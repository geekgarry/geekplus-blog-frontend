<template>
  <div class="container-fluid re-wrap">
    <div class="gp-page container re-page gp-tool-page">
      <div class="resume-editor-page gp-tool-app">
        <!-- 顶栏：桌面完整按钮 / 移动端图标栏 -->
        <header class="resume-toolbar no-print">
          <div class="toolbar-left">
            <h1 class="page-title">在线简历</h1>
            <span v-if="isSaving" class="save-hint">保存中...</span>
            <span v-else-if="isSavingNew" class="save-hint">另存中...</span>
            <span v-else-if="lastSavedHint" class="save-hint muted">{{ lastSavedHint }}</span>
          </div>

          <!-- 桌面操作 -->
          <div class="toolbar-actions toolbar-actions--desktop">
            <el-button
              v-if="isLoggedIn"
              size="mini"
              icon="el-icon-folder-opened"
              @click="openMyResumes"
            >我的简历</el-button>
            <el-button size="mini" type="primary" icon="el-icon-document" @click="openTemplateDialog">
              模板：{{ currentTemplateMeta.name }}
            </el-button>
            <el-button size="mini" type="success" icon="el-icon-download" :loading="isExporting" @click="downloadModalVisible = true">
              下载
            </el-button>
            <el-button size="mini" icon="el-icon-folder-checked" :loading="isSaving" @click="saveCurrentResume(false)">保存</el-button>
            <el-button
              v-if="isLoggedIn"
              size="mini"
              plain
              icon="el-icon-document-add"
              :loading="isSavingNew"
              @click="saveCurrentResume(true)"
            >另存新档</el-button>
            <el-button size="mini" type="danger" plain icon="el-icon-refresh-left" @click="resetData">重置</el-button>
          </div>

          <!-- 移动端图标操作 -->
          <div class="toolbar-actions toolbar-actions--mobile">
            <button type="button" class="icon-btn" title="模板" @click="openTemplateDialog">
              <i class="el-icon-document"></i>
            </button>
            <button type="button" class="icon-btn" title="下载" :disabled="isExporting" @click="downloadModalVisible = true">
              <i class="el-icon-download"></i>
            </button>
            <button type="button" class="icon-btn primary" title="保存" :disabled="isSaving" @click="saveCurrentResume(false)">
              <i class="el-icon-folder-checked"></i>
            </button>
            <button
              v-if="isLoggedIn"
              type="button"
              class="icon-btn"
              title="我的简历"
              @click="openMyResumes"
            >
              <i class="el-icon-user"></i>
            </button>
            <el-dropdown trigger="click" @command="onMobileMore">
              <button type="button" class="icon-btn" title="更多">
                <i class="el-icon-more"></i>
              </button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="isLoggedIn" command="saveAs">另存新档</el-dropdown-item>
                <el-dropdown-item command="reset" divided>重置内容</el-dropdown-item>
                <el-dropdown-item v-if="isLoggedIn" command="center">账号设置</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </header>

        <div v-if="isLoggedIn && currentResumeTitle" class="current-resume-tip no-print">
          当前编辑：<strong>{{ currentResumeTitle }}</strong>
        </div>

        <div v-if="!isLoggedIn" class="guest-tip no-print">
          <i class="el-icon-info"></i>
          <div>
            <strong>游客模式：</strong>数据保存在浏览器本地。登录后可云端保存并解锁 VIP 模板。
          </div>
        </div>

        <!-- 工作区页签：对齐 【简历制作】 的 builder / analysis / ppt，并新增岗位搜索 -->
        <nav class="re-workspace-tabs no-print">
          <button
            type="button"
            :class="{ active: workspace === 'builder' }"
            @click="workspace = 'builder'"
          >编辑简历</button>
          <button
            type="button"
            :class="{ active: workspace === 'analysis' }"
            @click="workspace = 'analysis'"
          >岗位分析</button>
          <button
            type="button"
            :class="{ active: workspace === 'jobs' }"
            @click="workspace = 'jobs'"
          >岗位搜索</button>
          <!-- <router-link class="re-workspace-link" to="/tool/pptStudio">PPT 工作室</router-link> -->
        </nav>

        <div v-show="workspace === 'builder'">
        <!-- 移动端：编辑 / 预览切换 -->
        <div class="mobile-pane-tabs no-print" v-if="isMobile">
          <button
            type="button"
            :class="{ active: mobilePane === 'edit' }"
            @click="mobilePane = 'edit'"
          >编辑</button>
          <button
            type="button"
            :class="{ active: mobilePane === 'preview' }"
            @click="mobilePane = 'preview'"
          >预览</button>
        </div>

        <div class="resume-split" :class="{ 'is-mobile': isMobile }">
          <div
            class="resume-editor-pane no-print editor-container"
            v-show="!isMobile || mobilePane === 'edit'"
          >
            <ResumeFormEditor
              v-model="resumeData"
              :template="currentTemplateMeta"
              @change="handleResumeChange"
            />
          </div>
          <div
            id="preview-container"
            class="resume-preview-pane"
            v-show="!isMobile || mobilePane === 'preview'"
          >
            <ResumePreview
              :data="resumeData"
              :template-id="currentTemplateId"
              :template="currentTemplateMeta"
            />
          </div>
        </div>
        </div>

        <div v-show="workspace === 'analysis'" class="re-workspace-pane no-print">
          <ResumeAnalysis
            :key="'analysis-' + analysisReloadKey"
            :resume-data="resumeData"
            @apply-resume="onApplyOptimizedResume"
          />
        </div>
        <div v-show="workspace === 'jobs'" class="re-workspace-pane no-print">
          <ResumeJobSearch
            :resume-data="resumeData"
            @use-jd="onUseJdFromSearch"
          />
        </div>

        <!-- Template picker -->
        <el-dialog
          title="选择简历模板"
          :visible.sync="templateDialogVisible"
          :width="isMobile ? '100%' : '760px'"
          :fullscreen="isMobile"
          custom-class="re-dialog"
          class="no-print"
          append-to-body
        >
          <div class="template-grid">
            <button
              v-for="t in templates"
              :key="t.key"
              type="button"
              class="template-card"
              :class="{
                active: currentTemplateId === t.key,
                disabled: t.isVip && !isLoggedIn,
              }"
              :disabled="t.isVip && !isLoggedIn"
              @click="selectTemplate(t)"
            >
              <div class="template-card-name">{{ t.name }}</div>
              <div class="template-card-desc">{{ t.description }}</div>
              <span v-if="t.isVip" class="vip-badge">VIP{{ !isLoggedIn ? ' · 需登录' : '' }}</span>
            </button>
          </div>
        </el-dialog>

        <!-- 个人中心式：我的简历 -->
        <el-dialog
          :visible.sync="myResumesVisible"
          :width="isMobile ? '100%' : '720px'"
          :fullscreen="isMobile"
          custom-class="re-center-dialog"
          class="no-print"
          append-to-body
          @open="onMyCenterOpen"
        >
          <div slot="title" class="re-center-title">个人中心</div>

          <div class="re-center-tabs">
            <button
              type="button"
              :class="{ active: myCenterTab === 'resume' }"
              @click="myCenterTab = 'resume'"
            >我的简历</button>
            <button
              type="button"
              :class="{ active: myCenterTab === 'ppt' }"
              @click="myCenterTab = 'ppt'"
            >我的PPT</button>
            <button
              type="button"
              :class="{ active: myCenterTab === 'account' }"
              @click="myCenterTab = 'account'"
            >账号设置</button>
          </div>

          <!-- 简历列表 -->
          <div v-show="myCenterTab === 'resume'" class="re-center-pane" v-loading="myResumesLoading">
            <div class="re-list-hd">
              <h3>简历列表</h3>
              <button type="button" class="re-new-btn" @click="createNewResume">
                <i class="el-icon-plus"></i> 新建简历
              </button>
            </div>
            <p class="re-list-hint">点击整张卡片打开内容编辑；铅笔图标仅修改简历名称。</p>

            <ul v-if="myResumeList.length" class="re-resume-list">
              <li
                v-for="row in myResumeList"
                :key="row.id || row.title"
                class="re-resume-card"
                :class="{ current: row.id === currentResumeId }"
                @click="applyResumeRecord(row)"
              >
                <div class="re-resume-card__icon">
                  <i class="el-icon-document"></i>
                </div>
                <div class="re-resume-card__body">
                  <div class="re-resume-card__title-row">
                    <strong>{{ row.title || '未命名简历' }}</strong>
                    <span v-if="row.id === currentResumeId" class="re-badge">当前编辑</span>
                  </div>
                  <p class="re-resume-card__meta">
                    最后更新: {{ formatResumeTime(row.updatedAt) }}
                    <span v-if="row.templateKey"> · {{ row.templateKey }}</span>
                  </p>
                </div>
                <div class="re-resume-card__actions" @click.stop>
                  <!-- 改名与打开编辑分离：整卡点击进内容编辑，铅笔只改标题 -->
                  <button
                    type="button"
                    class="re-icon-act"
                    title="修改名称"
                    @click="renameResumeRecord(row)"
                  >
                    <i class="el-icon-edit-outline"></i>
                  </button>
                  <button
                    type="button"
                    class="re-icon-act"
                    title="打开编辑内容"
                    @click="applyResumeRecord(row)"
                  >
                    <i class="el-icon-document"></i>
                  </button>
                  <button type="button" class="re-icon-act danger" title="删除" @click="removeResumeRecord(row)">
                    <i class="el-icon-delete"></i>
                  </button>
                </div>
              </li>
            </ul>
            <p v-else-if="!myResumesLoading" class="empty-resumes">暂无云端简历，保存后会出现在这里。</p>
          </div>

          <!-- PPT：与工作区 PPT 制作联动 -->
          <div v-show="myCenterTab === 'ppt'" class="re-center-pane">
            <div class="re-list-hd">
              <h3>我的 PPT</h3>
              <button type="button" class="re-new-btn" @click="openPptWorkspace">
                <i class="el-icon-edit"></i> 去制作
              </button>
            </div>
            <ul v-if="localPptList.length" class="re-resume-list">
              <li
                v-for="row in localPptList"
                :key="row.id"
                class="re-resume-card"
                @click="openPptWorkspace"
              >
                <div class="re-resume-card__icon">
                  <i class="el-icon-picture-outline"></i>
                </div>
                <div class="re-resume-card__body">
                  <div class="re-resume-card__title-row">
                    <strong>{{ row.title || '未命名演示文稿' }}</strong>
                  </div>
                  <p class="re-resume-card__meta">
                    {{ row.slideCount || 0 }} 页 · 本地保存
                    <span v-if="row.savedAt"> · {{ formatResumeTime(row.savedAt) }}</span>
                  </p>
                </div>
              </li>
            </ul>
            <p v-else class="empty-resumes">暂无本地 PPT，可在「PPT 制作」中生成并保存。</p>
          </div>

          <!-- 账号设置快捷入口 -->
          <div v-show="myCenterTab === 'account'" class="re-center-pane re-account">
            <router-link class="re-account-cell" to="/user/center" @click.native="myResumesVisible = false">
              <i class="el-icon-user"></i>
              <div>
                <strong>个人中心</strong>
                <p>头像、昵称与站内服务</p>
              </div>
              <i class="el-icon-arrow-right"></i>
            </router-link>
            <router-link class="re-account-cell" to="/user/center/edit" @click.native="myResumesVisible = false">
              <i class="el-icon-edit-outline"></i>
              <div>
                <strong>编辑资料</strong>
                <p>修改个人信息</p>
              </div>
              <i class="el-icon-arrow-right"></i>
            </router-link>
          </div>
        </el-dialog>

        <!-- Download modal -->
        <el-dialog
          title="选择下载格式"
          :visible.sync="downloadModalVisible"
          :width="isMobile ? '92%' : '480px'"
          custom-class="re-dialog"
          class="no-print"
          append-to-body
          @open="refreshDeviceType"
        >
          <p class="download-hint">
            <template v-if="isMobile">移动端支持分页 PDF 与不分页（长页）PDF。</template>
            <template v-else>桌面端：浏览器打印仅输出简历预览区；也可下载 HTML / Word。</template>
          </p>
          <div class="download-grid" :class="{ 'is-mobile': isMobile }">
            <template v-if="isMobile">
              <button type="button" class="download-card pdf" @click="onDownload('pdf-paginated')">
                <i class="el-icon-document"></i>
                <span>(分页) PDF</span>
              </button>
              <button type="button" class="download-card pdf" @click="onDownload('pdf-single')">
                <i class="el-icon-tickets"></i>
                <span>(不分页) PDF</span>
              </button>
            </template>
            <template v-else>
              <button type="button" class="download-card pdf" @click="onDownload('pdf-print')">
                <i class="el-icon-printer"></i>
                <span>PDF（浏览器打印）</span>
              </button>
              <button type="button" class="download-card html" @click="onDownload('html')">
                <i class="el-icon-monitor"></i>
                <span>HTML 简历</span>
              </button>
              <button type="button" class="download-card word" @click="onDownload('word')">
                <i class="el-icon-edit-outline"></i>
                <span>Word 文档</span>
              </button>
            </template>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import '@/plugins/element-admin'
import { getToken } from '@/utils/auth'
import {
  saveResume,
  getTemplates,
  getResume,
  getMyResumeList,
  deleteResume,
  renameResume,
} from '@/api/resume'
import {
  ResumePreview,
  ResumeFormEditor,
  ResumeAnalysis,
  ResumeJobSearch,
  createEmptyResumeData,
  DEFAULT_TEMPLATES,
} from '@/components/resume'
import {
  isMobileDevice,
  exportIntelligentPDF,
  printResumeArea,
  exportHTML,
  exportWordDoc,
} from '@/components/resume/export/exportUtils'
import '@/components/resume/styles/tailwind.css'
import '@/components/resume/styles/resume-print.css'
import {
  RESUME_EDITOR_CACHE_KEY,
  RESUME_PPT_LOCAL_KEY,
  RESUME_ANALYSIS_SESSION_KEY,
} from '@/components/resume/constants'
import { PPT_LOCAL_KEY } from '@/components/ppt/pptThemes'

const CACHE_KEY = RESUME_EDITOR_CACHE_KEY

export default {
  name: 'ResumeEditorPage',
  components: {
    ResumePreview,
    ResumeFormEditor,
    ResumeAnalysis,
    ResumeJobSearch,
  },
  props: {
    data: {
      type: Object,
      default: () => createEmptyResumeData(),
    },
  },
  data() {
    return {
      resumeData: this.data || createEmptyResumeData(),
      templates: DEFAULT_TEMPLATES.slice(),
      currentTemplateId: 'template1',
      templateDialogVisible: false,
      downloadModalVisible: false,
      isExporting: false,
      isSaving: false,
      isSavingNew: false,
      lastSavedHint: '',
      isMobile: false,
      mobilePane: 'edit',
      saveTimer: null,
      currentResumeId: null,
      currentResumeTitle: '',
      myResumesVisible: false,
      myResumesLoading: false,
      myResumeList: [],
      myCenterTab: 'resume',
      // builder | analysis | jobs
      workspace: 'builder',
      localPptList: [],
      analysisReloadKey: 0,
    }
  },
  computed: {
    userId() {
      return this.$store.state.user.userId
    },
    isLoggedIn() {
      return !!getToken()
    },
    currentTemplateMeta() {
      return (
        this.templates.find((t) => t.key === this.currentTemplateId) ||
        DEFAULT_TEMPLATES[0]
      )
    },
  },
  created() {
    this.refreshDeviceType()
    this.loadFromCache()
    this.loadRemoteTemplates()
    if (this.isLoggedIn) {
      this.getUserLatestResume()
    }
    window.addEventListener('resize', this.refreshDeviceType)
  },
  beforeDestroy() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    window.removeEventListener('resize', this.refreshDeviceType)
  },
  methods: {
    refreshDeviceType() {
      this.isMobile = isMobileDevice()
    },
    onMobileMore(cmd) {
      if (cmd === 'saveAs') this.saveCurrentResume(true)
      else if (cmd === 'reset') this.resetData()
      else if (cmd === 'center') this.$router.push('/user/center').catch(() => {})
    },
    onMyCenterOpen() {
      this.myCenterTab = 'resume'
      this.loadMyResumes()
      this.refreshLocalPptList()
    },
    refreshLocalPptList() {
      try {
        // 优先读独立工作室键，兼容旧 resume 内嵌键
        const raw =
          localStorage.getItem(PPT_LOCAL_KEY) ||
          localStorage.getItem(RESUME_PPT_LOCAL_KEY)
        if (!raw) {
          this.localPptList = []
          return
        }
        const obj = JSON.parse(raw)
        this.localPptList = [
          {
            id: 'local-ppt',
            title: obj.title || '本地演示文稿',
            slideCount: Array.isArray(obj.slides) ? obj.slides.length : 0,
            savedAt: obj.savedAt || Date.now(),
          },
        ]
      } catch (e) {
        this.localPptList = []
      }
    },
    openPptWorkspace() {
      this.myResumesVisible = false
      this.$router.push('/tool/pptStudio').catch(() => {})
    },
    onPptSaved() {
      this.refreshLocalPptList()
    },
    onApplyOptimizedResume(payload) {
      if (!payload || typeof payload !== 'object') return
      // Analysis 侧已 mergeResumeData；此处直接替换当前编辑数据
      this.resumeData = payload
      this.persistCache()
      this.workspace = 'builder'
    },
    onUseJdFromSearch(text) {
      // 岗位搜索 → 分析页：把 JD 塞进 session，切到分析页签
      try {
        const prev = sessionStorage.getItem(RESUME_ANALYSIS_SESSION_KEY)
        const obj = prev ? JSON.parse(prev) : {}
        obj.jobText = text
        sessionStorage.setItem(RESUME_ANALYSIS_SESSION_KEY, JSON.stringify(obj))
      } catch (e) {
        /* ignore */
      }
      this.workspace = 'analysis'
      this.analysisReloadKey += 1
    },
    handleResumeChange(data) {
      this.resumeData = data
      this.persistCache()
    },
    persistCache() {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            resumeData: this.resumeData,
            currentTemplateId: this.currentTemplateId,
            updatedAt: Date.now(),
          })
        )
        this.lastSavedHint = '已自动保存到本地'
      } catch (e) {
        // ignore quota
      }
    },
    getUserLatestResume() {
      if (!this.isLoggedIn || !this.userId) return
      getResume(this.userId)
        .then((res) => {
          const data = res && res.data ? res.data : null
          if (data && data.dataJson) {
            this.applyResumeRecord(data, true)
          }
        })
        .catch(() => {})
    },
    openMyResumes() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        return
      }
      this.myResumesVisible = true
      this.loadMyResumes()
    },
    loadMyResumes() {
      if (!this.userId) return
      this.myResumesLoading = true
      getMyResumeList(this.userId)
        .then((res) => {
          const list = (res && res.data) || []
          this.myResumeList = Array.isArray(list) ? list : []
        })
        .catch(() => {
          this.myResumeList = []
        })
        .finally(() => {
          this.myResumesLoading = false
        })
    },
    applyResumeRecord(record, silent = false) {
      if (!record) return
      try {
        const parsedRaw =
          typeof record.dataJson === 'string'
            ? JSON.parse(record.dataJson)
            : record.dataJson || createEmptyResumeData()
        const parsed = { ...parsedRaw }
        const embeddedTpl = parsed.__templateId
        if (embeddedTpl) delete parsed.__templateId
        this.resumeData = {
          ...createEmptyResumeData(),
          ...parsed,
          basics: {
            ...createEmptyResumeData().basics,
            ...(parsed.basics || {}),
          },
          jobIntention: {
            ...createEmptyResumeData().jobIntention,
            ...(parsed.jobIntention || {}),
          },
        }
        const tpl = record.templateKey || record.templateId || embeddedTpl
        if (tpl) this.currentTemplateId = tpl
        this.currentResumeId = record.id || null
        this.currentResumeTitle = record.title || '未命名简历'
        this.persistCache()
        this.myResumesVisible = false
        if (!silent) {
          this.$message.success(`已切换到：${this.currentResumeTitle}`)
        }
      } catch (e) {
        this.$message.error('简历数据解析失败')
      }
    },
    createNewResume() {
      this.resumeData = createEmptyResumeData()
      this.currentTemplateId = 'template1'
      this.currentResumeId = null
      this.currentResumeTitle = '新建简历'
      this.persistCache()
      this.myResumesVisible = false
      this.$message.success('已新建空白简历，保存后写入云端')
    },
    removeResumeRecord(row) {
      if (!row || !row.id) return
      this.$confirm(`确定删除「${row.title || row.id}」吗？`, '提示', { type: 'warning' })
        .then(() => deleteResume(row.id))
        .then(() => {
          this.$message.success('已删除')
          if (this.currentResumeId === row.id) {
            this.currentResumeId = null
            this.currentResumeTitle = ''
          }
          this.loadMyResumes()
        })
        .catch(() => {})
    },
    /**
     * 仅改简历名称：弹窗输入 → PUT /api/resume/{id}/title，不加载正文、不关列表。
     */
    renameResumeRecord(row) {
      if (!row || !row.id) {
        this.$message.warning('该简历尚未保存到云端，无法改名')
        return
      }
      this.$prompt('请输入新的简历名称', '修改名称', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputValue: row.title || '未命名简历',
        inputPattern: /\S+/,
        inputErrorMessage: '名称不能为空',
        closeOnClickModal: false,
      })
        .then(({ value }) => {
          const title = String(value || '').trim()
          if (!title) return Promise.reject(new Error('empty'))
          return renameResume(this.userId, row.id, title).then((res) => {
            const saved = (res && res.data) || { title }
            const nextTitle = saved.title || title
            // 列表就地更新，避免整表闪烁
            const hit = this.myResumeList.find((r) => r.id === row.id)
            if (hit) {
              hit.title = nextTitle
              if (saved.updatedAt) hit.updatedAt = saved.updatedAt
            }
            if (this.currentResumeId === row.id) {
              this.currentResumeTitle = nextTitle
            }
            this.$message.success('名称已更新')
          })
        })
        .catch((err) => {
          if (err === 'cancel' || err === 'close') return
          if (err && err.message === 'empty') return
          // 请求失败时 interceptor 多半已 tip；此处仅兜底
        })
    },
    formatResumeTime(val) {
      if (!val) return '-'
      try {
        const d = new Date(val)
        if (Number.isNaN(d.getTime())) return String(val)
        return d.toLocaleString()
      } catch (e) {
        return String(val)
      }
    },
    loadFromCache() {
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (parsed.resumeData && parsed.resumeData.basics) {
          this.resumeData = {
            ...createEmptyResumeData(),
            ...parsed.resumeData,
            basics: {
              ...createEmptyResumeData().basics,
              ...(parsed.resumeData.basics || {}),
            },
            jobIntention: {
              ...createEmptyResumeData().jobIntention,
              ...(parsed.resumeData.jobIntention || {}),
            },
          }
        }
        if (parsed.currentTemplateId) {
          this.currentTemplateId = parsed.currentTemplateId
        }
      } catch (e) {
        // ignore
      }
    },
    async loadRemoteTemplates() {
      try {
        const res = await getTemplates()
        const list = (res && (res.data || res.rows || res)) || []
        if (Array.isArray(list) && list.length) {
          const mapped = list.map((t) => ({
            key: t.key || t.templateKey,
            name: t.name || t.templateName,
            description: t.description || '',
            isVip: !!(t.isVip || t.vip),
            readonly: t.readonly !== false,
            layoutData:
              typeof t.layoutData === 'string'
                ? JSON.parse(t.layoutData)
                : t.layoutData ||
                  (typeof t.layoutJson === 'string'
                    ? JSON.parse(t.layoutJson)
                    : t.layoutJson),
          }))
          const map = {}
          DEFAULT_TEMPLATES.forEach((t) => {
            map[t.key] = t
          })
          mapped.forEach((t) => {
            if (t.key) map[t.key] = { ...map[t.key], ...t }
          })
          this.templates = Object.values(map)
        }
      } catch (e) {
        // keep DEFAULT_TEMPLATES
      }
    },
    openTemplateDialog() {
      this.templateDialogVisible = true
    },
    selectTemplate(t) {
      if (t.isVip && !this.isLoggedIn) {
        this.$message.warning('该模板为 VIP，请先登录')
        return
      }
      this.currentTemplateId = t.key
      this.templateDialogVisible = false
      this.persistCache()
    },
    async saveCurrentResume(asNew = false) {
      this.persistCache()
      if (!this.isLoggedIn) {
        this.$message.success('已保存到本地缓存', { duration: 3000 })
        return
      }
      if (asNew) {
        this.isSavingNew = true
      } else {
        this.isSaving = true
      }
      try {
        const payload = {
          title: `${(this.resumeData.basics && this.resumeData.basics.name) || '未命名'}的简历`,
          data: this.resumeData,
          templateId: this.currentTemplateId,
        }
        if (!asNew && this.currentResumeId) {
          payload.id = this.currentResumeId
        }
        const res = await saveResume(this.userId, payload)
        const saved = res && res.data ? res.data : null
        if (saved && saved.id) {
          this.currentResumeId = saved.id
          this.currentResumeTitle = saved.title || payload.title
        }
        this.$message.success(asNew || !payload.id ? '已新建并保存到云端' : '已更新当前简历')
        this.lastSavedHint = '已同步到云端'
        if (this.myResumesVisible) this.loadMyResumes()
      } catch (e) {
        this.$message.error('云端保存失败，数据仍在本地')
      } finally {
        if (asNew) {
          this.isSavingNew = false
        } else {
          this.isSaving = false
        }
      }
    },
    resetData() {
      this.$confirm('确定重置所有简历内容吗？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.resumeData = createEmptyResumeData()
          this.currentTemplateId = 'template1'
          this.currentResumeId = null
          this.currentResumeTitle = ''
          localStorage.removeItem(CACHE_KEY)
          this.lastSavedHint = ''
          this.$message.success('已重置')
        })
        .catch(() => {})
    },
    async onDownload(type) {
      this.refreshDeviceType()
      this.downloadModalVisible = false
      const name = this.resumeData.basics.name || '简历'
      this.isExporting = true
      try {
        await new Promise((r) => setTimeout(r, 80))
        if (type === 'pdf-print') {
          printResumeArea()
          this.$message.info('请在打印对话框中选择「另存为 PDF」', { duration: 3000 })
        } else if (type === 'pdf-paginated') {
          await exportIntelligentPDF('paginated', `${name}-${Date.now()}.pdf`)
          this.$message.success('分页 PDF 导出成功', { duration: 3000 })
        } else if (type === 'pdf-single') {
          await exportIntelligentPDF('single', `${name}-${Date.now()}.pdf`)
          this.$message.success('不分页 PDF 导出成功', { duration: 3000 })
        } else if (type === 'html') {
          await exportHTML(name)
          this.$message.success('HTML 导出成功', { duration: 3000 })
        } else if (type === 'word') {
          await exportWordDoc(name)
          this.$message.success('Word 导出成功', { duration: 3000 })
        }
      } catch (e) {
        console.error(e)
        this.$message.error((e && e.message) || '导出失败，请稍后重试', { duration: 3000 })
      } finally {
        this.isExporting = false
      }
    },
  },
}
</script>

<style scoped>
.re-wrap {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.resume-editor-page {
  --re-primary: var(--theme-color,#3b82f6);
  --re-primary-soft: var(--background,#eff6ff);
  --re-border: var(--border-color,#e5e7eb);
  --re-text: var(--text-color,#111827);
  --re-muted: var(--text-color-2,#6b7280);
  min-height: calc(100vh - 120px);
  background: var(--background-origin, #f3f4f6);
  padding: 10px 10px 28px;
}

.resume-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--background-2,#fff);
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 20;
}

.page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--re-text);
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.save-hint {
  font-size: 12px;
  color: #059669;
  white-space: nowrap;
}
.save-hint.muted { color: var(--re-muted); }

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.toolbar-actions--mobile { display: none; }
.toolbar-actions--desktop { display: flex; }

.icon-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--re-border);
  border-radius: 10px;
  background: var(--background,#fff);
  color: var(--text-color-2,#374151);
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.icon-btn.primary {
  background: var(--re-primary-soft);
  border-color: var(--border-color-2,#bfdbfe);
  color: var(--re-primary);
}
.icon-btn:disabled { opacity: 0.5; }

.guest-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: var(--background-1,#eff6ff);
  border: 1px solid var(--border-color-2,#bfdbfe);
  color: var(--theme-color,#1e40af);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
  font-size: 13px;
}
.re-workspace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  padding: 4px;
  background: var(--background-2, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
}
.re-workspace-tabs button {
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--re-muted, #6b7280);
  cursor: pointer;
}
.re-workspace-tabs button.active {
  background: var(--re-primary-soft, #dbeafe);
  color: var(--re-primary, #2563eb);
}
.re-workspace-link {
  display: inline-flex;
  align-items: center;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-color);
  text-decoration: none;
  background: var(--theme-color-muted);
  border: 1px solid var(--border-color-2);
}
.re-workspace-link:hover {
  border-color: var(--borderHoverColor);
}
.re-workspace-pane {
  min-height: 360px;
}
.current-resume-tip {
  margin-bottom: 10px;
  font-size: 13px;
  /* color: #374151; */
}

.mobile-pane-tabs {
  display: none;
  margin-bottom: 10px;
  background: var(--background-2,#fff);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}
.mobile-pane-tabs button {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 10px 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--re-muted);
  cursor: pointer;
}
.mobile-pane-tabs button.active {
  background: var(--re-primary-soft);
  color: var(--re-primary);
}

.resume-split {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resume-editor-pane {
  background: var(--background-2,#fff);
  border-radius: 14px;
  padding: 6px;
  overflow: visible;
}
.resume-preview-pane {
  background: var(--background-2,#d1d5db);
  border-radius: 14px;
  padding: 12px;
}

/* —— 个人中心弹窗（图中风格） —— */
::v-deep .re-center-dialog {
  border-radius: 16px;
  overflow: hidden;
}
::v-deep .re-center-dialog .el-dialog__header {
  padding: 16px 18px 10px;
  border-bottom: 1px solid var(--re-border);
}
::v-deep .re-center-dialog .el-dialog__body {
  padding: 0 0 16px;
}
.re-center-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--re-text);
}
.re-center-tabs {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  border-bottom: 1px solid var(--re-border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.re-center-tabs button {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--re-muted);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}
.re-center-tabs button.active {
  color: var(--re-primary);
  font-weight: 650;
}
.re-center-tabs button.active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: var(--re-primary);
}
.re-center-pane {
  padding: 14px 16px 8px;
  min-height: 220px;
}
.re-list-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.re-list-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--re-muted, #909399);
}
.re-list-hd h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}
.re-new-btn {
  border: none;
  background: var(--re-primary-soft);
  color: var(--re-primary);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.re-resume-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.re-resume-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--re-border);
  border-radius: 12px;
  background: var(--background-origin,#fff);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.re-resume-card.current {
  border-color: var(--re-primary);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.15);
  background: var(--background-1,#f8fbff);
}
.re-resume-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--background-2,#f3f4f6);
  color: var(--text-color-2,#6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.re-resume-card__body {
  flex: 1;
  min-width: 0;
}
.re-resume-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.re-resume-card__title-row strong {
  font-size: 14px;
  color: var(--re-text);
}
.re-badge {
  font-size: 11px;
  line-height: 1;
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--re-primary);
  color: var(--text-color,#fff);
  font-weight: 600;
}
.re-resume-card__meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--re-muted);
}
.re-resume-card__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.re-icon-act {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-color-2,#9ca3af);
  font-size: 16px;
  cursor: pointer;
}
.re-icon-act:hover { background: var(--background-2,#f3f4f6); color: var(--text-color-2,#374151); }
.re-icon-act.danger:hover { background: var(--background-1,#fef2f2); color: #dc2626; }

.empty-resumes {
  margin: 28px 0;
  color: var(--re-muted);
  font-size: 13px;
  text-align: center;
}
.re-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--re-muted);
  padding: 40px 16px;
}
.re-placeholder i { font-size: 36px; color: var(--text-color-2,#cbd5e1); }
.re-placeholder p { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-color,#64748b); }
.re-placeholder span { font-size: 12px; }

.re-account-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--re-border);
  border-radius: 12px;
  margin-bottom: 10px;
  text-decoration: none;
  color: inherit;
  background: var(--background-origin,#fff);
}
.re-account-cell i:first-child {
  font-size: 20px;
  color: var(--re-primary);
}
.re-account-cell strong { display: block; font-size: 14px; }
.re-account-cell p { margin: 2px 0 0; font-size: 12px; color: var(--re-muted); }
.re-account-cell > div { flex: 1; }
.re-account-cell .el-icon-arrow-right { color: var(--text-color-2,#cbd5e1); }

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.template-card {
  text-align: left;
  border: 2px solid var(--border-color,#e5e7eb);
  border-radius: 12px;
  padding: 14px;
  background: var(--background-2,#fff);
  cursor: pointer;
  color: var(--text-color,#374151);
}
.template-card:hover:not(.disabled) {
  border-color: var(--re-primary);
  background: #059669;
  color: #fff;
}
.template-card.active {
  border-color: var(--theme-color,#2563eb);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
.template-card.disabled { opacity: 0.55; cursor: not-allowed; }
.template-card-name { font-weight: 700; margin-bottom: 4px; }
.template-card-desc { font-size: 12px; color: var(--re-muted); line-height: 1.4; }
.vip-badge {
  display: inline-block;
  margin-top: 8px;
  font-size: 10px;
  background: var(--background-1,#ffedd5);
  color: #c2410c;
  padding: 2px 8px;
  border-radius: 999px;
}

.download-hint {
  font-size: 13px;
  margin: 0 0 16px;
  text-align: center;
  color: var(--re-muted);
}
.download-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.download-grid:not(.is-mobile) { grid-template-columns: 1fr; }
@media (min-width: 400px) {
  .download-grid:not(.is-mobile) { grid-template-columns: 1fr 1fr; }
  .download-grid:not(.is-mobile) .download-card.pdf { grid-column: 1 / -1; }
}
.download-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 22px 12px;
  border: 2px solid var(--border-color-2,#e5e7eb);
  border-radius: 14px;
  background: var(--background-1,#fff);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-2,#374151);
}
.download-card i { font-size: 28px; }
.download-card.pdf:hover { border-color: #f87171; background: #fef2f2; color: #dc2626; }
.download-card.html:hover { border-color: #60a5fa; background: #eff6ff; color: #2563eb; }
.download-card.word:hover { border-color: #34d399; background: #ecfdf5; color: #059669; }

/* 移动端 */
@media (max-width: 767px) {
  .resume-editor-page { padding: 8px 8px 24px; }
  .toolbar-actions--desktop { display: none; }
  .toolbar-actions--mobile { display: flex; }
  .mobile-pane-tabs { display: flex; }
  .page-title { font-size: 16px; }
  .resume-toolbar {
    position: sticky;
    top: 0;
    border-radius: 12px;
  }
  ::v-deep .re-center-dialog {
    border-radius: 0;
    margin: 0 !important;
  }
}

/* 桌面 / 大屏 */
@media (min-width: 1024px) {
  .resume-editor-page {
    padding: 16px 16px 40px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .resume-split {
    flex-direction: row;
    align-items: flex-start;
  }
  .resume-editor-pane,
  .resume-preview-pane {
    width: 50%;
    max-height: calc(100vh - 150px);
    overflow-y: auto;
  }
  .resume-toolbar { padding: 12px 16px; }
  .page-title { font-size: 18px; }
}

@media (min-width: 1440px) {
  .resume-editor-page { max-width: 1560px; }
}

@media print {
  .resume-editor-page {
    padding: 0 !important;
  }
  .resume-split { display: block !important; }
  .resume-preview-pane {
    width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
    padding: 0 !important;
    border-radius: 0 !important;
  }
}
</style>
