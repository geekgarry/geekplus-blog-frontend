<template>
  <div class="ppt-studio gp-tool-app">
    <!-- 生成来源 -->
    <section class="gp-tool-panel ppt-source">
      <h2 class="gp-tool-panel__title">生成来源</h2>
      <el-radio-group v-model="sourceType" size="small" class="gp-tool-tabs">
        <el-radio-button label="text">手输文稿</el-radio-button>
        <el-radio-button label="file">上传文档</el-radio-button>
        <el-radio-button label="resume">从简历</el-radio-button>
      </el-radio-group>

      <div v-show="sourceType === 'text'" class="ppt-source-body">
        <el-input
          v-model="sourceText"
          type="textarea"
          :rows="5"
          placeholder="粘贴大纲、演讲稿或要点… AI 将整理成幻灯片结构"
        />
      </div>
      <div v-show="sourceType === 'file'" class="ppt-source-body">
        <input ref="fileInput" type="file" class="ppt-hidden" accept=".pdf,.doc,.docx,.txt,.md,image/*" @change="onFile" />
        <el-button size="small" icon="el-icon-upload2" @click="$refs.fileInput && $refs.fileInput.click()">选择文件</el-button>
        <span class="ppt-muted">{{ fileHint || '支持 PDF / Word / 文本 / 图片' }}</span>
      </div>
      <div v-show="sourceType === 'resume'" class="ppt-source-body">
        <p class="ppt-muted" v-if="hasResume">已加载当前简历缓存，可一键生成个人介绍演示。</p>
        <p class="ppt-muted" v-else>未检测到简历数据，请先到「简历生成」编辑并保存本地，或改用手输/上传。</p>
        <el-button size="mini" plain @click="goResume">打开简历工具</el-button>
      </div>

      <div class="ppt-gen-row">
        <el-input v-model="ppt.title" size="small" class="ppt-title-input" placeholder="演示标题" />
        <el-select v-model="themeId" size="small" style="width: 140px">
          <el-option v-for="t in themes" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-input v-model="extraPrompt" size="small" class="ppt-extra" placeholder="风格要求（可选）" />
        <el-button type="primary" size="small" :loading="generating" icon="el-icon-magic-stick" @click="generate">
          AI 生成
        </el-button>
      </div>
    </section>

    <!-- 工具栏：传统 + 非传统 -->
    <section class="gp-tool-toolbar ppt-toolbar">
      <el-button size="mini" icon="el-icon-setting" @click="settingsVisible = true">设置</el-button>
      <el-button size="mini" icon="el-icon-plus" @click="addSlide">加页</el-button>
      <el-button size="mini" :disabled="!slides.length" @click="isEditing = !isEditing">
        {{ isEditing ? '预览' : '编辑' }}
      </el-button>
      <el-button size="mini" :disabled="slides.length < 2" @click="togglePlay">
        {{ playing ? '暂停' : '放映' }}
      </el-button>
      <el-button size="mini" :disabled="!slides.length" icon="el-icon-full-screen" @click="enterFullscreen">全屏</el-button>
      <el-button size="mini" :disabled="!slides.length" @click="duplicateSlide">复制本页</el-button>
      <el-button size="mini" :disabled="!currentSlide" @click="moveSlide(-1)">上移</el-button>
      <el-button size="mini" :disabled="!currentSlide" @click="moveSlide(1)">下移</el-button>
      <span class="gp-tool-toolbar__sep" />
      <el-button size="mini" :disabled="!slides.length" icon="el-icon-download" @click="exportHtml">导出 HTML</el-button>
      <el-button size="mini" :disabled="!slides.length" :loading="exportingPdf" @click="exportPdf">导出 PDF</el-button>
      <el-button size="mini" :disabled="!slides.length" @click="exportMarkdown">导出大纲 MD</el-button>
      <el-button size="mini" type="success" icon="el-icon-folder-checked" @click="saveLocal">保存</el-button>
      <el-button size="mini" plain @click="showOutline = !showOutline">
        {{ showOutline ? '隐藏脑图' : '大纲脑图' }}
      </el-button>
      <el-button size="mini" plain :disabled="!slides.length" @click="toggleLaser">
        {{ laserOn ? '关激光笔' : '激光笔模式' }}
      </el-button>
    </section>

    <div class="ppt-workspace" :class="{ 'has-outline': showOutline }">
      <aside class="ppt-thumbs">
        <button
          v-for="(s, i) in slides"
          :key="s.id"
          type="button"
          class="ppt-thumb"
          :class="{ active: i === currentIndex }"
          @click="selectSlide(i)"
        >
          <span class="ppt-thumb__idx">{{ i + 1 }}</span>
          <span class="ppt-thumb__title">{{ s.title || '无标题' }}</span>
          <i class="el-icon-delete ppt-thumb__del" @click.stop="removeSlide(i)" />
        </button>
        <p v-if="!slides.length" class="ppt-empty">暂无幻灯片</p>
      </aside>

      <div
        ref="presenter"
        class="ppt-stage-wrap"
        :class="{ 'is-pseudo-fs': pseudoFullscreen }"
      >
        <button
          v-if="isPresenting"
          type="button"
          class="ppt-fs-exit"
          title="退出全屏 (Esc)"
          @click="exitFullscreen"
        >
          <i class="el-icon-close" />
        </button>
        <div class="ppt-slide-frame">
        <div
          ref="stage"
          class="ppt-stage"
          :class="[
            'layout-' + (currentSlide && currentSlide.layout),
            'tr-' + animClass,
            { laser: laserOn, 'is-editing': isEditing },
          ]"
          :style="stageStyle"
          @click="onStageClick"
          @mousemove="onLaserMove"
        >
          <div class="ppt-slide-canvas">
          <span v-if="laserOn" class="ppt-laser-dot" :style="laserStyle" />
          <template v-if="currentSlide">
            <template v-if="isEditing">
              <el-input v-model="currentSlide.title" class="ppt-edit-title" placeholder="标题" />
              <el-row :gutter="8" class="ppt-edit-meta">
                <el-col :span="8">
                  <el-select v-model="currentSlide.layout" size="mini" placeholder="布局">
                    <el-option v-for="l in layouts" :key="l.id" :label="l.name" :value="l.id" />
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-select v-model="currentSlide.transition" size="mini" placeholder="动画">
                    <el-option label="跟随全局" value="" />
                    <el-option v-for="t in transitions" :key="t.id" :label="t.name" :value="t.id" />
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-color-picker v-model="currentSlide.accentColor" size="mini" />
                </el-col>
              </el-row>
              <el-input
                v-model="currentSlide.content"
                type="textarea"
                :rows="8"
                class="ppt-edit-body"
                placeholder="正文（换行分条；双栏用 | 分隔左右）"
              />
              <el-input
                v-model="currentSlide.notes"
                type="textarea"
                :rows="2"
                class="ppt-edit-notes"
                placeholder="演讲者备注（放映时不显示）"
              />
            </template>
            <template v-else>
              <div class="ppt-slide-inner" :key="currentIndex + '-' + animTick">
                <p v-if="currentSlide.layout === 'section'" class="ppt-section-label">SECTION</p>
                <h1 class="ppt-slide-title">{{ currentSlide.title }}</h1>
                <blockquote v-if="currentSlide.layout === 'quote'" class="ppt-quote">
                  {{ currentSlide.content }}
                </blockquote>
                <div v-else-if="currentSlide.layout === 'two-column'" class="ppt-two-col">
                  <div><p v-for="(line, li) in leftCol" :key="'L' + li">{{ line }}</p></div>
                  <div><p v-for="(line, li) in rightCol" :key="'R' + li">{{ line }}</p></div>
                </div>
                <div v-else class="ppt-slide-body">
                  <p v-for="(line, li) in contentLines" :key="li">{{ line }}</p>
                </div>
              </div>
            </template>
            <div v-if="settings.showPageNum" class="ppt-page-no">{{ currentIndex + 1 }} / {{ slides.length }}</div>
          </template>
          <div v-else class="ppt-stage-empty">
            <i class="el-icon-picture-outline" />
            <p>选择来源后 AI 生成，或手动加页</p>
          </div>
          </div>
        </div>
        </div>
        <div v-if="currentSlide && currentSlide.notes && !isEditing" class="ppt-notes-bar">
          <strong>备注</strong> {{ currentSlide.notes }}
        </div>
        <div class="ppt-nav" v-if="slides.length && settings.showControls">
          <el-button size="mini" icon="el-icon-arrow-left" :disabled="currentIndex <= 0" @click="prevSlide" />
          <el-button size="mini" icon="el-icon-arrow-right" :disabled="currentIndex >= slides.length - 1" @click="nextSlide" />
        </div>
        <div
          v-if="slides.length && settings.showProgress"
          class="ppt-progress"
          :style="{ '--ppt-progress': progressPercent + '%' }"
        />
      </div>

      <aside v-if="showOutline" class="ppt-outline gp-tool-panel">
        <h3 class="gp-tool-panel__title">大纲脑图</h3>
        <ul>
          <li v-for="(s, i) in slides" :key="'o' + s.id" :class="{ active: i === currentIndex }" @click="selectSlide(i)">
            <strong>{{ i + 1 }}. {{ s.title || '无标题' }}</strong>
            <span>{{ (s.content || '').slice(0, 48) }}</span>
          </li>
        </ul>
      </aside>
    </div>

    <!-- PPT 设置抽屉 -->
    <el-drawer
      title=""
      :visible.sync="settingsVisible"
      direction="rtl"
      size="320px"
      custom-class="gp-settings-drawer"
      append-to-body
    >
      <PptSettingsPanel v-model="settings" @change="onSettingsChange" />
    </el-drawer>
  </div>
</template>

<script>
import { generatePpt } from '@/api/ppt'
import { getResume } from '@/api/resume'
import { getToken } from '@/utils/auth'
import { parseResumeUploadFile } from '@/utils/resumeFileParse'
import { extractAiPayload, parseAiJson } from '@/utils/resumeAiPayload'
import { createResumeId } from '@/components/resume/export/idUtils'
import { RESUME_EDITOR_CACHE_KEY } from '@/components/resume/constants'
import PptSettingsPanel from './PptSettingsPanel.vue'
import {
  buildDeckHtml,
  exportPptPdf,
  downloadTextFile,
  resolveSlideTransition,
  normalizeStoredTransition,
} from './pptExport'
import {
  PPT_LOCAL_KEY,
  PPT_THEMES,
  PPT_TRANSITIONS,
  PPT_LAYOUTS,
  getThemeById,
  loadPptSettings,
  savePptSettings,
  fontStackById,
  deckColorDefaults,
  buildPptGeneratePrompt,
} from './pptThemes'

function emptySlide(partial) {
  return {
    id: createResumeId(),
    title: '',
    content: '',
    notes: '',
    layout: 'bullets',
    transition: '',
    backgroundColor: '',
    textColor: '',
    accentColor: '',
    ...partial,
  }
}

export default {
  name: 'PptStudio',
  components: { PptSettingsPanel },
  data() {
    return {
      sourceType: 'text',
      sourceText: '',
      fileHint: '',
      fileParsed: null,
      resumeData: null,
      extraPrompt: '',
      themeId: 'mist',
      themes: PPT_THEMES,
      transitions: PPT_TRANSITIONS,
      layouts: PPT_LAYOUTS,
      ppt: { title: '未命名演示文稿' },
      slides: [],
      currentIndex: 0,
      isEditing: false,
      playing: false,
      generating: false,
      exportingPdf: false,
      playTimer: null,
      showOutline: false,
      laserOn: false,
      laserPos: { x: 0, y: 0 },
      animTick: 0,
      animClass: 'fade',
      settingsVisible: false,
      settings: loadPptSettings(),
      /** iOS / 部分浏览器无 Fullscreen API 时用 fixed 伪全屏 */
      pseudoFullscreen: false,
    }
  },
  computed: {
    hasResume() {
      return !!(this.resumeData && this.resumeData.basics)
    },
    currentSlide() {
      return this.slides[this.currentIndex] || null
    },
    theme() {
      return getThemeById(this.themeId)
    },
    contentLines() {
      return splitLines(this.currentSlide && this.currentSlide.content)
    },
    leftCol() {
      const parts = String((this.currentSlide && this.currentSlide.content) || '').split('|')
      return splitLines(parts[0] || '')
    },
    rightCol() {
      const parts = String((this.currentSlide && this.currentSlide.content) || '').split('|')
      return splitLines(parts.slice(1).join('|'))
    },
    progressPercent() {
      if (!this.slides.length) return 0
      return Math.round(((this.currentIndex + 1) / this.slides.length) * 100)
    },
    stageStyle() {
      const s = this.currentSlide || {}
      const set = this.settings
      const th = this.theme
      // 全局设置优先于单页色与主题渐变，确保设置抽屉改动立刻反映在舞台
      return {
        background: set.backgroundColor || s.backgroundColor || th.solidBg,
        color: set.fontColor || s.textColor || th.solidText,
        fontFamily: fontStackById(set.fontFamily),
        '--ppt-font-family': fontStackById(set.fontFamily),
        '--ppt-title-color': set.titleColor || s.accentColor || th.solidAccent,
        '--ppt-accent': set.primaryColor || th.solidAccent,
        '--ppt-secondary': set.secondaryColor || th.solidAccent,
      }
    },
    laserStyle() {
      return {
        left: this.laserPos.x + 'px',
        top: this.laserPos.y + 'px',
      }
    },
    /** 原生全屏或伪全屏任一即为放映态 */
    isPresenting() {
      return this.pseudoFullscreen || this.isNativeFullscreen()
    },
  },
  mounted() {
    this._onFsChange = () => {
      if (!this.isNativeFullscreen() && !this.pseudoFullscreen) {
        this.exitPresentation(false)
      }
    }
    document.addEventListener('fullscreenchange', this._onFsChange)
    document.addEventListener('webkitfullscreenchange', this._onFsChange)
  },
  created() {
    this.loadLocal()
    this.loadResumeCache()
  },
  beforeDestroy() {
    this.stopPlay()
    document.removeEventListener('keydown', this.onKey)
    if (this._onFsChange) {
      document.removeEventListener('fullscreenchange', this._onFsChange)
      document.removeEventListener('webkitfullscreenchange', this._onFsChange)
    }
    this.exitPresentation(false)
  },
  methods: {
    goResume() {
      this.$router.push('/tool/resumeGenerator').catch(() => {})
    },
    loadResumeCache() {
      try {
        const raw = localStorage.getItem(RESUME_EDITOR_CACHE_KEY)
        if (raw) {
          const obj = JSON.parse(raw)
          if (obj && obj.resumeData) this.resumeData = obj.resumeData
        }
      } catch (e) {
        /* ignore */
      }
      const uid = this.$store.state.user && this.$store.state.user.userId
      if (getToken() && uid) {
        getResume(uid)
          .then((res) => {
            const row = res && res.data
            if (!row || !row.dataJson) return
            const parsed =
              typeof row.dataJson === 'string' ? JSON.parse(row.dataJson) : row.dataJson
            if (parsed) this.resumeData = parsed
          })
          .catch(() => {})
      }
    },
    async onFile(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.fileHint = '解析中…'
      try {
        this.fileParsed = await parseResumeUploadFile(file)
        this.fileHint = this.fileParsed.extractNote || file.name
      } catch (err) {
        this.fileHint = (err && err.message) || '解析失败'
        this.fileParsed = null
      }
    },
    loadLocal() {
      try {
        const raw = localStorage.getItem(PPT_LOCAL_KEY)
        if (!raw) return
        const obj = JSON.parse(raw)
        this.ppt.title = obj.title || this.ppt.title
        this.themeId = obj.themeId || this.themeId
        this.slides = Array.isArray(obj.slides)
          ? obj.slides.map((s) => ({
              ...s,
              transition: normalizeStoredTransition(s.transition),
            }))
          : []
      } catch (e) {
        /* ignore */
      }
    },
    saveLocal() {
      localStorage.setItem(
        PPT_LOCAL_KEY,
        JSON.stringify({
          title: this.ppt.title,
          themeId: this.themeId,
          slides: this.slides,
          savedAt: Date.now(),
        })
      )
      this.$message.success('已保存到本地')
      this.$emit('saved')
    },
    selectSlide(i) {
      const slide = this.slides[i]
      const tr = resolveSlideTransition(slide, this.settings)
      this.triggerAnim(tr)
      this.currentIndex = i
    },
    triggerAnim(tr) {
      this.animClass = tr || 'fade'
      this.animTick += 1
    },
    prevSlide() {
      if (this.currentIndex <= 0) return
      this.selectSlide(this.currentIndex - 1)
    },
    nextSlide() {
      if (this.currentIndex >= this.slides.length - 1) return
      this.selectSlide(this.currentIndex + 1)
    },
    addSlide() {
      const set = this.settings
      const deck = deckColorDefaults(set)
      this.slides.push(
        emptySlide({
          title: `第 ${this.slides.length + 1} 页`,
          backgroundColor: deck.backgroundColor,
          textColor: deck.textColor,
          accentColor: deck.accentColor,
          transition: '',
        })
      )
      this.currentIndex = this.slides.length - 1
      this.isEditing = true
    },
    removeSlide(i) {
      this.slides.splice(i, 1)
      if (this.currentIndex >= this.slides.length) {
        this.currentIndex = Math.max(0, this.slides.length - 1)
      }
    },
    duplicateSlide() {
      if (!this.currentSlide) return
      const copy = emptySlide({ ...this.currentSlide, id: createResumeId() })
      this.slides.splice(this.currentIndex + 1, 0, copy)
      this.currentIndex += 1
    },
    moveSlide(delta) {
      const i = this.currentIndex
      const j = i + delta
      if (j < 0 || j >= this.slides.length) return
      const tmp = this.slides[i]
      this.$set(this.slides, i, this.slides[j])
      this.$set(this.slides, j, tmp)
      this.currentIndex = j
    },
    togglePlay() {
      if (this.playing) this.stopPlay()
      else this.startPlay()
    },
    startPlay() {
      if (this.slides.length < 2) return
      this.playing = true
      this.isEditing = false
      const sec = Math.max(2, Number(this.settings.autoPlayInterval) || 5)
      this.playTimer = setInterval(() => {
        const next = (this.currentIndex + 1) % this.slides.length
        this.selectSlide(next)
      }, sec * 1000)
    },
    stopPlay() {
      this.playing = false
      if (this.playTimer) {
        clearInterval(this.playTimer)
        this.playTimer = null
      }
    },
    /** 设置变更：写回 data、持久化；与生成区 theme 下拉独立，不互相覆盖 */
    onSettingsChange(next) {
      const prevTransition = this.settings.transition
      this.settings = { ...next }
      savePptSettings(this.settings)
      if (next.transition && next.transition !== prevTransition) {
        this.triggerAnim(next.transition)
      }
      if (this.playing) {
        this.stopPlay()
        this.startPlay()
      }
    },
    enterFullscreen() {
      if (!this.slides.length) return
      const wrap = this.$refs.presenter
      if (!wrap) return
      this.isEditing = false
      document.addEventListener('keydown', this.onKey)
      const req =
        wrap.requestFullscreen ||
        wrap.webkitRequestFullscreen ||
        wrap.msRequestFullscreen ||
        wrap.mozRequestFullScreen
      if (!req) {
        this.enterPseudoFullscreen()
        return
      }
      try {
        const ret = req.call(wrap)
        if (ret && typeof ret.then === 'function') {
          ret.catch(() => this.enterPseudoFullscreen())
        } else {
          // 旧版 Safari 无 Promise：短暂检测是否进入成功
          window.setTimeout(() => {
            if (!this.isNativeFullscreen()) this.enterPseudoFullscreen()
          }, 120)
        }
      } catch (err) {
        this.enterPseudoFullscreen()
      }
    },
    isNativeFullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement
      )
    },
    enterPseudoFullscreen() {
      this.pseudoFullscreen = true
      document.body.style.overflow = 'hidden'
    },
    exitFullscreen() {
      if (this.isNativeFullscreen()) {
        const exit =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.msExitFullscreen ||
          document.mozCancelFullScreen
        if (exit) {
          try {
            exit.call(document)
          } catch (e) {
            /* ignore */
          }
        }
      }
      this.exitPresentation(true)
    },
    /** @param {boolean} removeKeyListener 是否移除键盘导航 */
    exitPresentation(removeKeyListener) {
      this.pseudoFullscreen = false
      document.body.style.overflow = ''
      if (removeKeyListener) {
        document.removeEventListener('keydown', this.onKey)
      }
      this.laserOn = false
    },
    onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.nextSlide()
        e.preventDefault()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.prevSlide()
        e.preventDefault()
      } else if (e.key === 'Escape') {
        if (this.isPresenting) {
          this.exitFullscreen()
          e.preventDefault()
          return
        }
        document.removeEventListener('keydown', this.onKey)
        this.laserOn = false
      }
    },
    onStageClick(e) {
      if (this.isEditing || !this.slides.length || this.laserOn) return
      const rect = e.currentTarget.getBoundingClientRect()
      if (e.clientX - rect.left > rect.width / 2) this.nextSlide()
      else this.prevSlide()
    },
    toggleLaser() {
      this.laserOn = !this.laserOn
      if (this.laserOn) this.isEditing = false
    },
    onLaserMove(e) {
      if (!this.laserOn) return
      const rect = e.currentTarget.getBoundingClientRect()
      this.laserPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    exportMarkdown() {
      const lines = [`# ${this.ppt.title}`, '']
      this.slides.forEach((s, i) => {
        lines.push(`## ${i + 1}. ${s.title || '无标题'}`)
        lines.push(s.content || '')
        if (s.notes) lines.push(`> 备注：${s.notes}`)
        lines.push('')
      })
      downloadTextFile(`${this.ppt.title || 'outline'}.md`, lines.join('\n'), 'text/markdown;charset=utf-8')
    },
    exportHtml() {
      const html = buildDeckHtml(this.ppt.title, this.slides, this.settings, this.theme)
      downloadTextFile(`${this.ppt.title || 'deck'}.html`, html, 'text/html;charset=utf-8')
      this.$message.success('已导出 HTML 放映稿')
    },
    async exportPdf() {
      if (!this.slides.length) return
      this.exportingPdf = true
      const loading = this.$loading({
        lock: true,
        text: '正在生成 PDF…',
        spinner: 'el-icon-loading',
      })
      try {
        await exportPptPdf(
          this.ppt.title,
          this.slides,
          this.settings,
          this.theme,
          (cur, total) => {
            loading.text = `正在生成 PDF… ${cur}/${total}`
          }
        )
        this.$message.success('PDF 已导出')
      } catch (err) {
        this.$message.error((err && err.message) || 'PDF 导出失败')
      } finally {
        loading.close()
        this.exportingPdf = false
      }
    },
    async generate() {
      const set = this.settings
      const payload = {
        sourceType: this.sourceType,
        title: this.ppt.title,
        theme: this.themeId,
        // 合并「风格要求」与设置面板配色，后端写入 AI prompt
        prompt: buildPptGeneratePrompt(this.extraPrompt, set),
      }
      if (this.sourceType === 'text') {
        if (!this.sourceText.trim()) {
          this.$message.warning('请输入文稿内容')
          return
        }
        payload.text = this.sourceText.trim()
      } else if (this.sourceType === 'file') {
        if (!this.fileParsed) {
          this.$message.warning('请先上传并解析文件')
          return
        }
        payload.fileText = this.fileParsed.text || ''
        payload.fileName = this.fileParsed.fileName
        payload.mediaData = this.fileParsed.base64
        payload.mediaMimeType = this.fileParsed.mimeType
      } else if (this.sourceType === 'resume') {
        if (!this.hasResume) {
          this.$message.warning('暂无简历数据')
          return
        }
        payload.resumeData = this.resumeData
      }
      this.generating = true
      this.stopPlay()
      try {
        const res = await generatePpt(payload)
        let data = extractAiPayload(res)
        if (typeof data === 'string') data = parseAiJson(data)
        const slides = normalizeSlides(data, this.theme, set)
        if (!slides.length) {
          this.$message.error('未生成有效幻灯片')
          return
        }
        this.slides = slides
        this.currentIndex = 0
        if (data && data.title) this.ppt.title = data.title
        if (data && data.theme) this.themeId = data.theme
        this.$message.success(`已生成 ${slides.length} 页`)
      } catch (err) {
        this.$message.error((err && err.message) || '生成失败')
      } finally {
        this.generating = false
      }
    },
  },
}

function splitLines(c) {
  return String(c || '')
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

function normalizeSlides(data, theme, settings) {
  const deck = deckColorDefaults(settings)
  const list = (data && data.slides) || []
  return list
    .filter((s) => s && (s.title || s.content))
    .map((s) =>
      emptySlide({
        title: s.title || '',
        content: Array.isArray(s.bullets) ? s.bullets.join('\n') : s.content || '',
        notes: s.notes || '',
        layout: s.layout || 'bullets',
        transition: normalizeStoredTransition(s.transition),
        backgroundColor: s.backgroundColor || deck.backgroundColor || '',
        textColor: s.textColor || deck.textColor || '',
        accentColor: s.accentColor || deck.accentColor || (theme && theme.solidAccent) || '',
      })
    )
}

</script>

<style scoped>
.ppt-studio {
  color: var(--text-color);
}
.ppt-panel {
  background: var(--background-origin);
  border: 1px solid var(--border-color);
  border-radius: var(--gp-surface-radius, 14px);
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: var(--gp-surface-shadow);
}
.ppt-panel__title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--gp-surface-title, var(--theme-color));
}
.ppt-source-tabs {
  margin-bottom: 10px;
}
.ppt-source-body {
  margin-bottom: 10px;
}
.ppt-muted {
  font-size: 12px;
  color: var(--muted-1-color, var(--greyFont));
  margin: 6px 0;
}
.ppt-hidden {
  display: none;
}
.ppt-gen-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.ppt-title-input {
  width: min(220px, 100%);
}
.ppt-extra {
  flex: 1;
  min-width: 140px;
}
.ppt-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: var(--background-2);
  border: 1px solid var(--border-color);
  border-radius: var(--gp-surface-radius, 10px);
}
.ppt-toolbar__sep {
  width: 1px;
  height: 18px;
  background: var(--border-color-2);
  margin: 0 4px;
}
.ppt-workspace {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  min-height: 440px;
}
.ppt-workspace.has-outline {
  grid-template-columns: 180px 1fr 200px;
}
@media (max-width: 960px) {
  .ppt-workspace,
  .ppt-workspace.has-outline {
    grid-template-columns: 1fr;
  }
}
.ppt-thumbs,
.ppt-outline {
  background: var(--background-origin);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  max-height: 560px;
  overflow: auto;
}
.ppt-outline h3 {
  margin: 4px 8px 10px;
  font-size: 13px;
  color: var(--theme-color);
}
.ppt-outline ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ppt-outline li {
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 4px;
}
.ppt-outline li.active,
.ppt-outline li:hover {
  background: var(--theme-color-muted);
  border-color: var(--border-color-2);
}
.ppt-outline strong {
  display: block;
  font-size: 12px;
  color: var(--text-color-2);
}
.ppt-outline span {
  font-size: 11px;
  color: var(--muted-1-color);
}
.ppt-thumb {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  background: var(--background-2);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  text-align: left;
  color: var(--text-color);
}
.ppt-thumb.active {
  border-color: var(--theme-color);
  background: var(--theme-color-muted);
}
.ppt-thumb__idx {
  font-size: 11px;
  color: var(--muted-1-color);
}
.ppt-thumb__title {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ppt-thumb__del {
  color: var(--red);
  opacity: 0.75;
}
.ppt-empty {
  text-align: center;
  color: var(--muted-1-color);
  font-size: 12px;
  padding: 16px 0;
}
.ppt-stage-wrap {
  min-width: 0;
  position: relative;
}
/* 16:9 幻灯片外框：固定比例，不随正文撑高 */
.ppt-slide-frame {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  background: #141414;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--gp-surface-shadow-hover);
  border: 1px solid var(--border-color-2);
}
.ppt-stage {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  border: none;
  border-radius: 0;
  box-shadow: none;
  font-family: var(--ppt-font-family, inherit);
}
.ppt-stage.is-editing {
  overflow: auto;
}
.ppt-slide-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 8% 7% 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: inherit;
}
.ppt-slide-inner {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: inherit;
}
.ppt-slide-title,
.ppt-slide-body,
.ppt-slide-body p,
.ppt-two-col,
.ppt-two-col p,
.ppt-quote {
  font-family: inherit;
}
/* 伪全屏：iOS Safari 等不支持元素 requestFullscreen 时的回退 */
.ppt-stage-wrap.is-pseudo-fs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10050;
  background: #0d0d0d;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.ppt-stage-wrap.is-pseudo-fs .ppt-notes-bar {
  display: none;
}
.ppt-stage-wrap.is-pseudo-fs .ppt-slide-frame {
  flex: 1;
  width: min(100%, calc((100vh - 80px) * 16 / 9));
  max-width: 100%;
  max-height: calc(100vh - 80px);
  margin: 0 auto;
  aspect-ratio: 16 / 9;
}
.ppt-stage-wrap.is-pseudo-fs .ppt-stage {
  height: 100%;
}
.ppt-stage-wrap.is-pseudo-fs .ppt-nav {
  flex-shrink: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.35);
}
.ppt-stage-wrap.is-pseudo-fs .ppt-progress {
  flex-shrink: 0;
  margin: 0;
}
/* 原生 Fullscreen API：舞台区铺满视口 */
.ppt-stage-wrap:fullscreen,
.ppt-stage-wrap:-webkit-full-screen {
  width: 100%;
  height: 100%;
  background: #0d0d0d;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.ppt-stage-wrap:fullscreen .ppt-notes-bar,
.ppt-stage-wrap:-webkit-full-screen .ppt-notes-bar {
  display: none;
}
.ppt-stage-wrap:fullscreen .ppt-slide-frame,
.ppt-stage-wrap:-webkit-full-screen .ppt-slide-frame {
  flex: 1;
  width: min(100%, calc((100vh - 80px) * 16 / 9));
  max-width: 100%;
  max-height: calc(100vh - 80px);
  margin: 0 auto;
  aspect-ratio: 16 / 9;
}
.ppt-stage-wrap:fullscreen .ppt-stage,
.ppt-stage-wrap:-webkit-full-screen .ppt-stage {
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
}
.ppt-stage-wrap:fullscreen .ppt-nav,
.ppt-stage-wrap:-webkit-full-screen .ppt-nav {
  flex-shrink: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.35);
}
.ppt-stage-wrap:fullscreen .ppt-progress,
.ppt-stage-wrap:-webkit-full-screen .ppt-progress {
  flex-shrink: 0;
  margin: 0;
}
.ppt-fs-exit {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  opacity: 0.85;
}
.ppt-fs-exit:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.65);
}
.ppt-stage.laser {
  cursor: none;
}
.ppt-laser-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 50%;
  background: var(--red);
  box-shadow: 0 0 12px var(--lightRed);
  pointer-events: none;
  z-index: 5;
}
.ppt-slide-title {
  margin: 0 0 18px;
  font-size: clamp(22px, 3.2vw, 38px);
  font-weight: 800;
  line-height: 1.25;
  color: var(--ppt-title-color);
}
.ppt-section-label {
  letter-spacing: 0.2em;
  font-size: 12px;
  color: var(--ppt-secondary, inherit);
  opacity: 0.85;
  margin: 0 0 8px;
}
.ppt-slide-body p,
.ppt-two-col p {
  margin: 0 0 10px;
  font-size: clamp(14px, 1.8vw, 18px);
  line-height: 1.55;
}
.ppt-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.ppt-quote {
  margin: 0;
  font-size: clamp(18px, 2.4vw, 26px);
  line-height: 1.5;
  border-left: 4px solid var(--ppt-accent, var(--theme-color-soft));
  padding-left: 16px;
  opacity: 0.95;
}
.ppt-page-no {
  position: absolute;
  right: 16px;
  bottom: 12px;
  font-size: 12px;
  opacity: 0.55;
}
.ppt-progress {
  margin-top: 8px;
  height: 3px;
  border-radius: 999px;
  background: var(--border-color-2);
  overflow: hidden;
}
.ppt-progress::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--ppt-progress, 0%);
  background: var(--ppt-accent, var(--theme-color));
  transition: width 0.25s ease;
}
.ppt-stage-empty {
  text-align: center;
  opacity: 0.65;
  padding: 80px 16px;
  color: inherit;
}
.ppt-notes-bar {
  margin-top: 8px;
  padding: 8px 12px;
  font-size: 12px;
  background: var(--commentContent);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--articleGreyFontColor);
}
.ppt-nav {
  margin-top: 8px;
  text-align: center;
}
.ppt-edit-title /deep/ .el-input__inner {
  background: var(--miniWhiteMask);
  border: 1px solid var(--border-color-2);
  color: inherit;
  font-family: inherit;
  font-size: 22px;
  font-weight: 700;
  height: 44px;
}
.ppt-edit-body /deep/ .el-textarea__inner,
.ppt-edit-notes /deep/ .el-textarea__inner {
  background: var(--miniWhiteMask);
  border: 1px solid var(--border-color-2);
  color: inherit;
  font-family: inherit;
}
.ppt-edit-meta {
  margin-bottom: 8px;
}
/* 切页动画 */
.tr-fade .ppt-slide-inner {
  animation: ppt-fade 0.4s ease;
}
.tr-slide .ppt-slide-inner {
  animation: ppt-slide 0.4s ease;
}
.tr-zoom .ppt-slide-inner {
  animation: ppt-zoom 0.4s ease;
}
.tr-none .ppt-slide-inner {
  animation: none;
}
.tr-flip .ppt-slide-inner {
  animation: ppt-flip 0.45s ease;
}
@keyframes ppt-flip {
  from { opacity: 0; transform: rotateY(-12deg); }
  to { opacity: 1; transform: rotateY(0); }
}
@keyframes ppt-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ppt-slide {
  from { opacity: 0; transform: translateX(28px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes ppt-zoom {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>
