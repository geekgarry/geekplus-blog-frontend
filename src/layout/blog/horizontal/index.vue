<template>
  <!-- 侧栏布局：主题色跟随站点 token，移动端抽屉可滑出 -->
  <div class="gp-side-layout" :class="{ 'is-drawer-open': isDrawerOpen }">
    <div
      class="gp-side-layout__mask"
      v-show="isDrawerOpen"
      @click="closeDrawer"
    ></div>

    <aside
      class="gp-side-layout__aside"
      :class="{ 'is-open': isDrawerOpen }"
      aria-hidden="false"
    >
      <div class="gp-side-layout__brand">
        <router-link to="/" class="gp-side-layout__logo" @click.native="closeDrawer">
          <img :src="iLogo" alt="GeekPlus" />
          <span>{{ siteTitle }}</span>
        </router-link>
        <button
          type="button"
          class="gp-side-layout__close"
          v-if="isMobile"
          aria-label="关闭菜单"
          @click="closeDrawer"
        >×</button>
      </div>

      <nav class="gp-side-layout__nav">
        <p class="gp-side-layout__group">主菜单</p>
        <router-link class="gp-side-nav-item" to="/" exact @click.native="closeDrawer">
          <i class="el-icon-s-home"></i><span>首页</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/search" @click.native="closeDrawer">
          <i class="el-icon-search"></i><span>搜索文章</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/categories" @click.native="closeDrawer">
          <i class="el-icon-menu"></i><span>分类浏览</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/tags" @click.native="closeDrawer">
          <i class="el-icon-collection-tag"></i><span>热门标签</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/leave-word" @click.native="closeDrawer">
          <i class="el-icon-chat-line-square"></i><span>留言板</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/file-transfer" @click.native="closeDrawer">
          <i class="el-icon-upload"></i><span>文件中转</span>
        </router-link>

        <p class="gp-side-layout__group">栏目</p>
        <div v-for="(item, index) in menuRoutes" :key="'m-' + index" class="gp-side-nav-block">
          <button
            type="button"
            class="gp-side-nav-item gp-side-nav-item--btn"
            :class="{ 'is-open': openIndex === index }"
            @click="toggleItem(index, item)"
          >
            <i class="el-icon-folder-opened"></i>
            <span>{{ item.meta && item.meta.title || item.categoryName || item.name }}</span>
            <i
              v-if="item.children && item.children.length"
              class="gp-side-nav-arrow"
              :class="openIndex === index ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
            ></i>
          </button>
          <div v-if="item.children && openIndex === index" class="gp-side-nav-sub">
            <router-link
              v-for="(sub, si) in item.children"
              :key="'s-' + si"
              class="gp-side-nav-item gp-side-nav-item--sub"
              :to="resolveChildPath(item, sub)"
              @click.native="closeDrawer"
            >
              <span>{{ sub.meta && sub.meta.title || sub.categoryName || sub.name }}</span>
            </router-link>
          </div>
        </div>

        <p class="gp-side-layout__group">个人</p>
        <router-link class="gp-side-nav-item" to="/about" @click.native="closeDrawer">
          <i class="el-icon-user"></i><span>关于作者</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/user/center" @click.native="closeDrawer">
          <i class="el-icon-s-custom"></i><span>个人中心</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/write" @click.native="closeDrawer">
          <i class="el-icon-edit"></i><span>投稿文章</span>
        </router-link>
        <router-link class="gp-side-nav-item" to="/resumeGenerator" @click.native="closeDrawer">
          <i class="el-icon-document"></i><span>简历生成</span>
        </router-link>
        <a class="gp-side-nav-item" href="/chat" target="_blank" rel="noopener">
          <i class="el-icon-cpu"></i><span>AI 助手</span>
        </a>
      </nav>

      <div class="gp-side-layout__foot">
        <div class="gp-side-layout__user">
          <img :src="(username && avatar) ? avatar : iLogo" alt="" />
          <div class="gp-side-layout__user-meta">
            <p class="name">{{ username ? (nickname || username) : '访客' }}</p>
            <p class="role">{{ username ? '已登录' : '未登录' }}</p>
          </div>
          <button
            v-if="username"
            type="button"
            class="gp-side-auth-btn"
            title="退出登录"
            @click="onLogout"
          >注销</button>
          <router-link
            v-else
            class="gp-side-auth-btn gp-side-auth-btn--primary"
            to="/user"
            @click.native="closeDrawer"
          >登录</router-link>
        </div>
        <button type="button" class="gp-side-theme" @click="changeColor" :title="isDark ? '浅色' : '深色'">
          <i :class="isDark ? 'el-icon-sunny' : 'el-icon-moon'"></i>
        </button>
      </div>
    </aside>

    <div class="gp-side-layout__main">
      <header class="gp-side-layout__top">
        <div class="gp-side-layout__top-left">
          <button
            type="button"
            class="gp-side-menu-btn"
            v-if="isMobile"
            aria-label="打开菜单"
            @click.stop="openDrawer"
          >
            <i class="el-icon-s-operation"></i>
          </button>
          <nav class="gp-side-crumb" v-if="!isMobile">
            <router-link to="/">首页</router-link>
            <span class="sep">/</span>
            <span>{{ pageTitle }}</span>
          </nav>
          <span class="gp-side-top-title" v-else>{{ pageTitle }}</span>
        </div>
        <div class="gp-side-layout__top-right">
          <form class="gp-side-search" @submit.prevent="goSearch">
            <i class="el-icon-search"></i>
            <input v-model="searchQuery" type="search" placeholder="搜索文章…" />
          </form>
          <button type="button" class="gp-icon-btn" @click="changeColor" :title="isDark ? '浅色' : '深色'">
            <i :class="isDark ? 'el-icon-sunny' : 'el-icon-moon'"></i>
          </button>
        </div>
      </header>

      <div class="gp-side-layout__body">
        <keep-alive >
          <router-view :key="keyMenuPath" />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HorizontalBlogLayout',
  data() {
    return {
      isDrawerOpen: false,
      openIndex: null,
      searchQuery: '',
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      iLogo: require('@/assets/logo.png')
    }
  },
  computed: {
    ...mapGetters(['username', 'nickname', 'avatar', 'addMenuRoutes']),
    isDark() {
      const dark = this.$store.state.darkMode
      return dark != null ? !!dark : false
    },
    isDarkMode() {
      return this.isDark
    },
    isMobile() {
      return this.windowWidth < 992
    },
    menuRoutes() {
      return this.addMenuRoutes || []
    },
    siteTitle() {
      const info = this.$store.state.webInfo || {}
      return info.gpWebName || info.webTitle || 'GeekPlus'
    },
    pageTitle() {
      return (this.$route.meta && this.$route.meta.title) || '内容'
    },
    keyMenuPath() {
      return this.$route.path
    }
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    document.body.style.overflow = ''
  },
  watch: {
    $route() {
      this.closeDrawer()
    },
    isDrawerOpen(val) {
      // 移动端打开抽屉时锁住背景滚动
      if (this.isMobile) {
        document.body.style.overflow = val ? 'hidden' : ''
      }
    }
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth || document.documentElement.clientWidth || 1200
      if (!this.isMobile) {
        this.isDrawerOpen = false
        document.body.style.overflow = ''
      }
    },
    openDrawer() {
      this.isDrawerOpen = true
    },
    closeDrawer() {
      this.isDrawerOpen = false
    },
    toggleItem(index, item) {
      if (item.children && item.children.length) {
        this.openIndex = this.openIndex === index ? null : index
        return
      }
      const path = item.path || '/'
      this.$router.push(path).catch(() => {})
      this.closeDrawer()
    },
    resolveChildPath(parent, child) {
      const p = (parent.path || '').replace(/\/$/, '')
      const c = (child.path || '').replace(/^\//, '')
      if (child.path && child.path.startsWith('/')) return child.path
      return `${p}/${c}`.replace(/\/+/g, '/')
    },
    goSearch() {
      const q = (this.searchQuery || '').trim()
      if (!q) return
      this.$router.push({ path: '/search', query: { keyWords: q } }).catch(() => {})
      this.searchQuery = ''
      this.closeDrawer()
    },
    changeColor() {
      const isDark = !this.isDarkMode
      if (isDark) {
        document.body.setAttribute('theme-mode', 'dark')
      } else {
        document.body.removeAttribute('theme-mode')
      }
      this.$store.commit('changeDarkMode', isDark)
    },
    async onLogout() {
      try {
        await this.$store.dispatch('user/logout')
      } catch (e) { /* ignore */ }
      this.closeDrawer()
      this.$router.push('/user').catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-side-layout {
  min-height: 100vh;
  background: var(--gp-page-wash, var(--background));
  color: var(--fontColor);
}

.gp-side-layout__mask {
  position: fixed;
  inset: 0;
  z-index: 1040;
  background: var(--mask, rgba(47, 45, 43, 0.42));
  backdrop-filter: blur(2px);
}

.gp-side-layout__aside {
  position: fixed;
  inset: 0 auto 0 0;
  width: min(280px, 86vw);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  /* 跟随站点主题，不再写死黑色 */
  background: var(--gp-surface-bg, var(--background-1, #faf8f5));
  color: var(--fontColor, #3a3835);
  border-right: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.08));
  box-shadow: var(--gp-surface-shadow, 0 2px 14px rgba(58, 56, 53, 0.06));
  transform: translate3d(-105%, 0, 0);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

/* 移动端：靠 .is-open 滑出（此前误写进桌面 media，导致点了没反应） */
.gp-side-layout__aside.is-open {
  transform: translate3d(0, 0, 0);
}

/* 桌面端：侧栏常驻 */
@media screen and (min-width: 992px) {
  .gp-side-layout__aside,
  .gp-side-layout__aside.is-open {
    transform: translate3d(0, 0, 0);
    width: 256px;
    box-shadow: none;
  }
}

.gp-side-layout__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
}

.gp-side-layout__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--fontColor);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.02em;

  img {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    object-fit: cover;
    background: var(--theme-color, #6e8b8e);
  }
}

.gp-side-layout__close {
  border: none;
  background: var(--theme-color-muted, rgba(110, 139, 142, 0.14));
  color: var(--font-color);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.gp-side-layout__nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 16px;
  -webkit-overflow-scrolling: touch;
}

.gp-side-layout__group {
  margin: 14px 8px 8px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted-1-color, #8a8580);
}

.gp-side-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: 10px;
  color: var(--font-color, #5c5854);
  text-decoration: none;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;

  i:first-child {
    font-size: 16px;
    width: 18px;
    color: var(--theme-color, #6e8b8e);
  }

  &:hover {
    background: var(--theme-color-muted, rgba(110, 139, 142, 0.14));
    color: var(--fontColor);
  }

  &.router-link-active {
    background: var(--gp-menu-active-bg, var(--theme-color-muted));
    color: var(--theme-color, #6e8b8e);
    font-weight: 600;
  }
}

.gp-side-nav-item--btn {
  justify-content: flex-start;
}

.gp-side-nav-arrow {
  margin-left: auto;
  font-size: 12px;
  color: var(--muted-1-color);
}

.gp-side-nav-sub {
  padding: 0 0 6px 12px;
}

.gp-side-nav-item--sub {
  padding: 8px 12px;
  font-size: 13px;
}

.gp-side-layout__foot {
  padding: 12px;
  border-top: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--background-2, #f7f4f0);
}

.gp-side-layout__user {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 12px;
  background: var(--gp-surface-bg, var(--background-1));
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
}

.gp-side-layout__user-meta {
  flex: 1;
  min-width: 0;

  p {
    margin: 0 auto;
    height: 20px;
    line-height: 20px;
  }

  .name {
    font-size: 13px;
    color: var(--fontColor);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .role {
    font-size: 11px;
    color: var(--muted-1-color, #8a8580);
  }
}

.gp-side-auth-btn {
  flex-shrink: 0;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.1));
  background: var(--background-2, #f7f4f0);
  color: var(--font-color);
  font-size: 12px;
  line-height: 26px;
  text-decoration: none;
  cursor: pointer;
}

.gp-side-auth-btn--primary {
  background: var(--theme-color, #6e8b8e);
  border-color: var(--theme-color, #6e8b8e);
  color: #faf9f7;
}

.gp-side-theme,
.gp-icon-btn,
.gp-side-menu-btn {
  border: none;
  background: transparent;
  color: var(--fontColor);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: var(--theme-color-muted, rgba(110, 139, 142, 0.14));
  }
}

.gp-side-menu-btn {
  font-size: 20px;
  /* background: var(--theme-color-muted, rgba(110, 139, 142, 0.14)); */
}

.gp-side-layout__main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (min-width: 992px) {
  .gp-side-layout__main {
    padding-left: 256px;
  }
}

.gp-side-layout__top {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  background: var(--navbarBackground, rgba(250, 248, 245, 0.92));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
}

.gp-side-layout__top-left,
.gp-side-layout__top-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.gp-side-top-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fontColor);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gp-side-crumb {
  font-size: 13px;
  color: var(--muted-1-color, #8a8580);

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--theme-color);
    }
  }

  .sep {
    margin: 0 6px;
  }

  span:last-child {
    color: var(--fontColor);
  }
}

.gp-side-search {
  position: relative;
  display: none;

  @media (min-width: 576px) {
    display: block;
  }

  i {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted-1-color);
    font-size: 14px;
  }

  input {
    width: 180px;
    height: 34px;
    padding: 0 12px 0 32px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: var(--background-2, #f7f4f0);
    color: var(--fontColor);
    outline: none;

    &:focus {
      border-color: var(--theme-color-soft);
      background: var(--background-1);
    }

    @media (min-width: 1200px) {
      width: 240px;
    }
  }
}

.gp-side-layout__body {
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 16px 40px;
  box-sizing: border-box;
}

@media (min-width: 1920px) {
  .gp-side-layout__body {
    max-width: 1480px;
    padding: 24px 28px 48px;
  }
}
</style>
