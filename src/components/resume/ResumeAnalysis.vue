<template>
  <div class="resume-analysis gp-tool-app">
    <div class="ra-grid">
      <section class="ra-card gp-tool-panel">
        <h2 class="ra-title gp-tool-panel__title"><i class="el-icon-briefcase"></i> 岗位 / 行业分析</h2>
        <p class="ra-desc">粘贴 JD，或结合当前简历做匹配与优化建议。</p>

        <label class="ra-label">岗位描述 / 行业动态</label>
        <el-input
          v-model="jobText"
          type="textarea"
          :rows="6"
          placeholder="粘贴招聘 JD，或输入想了解的行业/岗位…"
        />

        <div class="ra-file-row">
          <input
            ref="jdFile"
            type="file"
            class="hidden-input"
            accept="image/*,application/pdf,.pdf"
            @change="onJdFile"
          />
          <el-button size="small" icon="el-icon-upload2" @click="$refs.jdFile && $refs.jdFile.click()">
            上传 JD 截图/PDF
          </el-button>
          <span class="ra-file-name">{{ jdFileName || '未选择文件' }}</span>
          <el-button v-if="jdFileName" type="text" @click="clearJdFile">清除</el-button>
        </div>

        <div class="ra-actions">
          <el-button type="primary" :loading="loadingType === 'job'" @click="runAnalyze('job')">
            仅分析岗位/行业
          </el-button>
          <el-button type="warning" :loading="loadingType === 'match'" @click="runAnalyze('match')">
            简历综合匹配
          </el-button>
          <el-button type="success" :loading="loadingType === 'generate'" @click="runOptimizeResume">
            AI 按岗位优化简历
          </el-button>
        </div>
      </section>

      <section class="ra-card ra-result gp-tool-panel">
        <h2 class="ra-title gp-tool-panel__title"><i class="el-icon-document"></i> 分析结果</h2>
        <div v-if="!analysisHtml && !loadingType" class="ra-empty">填写 JD 后点击上方按钮开始分析</div>
        <div v-else-if="loadingType" class="ra-empty">AI 分析中，请稍候…</div>
        <div v-else class="ra-markdown" v-html="analysisHtml" />
      </section>
    </div>
  </div>
</template>

<script>
import { analyzeResumeAI } from '@/api/resume'
import { fileToBase64 } from '@/utils/gputil'
import { isEmptyResumePayload } from '@/utils/resumeFileParse'
import { extractAiPayload, parseAiJson, mergeResumeData } from '@/utils/resumeAiPayload'
import { RESUME_ANALYSIS_SESSION_KEY } from './constants'

const marked = require('marked')

export default {
  name: 'ResumeAnalysis',
  props: {
    resumeData: { type: Object, default: null },
  },
  data() {
    return {
      jobText: '',
      jdFileName: '',
      jdFileData: '',
      jdMimeType: '',
      analysisResult: '',
      loadingType: null,
    }
  },
  computed: {
    analysisHtml() {
      if (!this.analysisResult) return ''
      // 【关键项】高亮，方便扫 JD 要求
      const raw = String(this.analysisResult).replace(
        /【([^】]+)】/g,
        '<mark class="ra-mark">$1</mark>'
      )
      try {
        return marked.parse(raw)
      } catch (e) {
        return raw.replace(/\n/g, '<br/>')
      }
    },
  },
  created() {
    try {
      const cached = sessionStorage.getItem(RESUME_ANALYSIS_SESSION_KEY)
      if (cached) {
        const obj = JSON.parse(cached)
        this.jobText = obj.jobText || ''
        this.analysisResult = obj.analysisResult || ''
      }
    } catch (e) {
      /* ignore */
    }
  },
  methods: {
    async onJdFile(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.jdFileName = file.name
      this.jdMimeType = file.type || 'application/octet-stream'
      this.jdFileData = await fileToBase64(file)
    },
    clearJdFile() {
      this.jdFileName = ''
      this.jdFileData = ''
      this.jdMimeType = ''
      if (this.$refs.jdFile) this.$refs.jdFile.value = ''
    },
    persist() {
      sessionStorage.setItem(
        RESUME_ANALYSIS_SESSION_KEY,
        JSON.stringify({ jobText: this.jobText, analysisResult: this.analysisResult })
      )
    },
    async runAnalyze(type) {
      if (!this.jobText.trim() && !this.jdFileData) {
        this.$message.warning('请填写岗位描述或上传 JD 文件')
        return
      }
      if (type === 'match' && !this.resumeData) {
        this.$message.warning('暂无简历数据，请先在「编辑简历」中填写')
        return
      }
      this.loadingType = type
      this.analysisResult = ''
      try {
        const res = await analyzeResumeAI({
          type,
          text: this.jobText,
          fileData: this.jdFileData,
          mimeType: this.jdMimeType,
          resumeData: type === 'match' ? this.resumeData : undefined,
        })
        const payload = extractAiPayload(res)
        const text =
          (payload && typeof payload === 'object' && (payload.result || payload)) ||
          payload ||
          ''
        this.analysisResult =
          typeof text === 'string' ? text : JSON.stringify(text)
        this.persist()
      } catch (err) {
        this.$message.error((err && err.message) || '分析失败')
      } finally {
        this.loadingType = null
      }
    },
    async runOptimizeResume() {
      if (!this.jobText.trim() && !this.jdFileData) {
        this.$message.warning('请填写目标岗位描述以便优化简历')
        return
      }
      if (!this.resumeData) {
        this.$message.warning('暂无简历数据')
        return
      }
      this.loadingType = 'generate'
      try {
        const res = await analyzeResumeAI({
          type: 'generate',
          text: this.jobText,
          fileData: this.jdFileData,
          mimeType: this.jdMimeType,
          resumeData: this.resumeData,
        })
        let payload = extractAiPayload(res)
        if (payload && typeof payload === 'object' && payload.result) {
          payload = payload.result
        }
        if (typeof payload === 'string') {
          payload = parseAiJson(payload)
        }
        if (!payload || isEmptyResumePayload(payload)) {
          this.$message.error('优化结果无效，请稍后重试')
          return
        }
        this.$emit('apply-resume', mergeResumeData(this.resumeData, payload))
        this.$message.success('已生成优化后的简历，可在「编辑简历」中查看')
      } catch (err) {
        this.$message.error((err && err.message) || '优化失败')
      } finally {
        this.loadingType = null
      }
    },
  },
}
</script>

<style scoped>
.resume-analysis {
  padding: 4px 0 16px;
}
.ra-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) {
  .ra-grid {
    grid-template-columns: 1fr;
  }
}
.ra-card {
  background: var(--background-origin, #fff);
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: var(--gp-surface-radius, 12px);
  padding: 16px 18px;
  box-shadow: var(--gp-surface-shadow);
}
.ra-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  color: var(--gp-surface-title, var(--theme-color));
}
.ra-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--muted-1-color, #909399);
}
.ra-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-color, #606266);
}
.ra-file-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}
.ra-file-name {
  font-size: 12px;
  color: var(--muted-1-color, #909399);
}
.hidden-input {
  display: none;
}
.ra-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.ra-empty {
  color: var(--muted-1-color, #c0c4cc);
  font-size: 14px;
  padding: 24px 8px;
  text-align: center;
}
.ra-markdown {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-color-2, #303133);
  max-height: 70vh;
  overflow: auto;
}
.ra-markdown /deep/ .ra-mark,
.ra-markdown /deep/ mark.ra-mark {
  background: var(--lightYellow, #fff3bf);
  color: var(--orangeRed, #b45309);
  padding: 0 2px;
  border-radius: 2px;
}
</style>
