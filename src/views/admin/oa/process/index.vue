<template>
  <div class="process-list app-container">
    <el-card>
      <div slot="header" style="display:flex;justify-content:space-between;align-items:center">
        <span>📋 流程管理</span>
        <el-button type="primary" size="small" @click="$router.push('/oa/designer')">
          + 新建流程
        </el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-click="loadData">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="草稿" name="DRAFT" />
        <el-tab-pane label="已发布" name="PUBLISHED" />
        <el-tab-pane label="已停用" name="DISABLED" />
      </el-tabs>

      <!-- 无数据只展示空状态，不渲染空表头 -->
      <div v-loading="loading" class="oa-list-body">
        <el-table v-if="list.length" :data="list" style="width:100%">
          <el-table-column label="ID" width="170" show-overflow-tooltip>
            <template slot-scope="{row}">{{ rowId(row) }}</template>
          </el-table-column>
          <el-table-column prop="processKey" label="processKey" min-width="140" show-overflow-tooltip />
          <el-table-column prop="name" label="流程名称" min-width="160" />
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column label="状态" width="100">
            <template slot-scope="{row}">
              <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="80" />
          <el-table-column label="更新时间" width="170">
            <template slot-scope="{row}">{{ formatTime(row.updateTime) }}</template>
          </el-table-column>
          <el-table-column label="更多" width="200">
            <template slot-scope="{row}">
              <el-button size="mini" @click="downloadBpmn(row)">下载源码</el-button>
              <el-button v-if="isStatus(row, 'DRAFT')" size="mini" type="success"
                          @click="publish(row)">发布</el-button>
              <el-button v-if="isStatus(row, 'PUBLISHED')" size="mini" type="warning"
                          @click="disable(row)">停用</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template slot-scope="{row}">
              <el-button size="mini" @click="edit(row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else-if="!loading" description="暂无流程">
          <el-button type="primary" size="small" @click="$router.push('/oa/designer')">新建流程</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script>
import { listProcesses, publish as pubApi, disable, deleteProcess, getBpmn } from '@/api/oa/designer'

export default {
  name: 'OaProcessList',
  data() {
    return { activeTab: 'ALL', list: [], loading: false }
  },
  created() {
    // 工作台「已发布流程」带 ?tab=PUBLISHED
    const tab = (this.$route.query.tab || '').toString().toUpperCase()
    if (['ALL', 'DRAFT', 'PUBLISHED', 'DISABLED'].includes(tab)) this.activeTab = tab
    this.loadData()
  },
  watch: {
    '$route.query.tab'(val) {
      const tab = (val || 'ALL').toString().toUpperCase()
      if (['ALL', 'DRAFT', 'PUBLISHED', 'DISABLED'].includes(tab) && tab !== this.activeTab) {
        this.activeTab = tab
        this.loadData()
      }
    }
  },
  methods: {
    /** 始终按字符串使用主键，避免雪花 ID 被 Number 截断 */
    rowId(row) {
      return row && row.id != null ? String(row.id) : ''
    },
    isStatus(row, status) {
      return String(row.status || '') === status
    },
    async loadData() {
      this.loading = true
      try {
        const res = await listProcesses()
        let data = (res.data || []).map(p => ({
          ...p,
          id: p.id != null ? String(p.id) : p.id
        }))
        if (this.activeTab !== 'ALL') {
          data = data.filter(p => this.isStatus(p, this.activeTab))
        }
        this.list = data
      } finally { this.loading = false }
    },
    edit(row) {
      const id = this.rowId(row)
      if (!id) return this.$message.error('流程 ID 无效，无法编辑')
      this.$router.push({ name: 'OaDesignerEdit', params: { id } })
    },
    async downloadBpmn(row) {
      const id = this.rowId(row)
      if (!id) return this.$message.error('流程 ID 无效')
      try {
        const res = await getBpmn(id)
        const xml = typeof res === 'string' ? res : (res.data || res)
        if (!xml || typeof xml !== 'string') {
          return this.$message.error('未获取到 BPMN 内容')
        }
        const blob = new Blob([xml], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = (row.name || row.processKey || 'process') + '.bpmn'
        a.click()
        URL.revokeObjectURL(url)
        this.$message.success('已下载 BPMN 源码')
      } catch (e) {
        this.$message.error('下载失败: ' + (e.response?.data?.message || e.message))
      }
    },
    publish(row) {
      const id = this.rowId(row)
      this.$confirm('确认发布该流程？发布后不可编辑。', '提示', { type: 'warning' })
        .then(() => pubApi(id))
        .then(() => { this.$message.success('发布成功'); this.loadData() })
        .catch(() => {})
    },
    disable(row) {
      const id = this.rowId(row)
      this.$confirm('确认停用该流程？停用后无法发起新审批。', '提示', { type: 'warning' })
        .then(() => disable(id))
        .then(() => { this.$message.success('已停用'); this.loadData() })
        .catch(() => {})
    },
    remove(row) {
      const id = this.rowId(row)
      this.$confirm('确认删除该流程？', '提示', { type: 'warning' })
        .then(() => deleteProcess(id))
        .then(() => { this.$message.success('已删除'); this.loadData() })
        .catch(() => {})
    },
    statusType(s) { return { PUBLISHED: 'success', DRAFT: '', DISABLED: 'info' }[s] || '' },
    statusText(s) { return { PUBLISHED: '已发布', DRAFT: '草稿', DISABLED: '已停用' }[s] || s },
    formatTime(t) { return t ? new Date(t).toLocaleString() : '-' }
  }
}
</script>
