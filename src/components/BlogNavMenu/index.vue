<template>
  <!-- Vue2 单根：桌面横排 / 抽屉共用同一数据与导航逻辑 -->
  <div class="gp-blog-nav" :class="'is-' + mode">
  <!-- 桌面顶栏菜单：自定义下拉 + 溢出「更多」，不依赖 el-dropdown，避免挤压换行 -->
  <div
    v-if="mode === 'desktop'"
    ref="root"
    class="gp-nav-menu"
    @keydown.esc="closeAll"
  >
    <ul ref="list" class="gp-nav-menu__list">
      <li
        v-for="item in primaryItems"
        :key="item.key"
        ref="itemEls"
        class="gp-nav-menu__item"
        :class="{ 'is-active': isActive(item.path), 'is-open': openKey === item.key }"
      >
        <button
          v-if="item.children && item.children.length"
          type="button"
          class="gp-nav-menu__link"
          :aria-expanded="openKey === item.key ? 'true' : 'false'"
          @click.stop="toggleDropdown(item.key, $event)"
        >
          <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
          <span class="gp-nav-menu__text">{{ item.label }}</span>
          <i class="el-icon-arrow-down gp-nav-menu__caret" />
        </button>
        <button
          v-else
          type="button"
          class="gp-nav-menu__link"
          @click="navigate(item.path)"
        >
          <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
          <span class="gp-nav-menu__text">{{ item.label }}</span>
        </button>

        <div
          v-if="item.children && item.children.length && openKey === item.key"
          class="gp-nav-menu__panel"
          :style="panelStyle"
          @click.stop
        >
          <button
            v-for="(child, cIdx) in item.children"
            :key="cIdx"
            type="button"
            class="gp-nav-menu__panel-item"
            @click="navigate(childPath(item, child))"
          >
            <svg-icon v-if="child.icon" class="gp-nav-menu__icon" :icon-class="child.icon" />
            <span>{{ child.categoryName || child.label }}</span>
          </button>
        </div>
      </li>

      <!-- 溢出折叠：菜单过多时收入「更多」，保证顶栏单行不挤压 -->
      <li
        v-if="overflowItems.length"
        ref="moreEl"
        class="gp-nav-menu__item gp-nav-menu__more"
        :class="{ 'is-open': openKey === 'more' }"
      >
        <button
          type="button"
          class="gp-nav-menu__link"
          :aria-expanded="openKey === 'more' ? 'true' : 'false'"
          @click.stop="toggleDropdown('more', $event)"
        >
          <span class="gp-nav-menu__text">更多</span>
          <i class="el-icon-arrow-down gp-nav-menu__caret" />
        </button>
        <div
          v-if="openKey === 'more'"
          class="gp-nav-menu__panel gp-nav-menu__panel--more"
          :style="panelStyle"
          @click.stop
        >
          <template v-for="(item, idx) in overflowItems">
            <div v-if="item.children && item.children.length" :key="'g-' + idx" class="gp-nav-menu__group">
              <div class="gp-nav-menu__group-title">
                <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
                {{ item.label }}
              </div>
              <button
                v-for="(child, cIdx) in item.children"
                :key="'c-' + idx + '-' + cIdx"
                type="button"
                class="gp-nav-menu__panel-item"
                @click="navigate(childPath(item, child))"
              >
                <svg-icon v-if="child.icon" class="gp-nav-menu__icon" :icon-class="child.icon" />
                <span>{{ child.categoryName || child.label }}</span>
              </button>
            </div>
            <button
              v-else
              :key="'i-' + idx"
              type="button"
              class="gp-nav-menu__panel-item"
              @click="navigate(item.path)"
            >
              <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
              <span>{{ item.label }}</span>
            </button>
          </template>
        </div>
      </li>
    </ul>

    <!-- 测量用隐藏列表：用真实宽度计算可见数量，避免 flex 挤压后测不准 -->
    <ul ref="measure" class="gp-nav-menu__measure" aria-hidden="true">
      <li v-for="item in allItems" :key="'m-' + item.key" class="gp-nav-menu__item">
        <span class="gp-nav-menu__link">
          <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
          <span class="gp-nav-menu__text">{{ item.label }}</span>
          <i v-if="item.children && item.children.length" class="el-icon-arrow-down gp-nav-menu__caret" />
        </span>
      </li>
      <li class="gp-nav-menu__item">
        <span class="gp-nav-menu__link">
          <span class="gp-nav-menu__text">更多</span>
          <i class="el-icon-arrow-down gp-nav-menu__caret" />
        </span>
      </li>
    </ul>
  </div>

  <!-- 移动端抽屉菜单：与桌面同一数据源 / 路由逻辑 -->
  <ul v-else class="gp-nav-drawer">
    <li v-if="showAdminEntry" class="gp-nav-drawer__item">
      <button type="button" class="gp-nav-drawer__link" @click="navigate('/admin')">
        <svg-icon class="gp-nav-menu__icon" icon-class="manage-center" />
        <span>管理中心</span>
      </button>
    </li>
    <li
      v-for="(item, index) in allItems"
      :key="item.key"
      class="gp-nav-drawer__item"
      :class="{ 'is-open': openIndexes.includes(index) }"
    >
      <div class="gp-nav-drawer__row">
        <button
          v-if="item.children && item.children.length"
          type="button"
          class="gp-nav-drawer__link"
          @click="toggleDrawerItem(index)"
        >
          <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
          <span>{{ item.label }}</span>
        </button>
        <button
          v-else
          type="button"
          class="gp-nav-drawer__link"
          @click="navigate(item.path)"
        >
          <svg-icon v-if="item.icon" class="gp-nav-menu__icon" :icon-class="item.icon" />
          <span>{{ item.label }}</span>
        </button>
        <button
          v-if="item.children && item.children.length"
          type="button"
          class="gp-nav-drawer__arrow"
          :aria-expanded="openIndexes.includes(index) ? 'true' : 'false'"
          @click="toggleDrawerItem(index)"
        >
          <i :class="openIndexes.includes(index) ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        </button>
      </div>
      <ul v-if="item.children && item.children.length && openIndexes.includes(index)" class="gp-nav-drawer__sub">
        <li v-for="(child, cIdx) in item.children" :key="cIdx">
          <button type="button" class="gp-nav-drawer__link is-sub" @click="navigate(childPath(item, child))">
            <svg-icon v-if="child.icon" class="gp-nav-menu__icon" :icon-class="child.icon" />
            <span>{{ child.categoryName || child.label }}</span>
          </button>
        </li>
      </ul>
    </li>
  </ul>
  </div>
</template>

<script>
/**
 * 前台博客导航菜单（桌面横排 + 抽屉）。
 * 独立组件：自定义下拉 / 溢出「更多」，与 gp-surface 风格一致，便于日后去掉 Element 顶栏依赖。
 *
 * 架构注意：
 * - mode=desktop：离屏测量 + visibleCount；下拉用 fixed+placePanel（躲开顶栏 backdrop-filter 裁切）
 * - mode=drawer：手风琴，不跑溢出算法
 * - 菜单数据来自 props.menus（Vuex addMenuRoutes）+ 固定项（首页/中转/留言/关于）
 * 溢出算法误区：勿用 scrollWidth 与 (avail-SAFETY) 比较，width:100% 时会误判全折叠（见 tightenUntilFits）
 */
export default {
  name: 'BlogNavMenu',
  props: {
    mode: {
      type: String,
      default: 'desktop',
      validator: (v) => ['desktop', 'drawer'].includes(v)
    },
    menus: {
      type: Array,
      default: () => []
    },
    /** 抽屉是否展示「管理中心」入口 */
    showAdminEntry: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      openKey: null,
      openIndexes: [],
      visibleCount: 999,
      moreWidth: 72,
      itemWidths: [],
      /* fixed 面板坐标：避免被顶栏 overflow / 高度裁切 */
      panelStyle: {}
    }
  },
  computed: {
    /** 统一菜单项：固定首页/留言/关于 + 动态栏目 */
    allItems() {
      const dynamic = (this.menus || []).map((item, index) => ({
        key: 'dyn-' + (item.id != null ? item.id : index),
        label: item.categoryName || item.name || '',
        path: item.path,
        icon: item.icon,
        children: item.children && item.children.length ? item.children : null,
        raw: item
      }))
      return [
        { key: 'home', label: '首页', path: '/', icon: 'home', children: null },
        ...dynamic,
        { key: 'webTool', label: '在线工具', path: '/tool', icon: 'tool', children: [
          { key: 'transfer', label: '文件中转', path: '/file-transfer', icon: 'upload', children: null },
          { key: 'resumeGenerator', label: '简历生成', path: '/resumeGenerator', icon: 'document', children: null },
        ] },
        { key: 'chat', label: 'AI 助手', path: '/chat', icon: 'ai', children: null },
        { key: 'leave', label: '给我留言', path: '/leave-word', icon: 'leave-word', children: null },
        { key: 'about', label: '关于本站', path: '/about', icon: 'cheers', children: null }
      ]
    },
    primaryItems() {
      return this.allItems.slice(0, this.visibleCount)
    },
    overflowItems() {
      return this.allItems.slice(this.visibleCount)
    }
  },
  watch: {
    menus: {
      deep: true,
      handler() {
        this.$nextTick(() => this.scheduleRecompute())
      }
    },
    allItems() {
      this.$nextTick(() => this.scheduleRecompute())
    }
  },
  mounted() {
    if (this.mode === 'desktop') {
      this.scheduleRecompute()
      window.addEventListener('resize', this.onResize)
      document.addEventListener('click', this.onDocClick)
      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => this.scheduleRecompute())
        if (this.$el) this._ro.observe(this.$el)
        if (this.$refs.root) this._ro.observe(this.$refs.root)
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.scheduleRecompute()).catch(() => {})
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('click', this.onDocClick)
    if (this._ro) this._ro.disconnect()
    if (this._recomputeRAF) cancelAnimationFrame(this._recomputeRAF)
  },
  methods: {
    onResize() {
      this.closeAll()
      this.scheduleRecompute()
    },
    onDocClick() {
      this.closeAll()
    },
    closeAll() {
      this.openKey = null
      this.panelStyle = {}
    },
    toggleDropdown(key, evt) {
      if (this.openKey === key) {
        this.closeAll()
        return
      }
      this.openKey = key
      const trigger = evt && evt.currentTarget
      this.$nextTick(() => this.placePanel(trigger, key === 'more'))
    },
    /** 用 fixed 贴到触发按钮下方，彻底脱离顶栏裁剪上下文 */
    placePanel(trigger, alignRight) {
      if (!trigger || !trigger.getBoundingClientRect) return
      const rect = trigger.getBoundingClientRect()
      const top = Math.round(rect.bottom + 4)
      if (alignRight) {
        this.panelStyle = {
          top: top + 'px',
          left: 'auto',
          right: Math.max(8, Math.round(window.innerWidth - rect.right)) + 'px',
          transform: 'none'
        }
      } else {
        const left = Math.round(rect.left + rect.width / 2)
        this.panelStyle = {
          top: top + 'px',
          left: left + 'px',
          right: 'auto',
          transform: 'translateX(-50%)'
        }
      }
    },
    toggleDrawerItem(index) {
      if (this.openIndexes.includes(index)) {
        this.openIndexes = this.openIndexes.filter((i) => i !== index)
      } else {
        this.openIndexes = this.openIndexes.concat(index)
      }
    },
    isActive(path) {
      if (!path) return false
      if (path === '/') return this.$route.path === '/'
      return this.$route.path === path || this.$route.path.startsWith(path + '/')
    },
    childPath(parent, child) {
      const pRaw = parent && (parent.path || (parent.raw && parent.raw.path))
      if (!pRaw) return '/'
      if (!child || !child.path) return pRaw
      const p = String(pRaw).replace(/\/$/, '')
      const c = String(child.path).replace(/^\//, '')
      return p + '/' + c
    },
    navigate(path) {
      this.closeAll()
      this.$emit('navigate', path)
      if (path && this.$route.path !== path) {
        this.$router.push(path, () => {}, () => {})
      }
    },
    /** 含左右 margin 的占位宽度，避免只量 content 导致算出偏多 */
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
      if (this.mode !== 'desktop') return
      if (this._recomputeRAF) cancelAnimationFrame(this._recomputeRAF)
      this._recomputeRAF = requestAnimationFrame(() => {
        this._recomputeRAF = requestAnimationFrame(() => {
          this._recomputeRAF = 0
          this.recompute()
        })
      })
    },
    /**
     * 按外层可用宽度决定可见项数；装不下时预留「更多」。
     */
    recompute() {
      if (this.mode !== 'desktop' || !this.$refs.measure) return
      const host = this.$el
      const root = this.$refs.root
      const avail = Math.floor(
        (host && host.clientWidth) ||
          (root && root.clientWidth) ||
          0
      )
      if (avail <= 0) return

      const SAFETY = 4
      const budget = Math.max(0, avail - SAFETY)
      const measureKids = Array.prototype.slice.call(this.$refs.measure.children || [])
      if (!measureKids.length) return

      const moreEl = measureKids[measureKids.length - 1]
      const itemEls = measureKids.slice(0, -1)
      this.moreWidth = this.outerWidth(moreEl) || 72
      const widths = itemEls.map((el) => this.outerWidth(el))
      this.itemWidths = widths

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
        const next = used + widths[i]
        // 后面还有溢出项时必须预留「更多」
        if (next + this.moreWidth <= budget) {
          used = next
          count++
        } else {
          break
        }
      }
      this.visibleCount = Math.max(0, count)
      if (this.openKey && this.openKey !== 'more') {
        const stillVisible = this.primaryItems.some((it) => it.key === this.openKey)
        if (!stillVisible) this.openKey = null
      }
      this.$nextTick(() => this.tightenUntilFits())
    },
    /**
     * 仅在真实横向溢出时再收紧。
     * 注意：list 常被拉成 width:100%，此时 scrollWidth≈clientWidth，
     * 绝不能拿 scrollWidth 去和 (avail - SAFETY) 比，否则会误判并一路折到 0。
     */
    tightenUntilFits() {
      if (this._tightening) return
      this._tightening = true
      const run = () => {
        const list = this.$refs.list
        if (!list) {
          this._tightening = false
          return
        }
        const overflowed = list.scrollWidth > list.clientWidth + 1
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
.gp-blog-nav.is-desktop {
  /* flex:1 + basis 0：占满剩余空间且可被挤压，避免被菜单内容撑破 */
  flex: 1 1 0;
  min-width: 0;
  width: 0;
  max-width: 100%;
  display: flex;
  /* 允许 fixed 子菜单面板溢出顶栏高度 */
  overflow: visible;
}

.gp-blog-nav.is-drawer {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gp-nav-menu {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  /* 面板为 position:fixed，此处 hidden 只裁切横排溢出项 */
  overflow: hidden;
}

.gp-nav-menu__list {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  max-width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;
  overflow: hidden;
}

.gp-nav-menu__item {
  position: relative;
  flex: 0 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  margin: 0 2px;
  /* 打开时抬高层级，避免被同级菜单或顶栏右侧遮挡 */
  z-index: 1;
}

.gp-nav-menu__item.is-open {
  z-index: 20;
}

.gp-nav-menu__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 9.5em;
  height: 36px;
  padding: 0 10px;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--navbarFont, var(--text-color-2));
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.gp-nav-menu__text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.gp-nav-menu__icon {
  flex-shrink: 0;
  font-size: 14px;
}

.gp-nav-menu__caret {
  flex-shrink: 0;
  font-size: 12px;
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.gp-nav-menu__item.is-open .gp-nav-menu__caret {
  transform: rotate(180deg);
}

.gp-nav-menu__link:hover,
.gp-nav-menu__item.is-active > .gp-nav-menu__link,
.gp-nav-menu__item.is-open > .gp-nav-menu__link {
  color: var(--theme-color, #6e8b8e);
  background: var(--gp-menu-active-bg, rgba(11, 173, 182, 0.1));
}

/* fixed + JS 定位：不受顶栏 60px 高度 / overflow 裁切 */
.gp-nav-menu__panel {
  position: fixed;
  top: 0;
  left: 0;
  min-width: 148px;
  max-width: 240px;
  max-height: min(70vh, 420px);
  overflow: auto;
  padding: 8px;
  z-index: 3000;
  background: var(--gp-surface-bg, var(--background, #fff));
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
  border-radius: var(--gp-surface-radius-sm, 10px);
  box-shadow: var(--gp-surface-shadow-hover, 0 6px 18px rgba(15, 23, 42, 0.06));
}

.gp-nav-menu__panel--more {
  min-width: 168px;
  max-width: 280px;
}

.gp-nav-menu__panel-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin: 0 0 4px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-color-2);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.gp-nav-menu__panel-item:last-child {
  margin-bottom: 0;
}

.gp-nav-menu__panel-item:hover {
  background: var(--gp-menu-active-bg, rgba(11, 173, 182, 0.1));
  color: var(--theme-color, #6e8b8e);
}

.gp-nav-menu__group {
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
}

.gp-nav-menu__group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.gp-nav-menu__group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted-1-color, #999);
}

/* 离屏测量，不影响布局；与正式项同 margin，保证 outerWidth 一致 */
.gp-nav-menu__measure {
  position: absolute;
  left: -9999px;
  top: 0;
  display: flex;
  flex-wrap: nowrap;
  visibility: hidden;
  pointer-events: none;
  height: auto;
  overflow: visible;
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
}

.gp-nav-menu__measure .gp-nav-menu__item {
  height: auto;
}

.gp-nav-menu__measure .gp-nav-menu__link {
  /* 与按钮态同尺寸，避免 span/button 量宽偏差 */
  box-sizing: border-box;
}

/* —— 抽屉模式 —— */
.gp-nav-drawer {
  list-style: none;
  margin: 0;
  padding: 8px 0 16px;
  flex: 1;
  overflow: auto;
  color: var(--text-color-2, #0a0a0a);
  -webkit-user-select: none;
  user-select: none;
  width: 100%;
}

.gp-nav-drawer__item {
  margin: 6px 10px;
}

.gp-nav-drawer__row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gp-nav-drawer__link {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 12px;
  margin: 0;
  border: none;
  border-radius: 8px;
  background: var(--gp-surface-bg, var(--navbarBackground, transparent));
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.gp-nav-drawer__link.is-sub {
  background: transparent;
  font-weight: 400;
  padding-left: 18px;
}

.gp-nav-drawer__link:hover {
  background: var(--gp-menu-active-bg, rgba(11, 173, 182, 0.1));
  color: var(--theme-color, #6e8b8e);
}

.gp-nav-drawer__arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.gp-nav-drawer__arrow:hover {
  background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, 0.06));
}

.gp-nav-drawer__sub {
  list-style: none;
  margin: 4px 0 0;
  padding: 0 0 0 8px;
}
</style>
