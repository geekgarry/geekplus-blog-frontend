<template>
  <div class="admin-dashboard app-container">
    <el-tabs v-model="activeTab" class="dashboard-tabs">
      <el-tab-pane label="数据概览" name="overview">
        <div class="dashboard-toolbar">
          <el-button type="primary" icon="el-icon-refresh" :loading="loading" @click="loadDashboard">
            刷新数据
          </el-button>
        </div>

        <div v-loading="loading && !kpiList.length" class="dashboard-body">
          <el-row :gutter="20" class="kpi-row">
            <el-col :xs="24" :sm="12" :md="6" v-for="item in kpiList" :key="item.key">
              <el-card shadow="hover" class="kpi-card">
                <div class="kpi-card__label">{{ item.label }}</div>
                <div class="kpi-card__value" :style="{ color: item.color }">
                  {{ item.value }}<span class="kpi-card__suffix">{{ item.suffix }}</span>
                </div>
                <div class="kpi-card__delta">{{ item.delta }}</div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="chart-row">
            <el-col :xs="24" :md="12">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="chart-head">近 7 日用户登录</div>
                <div ref="loginChart" class="chart-box" />
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="chart-head">近 7 日用户操作</div>
                <div ref="operChart" class="chart-box" />
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="chart-row">
            <el-col :xs="24" :md="12">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="chart-head">操作模块分布</div>
                <div ref="operPieChart" class="chart-box" />
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="chart-head">访问地域分布</div>
                <div ref="mapChart" class="chart-box" />
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="chart-row">
            <el-col :xs="24" :lg="14">
              <el-card shadow="hover" class="metric-card-wrap">
                <div slot="header" class="chart-head">系统核心指标</div>
                <div class="metric-card__body" :class="{ 'is-masked': serverForbidden }">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <div class="metric-block">
                        <div class="metric-title">CPU</div>
                        <el-progress :percentage="num(server.cpu.used)" :stroke-width="10" />
                        <div class="metric-meta">
                          核心 {{ server.cpu.cpuNum || '-' }} · 系统 {{ pct(server.cpu.sys) }} · 空闲 {{ pct(server.cpu.free) }}
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="metric-block">
                        <div class="metric-title">内存 / JVM</div>
                        <el-progress :percentage="num(server.mem.usage)" :stroke-width="10" status="success" />
                        <div class="metric-meta">物理 {{ memSummary }} · JVM {{ pct(server.jvm.usage) }}</div>
                      </div>
                    </el-col>
                  </el-row>
                  <el-descriptions :column="2" border size="small" class="metric-desc">
                    <el-descriptions-item label="服务器名">{{ server.sys.computerName || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="服务器 IP">{{ server.sys.computerIp || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="操作系统">{{ server.sys.osName || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="系统架构">{{ server.sys.osArch || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="运行时长">{{ server.sys.runTime || server.jvm.runTime || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="Java 版本">{{ server.jvm.version || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="磁盘分区" :span="2">
                      <span v-if="!diskSummary.length">-</span>
                      <span v-else>
                        <span v-for="(d, i) in diskSummary" :key="d.dirName">
                          {{ d.dirName }} {{ d.usage }}%<span v-if="i < diskSummary.length - 1"> · </span>
                        </span>
                      </span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
                <div v-if="serverForbidden" class="metric-card__mask">
                  <i class="el-icon-lock metric-card__mask-icon" />
                  <div class="metric-card__mask-title">暂无权限查看</div>
                  <div class="metric-card__mask-desc">需要 <code>monitor:server:list</code> 权限，请联系管理员授权</div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :lg="10">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="chart-head">最近登录</div>
                <el-table :data="recentLogins" size="small" border max-height="320">
                  <el-table-column prop="logUsername" label="用户" width="90" show-overflow-tooltip />
                  <el-table-column prop="logLoginIp" label="IP" width="110" />
                  <el-table-column prop="loginLocation" label="地点" show-overflow-tooltip />
                  <el-table-column label="状态" width="72">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.logType === 1 ? 'success' : 'danger'" size="mini">
                        {{ formatLoginStatus(scope.row.logType) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="时间" width="150">
                    <template slot-scope="scope">{{ dateFormat(scope.row.logTime) }}</template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="chart-row">
            <el-col :span="24">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="chart-head">最近操作</div>
                <el-table :data="recentOpers" size="small" border>
                  <el-table-column prop="title" label="模块" min-width="140" show-overflow-tooltip />
                  <el-table-column prop="operName" label="操作人" width="90" />
                  <el-table-column label="类型" width="80">
                    <template slot-scope="scope">{{ formatOperType(scope.row.businessType) }}</template>
                  </el-table-column>
                  <el-table-column prop="operIp" label="IP" width="120" />
                  <el-table-column label="状态" width="80">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.status === (200 || 201 || 1) ? 'success' : 'danger'" size="mini">
                        {{ scope.row.status === (200 || 201 || 1) ? '成功' : '失败' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="时间" width="160">
                    <template slot-scope="scope">{{ dateFormat(scope.row.operTime) }}</template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="系统介绍" name="intro" lazy>
        <dashboard-intro />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { registerChinaMap } from '@/assets/echarts/map/js/registerChina'
import { listLoginLog, getLoginLogCountByDay } from '@/api/system/log/loginlog'
import {
  listOperLog,
  getViewCount,
  getOperLogCountByDay,
  getOperLogCountByTitle
} from '@/api/system/log/operlog'
import { getServer } from '@/api/monitor/server'
import { getOnlineUserCount } from '@/api/monitor/online'
import { mergeDailyCounts, lastNDays, parseStatsList } from '@/utils/dashboardStats'
import { dateFormat } from '@/utils/gputil'
import DashboardIntro from './DashboardIntro.vue'

const TREND_DAYS = 7

/** 图表色板：对齐站点莫兰迪 token */
const CHART_COLORS = {
  green: '#6f8f72',
  blue: '#6f8b96',
  purple: '#8fa3a6',
  pie: ['#6f8f72', '#6f8b96', '#8fa3a6', '#a8b5b0', '#c4b8ae', '#b56a6a']
}

function emptyServer() {
  return { cpu: {}, mem: {}, jvm: {}, sys: {}, sysFiles: [] }
}

function parseOnlineCount(res) {
  if (res == null) return 0
  if (typeof res === 'number') return res
  const d = res.data
  if (typeof d === 'number') return d
  if (d && typeof d.count === 'number') return d.count
  if (typeof res.count === 'number') return res.count
  return Number(res.total) || 0
}

function isForbiddenError(err) {
  const status = err && err.response && err.response.status
  return status === 403
}

export default {
  name: 'Dashboard',
  components: { DashboardIntro },
  data() {
    return {
      activeTab: 'overview',
      loading: false,
      kpiList: [],
      recentLogins: [],
      recentOpers: [],
      server: emptyServer(),
      serverForbidden: false,
      charts: {}
    }
  },
  computed: {
    memSummary() {
      const m = this.server.mem || {}
      if (m.used != null && m.total != null) return `${m.used}G / ${m.total}G`
      if (m.usage != null) return `${m.usage}%`
      return '-'
    },
    diskSummary() {
      return (this.server.sysFiles || []).slice(0, 4).map((f) => ({
        dirName: f.dirName,
        usage: f.usage != null ? Math.round(Number(f.usage)) : 0
      }))
    }
  },
  mounted() {
    this.loadDashboard()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    Object.keys(this.charts).forEach((k) => {
      if (this.charts[k]) this.charts[k].dispose()
    })
  },
  methods: {
    dateFormat,
    num(v) {
      const n = Number(v)
      return Number.isNaN(n) ? 0 : Math.min(100, Math.round(n))
    },
    pct(v) {
      return v != null && !Number.isNaN(Number(v)) ? `${v}%` : '-'
    },
    formatLoginStatus(type) {
      if (type === 1) return '成功'
      if (type === 0) return '失败'
      return '其它'
    },
    formatOperType(type) {
      const map = { 0: '其它', 1: '新增', 2: '修改', 3: '删除', 4: '授权', 5: '导出', 6: '导入', 7: '强退', 8: '生成', 9: '清空' }
      return map[type] || '其它'
    },
    resizeCharts() {
      Object.keys(this.charts).forEach((k) => {
        if (this.charts[k]) this.charts[k].resize()
      })
    },
    initChart(refName, option) {
      const el = this.$refs[refName]
      if (!el) return
      if (this.charts[refName]) this.charts[refName].dispose()
      const chart = echarts.init(el)
      chart.setOption(option)
      this.charts[refName] = chart
    },
    loadDashboard() {
      this.loading = true
      const days = lastNDays(TREND_DAYS)
      const recentQuery = { pageNum: 1, pageSize: 10 }

      const serverPromise = getServer({ __suppressErrorTip: true })
        .then((res) => ({ res, forbidden: false }))
        .catch((err) => ({ res: {}, forbidden: isForbiddenError(err) }))

      Promise.all([
        getLoginLogCountByDay(TREND_DAYS).catch(() => ({})),
        getOperLogCountByDay(TREND_DAYS).catch(() => ({})),
        getOperLogCountByTitle(TREND_DAYS).catch(() => ({})),
        listLoginLog(recentQuery).catch(() => ({ rows: [] })),
        listOperLog(recentQuery).catch(() => ({ rows: [] })),
        serverPromise,
        getOnlineUserCount().catch(() => ({})),
        getViewCount().catch(() => ({}))
      ])
        .then(([loginTrendRes, operTrendRes, operModuleRes, loginList, operList, serverOut, onlineRes, mapRes]) => {
          const loginCounts = mergeDailyCounts(days, parseStatsList(loginTrendRes))
          const operCounts = mergeDailyCounts(days, parseStatsList(operTrendRes))
          const todayLogin = loginCounts[loginCounts.length - 1] || 0
          const todayOper = operCounts[operCounts.length - 1] || 0
          const weekLogin = loginCounts.reduce((a, b) => a + b, 0)
          const weekOper = operCounts.reduce((a, b) => a + b, 0)

          this.serverForbidden = serverOut.forbidden
          const sd = (serverOut.res && serverOut.res.data) || serverOut.res || {}
          this.server = this.serverForbidden
            ? emptyServer()
            : {
                cpu: sd.cpu || {},
                mem: sd.mem || sd.memory || {},
                jvm: sd.jvm || {},
                sys: sd.sys || sd.system || {},
                sysFiles: Array.isArray(sd.sysFiles) ? sd.sysFiles : []
              }

          const cpu = this.server.cpu
          const onlineNum = parseOnlineCount(onlineRes)

          this.kpiList = [
            { key: 'online', label: '在线用户', value: onlineNum, suffix: '人', color: CHART_COLORS.blue, delta: '实时会话数' },
            { key: 'login', label: '今日登录', value: todayLogin, suffix: '次', color: CHART_COLORS.green, delta: `近${TREND_DAYS}日合计 ${weekLogin} 次` },
            { key: 'oper', label: '今日操作', value: todayOper, suffix: '次', color: '#c49a7c', delta: `近${TREND_DAYS}日合计 ${weekOper} 次` },
            {
              key: 'cpu',
              label: 'CPU 使用',
              value: this.serverForbidden ? '-' : (cpu.used != null ? this.num(cpu.used) : '-'),
              suffix: !this.serverForbidden && cpu.used != null ? '%' : '',
              color: CHART_COLORS.purple,
              delta: this.serverForbidden ? '无服务监控权限' : `内存 ${this.pct(this.server.mem.usage)}`
            }
          ]

          this.recentLogins = loginList.rows || []
          this.recentOpers = operList.rows || []

          const pieData = parseStatsList(operModuleRes).map((r) => ({
            name: r.name || r.title || '其他',
            value: Number(r.value != null ? r.value : r.count) || 0
          }))

          this.$nextTick(() => this.renderCharts(days, loginCounts, operCounts, pieData, mapRes))
        })
        .finally(() => {
          this.loading = false
        })
    },
    renderCharts(days, loginCounts, operCounts, pieData, mapRes) {
      const xLabels = days.map((d) => d.slice(5))

      this.initChart('loginChart', {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 24, bottom: 28 },
        xAxis: { type: 'category', data: xLabels, boundaryGap: false },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{
          name: '登录次数',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.12, color: CHART_COLORS.green },
          itemStyle: { color: CHART_COLORS.green },
          data: loginCounts
        }]
      })

      this.initChart('operChart', {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 24, bottom: 28 },
        xAxis: { type: 'category', data: xLabels },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{
          name: '操作次数',
          type: 'bar',
          itemStyle: { color: CHART_COLORS.blue, borderRadius: [4, 4, 0, 0] },
          data: operCounts
        }]
      })

      const pieList = pieData.length ? pieData : [{ name: '暂无数据', value: 1 }]
      this.initChart('operPieChart', {
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, type: 'scroll' },
        color: CHART_COLORS.pie,
        series: [{ name: '操作模块', type: 'pie', radius: ['35%', '60%'], data: pieList }]
      })

      registerChinaMap()
      const mapPayload = mapRes.data != null ? mapRes.data : mapRes
      const mapList = Array.isArray(mapPayload) ? mapPayload : (mapPayload.rows || [])
      const mapMax = Math.max(10, ...mapList.map((i) => Number(i.value) || 0))

      this.initChart('mapChart', {
        tooltip: {
          trigger: 'item',
          formatter(params) {
            const region = params.name || '未知地区'
            const count = params.value != null && !Number.isNaN(Number(params.value)) ? params.value : 0
            return `${region}<br/>访问次数：${count}`
          }
        },
        visualMap: {
          min: 0,
          max: mapMax,
          left: 'left',
          bottom: 20,
          text: ['高', '低'],
          calculable: true,
          inRange: { color: ['#88BFD3', '#66ADC7', '#459BBA', '#387F99', '#2C6478'] }
        },
        series: [{
          name: '访问次数',
          type: 'map',
          map: 'china',
          roam: true,
          data: mapList,
          emphasis: { label: { show: true } }
        }]
      })
    }
  }
}
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding-top: 8px;
}
.dashboard-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 16px;
  }
  ::v-deep .el-tabs__item.is-active {
    color: var(--theme-color, #6f8f72);
  }
  ::v-deep .el-tabs__active-bar {
    background-color: var(--theme-color, #6f8f72);
  }
}
.dashboard-toolbar {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.kpi-row {
  margin-bottom: 4px;
}
.kpi-card {
  margin-bottom: 16px;
  border-radius: var(--gp-surface-radius, 14px);
  border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
  background: var(--gp-surface-bg, var(--background-origin));
  color: var(--text-color-2);
  &__label {
    font-size: 13px;
    color: var(--muted-1-color, var(--greyFont, #7a7672));
    margin-bottom: 8px;
  }
  &__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text-color-2);
  }
  &__suffix {
    font-size: 14px;
    font-weight: 500;
    margin-left: 4px;
  }
  &__delta {
    margin-top: 8px;
    font-size: 12px;
    color: var(--muted-1-color, var(--greyFont, #7a7672));
  }
}
.chart-row {
  margin-bottom: 4px;
}
.chart-card,
.metric-card-wrap {
  margin-bottom: 16px;
  border-radius: var(--gp-surface-radius, 14px);
  border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
  background: var(--gp-surface-bg, var(--background-origin));
  color: var(--text-color-2);
}
.chart-head {
  font-weight: 600;
  color: var(--gp-surface-title, var(--theme-color));
}
.chart-box {
  height: 300px;
  width: 100%;
}
.metric-block {
  margin-bottom: 12px;
}
.metric-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}
.metric-meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--greyFont, #7a7672);
}
.metric-desc {
  margin-top: 12px;
}
.metric-card-wrap {
  position: relative;
  overflow: hidden;
}
.metric-card__body.is-masked {
  filter: blur(2px);
  pointer-events: none;
  user-select: none;
  opacity: 0.45;
}
.metric-card__mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  /* 随深浅色：勿写死奶白蒙层 */
  background: var(--disabled-background, var(--maxWhiteMask, rgba(250, 249, 247, 0.82)));
  color: var(--text-color-2);
  text-align: center;
}
.metric-card__mask-icon {
  font-size: 28px;
  color: var(--muted-1-color, var(--greyFont, #7a7672));
  margin-bottom: 8px;
}
.metric-card__mask-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color-2);
}
.metric-card__mask-desc {
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted-1-color, var(--greyFont, #7a7672));
  code {
    padding: 0 4px;
    border-radius: var(--gp-border-radius-base, 4px);
    background: var(--background-1, var(--lightGray, #e4e0db));
    color: var(--text-color-2);
  }
}
</style>
