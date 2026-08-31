<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="isActive(tag)?'active':''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle.native="!isAffix(tag)?closeSelectedTag(tag):''"
        @contextmenu.prevent.native="openMenu(tag,$event)"
      >
        {{ tag.title }}
        <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
      </router-link>
    </scroll-pane>
    <!-- 标签栏右侧快捷菜单：与右键菜单能力一致，便于触屏/发现 -->
    <div class="tags-view-menu">
      <el-dropdown trigger="click" placement="bottom-end" @command="handleTagCommand">
        <span class="tags-view-menu__trigger" title="标签操作">
          <i class="el-icon-arrow-down" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="refresh" icon="el-icon-refresh">刷新页面</el-dropdown-item>
          <el-dropdown-item command="close" icon="el-icon-close" :disabled="isAffix(currentRouteView)">
            关闭当前标签页
          </el-dropdown-item>
          <el-dropdown-item command="others" icon="el-icon-copy-document">关闭其它标签页</el-dropdown-item>
          <el-dropdown-item command="all" icon="el-icon-circle-close">关闭全部标签页</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭当前</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane'
import path from 'path'

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: []
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return this.$store.state.permission.permission_routes
    },
    themeColor() {
      return this.$store.state.settings.themeColor;
    },
    /** 下拉菜单默认作用于当前路由对应标签 */
    currentRouteView() {
      return this.visitedViews.find(v => v.path === this.$route.path) || {
        path: this.$route.path,
        fullPath: this.$route.fullPath,
        name: this.$route.name,
        meta: this.$route.meta,
        query: this.$route.query
      }
    }
  },
  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
  },
  methods: {
    isActive(route) {
      return route.path === this.$route.path
    },
    activeStyle(tag) {
      if (!this.isActive(tag)) return {};
      // 圆角走 CSS 变量，勿写死 inline，否则盖不住设置抽屉的整站圆角
      return {
        "background-color": this.themeColor,
        "border-color": this.themeColor,
      };
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    closeSelectedTag(view) {
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view)
        }
      })
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === this.$route.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView.fullPath)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    /** 标签栏右侧下拉：刷新 / 关闭当前 / 关闭其它 / 关闭全部 */
    handleTagCommand(command) {
      const view = this.currentRouteView
      if (!view || !view.path) return
      switch (command) {
        case 'refresh':
          this.refreshSelectedTag(view)
          break
        case 'close':
          if (!this.isAffix(view)) this.closeSelectedTag(view)
          break
        case 'others':
          this.selectedTag = view
          this.closeOthersTags()
          break
        case 'all':
          this.closeAllTags(view)
          break
        default:
          break
      }
    },
    handleScroll() {
      this.closeMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  display: flex;
  align-items: stretch;
  background: var(--background-origin,#fff);
  border-bottom: 1px solid var(--border-color-2,#d8dce5);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  .tags-view-wrapper {
    flex: 1;
    min-width: 0;
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 28px;
      line-height: 28px;
      //border: 1px solid #d8dce5;
      border-radius: var(--gp-border-radius-base, 4px);
      color: var(--text-color,#495060);
      background: var(--background,#fff);
      padding: 0 8px;
      font-size: 13px;
      margin-left: 5px;
      margin-top: 3px;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &:hover {
        background: var(--theme-color, #1890ff);
        color: #f5f5f5;
        border-color: var(--theme-color, #1890ff);
      }
      &.active {
        background-color: var(--theme-color,#42b983);
        color: #fff;
        border-color: var(--theme-color,#42b983);
        /* &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        } */
      }
    }
  }
  .tags-view-menu {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 10px 0 4px;
    border-left: 1px solid var(--border-color-2, #d8dce5);
    background: var(--background-origin, #fff);
  }
  .tags-view-menu__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--gp-border-radius-base, 4px);
    cursor: pointer;
    color: var(--text-color, #495060);
    transition: background 0.2s, color 0.2s;
    &:hover {
      background: var(--theme-color, #42b983);
      color: #fff;
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: var(--gp-border-radius-base, 4px);
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      /* vertical-align: 2px; */
      border-radius: 50%;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
      flex-direction: row;
      &:before {
        transform: scale(.8);
        font-weight: bold;
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc93;
        color: #fff;
      }
    }
  }
}
</style>
