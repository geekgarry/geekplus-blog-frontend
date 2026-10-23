<template>
  <div class="my-tasks app-container">
    <el-card>
      <div slot="header" style="display:flex;justify-content:space-between;align-items:center">
        <span>📋 我的审批</span>
        <el-button size="small" icon="el-icon-refresh" @click="loadData">刷新</el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-click="onTabChange">
        <el-tab-pane label="待办审批" name="todo">
          <!-- 无数据只展示空状态图，不渲染空表头 -->
          <div v-loading="loading" class="oa-list-body">
            <el-table v-if="tasks.length" :data="tasks" style="width:100%">
              <el-table-column prop="title" label="申请标题" min-width="160" show-overflow-tooltip>
                <template slot-scope="{row}">{{ row.title || '-' }}</template>
              </el-table-column>
              <el-table-column prop="taskName" label="当前节点" min-width="140" />
              <el-table-column label="流程" width="160">
                <template slot-scope="{row}">
                  {{ row.processName || getProcessName(row.processDefinitionId || row.processKey) }}
                </template>
              </el-table-column>
              <el-table-column label="到达时间" width="170">
                <template slot-scope="{row}">{{ formatTime(row.createTime) }}</template>
              </el-table-column>
              <!-- 次要操作随表横向滚动；右侧固定列只留常用按钮（与 plus-admin-antd 一致） -->
              <el-table-column label="更多" width="220">
                <template slot-scope="{row}">
                  <el-button size="mini" type="warning" @click="showBack(row)">回退</el-button>
                  <el-button size="mini" @click="showSigner(row)">加签</el-button>
                  <el-button size="mini" @click="showDelegate(row)">转办</el-button>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="240" fixed="right">
                <template slot-scope="{row}">
                  <el-button size="mini" type="success" @click="showApprove(row)">同意</el-button>
                  <el-button size="mini" type="danger" @click="showReject(row)">拒绝</el-button>
                  <el-button size="mini" @click="showDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else-if="!loading" description="暂无待办任务" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="已审批" name="done">
          <div v-loading="loading" class="oa-list-body">
            <el-table v-if="historyTasks.length" :data="historyTasks" style="width:100%">
              <el-table-column prop="title" label="申请标题" min-width="160" show-overflow-tooltip>
                <template slot-scope="{row}">{{ row.title || '-' }}</template>
              </el-table-column>
              <el-table-column prop="taskName" label="审批节点" min-width="140">
                <template slot-scope="{row}">{{ row.taskName || row.name }}</template>
              </el-table-column>
              <el-table-column label="流程" width="160">
                <template slot-scope="{row}">
                  {{ row.processName || getProcessName(row.processKey) }}
                </template>
              </el-table-column>
              <el-table-column label="完成时间" width="170">
                <template slot-scope="{row}">{{ formatTime(row.endTime) }}</template>
              </el-table-column>
              <el-table-column label="耗时" width="100">
                <template slot-scope="{row}">{{ formatDuration(row.durationInMillis) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template slot-scope="{row}">
                  <el-button size="mini" @click="showDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else-if="!loading" description="暂无已办审批" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 审批对话框 -->
    <el-dialog :visible.sync="approveVisible" title="审批操作" width="720px" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item label="操作">
          <el-radio-group v-model="approveForm.action">
            <el-radio label="AGREE">同意</el-radio>
            <el-radio label="REJECT">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上游附件" v-if="prevAttachments.length">
          <div class="prev-attach-tip">上一环节及之前提交的文件（可预览/下载，签署能力预留）</div>
          <attachment-panel
            :files="prevAttachments"
            :enable-sign="false"
            @sign-request="onSignRequest"
          />
        </el-form-item>

        <el-form-item label="审批意见">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3"
                     placeholder="请输入审批意见 / 驳回原因" />
        </el-form-item>
        <el-form-item label="补充附件">
          <el-upload
            action="#"
            :http-request="handleApproveUpload"
            :file-list="approveFileList"
            :on-remove="onApproveRemove"
            :before-upload="beforeApproveUpload"
            multiple
            :limit="10"
          >
            <el-button size="small" type="primary" :loading="uploading">
              <i class="el-icon-upload"></i> 上传附件
            </el-button>
            <div slot="tip" class="el-upload__tip">可附带图片、合同、截图等；将随流程带到下一节点</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="本步扩展字段">
          <div class="extra-fields">
            <div v-for="(row, idx) in approveExtraFields" :key="idx" class="extra-row">
              <el-input v-model="row.key" size="mini" placeholder="字段名" style="width:28%" />
              <el-input v-model="row.value" size="mini" placeholder="字段值" style="width:48%;margin:0 6px" />
              <el-button type="text" size="mini" style="color:#f56c6c" @click="approveExtraFields.splice(idx, 1)">删</el-button>
            </div>
            <el-button size="mini" type="text" icon="el-icon-plus" @click="approveExtraFields.push({ key: '', value: '' })">
              添加字段（将以 JSON 随流程流转）
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitApprove">
          提交
        </el-button>
      </div>
    </el-dialog>

    <!-- 回退对话框 -->
    <el-dialog :visible.sync="backVisible" title="回退操作" width="500px">
      <el-form label-width="100px">
        <el-form-item label="回退方式">
          <el-select v-model="backForm.type" style="width:100%">
            <el-option label="逐级回退（退到上一审批节点）" value="previous" />
            <el-option
              v-if="historyNodes.length"
              label="回退到历史节点"
              value="history"
            />
            <el-option label="回退到指定节点" value="specified" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标节点" v-if="backForm.type === 'history'">
          <el-select v-model="backForm.targetNode" style="width:100%" placeholder="选择历史节点">
            <el-option v-for="n in historyNodes" :key="n.id"
                        :label="n.name" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标节点" v-if="backForm.type === 'specified'">
          <el-select v-model="backForm.targetNode" style="width:100%" placeholder="选择节点">
            <el-option v-for="n in availableNodes" :key="n.id"
                        :label="n.name" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="backForm.type === 'history' || backForm.type === 'specified'"
          label=" "
        >
          <el-checkbox v-model="backForm.batch">批量回退（会签多实例）</el-checkbox>
        </el-form-item>
        <el-form-item label="回退原因">
          <el-input v-model="backForm.comment" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="backVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="submitBack">确认回退</el-button>
      </div>
    </el-dialog>

    <!-- 加签 / 转办 -->
    <el-dialog
      :visible.sync="signerVisible"
      :title="signerMode === 'delegate' ? '转办' : '加签'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90px">
        <el-form-item :label="signerMode === 'delegate' ? '转办给' : '加签人'" required>
          <el-select
            v-model="signerForm.assignee"
            filterable
            clearable
            style="width:100%"
            placeholder="选择用户"
          >
            <el-option
              v-for="u in allUsers"
              :key="u.userId || u.id"
              :label="(u.nickname || u.username || u.userName || '') + ' (' + (u.userId || u.id) + ')'"
              :value="String(u.userId != null ? u.userId : u.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="signerForm.comment" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="signerVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitSigner">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  myTasks, myHistoryTasks, approve, reject, backToPrevious, backToAny, backToHistory, batchBack,
  listProcesses, getInstanceDetail, addSigner, delegate,
} from '@/api/oa/designer'
import { uploadFile } from '@/api/oa/files'
import { listUser } from '@/api/system/user'
import AttachmentPanel from '../components/AttachmentPanel.vue'
import { mapGetters } from 'vuex'

const FALLBACK_NODES = [
  { id: 'Task_1', name: '第一审批节点', type: 'userTask' },
  { id: 'Task_2', name: '第二审批节点', type: 'userTask' },
  { id: 'Task_3', name: '第三审批节点', type: 'userTask' },
]

export default {
  name: 'OaMyTasks',
  components: { AttachmentPanel },
  data() {
    return {
      activeTab: 'todo',
      tasks: [],
      historyTasks: [],
      loading: false,
      submitting: false,
      uploading: false,
      approveVisible: false,
      backVisible: false,
      signerVisible: false,
      signerMode: 'add',
      currentTask: null,
      processNodes: [],
      historyNodes: [],
      approveForm: { action: 'AGREE', comment: '' },
      approveAttachments: [],
      approveFileList: [],
      approveExtraFields: [],
      prevAttachments: [],
      backForm: { type: 'previous', targetNode: '', comment: '', batch: false },
      signerForm: { assignee: undefined, comment: '' },
      allUsers: [],
      processNameMap: {}
    }
  },
  computed: {
    ...mapGetters(['userId']),
    availableNodes() {
      return (this.processNodes || []).filter(n => n.type === 'userTask' || !n.type)
    }
  },
  created() {
    // 工作台统计卡可带 ?tab=todo|done 直达对应页签
    const tab = (this.$route.query.tab || '').toString()
    if (tab === 'todo' || tab === 'done') this.activeTab = tab
    this.loadData()
    this.loadUsers()
  },
  watch: {
    '$route.query.tab'(val) {
      const tab = (val || '').toString()
      if ((tab === 'todo' || tab === 'done') && tab !== this.activeTab) {
        this.activeTab = tab
        this.loadData()
      }
    }
  },
  methods: {
    onTabChange() {
      this.loadData()
    },
    async loadUsers() {
      try {
        const res = await listUser({ pageNum: 1, pageSize: 500 })
        const data = res.rows || res.data || res || []
        this.allUsers = Array.isArray(data) ? data : (data.rows || [])
      } catch (e) {
        this.allUsers = []
      }
    },
    async loadData() {
      this.loading = true
      try {
        const userId = this.userId != null ? String(this.userId) : ''
        if (!userId) {
          this.tasks = []
          this.historyTasks = []
          return
        }
        await this.loadProcessNames()
        if (this.activeTab === 'todo') {
          const res = await myTasks(userId)
          this.tasks = res.data || res.rows || []
        } else {
          const res = await myHistoryTasks(userId)
          this.historyTasks = res.data || res.rows || []
        }
      } catch (e) {
        this.$message.error('加载失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.loading = false
      }
    },
    async loadProcessNames() {
      try {
        const defs = await listProcesses()
        ;(defs.data || []).forEach(p => {
          if (p.flowableProcessDefinitionId) {
            this.processNameMap[p.flowableProcessDefinitionId] = p.name
          }
          if (p.processKey) {
            this.processNameMap[p.processKey] = p.name
          }
        })
      } catch (e) { /* ignore */ }
    },
    getProcessName(defId) {
      if (!defId) return '-'
      if (this.processNameMap[defId]) return this.processNameMap[defId]
      const key = String(defId).split(':')[0]
      return this.processNameMap[key] || key || '-'
    },
    showApprove(row) {
      this.openApproveDialog(row, 'AGREE')
    },
    showReject(row) {
      this.openApproveDialog(row, 'REJECT')
    },
    async openApproveDialog(row, action) {
      this.currentTask = row
      this.approveForm = { action, comment: '' }
      this.approveAttachments = []
      this.approveFileList = []
      this.approveExtraFields = []
      this.prevAttachments = []
      this.approveVisible = true
      const instanceId = row.processInstanceId
      if (!instanceId) return
      try {
        const res = await getInstanceDetail(instanceId)
        const data = res.data || {}
        this.prevAttachments = Array.isArray(data.attachments) ? data.attachments : []
      } catch (e) {
        /* 上游附件加载失败不阻断审批 */
      }
    },
    /**
     * 电子签预留钩子：接入 SDK 后在此调起签署组件，
     * 签署完成 → uploadFile(signedBlob) → 将 meta.purpose='SIGNED' 推入 approveAttachments
     */
    onSignRequest({ file, onSigned }) {
      this.$message.info('电子签功能预留中：可对接 e签宝/法大大/自研签署组件。当前文件：' + (file && file.name))
      void onSigned
    },
    beforeApproveUpload(file) {
      if (file.size > 20 * 1024 * 1024) {
        this.$message.error('单文件不能超过 20MB')
        return false
      }
      return true
    },
    async handleApproveUpload({ file, onSuccess, onError }) {
      this.uploading = true
      try {
        const res = await uploadFile(file)
        const meta = res.data
        this.approveAttachments.push(meta)
        this.approveFileList.push({
          name: meta.name,
          url: meta.url,
          uid: file.uid,
          status: 'success',
          response: meta
        })
        onSuccess(meta)
      } catch (e) {
        this.$message.error('上传失败: ' + (e.response?.data?.message || e.message))
        onError(e)
      } finally {
        this.uploading = false
      }
    },
    onApproveRemove(file) {
      const fileId = file.response && file.response.id
      if (fileId) {
        this.approveAttachments = this.approveAttachments.filter(a => a.id !== fileId)
      }
      this.approveFileList = this.approveFileList.filter(f => f.uid !== file.uid)
    },
    buildApproveFormData() {
      const extra = {}
      ;(this.approveExtraFields || []).forEach(row => {
        const k = (row.key || '').trim()
        if (k) extra[k] = row.value
      })
      return JSON.stringify({
        attachments: this.approveAttachments,
        extra
      })
    },
    async submitApprove() {
      this.submitting = true
      try {
        const formData = this.buildApproveFormData()
        if (this.approveForm.action === 'AGREE') {
          await approve({
            taskId: this.currentTask.taskId,
            comment: this.approveForm.comment,
            formData
          })
          this.$message.success('审批通过')
        } else {
          await reject({
            taskId: this.currentTask.taskId,
            comment: this.approveForm.comment,
            formData
          })
          this.$message.success('已拒绝')
        }
        this.approveVisible = false
        this.loadData()
      } catch (e) {
        this.$message.error('操作失败: ' + (e.response?.data?.message || e.message))
      } finally { this.submitting = false }
    },
    async showDetail(row) {
      this.$router.push({ name: 'OaProcessDetail', params: { instanceId: row.processInstanceId } })
    },
    async showBack(row) {
      this.currentTask = row
      this.backForm = { type: 'previous', targetNode: '', comment: '', batch: false }
      this.processNodes = []
      this.historyNodes = []
      this.backVisible = true
      await this.loadBackNodes(row.processInstanceId)
    },
    /**
     * 从实例详情抽取历史/可用节点；无数据时回退到模板占位节点
     */
    async loadBackNodes(instanceId) {
      if (!instanceId) {
        this.processNodes = FALLBACK_NODES.slice()
        this.historyNodes = []
        return
      }
      try {
        const res = await getInstanceDetail(instanceId)
        const data = res.data || {}
        const seen = new Set()
        const history = []
        ;(data.historyTasks || []).forEach(h => {
          if (!h.endTime) return
          const id = h.taskDefinitionKey || h.nodeId
          if (!id || seen.has(id)) return
          seen.add(id)
          history.push({
            id,
            name: h.name || h.taskName || id,
            type: 'userTask'
          })
        })
        this.historyNodes = history

        const allSeen = new Set(history.map(n => n.id))
        const all = history.slice()
        ;(data.tasks || []).forEach(t => {
          const id = t.taskDefinitionKey || t.nodeId
          if (!id || allSeen.has(id)) return
          allSeen.add(id)
          all.push({
            id,
            name: t.name || t.taskName || id,
            type: 'userTask'
          })
        })
        ;(data.taskRecords || []).forEach(r => {
          const id = r.nodeId
          if (!id || id === 'START' || allSeen.has(id)) return
          allSeen.add(id)
          all.push({
            id,
            name: r.nodeName || id,
            type: 'userTask'
          })
        })
        this.processNodes = all.length ? all : FALLBACK_NODES.slice()
      } catch (e) {
        this.processNodes = FALLBACK_NODES.slice()
        this.historyNodes = []
      }
    },
    showSigner(row) {
      this.currentTask = row
      this.signerMode = 'add'
      this.signerForm = { assignee: undefined, comment: '' }
      this.signerVisible = true
    },
    showDelegate(row) {
      this.currentTask = row
      this.signerMode = 'delegate'
      this.signerForm = { assignee: undefined, comment: '' }
      this.signerVisible = true
    },
    async submitBack() {
      if ((this.backForm.type === 'specified' || this.backForm.type === 'history') && !this.backForm.targetNode) {
        return this.$message.warning('请选择目标节点')
      }
      this.submitting = true
      try {
        const pid = this.currentTask.processInstanceId
        const useBatch = this.backForm.batch &&
          (this.backForm.type === 'specified' || this.backForm.type === 'history')
        if (useBatch) {
          await batchBack({
            processInstanceId: pid,
            targetNodeId: this.backForm.targetNode,
            comment: this.backForm.comment
          })
        } else if (this.backForm.type === 'previous') {
          await backToPrevious(pid, { comment: this.backForm.comment })
        } else if (this.backForm.type === 'history') {
          await backToHistory({
            processInstanceId: pid,
            targetNodeId: this.backForm.targetNode,
            comment: this.backForm.comment
          })
        } else {
          await backToAny({
            processInstanceId: pid,
            targetNodeId: this.backForm.targetNode,
            comment: this.backForm.comment
          })
        }
        this.$message.success('回退成功')
        this.backVisible = false
        this.loadData()
      } catch (e) {
        this.$message.error('回退失败: ' + (e.response?.data?.message || e.message))
      } finally { this.submitting = false }
    },
    async submitSigner() {
      if (!this.signerForm.assignee) {
        return this.$message.warning('请选择用户')
      }
      this.submitting = true
      try {
        const payload = {
          taskId: this.currentTask.taskId,
          assignee: this.signerForm.assignee,
          comment: this.signerForm.comment
        }
        if (this.signerMode === 'delegate') {
          await delegate(payload)
          this.$message.success('转办成功')
        } else {
          await addSigner(payload)
          this.$message.success('加签成功')
        }
        this.signerVisible = false
        this.loadData()
      } catch (e) {
        this.$message.error('操作失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.submitting = false
      }
    },
    formatTime(t) { return t ? new Date(t).toLocaleString() : '-' },
    formatDuration(ms) {
      if (ms == null) return '-'
      const sec = Math.floor(ms / 1000)
      if (sec < 60) return sec + '秒'
      const min = Math.floor(sec / 60)
      if (min < 60) return min + '分钟'
      return Math.floor(min / 60) + '小时' + (min % 60) + '分'
    }
  }
}
</script>

<style scoped>
.prev-attach-tip {
  font-size: 12px;
  color: var(--text-color, #909399);
  margin-bottom: 8px;
  line-height: 1.4;
}
.extra-fields .extra-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
</style>
