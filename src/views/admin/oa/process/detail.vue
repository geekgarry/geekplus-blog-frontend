<template>
  <div class="process-detail app-container" v-loading="loading">
    <el-page-header @back="$router.go(-1)" style="margin-bottom:16px">
      <template slot="content">审批流程详情</template>
    </el-page-header>

    <template v-if="instance">
      <!-- 顶部状态摘要 -->
      <div class="summary-banner" :class="'status-' + (instance.status || '').toLowerCase()">
        <div class="summary-main">
          <h2 class="summary-title">{{ instance.title || '未命名申请' }}</h2>
          <div class="summary-meta">
            <el-tag :type="statusType(instance.status)" effect="dark" size="medium">
              {{ statusText(instance.status) }}
            </el-tag>
            <span class="meta-item">流程：{{ processName || instance.processKey }}</span>
            <span class="meta-item">发起人：{{ starterName || instance.startBy || '-' }}</span>
            <span class="meta-item">发起：{{ formatTime(instance.startTime) }}</span>
          </div>
        </div>
        <div class="summary-progress">
          <el-progress
            type="circle"
            :percentage="progressPercent"
            :width="78"
            :status="progressStatus"
            :color="progressColor"
          />
          <div class="progress-label">{{ progressLabel }}</div>
        </div>
      </div>

      <!-- 驳回原因醒目提示 -->
      <el-alert
        v-if="instance.status === 'REJECTED'"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom:16px"
        title="流程已被驳回"
        :description="'驳回原因：' + (rejectReason || '未填写意见')"
      />
      <el-alert
        v-else-if="instance.status === 'CANCELED'"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom:16px"
        title="流程已撤销"
        description="发起人已撤销该申请"
      />

      <!-- 横向进度条 -->
      <el-card shadow="never" class="progress-card" style="margin-bottom:16px">
        <div slot="header" class="card-header">
          <span>🔄 审批进度</span>
          <span class="header-sub" v-if="instance.status === 'RUNNING'">
            当前：{{ instance.currentNode || currentTasks[0] && currentTasks[0].name || '处理中' }}
          </span>
        </div>
        <el-steps :active="activeStepIndex" align-center finish-status="success" :process-status="stepProcessStatus">
          <el-step
            v-for="(node, i) in progressNodes"
            :key="i"
            :title="node.title"
            :description="node.description"
            :status="node.stepStatus"
            :icon="node.icon"
          />
        </el-steps>
      </el-card>

      <el-row :gutter="16">
        <!-- 左侧：时间轴 -->
        <el-col :span="15">
          <el-card shadow="never" style="margin-bottom:16px">
            <div slot="header" class="card-header">
              <span>📜 节点完成情况</span>
              <span class="header-sub">共 {{ timelineItems.length }} 个环节</span>
            </div>

            <el-timeline v-if="timelineItems.length">
              <el-timeline-item
                v-for="(item, i) in timelineItems"
                :key="i"
                :timestamp="item.time"
                placement="top"
                :type="item.timelineType"
                :icon="item.icon"
                :color="item.color"
                size="large"
              >
                <div class="timeline-card" :class="item.cardClass">
                  <div class="timeline-head">
                    <div class="timeline-title-row">
                      <b>{{ item.title }}</b>
                      <el-tag size="mini" :type="item.tagType" effect="plain">{{ item.statusText }}</el-tag>
                    </div>
                    <span class="timeline-user">{{ item.user }}</span>
                  </div>

                  <div v-if="item.duration" class="timeline-duration">耗时 {{ item.duration }}</div>

                  <div v-if="item.comment" class="timeline-comment" :class="{ reject: item.isReject }">
                    <div class="comment-label">{{ item.isReject ? '驳回原因' : '审批意见' }}</div>
                    <div class="comment-body">{{ item.comment }}</div>
                  </div>
                  <div v-else-if="item.showEmptyComment" class="timeline-comment muted">
                    未填写审批意见
                  </div>

                  <div v-if="item.attachments && item.attachments.length" class="timeline-attachments">
                    <div class="comment-label">本步骤附件</div>
                    <attachment-panel :files="item.attachments" />
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无审批记录" :image-size="72" />
          </el-card>

          <el-card shadow="never" v-if="bpmnXml" style="margin-bottom:16px">
            <div slot="header" class="card-header"><span>🗺️ 流程图</span></div>
            <div ref="bpmnViewer" class="bpmn-viewer" />
          </el-card>
        </el-col>

        <!-- 右侧：信息与当前任务 -->
        <el-col :span="9">
          <el-card shadow="never" style="margin-bottom:16px">
            <div slot="header" class="card-header"><span>📋 申请信息</span></div>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="流程名称">{{ processName || instance.processKey }}</el-descriptions-item>
              <el-descriptions-item label="流程 Key">{{ instance.processKey }}</el-descriptions-item>
              <el-descriptions-item label="发起人">{{ starterName || instance.startBy }}</el-descriptions-item>
              <el-descriptions-item label="发起时间">{{ formatTime(instance.startTime) }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ formatTime(instance.endTime) }}</el-descriptions-item>
              <el-descriptions-item label="当前节点">{{ instance.currentNode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="当前处理人">{{ currentAssigneeDisplay }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" style="margin-bottom:16px" v-if="formEntries.length">
            <div slot="header" class="card-header"><span>📝 表单数据</span></div>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item v-for="(f, i) in formEntries" :key="i" :label="f.label">
                {{ f.value }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" style="margin-bottom:16px" v-if="attachments.length || attachmentHistory.length">
            <div slot="header" class="card-header">
              <span>📎 流程附件</span>
              <span class="header-sub">共 {{ attachments.length }} 个 · 随流程流转可回溯</span>
            </div>
            <el-tabs v-model="attachTab" stretch>
              <el-tab-pane label="全部附件" name="all">
                <attachment-panel :files="attachments" :show-empty="true" />
              </el-tab-pane>
              <el-tab-pane label="按步骤" name="steps">
                <div v-if="attachmentHistory.length">
                  <div v-for="(step, si) in attachmentHistory" :key="step.stepKey || si" class="history-step">
                    <div class="history-step-head">
                      <b>{{ step.nodeName || '未知节点' }}</b>
                      <el-tag size="mini" type="info">{{ stepActionText(step.action) }}</el-tag>
                      <span class="muted">{{ step.uploadedByName || '-' }} · {{ formatTime(step.uploadedAt) }}</span>
                    </div>
                    <attachment-panel :files="step.files || []" :show-empty="true" />
                  </div>
                </div>
                <el-empty v-else description="暂无分步附件记录" :image-size="64" />
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <el-card shadow="never" style="margin-bottom:16px" v-if="extraEntries.length">
            <div slot="header" class="card-header"><span>🧩 扩展信息</span></div>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item v-for="(e, i) in extraEntries" :key="i" :label="e.key">
                <pre v-if="e.isComplex" class="extra-pre">{{ e.value }}</pre>
                <span v-else>{{ e.value }}</span>
              </el-descriptions-item>
            </el-descriptions>
            <el-collapse class="extra-raw" v-if="extraObject">
              <el-collapse-item title="查看原始 JSON" name="raw">
                <pre class="extra-pre">{{ prettyExtra }}</pre>
              </el-collapse-item>
            </el-collapse>
          </el-card>

          <el-card shadow="never" style="margin-bottom:16px">
            <div slot="header" class="card-header"><span>⚡ 当前待办</span></div>
            <div v-if="currentTasks.length">
              <div v-for="t in currentTasks" :key="t.id || t.taskId" class="current-task">
                <div class="current-task-name">
                  <i class="el-icon-s-check"></i> {{ t.name }}
                </div>
                <p>处理人：{{ t.assigneeName || t.assignee || '待认领' }}</p>
                <p class="muted">到达：{{ formatTime(t.createTime) }}</p>
              </div>
            </div>
            <el-empty v-else :description="endedEmptyText" :image-size="64" />
          </el-card>

          <el-card shadow="never" v-if="canApprove">
            <div slot="header" class="card-header"><span>✅ 审批操作</span></div>
            <el-form label-width="80px" size="small">
              <el-form-item label="操作">
                <el-radio-group v-model="approveForm.action">
                  <el-radio label="AGREE">同意</el-radio>
                  <el-radio label="REJECT">拒绝</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="审批意见">
                <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审批意见" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="submitting" @click="submitApprove">提交</el-button>
                <el-button type="warning" @click="openBack">回退</el-button>
                <el-button @click="openSigner('add')">加签</el-button>
                <el-button @click="openSigner('delegate')">转办</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <el-empty v-else-if="!loading" description="未找到流程实例" />

    <el-dialog :visible.sync="backVisible" title="回退操作" width="500px">
      <el-form label-width="100px">
        <el-form-item label="回退方式">
          <el-select v-model="backForm.type" style="width:100%">
            <el-option label="逐级回退" value="previous" />
            <el-option v-if="historyNodes.length" label="回退到历史节点" value="history" />
            <el-option label="指定节点" value="specified" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="backForm.type === 'history'" label="目标节点">
          <el-select v-model="backForm.targetNode" style="width:100%" placeholder="选择历史节点">
            <el-option v-for="n in historyNodes" :key="n.id" :label="n.name" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="backForm.type === 'specified'" label="目标节点">
          <el-select v-model="backForm.targetNode" style="width:100%" placeholder="选择节点">
            <el-option v-for="n in backNodes" :key="n.id" :label="n.name" :value="n.id" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="backForm.type === 'history' || backForm.type === 'specified'"
          label=" "
        >
          <el-checkbox v-model="backForm.batch">批量回退（会签多实例）</el-checkbox>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="backForm.comment" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="backVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="submitBack">确认回退</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="signerVisible"
      :title="signerMode === 'delegate' ? '转办' : '加签'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90px">
        <el-form-item label="选择用户" required>
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
import BpmnViewer from 'bpmn-js/lib/Viewer'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import {
  getInstanceDetail, approve, reject, getBpmn, listProcesses,
  backToPrevious, backToAny, backToHistory, batchBack, addSigner, delegate,
} from '@/api/oa/designer'
import { listUser } from '@/api/system/user'
import AttachmentPanel from '../components/AttachmentPanel.vue'
import { mapGetters } from 'vuex'
import { syncOaBpmnBrandFromStorage } from '@/utils/oaBpmnBrand'

const FALLBACK_NODES = [
  { id: 'Task_1', name: '第一审批节点' },
  { id: 'Task_2', name: '第二审批节点' },
  { id: 'Task_3', name: '第三审批节点' },
]

export default {
  name: 'OaProcessDetail',
  components: { AttachmentPanel },
  props: { instanceId: String },
  data() {
    return {
      loading: false,
      submitting: false,
      instance: null,
      processName: '',
      starterName: '',
      rejectReason: '',
      formData: null,
      attachments: [],
      attachmentHistory: [],
      attachTab: 'all',
      extraObject: null,
      historyTasks: [],
      currentTasks: [],
      taskRecords: [],
      bpmnXml: '',
      viewer: null,
      approveForm: { action: 'AGREE', comment: '' },
      backVisible: false,
      backForm: { type: 'previous', targetNode: '', comment: '', batch: false },
      backNodes: FALLBACK_NODES.slice(),
      historyNodes: [],
      signerVisible: false,
      signerMode: 'add',
      signerForm: { assignee: undefined, comment: '' },
      allUsers: []
    }
  },
  computed: {
    ...mapGetters(['userId']),
    canApprove() {
      const uid = this.userId != null ? String(this.userId) : ''
      if (!uid || !this.currentTasks.length) return false
      return this.currentTasks.some(t => String(t.assignee) === uid)
    },
    myTaskId() {
      const uid = this.userId != null ? String(this.userId) : ''
      const t = this.currentTasks.find(x => String(x.assignee) === uid)
      return t && (t.taskId || t.id)
    },
    progressPercent() {
      if (!this.instance) return 0
      if (this.instance.status === 'COMPLETED') return 100
      if (this.instance.status === 'REJECTED' || this.instance.status === 'CANCELED') {
        const done = this.historyTasks.filter(h => h.endTime).length
        const total = Math.max(done + this.currentTasks.length, done, 1)
        return Math.min(99, Math.round((done / total) * 100))
      }
      const done = this.historyTasks.filter(h => h.endTime).length
      const pending = this.currentTasks.length
      const total = done + pending + (pending ? 1 : 0)
      if (total <= 0) return 10
      return Math.min(95, Math.round((done / total) * 100) || 5)
    },
    progressStatus() {
      const s = this.instance && this.instance.status
      if (s === 'COMPLETED') return 'success'
      if (s === 'REJECTED') return 'exception'
      return undefined
    },
    progressColor() {
      const s = this.instance && this.instance.status
      if (s === 'CANCELED') return '#909399'
      if (s === 'RUNNING') return '#409eff'
      return undefined
    },
    progressLabel() {
      const s = this.instance && this.instance.status
      return ({
        RUNNING: '审批中',
        COMPLETED: '已完成',
        REJECTED: '已驳回',
        CANCELED: '已撤销'
      })[s] || '进度'
    },
    stepProcessStatus() {
      const s = this.instance && this.instance.status
      if (s === 'REJECTED') return 'error'
      if (s === 'CANCELED') return 'wait'
      return 'process'
    },
    progressNodes() {
      const nodes = []
      nodes.push({
        title: '发起申请',
        description: this.starterName || '发起人',
        stepStatus: 'success',
        icon: 'el-icon-user'
      })

      this.historyTasks.filter(h => h.endTime).forEach(h => {
        const rejected = h.approved === false || h.action === 'REJECT'
        nodes.push({
          title: h.name || '审批节点',
          description: rejected
            ? ('已驳回 · ' + (h.assigneeName || h.assignee || ''))
            : ('已通过 · ' + (h.assigneeName || h.assignee || '')),
          stepStatus: rejected ? 'error' : 'success',
          icon: rejected ? 'el-icon-close' : 'el-icon-check'
        })
      })

      if (this.instance.status === 'RUNNING') {
        this.currentTasks.forEach(t => {
          nodes.push({
            title: t.name || '审批中',
            description: '处理中 · ' + (t.assigneeName || t.assignee || '待认领'),
            stepStatus: 'process',
            icon: 'el-icon-loading'
          })
        })
        if (!this.currentTasks.length) {
          nodes.push({
            title: this.instance.currentNode || '处理中',
            description: '等待办理',
            stepStatus: 'process',
            icon: 'el-icon-time'
          })
        }
      } else if (this.instance.status === 'COMPLETED') {
        nodes.push({
          title: '流程结束',
          description: '审批通过',
          stepStatus: 'success',
          icon: 'el-icon-circle-check'
        })
      } else if (this.instance.status === 'REJECTED') {
        nodes.push({
          title: '流程终止',
          description: '已驳回',
          stepStatus: 'error',
          icon: 'el-icon-warning'
        })
      } else if (this.instance.status === 'CANCELED') {
        nodes.push({
          title: '已撤销',
          description: '发起人撤销',
          stepStatus: 'wait',
          icon: 'el-icon-remove-outline'
        })
      }

      return nodes
    },
    activeStepIndex() {
      if (!this.progressNodes.length) return 0
      if (this.instance.status === 'COMPLETED') return this.progressNodes.length
      const idx = this.progressNodes.findIndex(n => n.stepStatus === 'process' || n.stepStatus === 'error')
      return idx >= 0 ? idx : this.progressNodes.length - 1
    },
    timelineItems() {
      const items = []
      const startFiles = this.filesForStep('START', null)
      if (this.instance) {
        items.push({
          title: '发起申请',
          statusText: '已提交',
          tagType: 'info',
          timelineType: 'primary',
          color: '#409eff',
          icon: 'el-icon-edit-outline',
          user: this.starterName || String(this.instance.startBy || '-'),
          time: this.formatTime(this.instance.startTime),
          comment: null,
          isReject: false,
          showEmptyComment: false,
          cardClass: 'card-start',
          duration: null,
          attachments: startFiles
        })
      }

      this.historyTasks.filter(h => h.endTime).forEach(h => {
        const isReject = h.approved === false || h.action === 'REJECT'
        const isBack = h.action === 'BACK'
        const rec = this.taskRecords.find(r => r.taskId === h.id || r.taskId === h.taskId)
        items.push({
          title: h.name || '审批节点',
          statusText: h.actionName || (isReject ? '已驳回' : isBack ? '已回退' : '已通过'),
          tagType: isReject ? 'danger' : isBack ? 'warning' : 'success',
          timelineType: isReject ? 'danger' : isBack ? 'warning' : 'success',
          color: isReject ? '#f56c6c' : isBack ? '#e6a23c' : '#67c23a',
          icon: isReject ? 'el-icon-close' : 'el-icon-check',
          user: h.assigneeName || h.assignee || '-',
          time: this.formatTime(h.endTime),
          comment: h.comment || null,
          isReject,
          showEmptyComment: !h.comment,
          cardClass: isReject ? 'card-reject' : 'card-pass',
          duration: this.formatDuration(h.durationInMillis),
          attachments: this.filesForStep(h.id || h.taskId, rec)
        })
      })

      this.currentTasks.forEach(t => {
        items.push({
          title: t.name || '审批中',
          statusText: '处理中',
          tagType: '',
          timelineType: 'primary',
          color: '#409eff',
          icon: 'el-icon-time',
          user: t.assigneeName || t.assignee || '待认领',
          time: this.formatTime(t.createTime),
          comment: null,
          isReject: false,
          showEmptyComment: false,
          cardClass: 'card-active',
          duration: null,
          attachments: []
        })
      })

      if (this.instance && this.instance.status === 'COMPLETED') {
        items.push({
          title: '流程结束',
          statusText: '已完成',
          tagType: 'success',
          timelineType: 'success',
          color: '#67c23a',
          icon: 'el-icon-circle-check',
          user: '-',
          time: this.formatTime(this.instance.endTime),
          comment: null,
          isReject: false,
          showEmptyComment: false,
          cardClass: 'card-end',
          duration: null,
          attachments: []
        })
      }

      return items
    },
    formEntries() {
      if (!this.formData || typeof this.formData !== 'object') return []
      const skip = new Set(['attachments', 'extra', 'attachmentHistory'])
      const labelMap = {
        days: '请假天数', amount: '金额', reason: '事由', title: '标题',
        startDate: '开始日期', endDate: '结束日期', remark: '备注',
        leaveType: '请假类型', expenseType: '报销类型', destination: '目的地',
        travelDays: '出差天数', contractNo: '合同编号', vendor: '供应商',
        purchaseItem: '采购物品', transferTo: '调动至'
      }
      return Object.keys(this.formData)
        .filter(k => !skip.has(k))
        .map(k => {
          const v = this.formData[k]
          let display = '-'
          if (v != null) {
            display = typeof v === 'object' ? JSON.stringify(v) : String(v)
          }
          return { label: labelMap[k] || k, value: display }
        })
    },
    extraEntries() {
      if (!this.extraObject || typeof this.extraObject !== 'object') return []
      return Object.keys(this.extraObject).map(key => {
        const v = this.extraObject[key]
        const isComplex = v != null && typeof v === 'object'
        return {
          key,
          isComplex,
          value: isComplex ? JSON.stringify(v, null, 2) : (v == null ? '-' : String(v))
        }
      })
    },
    prettyExtra() {
      if (!this.extraObject) return ''
      try {
        return JSON.stringify(this.extraObject, null, 2)
      } catch (e) {
        return String(this.extraObject)
      }
    },
    currentAssigneeDisplay() {
      if (this.currentTasks.length) {
        return this.currentTasks.map(t => t.assigneeName || t.assignee || '待认领').join('、')
      }
      return this.instance && this.instance.currentAssignee ? this.instance.currentAssignee : '-'
    },
    endedEmptyText() {
      const s = this.instance && this.instance.status
      if (s === 'COMPLETED') return '流程已完成，无待办'
      if (s === 'REJECTED') return '流程已驳回，无待办'
      if (s === 'CANCELED') return '流程已撤销，无待办'
      return '暂无待办任务'
    }
  },
  watch: {
    instanceId() {
      this.loadDetail()
    }
  },
  created() {
    // 与设计器共用「编辑器品牌」偏好，避免仅打开详情时仍露出 bpmn.io 角标
    syncOaBpmnBrandFromStorage()
    this.loadDetail()
    this.loadUsers()
  },
  beforeDestroy() {
    if (this.viewer) {
      this.viewer.destroy()
      this.viewer = null
    }
  },
  methods: {
    async loadUsers() {
      try {
        const res = await listUser({ pageNum: 1, pageSize: 500 })
        const data = res.rows || res.data || res || []
        this.allUsers = Array.isArray(data) ? data : (data.rows || [])
      } catch (e) {
        this.allUsers = []
      }
    },
    buildNodesFromDetail(data) {
      const seen = new Set()
      const history = []
      ;(data.historyTasks || []).forEach(h => {
        if (!h.endTime) return
        const id = h.taskDefinitionKey || h.nodeId
        if (!id || seen.has(id)) return
        seen.add(id)
        history.push({ id, name: h.name || h.taskName || id })
      })
      this.historyNodes = history

      const allSeen = new Set(history.map(n => n.id))
      const all = history.slice()
      ;(data.tasks || []).forEach(t => {
        const id = t.taskDefinitionKey || t.nodeId
        if (!id || allSeen.has(id)) return
        allSeen.add(id)
        all.push({ id, name: t.name || t.taskName || id })
      })
      ;(data.taskRecords || []).forEach(r => {
        const id = r.nodeId
        if (!id || id === 'START' || allSeen.has(id)) return
        allSeen.add(id)
        all.push({ id, name: r.nodeName || id })
      })
      this.backNodes = all.length ? all : FALLBACK_NODES.slice()
    },
    async loadDetail() {
      this.loading = true
      try {
        const res = await getInstanceDetail(this.instanceId)
        const data = res.data || {}
        this.instance = data.instance
        this.processName = data.processName || ''
        this.starterName = data.starterName || ''
        this.rejectReason = data.rejectReason || ''
        this.formData = data.formData || null
        this.attachments = Array.isArray(data.attachments)
          ? data.attachments
          : (this.formData && Array.isArray(this.formData.attachments) ? this.formData.attachments : [])
        this.attachmentHistory = Array.isArray(data.attachmentHistory)
          ? data.attachmentHistory
          : (this.formData && Array.isArray(this.formData.attachmentHistory) ? this.formData.attachmentHistory : [])
        const extra = data.extra != null
          ? data.extra
          : (this.formData && this.formData.extra)
        this.extraObject = (extra && typeof extra === 'object' && !Array.isArray(extra) && Object.keys(extra).length)
          ? extra
          : null
        this.taskRecords = data.taskRecords || []
        this.historyTasks = (data.historyTasks || []).map(h => ({
          ...h,
          approved: h.approved !== false && h.action !== 'REJECT' && h.action !== 'BACK',
          comment: h.comment
        }))
        this.currentTasks = data.tasks || []
        this.buildNodesFromDetail(data)
        this.approveForm = { action: 'AGREE', comment: '' }
        this.bpmnXml = data.bpmnXml || ''
        if (!this.bpmnXml && this.instance && this.instance.processKey) {
          await this.loadBpmnByProcessKey(this.instance.processKey)
        }
        this.$nextTick(() => this.renderBpmn())
      } catch (e) {
        this.$message.error('加载详情失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.loading = false
      }
    },
    async loadBpmnByProcessKey(processKey) {
      try {
        const res = await listProcesses()
        const list = res.data || []
        const def = list.find(p => p.processKey === processKey || p.key === processKey)
        if (!def || def.id == null) return
        const bpmnRes = await getBpmn(def.id)
        this.bpmnXml = typeof bpmnRes === 'string' ? bpmnRes : (bpmnRes.data || '')
      } catch (e) { /* ignore */ }
    },
    async renderBpmn() {
      if (!this.bpmnXml || !this.$refs.bpmnViewer) return
      if (this.viewer) {
        this.viewer.destroy()
        this.viewer = null
      }
      this.viewer = new BpmnViewer({ container: this.$refs.bpmnViewer })
      try {
        await this.viewer.importXML(this.bpmnXml)
        const canvas = this.viewer.get('canvas')
        canvas.zoom('fit-viewport')
      } catch (e) {
        console.warn('BPMN 预览失败', e)
      }
    },
    async submitApprove() {
      if (!this.myTaskId) return
      this.submitting = true
      try {
        const payload = {
          taskId: this.myTaskId,
          comment: this.approveForm.comment,
          formData: JSON.stringify({ attachments: [], extra: {} })
        }
        if (this.approveForm.action === 'AGREE') {
          await approve(payload)
          this.$message.success('审批通过')
        } else {
          await reject(payload)
          this.$message.success('已拒绝')
        }
        this.loadDetail()
      } catch (e) {
        this.$message.error('操作失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.submitting = false
      }
    },
    openBack() {
      this.backForm = { type: 'previous', targetNode: '', comment: '', batch: false }
      this.backVisible = true
    },
    openSigner(mode) {
      this.signerMode = mode
      this.signerForm = { assignee: undefined, comment: '' }
      this.signerVisible = true
    },
    async submitBack() {
      if (!this.instance) return
      if ((this.backForm.type === 'specified' || this.backForm.type === 'history') && !this.backForm.targetNode) {
        return this.$message.warning('请选择目标节点')
      }
      this.submitting = true
      try {
        const pid = this.instance.flowableInstanceId || this.instanceId
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
        this.loadDetail()
      } catch (e) {
        this.$message.error('回退失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.submitting = false
      }
    },
    async submitSigner() {
      if (!this.myTaskId || !this.signerForm.assignee) {
        return this.$message.warning('请选择用户')
      }
      this.submitting = true
      try {
        const payload = {
          taskId: this.myTaskId,
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
        this.loadDetail()
      } catch (e) {
        this.$message.error('操作失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.submitting = false
      }
    },
    filesForStep(stepKey, record) {
      if (record && Array.isArray(record.attachments) && record.attachments.length) {
        return record.attachments
      }
      const fromHistory = (this.attachmentHistory || []).find(s =>
        String(s.stepKey) === String(stepKey) ||
        String(s.taskId) === String(stepKey) ||
        (stepKey === 'START' && (s.nodeId === 'START' || s.source === 'START'))
      )
      if (fromHistory && Array.isArray(fromHistory.files)) {
        return fromHistory.files
      }
      if (stepKey === 'START') {
        return (this.attachments || []).filter(f =>
          f.source === 'START' || f.nodeId === 'START' || (!f.taskId && !f.nodeId)
        )
      }
      return (this.attachments || []).filter(f =>
        String(f.taskId) === String(stepKey) || String(f.nodeId) === String(stepKey)
      )
    },
    stepActionText(action) {
      return ({
        START: '发起',
        AGREE: '同意',
        REJECT: '拒绝',
        BACK: '回退'
      })[action] || action || '附件'
    },
    statusType(s) {
      return { RUNNING: 'primary', COMPLETED: 'success', REJECTED: 'danger', CANCELED: 'info' }[s] || ''
    },
    statusText(s) {
      return { RUNNING: '运行中', COMPLETED: '已完成', REJECTED: '已驳回', CANCELED: '已撤销' }[s] || s
    },
    formatTime(t) {
      return t ? new Date(t).toLocaleString() : '-'
    },
    formatDuration(ms) {
      if (ms == null) return ''
      const sec = Math.floor(ms / 1000)
      if (sec < 60) return sec + ' 秒'
      const min = Math.floor(sec / 60)
      if (min < 60) return min + ' 分钟'
      const h = Math.floor(min / 60)
      return h + ' 小时 ' + (min % 60) + ' 分'
    }
  }
}
</script>

<style scoped>
.process-detail {
  padding-bottom: 24px;
}

.summary-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-radius: 10px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f5f9ff 0%, #eef5ff 100%);
  border: 1px solid #d9ecff;
}

.summary-banner.status-completed {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f6e0 100%);
  border-color: #e1f3d8;
}

.summary-banner.status-rejected {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-color: #fde2e2;
}

.summary-banner.status-canceled {
  background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
  border-color: #e9e9eb;
}

.summary-title {
  margin: 0 0 10px;
  font-size: 20px;
  color: var(--text-color-2, #303133);
}

.summary-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 13px;
}

.meta-item::before {
  content: '';
}

.summary-progress {
  text-align: center;
  min-width: 100px;
}

.progress-label {
  margin-top: 6px;
  font-size: 12px;
  color: #606266;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-sub {
  font-weight: normal;
  font-size: 12px;
  color: #909399;
}

.progress-card >>> .el-step__title {
  font-size: 13px;
  line-height: 1.3;
}

.progress-card >>> .el-step__description {
  font-size: 12px;
}

.timeline-card {
  background: var(--background-origin, #fff);
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 8px;
  padding: 12px 14px;
}

.timeline-card.card-reject {
  border-color: #fbc4c4;
  background: #fff7f7;
}

.timeline-card.card-pass {
  border-color: #d9f0c7;
  background: #f9fff4;
}

.timeline-card.card-active {
  border-color: #b3d8ff;
  background: #f5faff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.08);
}

.timeline-card.card-start,
.timeline-card.card-end {
  background: #fafafa;
}

.timeline-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.timeline-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-user {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.timeline-duration {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.timeline-comment {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--background-1, #f5f7fa);
}

.timeline-comment.reject {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.timeline-comment.muted {
  color: #c0c4cc;
  font-size: 12px;
}

.comment-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.comment-body {
  font-size: 13px;
  color: var(--text-color-2, #303133);
  line-height: 1.5;
  white-space: pre-wrap;
}

.current-task {
  padding: 12px;
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 8px;
  margin-bottom: 10px;
  background: var(--background-2, #fafcff);
}

.current-task-name {
  font-weight: 600;
  color: var(--text-color-2, #303133);
  margin-bottom: 6px;
}

.current-task p {
  margin: 2px 0;
  font-size: 13px;
  color: #606266;
}

.current-task .muted,
.muted {
  color: #909399;
  font-size: 12px;
}

.timeline-attachments {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color, #ebeef5);
}

.history-step {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color, #f0f2f5);
}

.history-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.history-step-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.attach-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.extra-pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-color-2, #303133);
  font-family: Menlo, Monaco, Consolas, monospace;
}

.extra-raw {
  margin-top: 8px;
  border: none;
}

.extra-raw >>> .el-collapse-item__header {
  height: 36px;
  line-height: 36px;
  font-size: 12px;
  color: #909399;
  border: none;
  background: transparent;
}

.extra-raw >>> .el-collapse-item__wrap {
  border: none;
  background: var(--background-1, #f5f7fa);
  border-radius: 6px;
}

.extra-raw >>> .el-collapse-item__content {
  padding: 10px 12px;
}

.bpmn-viewer {
  /* 流程图查看器固定浅色底，暗色适配见 oa-theme.css */
  height: 360px;
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 4px;
  background: #fff;
}
</style>
