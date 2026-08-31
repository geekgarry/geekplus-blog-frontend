<template>
  <!-- OA 工作台：图标式菜单 + 轻量数据概览，桌面/移动共用同一套响应式栅格 -->
  <div class="gp-workbench">
    <header class="gp-workbench__hero">
      <div class="gp-workbench__hero-text">
        <h1 class="gp-workbench__title">{{ heroTitleText }}</h1>
        <p class="gp-workbench__subtitle">{{ heroSubtitleText }}</p>
      </div>
      <router-link v-if="showClassicHomeLink" class="gp-workbench__classic-link" to="/">
        文章流首页
        <i class="el-icon-arrow-right" />
      </router-link>
    </header>

    <!-- 概览：博客用 visitInfo；后台可选运营统计 -->
    <section v-if="showOverview" class="gp-workbench__overview" aria-label="站点概览">
      <div class="gp-workbench__kpi-row">
        <div v-for="card in kpiCards" :key="card.key" class="gp-workbench__kpi">
          <div class="gp-workbench__kpi-icon">
            <i :class="card.icon" />
          </div>
          <div class="gp-workbench__kpi-body">
            <span class="gp-workbench__kpi-label">{{ card.label }}</span>
            <strong class="gp-workbench__kpi-value">{{ card.value }}</strong>
          </div>
        </div>
      </div>
      <div class="gp-workbench__charts">
        <div class="gp-workbench__panel">
          <div class="gp-workbench__panel-head">
            <h3>访问趋势</h3>
            <span>今日 / 本月 / 本季 / 本年</span>
          </div>
          <div ref="visitBarChart" class="gp-workbench__chart" role="img" aria-label="访问量柱状图" />
        </div>
        <div class="gp-workbench__panel gp-workbench__panel--menu">
          <div class="gp-workbench__panel-head">
            <h3>栏目分布</h3>
            <span>各分组入口数量</span>
          </div>
          <div ref="menuPieChart" class="gp-workbench__chart" role="img" aria-label="栏目占比饼图" />
        </div>
      </div>
    </section>

    <!-- 按菜单分类的 App 图标网格 -->
    <section
      v-for="group in menuGroups"
      :key="group.key"
      class="gp-workbench__group"
    >
      <div class="gp-workbench__group-head">
        <svg-icon v-if="group.icon && !isElIcon(group.icon)" class="gp-workbench__group-icon" :icon-class="group.icon" />
        <i v-else-if="group.icon" :class="group.icon" class="gp-workbench__group-icon gp-workbench__group-icon--el" />
        <h2 class="gp-workbench__group-title">{{ group.title }}</h2>
        <span class="gp-workbench__group-count">{{ group.items.length }} 项</span>
      </div>
      <ul class="gp-workbench__grid">
        <li v-for="app in group.items" :key="app.key">
          <button
            type="button"
            class="gp-workbench__app"
            :class="{ 'is-active': isActivePath(app.path) }"
            @click="navigate(app.path)"
          >
            <span class="gp-workbench__app-icon">
              <i v-if="isElIcon(app.icon)" :class="app.icon" />
              <svg-icon v-else :icon-class="app.icon || 'category'" />
            </span>
            <span class="gp-workbench__app-label">{{ app.label }}</span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { buildAdminWorkbenchMenuGroups, buildWorkbenchMenuGroups } from '@/utils/blogNavItems'
import { getVisitInfo } from '@/api/geekplus/geekplus'
import { getDashboardStats } from '@/api/geekplus/stats'
import { canViewBlogDashboard } from '@/utils/blogAdmin'
import { numFormatKWM } from '@/utils/plusTool'

export default {
  name: 'WorkbenchHome',
  props: {
    /** blog=前台栏目 | admin=后台 permission_routes */
    scope: {
      type: String,
      default: 'blog',
      validator: (v) => ['blog', 'admin'].includes(v)
    },
    /** 外部传入分组时优先使用（便于测试/扩展） */
    menuGroupsProp: {
      type: Array,
      default: null
    },
    /** 是否展示概览区；默认 blog 开、admin 按权限 */
    showStats: {
      type: Boolean,
      default: null
    },
    /** 博客工作台页可展示返回文章流链接 */
    showClassicHomeLink: {
      type: Boolean,
      default: false
    },
    heroTitle: {
      type: String,
      default: ''
    },
    heroSubtitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visitStats: {
        visitCount: null,
        today: null,
        month: null,
        quarter: null,
        year: null
      },
      adminStats: {},
      statsLoading: false,
      visitChart: null,
      menuChart: null,
      _resizeHandler: null
    }
  },
  computed: {
    ...mapGetters(['addMenuRoutes', 'permission_routes']),
    menuGroups() {
      if (this.menuGroupsProp && this.menuGroupsProp.length) {
        return this.menuGroupsProp
      }
      if (this.scope === 'admin') {
        return buildAdminWorkbenchMenuGroups(this.permission_routes)
      }
      return buildWorkbenchMenuGroups(this.addMenuRoutes)
    },
    showOverview() {
      if (this.showStats != null) return this.showStats
      if (this.scope === 'admin') return canViewBlogDashboard()
      return true
    },
    heroTitleText() {
      if (this.heroTitle) return this.heroTitle
      if (this.scope === 'admin') return `${this.greeting}，管理控制台`
      return `${this.greeting}，欢迎来到工作台`
    },
    heroSubtitleText() {
      if (this.heroSubtitle) return this.heroSubtitle
      if (this.scope === 'admin') {
        return '点击图标进入系统管理等功能，菜单与侧栏/顶栏同源'
      }
      return '点击图标进入对应栏目，布局与顶栏菜单同源、按分类分组展示'
    },
    greeting() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了'
      if (h < 12) return '上午好'
      if (h < 14) return '中午好'
      if (h < 18) return '下午好'
      return '晚上好'
    },
    kpiCards() {
      const fmt = (n) => (n == null ? '—' : numFormatKWM(Number(n) || 0) || '0')
        if (this.scope === 'admin') {
        const s = this.adminStats || {}
        const vp = s.visitPeriod || {}
        return [
          {
            key: 'pv',
            label: '今日 PV',
            value: fmt(s.todayPv != null ? s.todayPv : vp.today),
            icon: 'el-icon-view'
          },
          {
            key: 'read',
            label: '总阅读量',
            value: fmt(s.totalViews),
            icon: 'el-icon-reading'
          },
          {
            key: 'like',
            label: '总点赞',
            value: fmt(s.totalLikes),
            icon: 'el-icon-thumb'
          },
          {
            key: 'apps',
            label: '可用入口',
            value: String(this.totalAppCount),
            icon: 'el-icon-menu'
          }
        ]
      }
      return [
        {
          key: 'total',
          label: '累计访问',
          value: fmt(this.visitStats.visitCount),
          icon: 'el-icon-view'
        },
        {
          key: 'today',
          label: '今日访问',
          value: fmt(this.visitStats.today),
          icon: 'el-icon-sunny'
        },
        {
          key: 'month',
          label: '本月访问',
          value: fmt(this.visitStats.month),
          icon: 'el-icon-date'
        },
        {
          key: 'apps',
          label: '可用入口',
          value: String(this.totalAppCount),
          icon: 'el-icon-menu'
        }
      ]
    },
    totalAppCount() {
      return this.menuGroups.reduce((sum, g) => sum + (g.items ? g.items.length : 0), 0)
    }
  },
  watch: {
    menuGroups: {
      deep: true,
      handler() {
        this.$nextTick(() => this.renderMenuPieChart())
      }
    },
    visitStats: {
      deep: true,
      handler() {
        this.$nextTick(() => this.renderVisitBarChart())
      }
    }
  },
  mounted() {
    if (this.showOverview) {
      this.loadStats()
    }
    this._resizeHandler = () => {
      if (this.visitChart) this.visitChart.resize()
      if (this.menuChart) this.menuChart.resize()
    }
    window.addEventListener('resize', this._resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._resizeHandler)
    this.disposeCharts()
  },
  methods: {
    isElIcon(icon) {
      return icon && String(icon).indexOf('el-icon-') === 0
    },
    isActivePath(path) {
      if (!path) return false
      if (path === '/') return this.$route.path === '/'
      return this.$route.path === path || this.$route.path.startsWith(path + '/')
    },
    navigate(path) {
      if (!path || this.$route.path === path) return
      this.$router.push(path, () => {}, () => {})
    },
    loadStats() {
      if (this.scope === 'admin') {
        this.loadAdminStats()
        return
      }
      this.loadVisitStats()
    },
    loadAdminStats() {
      if (!canViewBlogDashboard()) return
      this.statsLoading = true
      getDashboardStats(30)
        .then((res) => {
          const data = res && res.data !== undefined ? res.data : res
          this.adminStats = data && typeof data === 'object' ? data : {}
        })
        .catch(() => {})
        .finally(() => {
          this.statsLoading = false
          this.$nextTick(() => {
            this.renderVisitBarChart()
            this.renderMenuPieChart()
          })
        })
    },
    loadVisitStats() {
      this.statsLoading = true
      getVisitInfo()
        .then((res) => {
          const data = res && res.data !== undefined ? res.data : res
          if (!data || typeof data !== 'object') return
          this.visitStats = {
            visitCount: data.visitCount != null ? data.visitCount : this.visitStats.visitCount,
            today: data.today != null ? data.today : data.visitToday,
            month: data.month != null ? data.month : data.visitMonth,
            quarter: data.quarter != null ? data.quarter : data.visitQuarter,
            year: data.year != null ? data.year : data.visitYear
          }
        })
        .catch(() => {
          /* 统计失败不影响工作台菜单主流程 */
        })
        .finally(() => {
          this.statsLoading = false
          this.$nextTick(() => {
            this.renderVisitBarChart()
            this.renderMenuPieChart()
          })
        })
    },
    themeColor() {
      return this.cssVar('--theme-color', '#5f7d80')
    },
    themeColorStrong() {
      return this.cssVar('--theme-color-strong', this.themeColor())
    },
    textColorSecondary() {
      return this.cssVar('--text-color', '#4f4c48')
    },
    textColorPrimary() {
      return this.cssVar('--text-color-2', '#1f1e1d')
    },
    borderColorToken() {
      return this.cssVar('--border-color', '#ebe6e0')
    },
    chartPalette() {
      /* 与 color.css 莫兰迪盘一致，深浅色随 body[theme-mode] 自动切换 */
      return [
        this.themeColor(),
        this.cssVar('--theme-color-soft', '#8aa0a2'),
        this.cssVar('--lightGreen', '#8fa89a'),
        this.cssVar('--blue', '#6f8b96'),
        this.cssVar('--green', '#6f8f72'),
        this.cssVar('--plus-grey-8', '#8a8580')
      ]
    },
    cssVar(name, fallback) {
      if (typeof document === 'undefined') return fallback
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      return v || fallback
    },
    async ensureEcharts() {
      if (this._echarts) return this._echarts
      const mod = await import(/* webpackChunkName: "echarts-workbench" */ 'echarts')
      this._echarts = mod.default || mod
      return this._echarts
    },
    disposeCharts() {
      if (this.visitChart) {
        this.visitChart.dispose()
        this.visitChart = null
      }
      if (this.menuChart) {
        this.menuChart.dispose()
        this.menuChart = null
      }
    },
    async renderVisitBarChart() {
      const el = this.$refs.visitBarChart
      if (!el) return
      const echarts = await this.ensureEcharts()
      if (this.visitChart) this.visitChart.dispose()
      this.visitChart = echarts.init(el)
      const labels = this.scope === 'admin'
        ? ['今日PV', '阅读量', '点赞', '入口']
        : ['今日', '本月', '本季', '本年']
      const values = this.scope === 'admin'
        ? [
          Number(this.adminStats.todayPv || (this.adminStats.visitPeriod && this.adminStats.visitPeriod.today)) || 0,
          Number(this.adminStats.totalViews) || 0,
          Number(this.adminStats.totalLikes) || 0,
          this.totalAppCount
        ]
        : [
          Number(this.visitStats.today) || 0,
          Number(this.visitStats.month) || 0,
          Number(this.visitStats.quarter) || 0,
          Number(this.visitStats.year) || 0
        ]
      this.visitChart.setOption({
        backgroundColor: 'transparent',
        grid: { left: 40, right: 16, top: 24, bottom: 28 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: this.cssVar('--background-origin', '#fff'),
          borderColor: this.borderColorToken(),
          textStyle: { color: this.textColorPrimary() }
        },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: this.textColorSecondary() },
          axisLine: { lineStyle: { color: this.borderColorToken() } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: this.textColorSecondary() },
          splitLine: { lineStyle: { type: 'dashed', color: this.borderColorToken(), opacity: 0.45 } }
        },
        series: [
          {
            type: 'bar',
            data: values,
            barWidth: '42%',
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: this.themeColor()
            }
          }
        ]
      })
    },
    async renderMenuPieChart() {
      const el = this.$refs.menuPieChart
      if (!el || !this.menuGroups.length) return
      const echarts = await this.ensureEcharts()
      if (this.menuChart) this.menuChart.dispose()
      this.menuChart = echarts.init(el)
      const palette = this.chartPalette()
      const seriesData = this.menuGroups.map((g, idx) => ({
        name: g.title,
        value: g.items.length,
        itemStyle: { color: palette[idx % palette.length] }
      }))
      this.menuChart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} 项 ({d}%)',
          backgroundColor: this.cssVar('--background-origin', '#fff'),
          borderColor: this.borderColorToken(),
          textStyle: { color: this.textColorPrimary() }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 8,
          top: 'middle',
          textStyle: { color: this.textColorSecondary(), fontSize: 11 }
        },
        series: [
          {
            type: 'pie',
            radius: ['42%', '68%'],
            center: ['38%', '50%'],
            avoidLabelOverlap: true,
            label: { show: false },
            data: seriesData
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 卡片/图标统一走 color.css 的 gp-surface 与深浅色 token，避免硬编码蓝白 */
.gp-workbench {
  padding: 8px 0 32px;
  color: var(--text-color);
}

.gp-workbench__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.gp-workbench__title {
  margin: 0 0 6px;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-color-2, var(--articleFontColor, #2c2a28));
}

.gp-workbench__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color, var(--articleGreyFontColor, #6a6661));
}

.gp-workbench__classic-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 0.8125rem;
  color: var(--gp-menu-active-color, var(--theme-color-strong, var(--theme-color)));
  background: var(--gp-menu-active-bg, var(--theme-color-muted));
  border: 1px solid var(--gp-surface-border, var(--border-color));
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.gp-workbench__classic-link:hover {
  background: var(--interactive-bg-secondary-hover, var(--hover-background));
  border-color: var(--gp-surface-border-hover, var(--borderHoverColor));
}

.gp-workbench__overview {
  margin-bottom: 28px;
}

.gp-workbench__kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.gp-workbench__kpi {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--gp-surface-padding, 14px 16px);
  background: var(--gp-surface-bg, var(--background));
  border: 1px solid var(--gp-surface-border, var(--border-color));
  border-radius: var(--gp-surface-radius, 10px);
  box-shadow: var(--gp-surface-shadow, 0 2px 14px var(--box-shadow));
}

.gp-workbench__kpi-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--gp-surface-radius, 10px);
  color: var(--gp-menu-active-color, var(--theme-color));
  background: var(--gp-menu-active-bg, var(--theme-color-muted));
  font-size: 20px;
}

.gp-workbench__kpi-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-color, var(--articleGreyFontColor));
  margin-bottom: 2px;
}

.gp-workbench__kpi-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color-2, var(--articleFontColor));
}

.gp-workbench__charts {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
}

.gp-workbench__panel {
  padding: var(--gp-surface-padding, 14px 16px 8px);
  background: var(--gp-surface-bg, var(--background));
  border: 1px solid var(--gp-surface-border, var(--border-color));
  border-radius: var(--gp-surface-radius, 10px);
  box-shadow: var(--gp-surface-shadow, 0 2px 14px var(--box-shadow));
}

.gp-workbench__panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--gp-surface-title, var(--theme-color));
  }

  span {
    font-size: 0.75rem;
    color: var(--text-color, var(--articleGreyFontColor));
  }
}

.gp-workbench__chart {
  width: 100%;
  height: 220px;
}

.gp-workbench__group {
  margin-bottom: 28px;
}

.gp-workbench__group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gp-surface-border, var(--border-color));
}

.gp-workbench__group-icon {
  width: 20px;
  height: 20px;
  color: var(--gp-surface-title, var(--theme-color));
}

.gp-workbench__group-icon--el {
  width: auto;
  height: auto;
  font-size: 18px;
}

.gp-workbench__group-title {
  margin: 0;
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-2, var(--articleFontColor));
}

.gp-workbench__group-count {
  font-size: 0.75rem;
  color: var(--text-color, var(--articleGreyFontColor));
}

.gp-workbench__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px 12px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.gp-workbench__app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.gp-workbench__app-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--gp-surface-radius, 14px);
  background: var(--background-origin, var(--gp-surface-bg));
  border: 1px solid var(--gp-surface-border, var(--border-color));
  box-shadow: var(--gp-surface-shadow, 0 2px 14px var(--box-shadow));
  color: var(--gp-menu-active-color, var(--theme-color));
  font-size: 26px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.gp-workbench__app-icon i {
  font-size: 26px;
}

.gp-workbench__app:hover .gp-workbench__app-icon,
.gp-workbench__app:focus-visible .gp-workbench__app-icon {
  transform: translateY(-2px) scale(1.04);
  box-shadow: var(--gp-surface-shadow-hover, 0 8px 22px var(--box-shadow));
  border-color: var(--gp-surface-border-hover, var(--borderHoverColor));
}

.gp-workbench__app.is-active .gp-workbench__app-icon {
  background: var(--gp-menu-active-bg, var(--theme-color-muted));
  border-color: var(--gp-menu-active-border, var(--theme-color));
  outline: none;
}

.gp-workbench__app-label {
  max-width: 100%;
  font-size: 0.75rem;
  line-height: 1.3;
  text-align: center;
  color: var(--text-color, var(--articleGreyFontColor));
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 1199px) {
  .gp-workbench__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .gp-workbench__kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .gp-workbench__charts {
    grid-template-columns: 1fr;
  }

  .gp-workbench__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px 8px;
  }

  .gp-workbench__app-icon {
    width: 52px;
    height: 52px;
    font-size: 24px;
  }

  .gp-workbench__app-icon i {
    font-size: 24px;
  }

  .gp-workbench__panel--menu .gp-workbench__chart {
    height: 260px;
  }
}
</style>
