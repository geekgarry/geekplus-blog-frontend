<template>
  <div class="dashboard app-container oa-workbench">
    <el-page-header content="OA工作台" class="wb-header" />

    <!-- 统计卡：可点击跳转对应列表；栅格随屏宽断行 -->
    <el-row :gutter="16" class="wb-stats">
      <el-col
        v-for="(card, i) in statCards"
        :key="i"
        :xs="12"
        :sm="12"
        :md="6"
        :lg="6"
      >
        <el-card
          shadow="hover"
          class="stat-card"
          role="button"
          tabindex="0"
          @click.native="goStat(card)"
          @keyup.enter.native="goStat(card)"
        >
          <div class="stat-icon" :style="{ background: card.color }">{{ card.icon }}</div>
          <div class="stat-info">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
          <i class="el-icon-arrow-right stat-arrow" aria-hidden="true" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="wb-main">
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card class="wb-templates">
          <div slot="header">📋 流程模板（点击快速创建）</div>
          <div class="tpl-card-container">
            <div v-for="tpl in templates" :key="tpl.key" class="tpl-item">
              <div class="tpl-card" @click="createFromTemplate(tpl)">
                <div class="tpl-icon">{{ tpl.icon }}</div>
                <h4>{{ tpl.name }}</h4>
                <p>{{ tpl.description }}</p>
              </div>
            </div>
            <el-empty v-if="!templates.length" description="暂无可用模板" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="shortcut-card">
          <div slot="header">⚡ 快捷操作</div>
          <div class="shortcut-actions">
            <el-button type="primary" icon="el-icon-plus" class="shortcut-btn"
                        @click="$router.push('/oa/designer')">
              新建流程
            </el-button>
            <el-button type="success" icon="el-icon-document-checked" class="shortcut-btn"
                        @click="goStat({ path: '/oa/task', query: { tab: 'todo' } })">
              我的待办 ({{ todoCount }})
            </el-button>
            <el-button class="shortcut-btn"
                        @click="$router.push('/oa/process')">
              流程管理
            </el-button>
            <el-button type="warning" icon="el-icon-s-claim" class="shortcut-btn"
                        @click="$router.push('/oa/mine')">
              我的申请
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTemplates, myTasks, myHistoryTasks, myProcesses, listPublished } from '@/api/oa/designer'

export default {
  name: 'OaWorkbench',
  data() {
    return {
      templates: [],
      todoCount: 0,
      // path/query：点击统计卡直达对应列表页（待办/已办走 task 的 tab）
      statCards: [
        { icon: '📝', label: '待办任务', value: 0, color: '#409eff', path: '/admin/oa/task', query: { tab: 'todo' } },
        { icon: '✅', label: '已办任务', value: 0, color: '#f56c6c', path: '/admin/oa/task', query: { tab: 'done' } },
        { icon: '📋', label: '我的申请', value: 0, color: '#e6a23c', path: '/admin/oa/mine' },
        { icon: '📊', label: '已发布流程', value: 0, color: '#67c23a', path: '/admin/oa/process', query: { tab: 'PUBLISHED' } }
      ]
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  created() {
    this.loadTemplates()
    this.loadStats()
  },
  methods: {
    /** 统计卡 / 快捷入口统一跳转 */
    goStat(card) {
      if (!card || !card.path) return
      this.$router.push({ path: card.path, query: card.query || {} }).catch(() => {})
    },
    loadTemplates() {
      getTemplates().then(res => {
        const list = res.data || res.rows || []
        const icons = { leave: '🏖️', expense: '💰', purchase: '🛒', contract: '📄', travel: '✈️', transfer: '🔄' }
        this.templates = list.map(t => ({
          ...t,
          icon: icons[t.key] || '📋'
        }))
      }).catch(() => {})
    },
    async loadStats() {
      const userId = this.userId != null ? String(this.userId) : ''
      if (!userId) return
      try {
        const [todoRes, doneRes, mineRes, pubRes] = await Promise.all([
          myTasks(userId).catch(() => ({ data: [] })),
          myHistoryTasks(userId).catch(() => ({ data: [] })),
          myProcesses(userId).catch(() => ({ data: [] })),
          listPublished().catch(() => ({ data: [] }))
        ])
        const todos = todoRes.data || todoRes.rows || []
        const done = doneRes.data || doneRes.rows || []
        const mine = mineRes.data || mineRes.rows || []
        const pub = pubRes.data || pubRes.rows || []
        this.todoCount = todos.length
        // 与 statCards 顺序一致：待办 / 已办 / 我的申请 / 已发布
        this.statCards[0].value = todos.length
        this.statCards[1].value = done.length
        this.statCards[2].value = mine.length
        this.statCards[3].value = pub.length
      } catch (e) { /* ignore */ }
    },
    createFromTemplate(tpl) {
      this.$router.push({ path: '/oa/designer', query: { template: tpl.key, name: tpl.name } })
    }
  }
}
</script>

<style scoped>
.oa-workbench {
  padding-bottom: 24px;
}

.wb-header {
  margin-bottom: 16px;
}

.wb-stats {
  margin-bottom: 16px;
}

.wb-stats .el-col {
  margin-bottom: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card:focus {
  outline: 2px solid var(--theme-color, #409eff);
  outline-offset: 2px;
}

.stat-icon {
  font-size: 28px;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.stat-info {
  min-width: 0;
  flex: 1;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-color-2, #303133);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-color, #909399);
  margin-top: 4px;
}

.stat-arrow {
  color: var(--text-color, #c0c4cc);
  font-size: 14px;
  flex-shrink: 0;
  margin-left: 4px;
}

.wb-main .el-col {
  margin-bottom: 16px;
}

/* 模板：大屏 3 列 → 平板 2 列 → 手机 1 列 */
.tpl-card-container {
  column-count: 3;
  column-gap: 16px;
}

.tpl-item {
  break-inside: avoid;
  margin-bottom: 16px;
  width: 100%;
}

.tpl-card {
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 8px;
  padding: 16px 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--background-origin, #fff);
}

.tpl-card:hover {
  border-color: var(--theme-color, #409eff);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.tpl-icon {
  font-size: 32px;
  margin-bottom: 6px;
}

.tpl-card h4 {
  margin: 6px 0 4px;
  color: var(--text-color-2, #303133);
  font-size: 15px;
}

.tpl-card p {
  margin: 0;
  font-size: 12px;
  color: var(--text-color, #909399);
  line-height: 1.4;
}

.shortcut-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut-btn {
  width: 100%;
  margin-left: 0 !important;
}

.shortcut-card .el-button + .el-button {
  margin-left: 0;
}

@media (max-width: 991px) {
  .tpl-card-container {
    column-count: 2;
  }
}

@media (max-width: 767px) {
  .oa-workbench {
    padding-left: 8px;
    padding-right: 8px;
  }

  .stat-card {
    padding: 12px 10px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
    margin-right: 10px;
  }

  .stat-value {
    font-size: 22px;
  }

  .tpl-card-container {
    column-count: 1;
  }

  /* 手机：快捷操作两列，减少纵向滚动 */
  .shortcut-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .shortcut-actions {
    grid-template-columns: 1fr;
  }
}
</style>
