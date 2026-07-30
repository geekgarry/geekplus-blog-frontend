<template>
  <div class="topbar-root" :class="{ 'has-header-logo': showLogo }">
    <logo v-if="showLogo" :collapse="false" />
    <div ref="menuWrap" class="top-menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        :unique-opened="false"
        :active-text-color="themeColor || variables.menuActiveText"
        :collapse-transition="false"
        mode="horizontal"
        class="top-menu"
      >
        <horizontal-item
          v-for="route in primaryRoutes"
          :key="'p-' + route.path"
          :item="route"
          :base-path="route.path"
        />
        <!-- 溢出折叠到「更多」 -->
        <el-submenu
          v-if="overflowRoutes.length"
          index="__topbar_more__"
          popper-append-to-body
          class="top-menu-more"
        >
          <template slot="title">
            <span>更多</span>
          </template>
          <horizontal-item
            v-for="route in overflowRoutes"
            :key="'o-' + route.path"
            :is-nest="true"
            :item="route"
            :base-path="route.path"
            class="top-menu-more__item"
          />
        </el-submenu>
      </el-menu>

      <!-- 离屏测量：真实标题宽度 +「更多」，避免 flex 挤压后测不准 -->
      <div ref="measure" class="top-menu-measure" aria-hidden="true">
        <span
          v-for="route in menuRoutes"
          :key="'m-' + route.path"
          class="top-menu-measure__item"
        >
          <i
            v-if="routeMeasureIcon(route) && String(routeMeasureIcon(route)).includes('el-icon')"
            :class="routeMeasureIcon(route)"
          />
          <svg-icon
            v-else-if="routeMeasureIcon(route)"
            :icon-class="routeMeasureIcon(route)"
          />
          <span>{{ routeMeasureTitle(route) }}</span>
        </span>
        <span class="top-menu-measure__item top-menu-measure__more">
          <span>更多</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Logo from './Logo'
import HorizontalItem from './HorizontalItem'
import variables from '@/styles/variables.module.scss'

export default {
  components: { HorizontalItem, Logo },
  data() {
    return {
      visibleCount: 999,
      moreWidth: 88,
      _recomputeRAF: 0,
      _tightening: false,
      _ro: null
    }
  },
  computed: {
    ...mapState(['settings']),
    ...mapGetters(['sidebar']),
    permission_routes() {
      const result = this.$store.getters.permission_routes || []
      return result.filter((item) => item.type === 'admin')
    },
    menuRoutes() {
      return (this.permission_routes || []).filter((r) => r && !r.hidden)
    },
    primaryRoutes() {
      return this.menuRoutes.slice(0, this.visibleCount)
    },
    overflowRoutes() {
      return this.menuRoutes.slice(this.visibleCount)
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo == '1' ? true : false
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    themeColor() {
      return this.$store.state.settings.themeColor
    }
  },
  watch: {
    menuRoutes() {
      this.$nextTick(() => this.scheduleRecompute())
    },
    showLogo() {
      this.$nextTick(() => this.scheduleRecompute())
    }
  },
  mounted() {
    this.scheduleRecompute()
    window.addEventListener('resize', this.onResize)
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.scheduleRecompute())
      if (this.$refs.menuWrap) this._ro.observe(this.$refs.menuWrap)
      if (this.$el) this._ro.observe(this.$el)
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.scheduleRecompute()).catch(() => {})
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    if (this._ro) this._ro.disconnect()
    if (this._recomputeRAF) cancelAnimationFrame(this._recomputeRAF)
  },
  methods: {
    onResize() {
      this.scheduleRecompute()
    },
    routeMeasureTitle(route) {
      if (!route) return ''
      if (route.meta && route.meta.title) return route.meta.title
      if (route.children && route.children.length === 1 && route.children[0].meta) {
        return route.children[0].meta.title || ''
      }
      return route.name || route.path || ''
    },
    routeMeasureIcon(route) {
      if (!route) return ''
      if (route.meta && route.meta.icon) return route.meta.icon
      if (route.children && route.children.length === 1 && route.children[0].meta) {
        return route.children[0].meta.icon || ''
      }
      return ''
    },
    outerWidth(el) {
      if (!el || !el.getBoundingClientRect) return 0
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      return Math.ceil(
        rect.width +
          (parseFloat(style.marginLeft) || 0) +
          (parseFloat(style.marginRight) || 0)
      )
    },
    scheduleRecompute() {
      if (this._recomputeRAF) cancelAnimationFrame(this._recomputeRAF)
      this._recomputeRAF = requestAnimationFrame(() => {
        this._recomputeRAF = requestAnimationFrame(() => {
          this._recomputeRAF = 0
          this.recompute()
        })
      })
    },
    recompute() {
      const wrap = this.$refs.menuWrap
      const measure = this.$refs.measure
      if (!wrap || !measure) return

      const avail = Math.floor(wrap.clientWidth || 0)
      if (avail <= 0) return

      const SAFETY = 4
      const budget = Math.max(0, avail - SAFETY)
      const kids = Array.prototype.slice.call(measure.children || [])
      if (!kids.length) return

      const moreEl = kids[kids.length - 1]
      const itemEls = kids.slice(0, -1)
      this.moreWidth = this.outerWidth(moreEl) || 88
      const widths = itemEls.map((el) => this.outerWidth(el))

      const total = widths.length
      if (!total) {
        this.visibleCount = 0
        return
      }

      const sumAll = widths.reduce((a, b) => a + b, 0)
      if (sumAll <= budget) {
        this.visibleCount = total
        this.$nextTick(() => this.tightenUntilFits())
        return
      }

      let used = 0
      let count = 0
      for (let i = 0; i < total; i++) {
        if (used + widths[i] + this.moreWidth <= budget) {
          used += widths[i]
          count++
        } else {
          break
        }
      }
      this.visibleCount = Math.max(0, count)
      this.$nextTick(() => this.tightenUntilFits())
    },
    /**
     * 仅在真实横向溢出时再收紧。
     * menu 常被拉成 width:100%，scrollWidth≈clientWidth，不能和 budget 比较。
     */
    tightenUntilFits() {
      if (this._tightening) return
      this._tightening = true
      const run = () => {
        const wrap = this.$refs.menuWrap
        const menu = wrap && wrap.querySelector('.top-menu')
        if (!wrap || !menu) {
          this._tightening = false
          return
        }
        const overflowed = menu.scrollWidth > menu.clientWidth + 1
        if (overflowed && this.visibleCount > 0) {
          this.visibleCount -= 1
          this.$nextTick(run)
          return
        }
        this._tightening = false
      }
      this.$nextTick(run)
    }
  }
}
</script>

<style lang="scss" scoped>
.topbar-root {
  display: flex;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
  width: 0;
  max-width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.top-menu-wrapper {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 50px;
  line-height: 50px;
  border: none;
  overflow: hidden;
  box-sizing: border-box;
  background-color: var(--gp-surface-bg, #f7f7f7);
  box-shadow: var(--gp-nav-shadow, 0 1px 4px rgba(15, 23, 42, 0.06));
  color: var(--fontColor, #303133);
}

.top-menu {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 50px;
  border: none !important;
  background: transparent !important;
  overflow: hidden;
  box-sizing: border-box;
}

.top-menu-measure {
  position: absolute;
  left: -9999px;
  top: 0;
  display: flex;
  flex-wrap: nowrap;
  visibility: hidden;
  pointer-events: none;
  height: 0;
  overflow: hidden;
  white-space: nowrap;
}

.top-menu-measure__item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex: 0 0 auto;
  height: 50px;
  /* 与 src/styles/sidebar.scss .showTopMenuBar 顶栏项 padding 对齐 */
  padding: 0 6px;
  font-size: 14px;
  white-space: nowrap;
  box-sizing: border-box;
}

.top-menu-more__item {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
