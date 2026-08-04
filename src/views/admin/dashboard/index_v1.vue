<template>
  <div class="blog-insight-dash">
    <!-- 无权限 -->
    <div v-if="!allowed" class="dash-denied">
      <i class="el-icon-lock"></i>
      <h2>无权访问博客运营看板</h2>
      <p>仅<strong>博客管理员 / 网站管理员 / 系统管理员</strong>可查看本页数据。</p>
      <el-button type="primary" size="small" @click="$router.push('/admin')">返回首页</el-button>
    </div>

    <template v-else>
      <div class="dash-header">
        <div class="dash-header__text">
          <h1>欢迎回来，{{ displayName }}</h1>
          <p>近 30 天内容表现 · Redis 日统计 + 文章累计数据（当日实时，历史可归档落库）</p>
        </div>
        <div class="dash-header__actions">
          <el-button type="primary" size="small" icon="el-icon-refresh" @click="loadDashboard">刷新</el-button>
          <el-button size="small" class="btn-ghost" icon="el-icon-download" :loading="exporting" @click="handleExport">
            导出报告
          </el-button>
          <el-button type="primary" size="small" icon="el-icon-edit" @click="goWrite">发布新文章</el-button>
        </div>
      </div>

      <div v-loading="loading" class="dash-body">
        <!-- KPI -->
        <div class="kpi-row">
          <div class="kpi-card" v-for="item in kpiList" :key="item.key">
            <div class="kpi-card__icon" :style="{ background: item.iconBg }">
              <i :class="item.icon"></i>
            </div>
            <div class="kpi-card__main">
              <div class="kpi-card__label">{{ item.label }}</div>
              <div class="kpi-card__value">{{ item.value }}</div>
              <div class="kpi-card__delta" :class="item.up ? 'is-up' : 'is-down'">
                <i :class="item.up ? 'el-icon-top' : 'el-icon-bottom'"></i>
                {{ item.delta }}
              </div>
            </div>
          </div>
        </div>

        <!-- 图表 + 分布 -->
        <div class="chart-row">
          <div class="dash-panel chart-panel">
            <div class="dash-panel__head">
              <h3>流量与互动趋势</h3>
              <span class="dash-panel__hint">近 30 天 · PV / 阅读增量 / 点赞增量</span>
            </div>
            <div ref="trendChart" class="trend-chart"></div>
          </div>
          <div class="dash-panel ratio-panel">
            <div class="dash-panel__head">
              <h3>内容类型占比</h3>
            </div>
            <div class="ratio-list">
              <div class="ratio-item" v-for="(cat, idx) in categoryRatio" :key="cat.name">
                <div class="ratio-item__top">
                  <span>{{ cat.name }}</span>
                  <strong>{{ cat.percent }}%</strong>
                </div>
                <el-progress
                  :percentage="cat.percent"
                  :stroke-width="8"
                  :show-text="false"
                  :color="ratioColors[idx % ratioColors.length]"
                />
              </div>
            </div>
            <div class="insight-box">
              <i class="el-icon-opportunity"></i>
              <div>
                <strong>建议</strong>
                <p>{{ insightText }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近创作 -->
        <div class="dash-panel recent-panel">
          <div class="dash-panel__head">
            <h3>最近创作内容</h3>
            <el-button type="text" @click="goAllArticles">查看全部</el-button>
          </div>
          <div v-if="!recentArticles.length" class="recent-empty">暂无文章数据</div>
          <div
            v-for="row in recentArticles"
            :key="row.id"
            class="recent-item"
          >
            <el-image class="recent-item__cover" :src="row.indexPicture || defaultCover" fit="cover">
              <div slot="error" class="image-slot"><i class="el-icon-picture-outline"></i></div>
            </el-image>
            <div class="recent-item__main">
              <div class="recent-item__meta">
                <el-tag size="mini" effect="dark" :color="tagColor(row)">{{ categoryName(row) }}</el-tag>
                <span>发布于 {{ formatTime(row.createTime || row.updateTime) }}</span>
              </div>
              <a class="recent-item__title" href="javascript:;" @click.prevent="goEdit(row)">{{ row.articleTitle }}</a>
              <p class="recent-item__excerpt">{{ excerpt(row) }}</p>
            </div>
            <div class="recent-item__stats">
              <div><span>阅读</span><strong>{{ numFormat(row.viewCount) }}</strong></div>
              <div><span>点赞</span><strong>{{ numFormat(row.likeCount) }}</strong></div>
              <div><span>CTR</span><strong>{{ calcCtr(row) }}</strong></div>
            </div>
            <el-dropdown trigger="click" @command="(cmd) => onArticleCmd(cmd, row)">
              <button type="button" class="recent-item__more"><i class="el-icon-more"></i></button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="view">前台预览</el-dropdown-item>
                <el-dropdown-item command="list">文章列表</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { exportArticles } from '@/api/geekplus/articles'
import { getDashboardStats } from '@/api/geekplus/stats'
import { canViewBlogDashboard } from '@/utils/blogAdmin'
import { numFormatKWM } from '@/utils/plusTool'

export default {
  name: 'BlogInsightDashboard',
  data() {
    return {
      allowed: false,
      loading: false,
      exporting: false,
      stats: {},
      trend: [],
      recentArticles: [],
      categoryRatio: [],
      kpiList: [],
      insightText: '持续产出高质量深度内容，有助于提升整体阅读与互动。',
      ratioColors: ['#3b82f6', '#60a5fa', '#a78bfa', '#94a3b8', '#34d399', '#f59e0b'],
      defaultCover: require('@/assets/images/cover2.jpeg'),
      chart: null,
      _resizeBound: null
    }
  },
  computed: {
    displayName() {
      return this.$store.getters.nickname || this.$store.getters.username || '管理员'
    }
  },
  created() {
    this.allowed = canViewBlogDashboard()
    if (this.allowed) {
      this.loadDashboard()
    }
  },
  mounted() {
    this._resizeBound = () => {
      if (this.chart) this.chart.resize()
    }
    window.addEventListener('resize', this._resizeBound)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._resizeBound)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    numFormat(n) {
      return numFormatKWM(Number(n) || 0) || '0'
    },
    formatTime(val) {
      if (!val) return '-'
      if (this.getYMDTime) return this.getYMDTime(val)
      return String(val).slice(0, 16)
    },
    categoryName(row) {
      if (!row) return '未分类'
      if (row.categoryName) return row.categoryName
      if (row.category && row.category.categoryName) {
        return row.category.categoryName
      }
      return row.articleCategory != null ? ('分类#' + row.articleCategory) : '未分类'
    },
    tagColor(row) {
      const name = this.categoryName(row)
      let hash = 0
      for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * 17) % 360
      return `hsl(${hash}, 55%, 42%)`
    },
    excerpt(row) {
      const text = row.abstractText || row.articleDigest || row.articleTitle || ''
      return String(text).replace(/<[^>]+>/g, '').slice(0, 80)
    },
    calcCtr(row) {
      const views = Number(row.viewCount) || 0
      const likes = Number(row.likeCount) || 0
      if (!views) return '0%'
      return ((likes / views) * 100).toFixed(1) + '%'
    },
    async loadDashboard() {
      this.loading = true
      try {
        const res = await getDashboardStats(30)
        const data = (res && res.data) || {}
        this.stats = data
        this.trend = Array.isArray(data.trend) ? data.trend : []
        this.recentArticles = Array.isArray(data.recentArticles) ? data.recentArticles : []
        this.categoryRatio = (data.categoryRatio || []).map((c) => ({
          name: c.name || '未分类',
          percent: Number(c.percent) || 0,
          count: c.count
        }))
        if (!this.categoryRatio.length) {
          this.categoryRatio = [{ name: '暂无分类', percent: 0 }]
        }
        this.buildKpi()
        const top = this.categoryRatio[0]
        if (top && top.percent >= 40) {
          this.insightText = `「${top.name}」占比偏高（${top.percent}%），可适当补充其他类型。今日 UV ${this.numFormat(data.todayUv)} / PV ${this.numFormat(data.todayPv)}。`
        } else {
          this.insightText = `今日 UV ${this.numFormat(data.todayUv)}，PV ${this.numFormat(data.todayPv)}；阅读增量 ${this.numFormat(data.todayViews)}，点赞增量 ${this.numFormat(data.todayLikes)}。`
        }
        this.$nextTick(() => this.renderTrendChart())
      } catch (e) {
        this.$message.error((e && (e.msg || e.message)) || '加载看板数据失败')
      } finally {
        this.loading = false
      }
    },
    buildKpi() {
      const s = this.stats || {}
      const vp = s.visitPeriod || {}
      const totalViews = Number(s.totalViews) || 0
      const totalLikes = Number(s.totalLikes) || 0
      const avgCtr = totalViews ? ((totalLikes / totalViews) * 100) : 0
      this.kpiList = [
        {
          key: 'visit',
          label: '总访问量',
          value: this.numFormat(vp.visitCount != null ? vp.visitCount : s.todayPv),
          delta: '今日 ' + this.numFormat(vp.today) + ' · 月 ' + this.numFormat(vp.month),
          up: true,
          icon: 'el-icon-data-line',
          iconBg: 'rgba(56,189,248,0.18)'
        },
        {
          key: 'views',
          label: '总阅读量',
          value: this.numFormat(totalViews),
          delta: '今日 +' + this.numFormat(s.todayViews) + ' · 年访 ' + this.numFormat(vp.year),
          up: true,
          icon: 'el-icon-view',
          iconBg: 'rgba(59,130,246,0.18)'
        },
        {
          key: 'likes',
          label: '总点赞',
          value: this.numFormat(totalLikes),
          delta: '今日 +' + this.numFormat(s.todayLikes) + ' · 季访 ' + this.numFormat(vp.quarter),
          up: true,
          icon: 'el-icon-star-off',
          iconBg: 'rgba(249,115,22,0.18)'
        },
        {
          key: 'uv',
          label: '今日 UV',
          value: this.numFormat(s.todayUv),
          delta: 'PV ' + this.numFormat(s.todayPv),
          up: true,
          icon: 'el-icon-user',
          iconBg: 'rgba(167,139,250,0.18)'
        },
        {
          key: 'ctr',
          label: '互动率',
          value: avgCtr.toFixed(1) + '%',
          delta: '评论 ' + this.numFormat(s.totalComments),
          up: true,
          icon: 'el-icon-aim',
          iconBg: 'rgba(52,211,153,0.18)'
        }
      ]
    },
    renderTrendChart() {
      if (!this.$refs.trendChart) return
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      this.chart = echarts.init(this.$refs.trendChart)
      const labels = this.trend.map((t) => t.label || t.date)
      const pvSeries = this.trend.map((t) => Number(t.pv) || 0)
      const viewSeries = this.trend.map((t) => Number(t.newViews) || 0)
      const likeSeries = this.trend.map((t) => Number(t.newLikes) || 0)

      this.chart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['PV', '阅读增量', '点赞增量'],
          textStyle: { color: '#94a3b8' },
          top: 0
        },
        grid: { left: 40, right: 16, top: 36, bottom: 28 },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: '#64748b', interval: 4 },
          axisLine: { lineStyle: { color: '#1e293b' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b' },
          splitLine: { lineStyle: { color: 'rgba(148,163,184,0.12)' } }
        },
        series: [
          {
            name: 'PV',
            type: 'bar',
            barMaxWidth: 12,
            data: pvSeries,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#2563eb' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          },
          {
            name: '阅读增量',
            type: 'line',
            smooth: true,
            data: viewSeries,
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { color: '#34d399', width: 2 },
            itemStyle: { color: '#34d399' }
          },
          {
            name: '点赞增量',
            type: 'line',
            smooth: true,
            data: likeSeries,
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { color: '#f59e0b', width: 2 },
            itemStyle: { color: '#f59e0b' }
          }
        ]
      })
    },
    goWrite() {
      this.$router.push('/admin/geekplus/writeArticle')
    },
    goAllArticles() {
      this.$router.push('/admin/geekplus/articles')
    },
    goEdit(row) {
      this.$router.push({ path: '/admin/geekplus/writeArticle', query: { articleId: row.id } })
    },
    onArticleCmd(cmd, row) {
      if (cmd === 'edit') this.goEdit(row)
      else if (cmd === 'view') window.open(`/article/${row.id}`, '_blank')
      else if (cmd === 'list') this.goAllArticles()
    },
    handleExport() {
      this.exporting = true
      this.exportChart()
      // exportArticles({})
      //   .then((response) => {
      //     this.download(response.msg);
      //     //this.$message.success('已发起导出，请按接口返回下载')
      //   })
      //   .catch(() => {
      //     this.$message.warning('导出接口暂不可用，可在文章列表页导出')
      //   })
      //   .finally(() => {
      //     this.exporting = false
      //   })
    },
    async exportChart() {
      const chart = echarts.getInstanceByDom(this.$refs.trendChart);
      const canvas = chart.renderToCanvas({pixelRatio: 2}); // 获取渲染后的canvas对象
      const imageUrl = canvas.toDataURL('image/png'); // 将canvas转换为图片URL
      const link = document.createElement('a'); // 创建一个a标签用于下载图片
      link.download = 'echarts-chart.png'; // 设置下载文件名
      link.href = imageUrl; // 设置下载链接为图片的URL
      document.body.appendChild(link); // 将a标签添加到文档中以便触发下载
      link.click(); // 触发点击事件开始下载
      document.body.removeChild(link); // 下载完成后移除a标签
      this.exporting = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.blog-insight-dash {
  --dash-bg: var(--background, #0b1220);
  --dash-panel: var(--background-origin, #111a2e);
  --dash-border: var(--border-color, rgba(148, 163, 184, 0.12));
  --dash-text: var(--text-color, #e2e8f0);
  --dash-muted: var(--text-color-2, #94a3b8);
  --dash-accent: var(--theme-color, #3b82f6);
  min-height: calc(100vh - 84px);
  padding: 24px;
  background:
    radial-gradient(1200px 480px at 10% -10%, rgba(37, 99, 235, 0.18), transparent 60%),
    radial-gradient(900px 420px at 90% 0%, rgba(245, 158, 11, 0.08), transparent 55%),
    var(--dash-bg);
  color: var(--dash-text);
}

.dash-denied {
  max-width: 480px;
  margin: 80px auto;
  text-align: center;
  padding: 40px 24px;
  border-radius: 16px;
  background: var(--dash-panel);
  border: 1px solid var(--dash-border);

  i {
    font-size: 42px;
    color: var(--dash-accent);
  }

  h2 {
    margin: 12px 0 8px;
    font-size: 20px;
  }

  p {
    color: var(--dash-muted);
    margin-bottom: 20px;
    line-height: 1.6;
  }
}

.dash-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.dash-header__text {
  h1 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  p {
    margin: 0;
    color: var(--dash-muted);
    font-size: 13px;
  }
}

.dash-header__actions {
  display: flex;
  gap: 10px;
}

.btn-ghost {
  background: transparent !important;
  border-color: rgba(148, 163, 184, 0.35) !important;
  color: var(--dash-text) !important;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.kpi-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--dash-panel);
  border: 1px solid var(--dash-border);
}

.kpi-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93c5fd;
  font-size: 18px;
}

.kpi-card__label {
  font-size: 12px;
  color: var(--dash-muted);
}

.kpi-card__value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  margin: 2px 0;
}

.kpi-card__delta {
  font-size: 12px;

  &.is-up {
    color: #34d399;
  }

  &.is-down {
    color: #f87171;
  }
}

.chart-row {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.dash-panel {
  border-radius: 14px;
  background: var(--dash-panel);
  border: 1px solid var(--dash-border);
  padding: 16px 18px 18px;
}

.dash-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }
}

.dash-panel__hint {
  font-size: 12px;
  color: var(--dash-muted);
}

.trend-chart {
  width: 100%;
  height: 280px;
}

.ratio-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ratio-item__top {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--dash-muted);

  strong {
    color: var(--dash-text);
  }
}

.insight-box {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);

  i {
    color: #fbbf24;
    font-size: 18px;
    margin-top: 2px;
  }

  strong {
    font-size: 13px;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--dash-muted);
    line-height: 1.5;
  }
}

.recent-panel {
  padding-bottom: 8px;
}

.recent-empty {
  padding: 28px;
  text-align: center;
  color: var(--dash-muted);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 4px;
  border-top: 1px solid var(--dash-border);

  &:first-of-type {
    border-top: none;
  }
}

.recent-item__cover {
  width: 88px;
  height: 64px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  background: #1e293b;
}

.recent-item__main {
  flex: 1;
  min-width: 0;
}

.recent-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--dash-muted);
  margin-bottom: 4px;
}

.recent-item__title {
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  color: var(--dash-text);
  text-decoration: none;
  margin-bottom: 4px;

  &:hover {
    color: #93c5fd;
  }
}

.recent-item__excerpt {
  margin: 0;
  font-size: 12px;
  color: var(--dash-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-item__stats {
  display: flex;
  gap: 18px;
  flex-shrink: 0;

  div {
    text-align: center;
    min-width: 52px;
  }

  span {
    display: block;
    font-size: 11px;
    color: var(--dash-muted);
  }

  strong {
    font-size: 14px;
  }
}

.recent-item__more {
  border: none;
  background: transparent;
  color: var(--dash-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
}

@media screen and (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .blog-insight-dash {
    padding: 16px 12px 28px;
  }

  .kpi-row {
    grid-template-columns: 1fr;
  }

  .recent-item {
    flex-wrap: wrap;
  }

  .recent-item__stats {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
