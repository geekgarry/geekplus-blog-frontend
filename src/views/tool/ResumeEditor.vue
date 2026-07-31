<template>
  <div class="container-fluid">
    <div class="gp-page container">
    <div class="resume-editor-page">
      <!-- Header -->
      <div class="resume-toolbar no-print">
        <div class="toolbar-left">
          <h1 class="page-title">在线简历编辑器</h1>
          <span v-if="isSaving" class="save-hint">保存中...</span>
          <span v-else-if="isSavingNew" class="save-hint">另存中...</span>
          <span v-else-if="lastSavedHint" class="save-hint muted">{{ lastSavedHint }}</span>
        </div>
        <div class="toolbar-actions">
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
      </div>

      <div v-if="isLoggedIn && currentResumeTitle" class="current-resume-tip no-print">
        当前编辑：<strong>{{ currentResumeTitle }}</strong>
        <span v-if="currentResumeId" class="muted">（ID {{ currentResumeId }}）</span>
      </div>

      <div v-if="!isLoggedIn" class="guest-tip no-print">
        <i class="el-icon-info"></i>
        <div>
          <strong>游客模式：</strong>数据保存在浏览器本地。登录后可云端保存并解锁 VIP 模板。
        </div>
      </div>

      <div class="resume-split">
        <div class="resume-editor-pane no-print editor-container">
          <ResumeFormEditor
            v-model="resumeData"
            :template="currentTemplateMeta"
            @change="handleResumeChange"
          />
        </div>
        <div id="preview-container" class="resume-preview-pane">
          <ResumePreview
            :data="resumeData"
            :template-id="currentTemplateId"
            :template="currentTemplateMeta"
          />
        </div>
      </div>

      <!-- Template picker -->
      <el-dialog
        title="选择简历模板"
        :visible.sync="templateDialogVisible"
        width="720px"
        class="no-print"
        append-to-body
      >
        <div class="template-grid">
          <button
            v-for="t in templates"
            :key="t.id"
            type="button"
            class="template-card"
            :class="{
              active: currentTemplateId === t.id,
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

      <!-- 我的简历列表 -->
      <el-dialog
        title="我的简历"
        :visible.sync="myResumesVisible"
        width="640px"
        class="no-print"
        append-to-body
      >
        <div class="my-resumes-toolbar">
          <el-button size="mini" type="primary" icon="el-icon-plus" @click="createNewResume">新建空白简历</el-button>
          <el-button size="mini" icon="el-icon-refresh" :loading="myResumesLoading" @click="loadMyResumes">刷新</el-button>
        </div>
        <el-table
          v-loading="myResumesLoading"
          :data="myResumeList"
          size="small"
          border
          highlight-current-row
          :row-class-name="resumeRowClass"
          @row-click="selectResumeRow"
        >
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column prop="templateKey" label="模板" width="120" show-overflow-tooltip />
          <el-table-column prop="updatedAt" label="更新时间" width="170">
            <template slot-scope="scope">{{ formatResumeTime(scope.row.updatedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click.stop="applyResumeRecord(scope.row)">打开</el-button>
              <el-button type="text" size="mini" style="color:#f56c6c" @click.stop="removeResumeRecord(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="!myResumesLoading && !myResumeList.length" class="empty-resumes">暂无云端简历，保存后会出现在这里。</p>
      </el-dialog>

      <!-- Download modal: mobile = 分页/不分页 PDF；desktop = 打印PDF / HTML / Word -->
      <el-dialog
        title="选择下载格式"
        :visible.sync="downloadModalVisible"
        width="480px"
        class="no-print"
        append-to-body
        @open="refreshDeviceType"
      >
        <p class="download-hint">
          <template v-if="isMobile">移动端支持分页 PDF 与不分页（长页）PDF。</template>
          <template v-else>桌面端：浏览器打印仅输出简历预览区；也可下载 HTML / Word。</template>
        </p>
        <div class="download-grid" :class="{ 'is-mobile': isMobile }">
          <!-- 移动端：分页 + 不分页 PDF -->
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
          <!-- 桌面端：打印PDF + HTML + Word -->
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
import { getToken } from '@/utils/auth';
import {
  saveResume,
  getTemplates,
  getResume,
  getMyResumeList,
  deleteResume,
} from '@/api/resume';
import {
  ResumePreview,
  ResumeFormEditor,
  createEmptyResumeData,
  DEFAULT_TEMPLATES,
} from '@/components/resume';
import {
  isMobileDevice,
  exportIntelligentPDF,
  printResumeArea,
  exportHTML,
  exportWordDoc,
} from '@/components/resume/export/exportUtils';
import '@/components/resume/styles/tailwind.css';
import '@/components/resume/styles/resume-print.css';

const CACHE_KEY = 'resume_editor_cache_v2';

export default {
  name: 'ResumeEditorPage',
  components: {
    ResumePreview,
    ResumeFormEditor,
  },
  props: {
    data: {
      type: Object,
      default: () => createEmptyResumeData(), // 简历数据
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
      saveTimer: null,
      currentResumeId: null,
      currentResumeTitle: '',
      myResumesVisible: false,
      myResumesLoading: false,
      myResumeList: [],
    };
  },
  computed: {
    userId() {
      return this.$store.state.user.userId;
    },
    isLoggedIn() {
      return !!getToken();
    },
    currentTemplateMeta() {
      return (
        this.templates.find((t) => t.id === this.currentTemplateId) ||
        DEFAULT_TEMPLATES[0]
      );
    },
  },
  created() {
    this.refreshDeviceType();
    this.loadFromCache();
    this.loadRemoteTemplates();
    if (this.isLoggedIn) {
      this.getUserLatestResume();
    }
    window.addEventListener('resize', this.refreshDeviceType);
  },
  beforeDestroy() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    window.removeEventListener('resize', this.refreshDeviceType);
  },
  methods: {
    refreshDeviceType() {
      this.isMobile = isMobileDevice();
    },
    handleResumeChange(data) {
      this.resumeData = data;
      this.persistCache();
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
        );
        this.lastSavedHint = '已自动保存到本地';
      } catch (e) {
        // ignore quota
      }
    },
    getUserLatestResume() {
      if (!this.isLoggedIn || !this.userId) return;
      getResume(this.userId)
        .then((res) => {
          const data = res && res.data ? res.data : null;
          if (data && data.dataJson) {
            this.applyResumeRecord(data, true);
          }
        })
        .catch(() => {});
    },
    openMyResumes() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录');
        return;
      }
      this.myResumesVisible = true;
      this.loadMyResumes();
    },
    loadMyResumes() {
      if (!this.userId) return;
      this.myResumesLoading = true;
      getMyResumeList(this.userId)
        .then((res) => {
          const list = (res && res.data) || [];
          this.myResumeList = Array.isArray(list) ? list : [];
        })
        .catch(() => {
          this.myResumeList = [];
        })
        .finally(() => {
          this.myResumesLoading = false;
        });
    },
    resumeRowClass({ row }) {
      return row && row.id === this.currentResumeId ? 'is-current-resume' : '';
    },
    selectResumeRow(row) {
      this.applyResumeRecord(row);
    },
    applyResumeRecord(record, silent = false) {
      if (!record) return;
      try {
        const parsedRaw =
          typeof record.dataJson === 'string'
            ? JSON.parse(record.dataJson)
            : record.dataJson || createEmptyResumeData();
        const parsed = { ...parsedRaw };
        const embeddedTpl = parsed.__templateId;
        if (embeddedTpl) delete parsed.__templateId;
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
        };
        const tpl = record.templateKey || record.templateId || embeddedTpl;
        if (tpl) this.currentTemplateId = tpl;
        this.currentResumeId = record.id || null;
        this.currentResumeTitle = record.title || '未命名简历';
        this.persistCache();
        this.myResumesVisible = false;
        if (!silent) {
          this.$message.success(`已切换到：${this.currentResumeTitle}`);
        }
      } catch (e) {
        this.$message.error('简历数据解析失败');
      }
    },
    createNewResume() {
      this.resumeData = createEmptyResumeData();
      this.currentTemplateId = 'template1';
      this.currentResumeId = null;
      this.currentResumeTitle = '新建简历';
      this.persistCache();
      this.myResumesVisible = false;
      this.$message.success('已新建空白简历，保存后写入云端');
    },
    removeResumeRecord(row) {
      if (!row || !row.id) return;
      this.$confirm(`确定删除「${row.title || row.id}」吗？`, '提示', { type: 'warning' })
        .then(() => deleteResume(row.id))
        .then(() => {
          this.$message.success('已删除');
          if (this.currentResumeId === row.id) {
            this.currentResumeId = null;
            this.currentResumeTitle = '';
          }
          this.loadMyResumes();
        })
        .catch(() => {});
    },
    formatResumeTime(val) {
      if (!val) return '-';
      try {
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return String(val);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch (e) {
        return String(val);
      }
    },
    // 从缓存中加载数据
    loadFromCache() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
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
          };
        }
        if (parsed.currentTemplateId) {
          this.currentTemplateId = parsed.currentTemplateId;
        }
      } catch (e) {
        // ignore
      }
    },
    async loadRemoteTemplates() {
      try {
        const res = await getTemplates();
        const list = (res && (res.data || res.rows || res)) || [];
        if (Array.isArray(list) && list.length) {
          const mapped = list.map((t) => ({
            id: t.id || t.key || t.templateKey,
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
          }));
          // Merge system presets with remote (remote overrides same id)
          const map = {};
          DEFAULT_TEMPLATES.forEach((t) => {
            map[t.id] = t;
          });
          mapped.forEach((t) => {
            if (t.id) map[t.id] = { ...map[t.id], ...t };
          });
          this.templates = Object.values(map);
        }
      } catch (e) {
        // keep DEFAULT_TEMPLATES
      }
    },
    openTemplateDialog() {
      this.templateDialogVisible = true;
    },
    selectTemplate(t) {
      if (t.isVip && !this.isLoggedIn) {
        this.$message.warning('该模板为 VIP，请先登录');
        return;
      }
      this.currentTemplateId = t.id;
      this.templateDialogVisible = false;
      this.persistCache();
    },
    async saveCurrentResume(asNew = false) {
      this.persistCache();
      if (!this.isLoggedIn) {
        this.$message.success('已保存到本地缓存');
        return;
      }
      if (asNew) {
        this.isSavingNew = true;
      } else {
        this.isSaving = true;
      }
      try {
        const payload = {
          title: `${(this.resumeData.basics && this.resumeData.basics.name) || '未命名'}的简历`,
          data: this.resumeData,
          templateId: this.currentTemplateId,
        };
        // 有当前 id 且非「另存为」→ 更新；否则新建
        if (!asNew && this.currentResumeId) {
          payload.id = this.currentResumeId;
        }
        const res = await saveResume(this.userId, payload);
        const saved = res && res.data ? res.data : null;
        if (saved && saved.id) {
          this.currentResumeId = saved.id;
          this.currentResumeTitle = saved.title || payload.title;
        }
        this.$message.success(asNew || !payload.id ? '已新建并保存到云端' : '已更新当前简历');
        this.lastSavedHint = '已同步到云端';
        // 保存后立刻刷新列表缓存（若弹窗开着）
        if (this.myResumesVisible) this.loadMyResumes();
      } catch (e) {
        this.$message.error('云端保存失败，数据仍在本地');
      } finally {
        if (asNew) {
          this.isSavingNew = false;
        } else {
          this.isSaving = false;
        }
      }
    },
    resetData() {
      this.$confirm('确定重置所有简历内容吗？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.resumeData = createEmptyResumeData();
          this.currentTemplateId = 'template1';
          this.currentResumeId = null;
          this.currentResumeTitle = '';
          localStorage.removeItem(CACHE_KEY);
          this.lastSavedHint = '';
          this.$message.success('已重置');
        })
        .catch(() => {});
    },
    async onDownload(type) {
      this.refreshDeviceType();
      this.downloadModalVisible = false;
      const name = this.resumeData.basics.name || '简历';
      this.isExporting = true;
      try {
        await new Promise((r) => setTimeout(r, 80));
        if (type === 'pdf-print') {
          // 桌面：仅打印 #resume-print-area，在对话框中选「另存为 PDF」
          printResumeArea();
          this.$message.info('请在打印对话框中选择「另存为 PDF」', { duration: 3000 });
        } else if (type === 'pdf-paginated') {
          await exportIntelligentPDF('paginated', `${name}-${Date.now()}.pdf`);
          this.$message.success('分页 PDF 导出成功', { duration: 3000 });
        } else if (type === 'pdf-single') {
          await exportIntelligentPDF('single', `${name}-${Date.now()}.pdf`);
          this.$message.success('不分页 PDF 导出成功', { duration: 3000 });
        } else if (type === 'html') {
          await exportHTML(name);
          this.$message.success('HTML 导出成功', { duration: 3000 });
        } else if (type === 'word') {
          await exportWordDoc(name);
          this.$message.success('Word 导出成功', { duration: 3000 });
        }
      } catch (e) {
        console.error(e);
        this.$message.error((e && e.message) || '导出失败，请稍后重试', { duration: 3000 });
      } finally {
        this.isExporting = false;
      }
    },
  },
};
</script>

<style scoped>
.resume-editor-page {
  min-height: calc(100vh - 120px);
  background: linear-gradient(180deg, var(--background-origin, #f3f4f6) 0%, var(--background-color, #e5e7eb) 100%);
  padding: 12px 12px 32px;
  background: var(--background-origin, #f3f4f6);
}

.resume-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--background-origin, #fff);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: var(--box-shadow, 0 1px 3px rgba(0, 0, 0, 0.06));
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color, #111827);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-hint {
  font-size: 12px;
  color: var(--success-color, #059669);
}
.save-hint.muted {
  color: var(--muted-color, #9ca3af);
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.guest-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: var(--background-1, #eff6ff);
  border: 1px solid #bfdbfe;
  color: var(--primary-color, #1e40af);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 13px;
}

.current-resume-tip {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-color, #374151);
}
.current-resume-tip .muted {
  color: var(--muted-color, #9ca3af);
  margin-left: 6px;
}
.my-resumes-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.empty-resumes {
  margin: 16px 0 0;
  color: var(--muted-color, #9ca3af);
  font-size: 13px;
  text-align: center;
}
::v-deep .is-current-resume > td {
  background: var(--background-1, #ecfdf5) !important;
}

.resume-split {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 1024px) {
  .resume-split {
    flex-direction: row;
    align-items: flex-start;
  }
  .resume-editor-pane,
  .resume-preview-pane {
    width: 50%;
  }
}

.resume-editor-pane {
  background: var(--background-color, #fff);
  border-radius: 12px;
  padding: 8px;
  max-height: none;
  overflow: visible;
}

@media (min-width: 1024px) {
  .resume-editor-pane {
    max-height: calc(100vh - 160px);
    overflow-y: auto;
  }
  .resume-preview-pane {
    max-height: calc(100vh - 160px);
    overflow-y: auto;
  }
}

.resume-preview-pane {
  background: var(--background-1, #d1d5db);
  border-radius: 12px;
  padding: 16px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.template-card {
  text-align: left;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 14px;
  background: var(--background-color, #fff);
  cursor: pointer;
  transition: all 0.15s;
}
.template-card:hover:not(.disabled) {
  border-color: var(--primary-color, #3b82f6);
  background: var(--background-1, #eff6ff);
}
.template-card.active {
  border-color: var(--primary-color, #2563eb);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
.template-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.template-card-name {
  font-weight: 700;
  color: var(--text-color, #111827);
  margin-bottom: 4px;
}
.template-card-desc {
  font-size: 12px;
  color: var(--muted-color, #6b7280);
  line-height: 1.4;
}
.vip-badge {
  display: inline-block;
  margin-top: 8px;
  font-size: 10px;
  background: var(--warning-color-light, #ffedd5);
  color: var(--warning-color, #c2410c);
  padding: 2px 8px;
  border-radius: 999px;
}

.download-hint {
  font-size: 13px;
  color: var(--muted-color, #6b7280);
  margin: 0 0 16px;
  text-align: center;
}

.download-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.download-grid:not(.is-mobile) {
  grid-template-columns: 1fr;
}

@media (min-width: 400px) {
  .download-grid:not(.is-mobile) {
    grid-template-columns: 1fr 1fr;
  }
  .download-grid:not(.is-mobile) .download-card.pdf {
    grid-column: 1 / -1;
  }
}

.download-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 12px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  background: var(--background-origin, #fff);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #374151);
  transition: all 0.15s;
}
.download-card i {
  font-size: 28px;
}
.download-card.pdf:hover {
  border-color: var(--danger-color, #f87171);
  background: var(--danger-color-light, #fef2f2);
  color: var(--danger-color, #dc2626);
}
.download-card.html:hover {
  border-color: var(--primary-color, #60a5fa);
  background: var(--background-1, #eff6ff);
  color: var(--primary-color, #2563eb);
}
.download-card.word:hover {
  border-color: var(--success-color, #34d399);
  background: var(--background-1, #ecfdf5);
  color: var(--success-color, #059669);
}

@media print {
  .resume-editor-page {
    background: var(--background-color, #fff) !important;
    padding: 0 !important;
  }
  .resume-split {
    display: block !important;
  }
  .resume-preview-pane {
    width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
    background: var(--background-color, #fff) !important;
    padding: 0 !important;
    border-radius: 0 !important;
  }
}
</style>
