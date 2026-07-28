<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>临时文件中转记录</span>
        <div style="float:right">
          <el-select v-model="status" clearable placeholder="状态" size="mini" style="width:110px;margin-right:8px" @change="load">
            <el-option :value="1" label="有效" />
            <el-option :value="0" label="已失效" />
          </el-select>
          <el-button type="primary" size="mini" :loading="loading" @click="load">刷新</el-button>
          <el-button type="warning" size="mini" :loading="cleaning" @click="cleanup">立即清理过期</el-button>
        </div>
      </div>
      <el-table :data="rows" v-loading="loading" size="small" border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="originalName" label="文件名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="shareCode" label="分享码" width="120" />
        <el-table-column label="大小" width="90">
          <template slot-scope="{ row }">{{ formatSize(row.fileSize) }}</template>
        </el-table-column>
        <el-table-column label="下载" width="90">
          <template slot-scope="{ row }">{{ row.downloadCount || 0 }}{{ row.maxDownloads > 0 ? ' / ' + row.maxDownloads : '' }}</template>
        </el-table-column>
        <el-table-column label="过期时间" width="160">
          <template slot-scope="{ row }">{{ formatTime(row.expireAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '有效' : '失效' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="磁盘路径" min-width="140" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.storedPath || '已清理' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" style="color:#b56a6a" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p class="tip">定时任务每 5 分钟清理到期文件；此处可手动触发并强制删除残留磁盘文件。</p>
    </el-card>
  </div>
</template>

<script>
import { listFileTransfer, cleanupFileTransfer, deleteFileTransfer } from '@/api/system/fileTransfer'

export default {
  name: 'AdminFileTransfer',
  data() {
    return {
      rows: [],
      status: null,
      loading: false,
      cleaning: false
    }
  },
  created() {
    this.load()
  },
  methods: {
    formatSize(n) {
      if (!n && n !== 0) return '-'
      if (n < 1024) return n + ' B'
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
      return (n / 1024 / 1024).toFixed(2) + ' MB'
    },
    formatTime(ts) {
      if (!ts) return '-'
      try { return new Date(ts).toLocaleString() } catch (e) { return '-' }
    },
    async load() {
      this.loading = true
      try {
        const res = await listFileTransfer({ status: this.status, limit: 100 })
        const data = res.data || res
        this.rows = data.rows || []
      } catch (e) {
        this.$message.error((e && e.message) || '加载失败')
      } finally {
        this.loading = false
      }
    },
    async cleanup() {
      this.cleaning = true
      try {
        const res = await cleanupFileTransfer()
        this.$message.success((res && res.msg) || '清理完成')
        this.load()
      } catch (e) {
        this.$message.error((e && e.message) || '清理失败')
      } finally {
        this.cleaning = false
      }
    },
    remove(row) {
      this.$confirm(`确认删除「${row.originalName}」并清理磁盘？`, '提示', { type: 'warning' })
        .then(async () => {
          await deleteFileTransfer(row.id)
          this.$message.success('已删除')
          this.load()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: #8a8580;
}
</style>
