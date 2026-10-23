<template>
  <div class="my-processes">
    <el-card>
      <div slot="header" style="display:flex;justify-content:space-between;align-items:center">
        <span>📋 我的申请</span>
        <el-button type="primary" size="small" @click="showStartDialog">
          <i class="el-icon-plus"></i> 发起审批
        </el-button>
      </div>

      <!-- 搜索和筛选 -->
      <el-row :gutter="12" style="margin-bottom:16px">
        <el-col :span="6">
          <el-input v-model="searchKey" placeholder="搜索标题" size="small" clearable @clear="loadData" @keyup.enter.native="loadData">
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态筛选" size="small" clearable @change="loadData">
            <el-option label="全部" value="" />
            <el-option label="运行中" value="RUNNING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已驳回" value="REJECTED" />
            <el-option label="已撤销" value="CANCELED" />
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button size="small" @click="loadData">刷新</el-button>
        </el-col>
      </el-row>

      <!-- 无数据只展示空状态，不渲染空表头 -->
      <div v-loading="loading" class="oa-list-body">
        <el-table v-if="filteredList.length" :data="filteredList" style="width:100%">
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column label="流程" width="150">
            <template slot-scope="{row}">
              <el-tag size="small" type="info">{{ getProcessName(row.processKey) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="{row}">
              <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="当前环节" width="120">
            <template slot-scope="{row}">
              <span v-if="row.currentTaskName">{{ row.currentTaskName }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="发起时间" width="160">
            <template slot-scope="{row}">{{ formatTime(row.startTime) }}</template>
          </el-table-column>
          <el-table-column label="完成时间" width="160">
            <template slot-scope="{row}">
              <span v-if="row.endTime">{{ formatTime(row.endTime) }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template slot-scope="{row}">
              <el-button size="mini" @click="viewDetail(row)">详情</el-button>
              <el-button v-if="row.status === 'RUNNING'" size="mini" type="danger"
                          @click="cancel(row)" plain>撤销</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="filteredList.length && total > 0"
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          style="margin-top:16px;text-align:right"
          @current-change="handlePageChange"
        />

        <el-empty v-else-if="!loading" description="暂无申请记录">
          <el-button type="primary" @click="showStartDialog">立即发起审批</el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 发起审批对话框 -->
    <el-dialog :visible.sync="startVisible" title="发起审批" width="720px" :close-on-click-modal="false">
      <el-form ref="startFormRef" :model="startForm" :rules="formRules" label-width="100px">
        <el-form-item label="选择流程" prop="processKey">
          <el-select v-model="startForm.processKey" style="width:100%"
                     placeholder="请选择要发起的流程" @change="onProcessChange" filterable>
            <el-option v-for="p in publishedProcesses" :key="p.processKey"
                       :label="p.name + ' (v' + p.version + ')'" :value="p.processKey">
              <span style="float:left">{{ p.name }}</span>
              <span style="float:right;color:#909399;font-size:12px">v{{ p.version }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="startForm.title" placeholder="请输入审批标题" maxlength="100" show-word-limit />
        </el-form-item>

        <!-- 动态表单字段（来自流程设计器 Form Schema） -->
        <template v-if="selectedProcess">
          <el-divider content-position="left">{{ selectedProcess.name }} - 表单信息</el-divider>

          <dynamic-form
            ref="dynamicForm"
            :schema="activeFormSchema"
            v-model="formValues"
          />

          <el-form-item label="备注说明">
            <el-input v-model="startForm.remark" type="textarea" :rows="2" placeholder="可选填写备注信息" />
          </el-form-item>

          <el-divider content-position="left">附件</el-divider>

          <el-form-item label="上传附件">
            <el-upload
              action="#"
              :http-request="handleUpload"
              :file-list="fileList"
              :on-remove="onAttachmentRemove"
              :before-upload="beforeUpload"
              multiple
              :limit="10"
              list-type="text"
            >
              <el-button size="small" type="primary" :loading="uploading">
                <i class="el-icon-upload"></i> 选择文件
              </el-button>
              <div slot="tip" class="el-upload__tip">
                支持图片、PDF、Office、压缩包等，单文件 ≤ 20MB，最多 10 个
              </div>
            </el-upload>
            <attachment-panel
              v-if="attachmentPreview.length"
              :files="attachmentPreview"
              :removable="true"
              style="margin-top:8px"
              @remove="onPanelRemove"
            />
          </el-form-item>

          <el-collapse>
            <el-collapse-item title="查看将提交的 JSON 载荷" name="payload">
              <pre class="payload-preview">{{ previewPayload }}</pre>
            </el-collapse-item>
          </el-collapse>
        </template>

        <template v-if="!selectedProcess">
          <el-alert type="info" :closable="false" show-icon>
            <template slot="title">
              <i class="el-icon-info"></i> 请先选择要发起的流程，然后填写表单信息
            </template>
          </el-alert>
        </template>
      </el-form>

      <div slot="footer">
        <el-button @click="startVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitStart" :disabled="!selectedProcess">
          <i class="el-icon-check"></i> 提交审批
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPublished, startProcess, myProcesses, cancel } from '@/api/oa/designer'
import { uploadFile } from '@/api/oa/files'
import AttachmentPanel from '../components/AttachmentPanel.vue'
import DynamicForm from '../components/DynamicForm.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'OaMyProcesses',
  components: { AttachmentPanel, DynamicForm },
  data() {
    return {
      list: [],
      filteredList: [],
      loading: false,
      submitting: false,
      uploading: false,
      startVisible: false,
      selectedProcessKey: '',
      selectedProcess: null,
      publishedProcesses: [],
      startForm: { processKey: '', title: '' },
      formRules: {
        processKey: [{ required: true, message: '请选择流程', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' },
                { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }]
      },
      formValues: {},
      activeFormSchema: { fields: [] },
      processNameMap: {},
      searchKey: '',
      filterStatus: '',
      pageNum: 1,
      pageSize: 10,
      total: 0,
      attachmentList: [],
      fileList: []
    }
  },
  computed: {
    ...mapGetters(['userId', 'nickname', 'username']),
    attachmentPreview() {
      return this.attachmentList || []
    },
    previewPayload() {
      return JSON.stringify(this.buildBusinessData(), null, 2)
    }
  },
  created() {
    this.loadData()
    this.loadPublished()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const userId = this.userId != null ? String(this.userId) : ''
        if (!userId) {
          this.list = []
          this.applyFilters()
          return
        }
        const res = await myProcesses(userId)
        this.list = res.data || res.rows || []
        this.applyFilters()
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      let data = [...this.list]
      if (this.searchKey) {
        data = data.filter(p => p.title && p.title.toLowerCase().includes(this.searchKey.toLowerCase()))
      }
      if (this.filterStatus) {
        data = data.filter(p => p.status === this.filterStatus)
      }
      this.filteredList = data
      this.total = data.length
    },
    handlePageChange(page) {
      this.pageNum = page
    },
    async loadPublished() {
      const res = await listPublished()
      const list = res.data || res.rows || []
      this.publishedProcesses = list
      list.forEach(p => { this.processNameMap[p.processKey] = p.name })
    },
    getProcessName(key) { return this.processNameMap[key] || key },
    onProcessChange(key) {
      this.selectedProcess = this.publishedProcesses.find(p => p.processKey === key)
      this.formValues = {}
      this.activeFormSchema = this.resolveFormSchema(this.selectedProcess)
    },
    resolveFormSchema(process) {
      if (process && process.formSchema) {
        try {
          const obj = typeof process.formSchema === 'string'
            ? JSON.parse(process.formSchema)
            : process.formSchema
          if (obj && Array.isArray(obj.fields) && obj.fields.length) {
            return { fields: obj.fields.map(f => this.normalizeField(f)) }
          }
        } catch (e) { /* fallback */ }
      }
      return { fields: this.fallbackFields(process && process.processKey).map(f => this.normalizeField(f)) }
    },
    normalizeField(f) {
      const field = { ...f }
      if (Array.isArray(f.options) && f.options.length && typeof f.options[0] === 'object') {
        field.options = f.options.map(o => (o && (o.label || o.value)) || o)
      }
      return field
    },
    fallbackFields(processKey) {
      const map = {
        leave_process: [
          { key: 'leaveType', label: '请假类型', type: 'select', required: true, options: ['事假', '病假', '年假', '调休'] },
          { key: 'days', label: '请假天数', type: 'number', required: true },
          { key: 'startDate', label: '开始日期', type: 'date', required: true },
          { key: 'endDate', label: '结束日期', type: 'date', required: true },
          { key: 'reason', label: '请假原因', type: 'textarea', required: true }
        ],
        expense_process: [
          { key: 'expenseType', label: '费用类型', type: 'select', required: true, options: ['差旅费', '交通费', '餐饮费', '办公费'] },
          { key: 'amount', label: '报销金额', type: 'amount', required: true },
          { key: 'reason', label: '报销事由', type: 'textarea', required: true }
        ],
        purchase_process: [
          { key: 'itemName', label: '采购物品', type: 'text', required: true },
          { key: 'quantity', label: '采购数量', type: 'number', required: true },
          { key: 'amount', label: '预估金额', type: 'amount', required: true },
          { key: 'reason', label: '采购事由', type: 'textarea', required: true }
        ]
      }
      return map[processKey] || [
        { key: 'description', label: '申请说明', type: 'textarea', required: true }
      ]
    },
    showStartDialog() {
      this.startForm = { processKey: '', title: '', remark: '' }
      this.selectedProcessKey = ''
      this.selectedProcess = null
      this.formValues = {}
      this.activeFormSchema = { fields: [] }
      this.attachmentList = []
      this.fileList = []
      this.startVisible = true
    },
    beforeUpload(file) {
      const max = 20 * 1024 * 1024
      if (file.size > max) {
        this.$message.error('单文件不能超过 20MB')
        return false
      }
      return true
    },
    async handleUpload({ file, onSuccess, onError }) {
      this.uploading = true
      try {
        const res = await uploadFile(file)
        const meta = res.data
        this.attachmentList.push(meta)
        this.fileList.push({
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
    onAttachmentRemove(file) {
      const fileId = file.response && file.response.id
      if (fileId) {
        this.attachmentList = this.attachmentList.filter(a => a.id !== fileId)
      } else {
        this.attachmentList = this.attachmentList.filter(a => a.name !== file.name)
      }
      this.fileList = this.fileList.filter(f => f.uid !== file.uid)
    },
    onPanelRemove(file) {
      const fileId = file && (file.id || file.fileId)
      if (fileId) {
        this.attachmentList = this.attachmentList.filter(a => a.id !== fileId && a.fileId !== fileId)
        this.fileList = this.fileList.filter(f => {
          const rid = f.response && f.response.id
          return rid !== fileId
        })
      } else if (file && file.name) {
        this.attachmentList = this.attachmentList.filter(a => a.name !== file.name)
        this.fileList = this.fileList.filter(f => f.name !== file.name)
      }
    },
    buildBusinessData() {
      const businessData = { ...this.formValues }
      if (this.startForm.remark) businessData.remark = this.startForm.remark
      businessData.attachments = this.attachmentList
      return businessData
    },
    async submitStart() {
      this.$refs.startFormRef.validate(async (valid) => {
        if (!valid) return
        if (!this.selectedProcess) return this.$message.warning('请选择流程')
        const formErr = this.$refs.dynamicForm && this.$refs.dynamicForm.validate()
        if (formErr) return this.$message.warning(formErr)

        this.submitting = true
        try {
          const displayName = this.nickname || this.username || '用户'
          if (!this.startForm.title) {
            this.startForm.title = `${this.selectedProcess.name} - ${displayName} - ${new Date().toLocaleDateString()}`
          }

          const businessData = this.buildBusinessData()
          const sysUser = this.$store.state.user.sysUser || {}

          await startProcess({
            processKey: this.startForm.processKey,
            businessKey: String(Date.now()),
            title: this.startForm.title,
            formData: JSON.stringify(businessData),
            startBy: this.userId,
            deptId: sysUser.deptId
          })
          this.$message.success('审批已发起')
          this.startVisible = false
          this.loadData()
        } catch (e) {
          this.$message.error('发起失败: ' + (e.response?.data?.message || e.message))
        } finally {
          this.submitting = false
        }
      })
    },
    viewDetail(row) {
      this.$router.push({ name: 'OaProcessDetail', params: { instanceId: row.flowableInstanceId } })
    },
    cancel(row) {
      this.$confirm('确认撤销该审批？撤销后流程将终止。', '撤销确认', { type: 'warning' })
        .then(() => cancel(row.flowableInstanceId, this.userId))
        .then(() => {
          this.$message.success('已撤销')
          this.loadData()
        })
        .catch(() => {})
    },
    statusType(s) {
      return { RUNNING: 'primary', COMPLETED: 'success', REJECTED: 'danger', CANCELED: 'info' }[s] || ''
    },
    statusText(s) {
      return { RUNNING: '运行中', COMPLETED: '已完成', REJECTED: '已驳回', CANCELED: '已撤销' }[s] || s
    },
    formatTime(t) {
      return t ? new Date(t).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'
    }
  }
}
</script>

<style scoped>
.my-processes {
  padding: 16px;
}
.text-muted {
  color: #909399;
  font-size: 13px;
}
.attach-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.payload-preview {
  margin: 0;
  max-height: 200px;
  overflow: auto;
  padding: 10px;
  background: var(--background-1, #f5f7fa);
  color: var(--text-color-2, #303133);
  font-size: 12px;
  font-family: Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
.attach-thumb {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 1px solid var(--border-color, #ebeef5);
}
.attach-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #409eff;
}
</style>
