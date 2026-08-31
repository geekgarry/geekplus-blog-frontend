<template>
  <!--
    代码演练场：类型下拉；桌面 Ace / 移动端 textarea；
    编辑区与预览区绝对铺满；预览用 srcdoc + key 强制刷新（移动端 Blob 常空白）。
  -->
  <div class="gp-code-playground" :class="{ 'is-compact': compact, 'is-mobile': isMobile }">
    <div class="gp-cp-toolbar">
      <div class="gp-cp-toolbar__left">
        <span class="gp-cp-label">类型</span>
        <el-select
          v-model="mode"
          size="small"
          class="gp-cp-mode-select"
          placeholder="选择类型"
          @change="onModeChange"
        >
          <el-option-group
            v-for="group in modeGroups"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="opt in group.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-option-group>
        </el-select>
        <el-checkbox v-model="autoRun" size="small">自动运行</el-checkbox>
      </div>
      <div class="gp-cp-toolbar__right">
        <el-button size="small" icon="el-icon-refresh-left" @click="resetCode">重置</el-button>
        <el-button type="primary" size="small" icon="el-icon-video-play" @click="runPreview">运行</el-button>
      </div>
    </div>

    <div class="gp-cp-panes">
      <section class="gp-cp-pane gp-cp-pane--editor">
        <header class="gp-cp-pane__head">
          <span>编辑器{{ isMobile ? '（移动端）' : '' }}</span>
        </header>
        <div ref="editorBody" class="gp-cp-pane__body">
          <textarea
            v-if="isMobile"
            v-model="code"
            class="gp-cp-fill gp-cp-textarea"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            @input="onCodeChange(code)"
          />
          <!-- Ace 使用像素高度，避免 absolute+100% 导致半像素行高、光标错位 -->
          <ace-editor
            v-else
            ref="editor"
            class="gp-cp-ace-host"
            v-model="code"
            :lang="aceLang"
            :height="acePixelHeight"
            :min-height="200"
            :font-size="14"
            @change="onCodeChange"
          />
        </div>
      </section>

      <section class="gp-cp-pane gp-cp-pane--preview">
        <header class="gp-cp-pane__head">
          <span>预览</span>
          <span v-if="runError" class="gp-cp-error">{{ runError }}</span>
        </header>
        <div class="gp-cp-pane__body">
          <!--
            allow-same-origin：移动端 srcdoc/脚本可执行；演练场本就是跑用户代码。
            :key 变化强制重建 iframe，避免旧文档残留。
          -->
          <iframe
            v-if="frameReady"
            :key="frameKey"
            ref="frame"
            class="gp-cp-fill gp-cp-frame"
            title="code-playground-preview"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            :srcdoc="previewHtml"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import AceEditor from '@/components/AceEditor'
import { MODE_OPTIONS, TEMPLATES } from './templates'
import { buildPreviewDocument } from './buildPreview'

const AUTO_RUN_MS = 700
const MOBILE_MQ = '(max-width: 899px), (pointer: coarse)'

export default {
  name: 'CodePlayground',
  components: { AceEditor },
  props: {
    defaultMode: { type: String, default: 'html' },
    value: { type: String, default: '' },
    compact: { type: Boolean, default: false },
  },
  data () {
    const mode = MODE_OPTIONS.some((m) => m.value === this.defaultMode)
      ? this.defaultMode
      : 'html'
    return {
      mode,
      modeOptions: MODE_OPTIONS,
      code: this.value || TEMPLATES[mode] || '',
      autoRun: true,
      runError: '',
      isMobile: false,
      previewHtml: '',
      frameKey: 0,
      frameReady: true,
      /** Ace 像素高度（由容器实测，避免 100%/absolute 光标错位） */
      acePixelHeight: 360,
      _timer: null,
      _mq: null,
    }
  },
  computed: {
    aceLang () {
      const hit = MODE_OPTIONS.find((m) => m.value === this.mode)
      return (hit && hit.aceLang) || 'html'
    },
    modeGroups () {
      const map = {}
      MODE_OPTIONS.forEach((opt) => {
        const g = opt.group || '其它'
        if (!map[g]) map[g] = []
        map[g].push(opt)
      })
      return Object.keys(map).map((label) => ({ label, options: map[label] }))
    },
  },
  watch: {
    value (val) {
      if (typeof val === 'string' && val !== this.code) this.code = val
    },
  },
  mounted () {
    this.bindMobileMq()
    this.runPreview()
    this.$nextTick(() => {
      this.updateAceHeight()
      this.resizeEditor()
    })
    window.addEventListener('resize', this.onWinResize)
  },
  // 父页 keep-alive 再激活时 Ace/iframe 需重新量高，否则布局/光标易异常
  activated () {
    this.$nextTick(() => {
      this.updateAceHeight()
      this.resizeEditor()
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onWinResize)
    if (this._timer) clearTimeout(this._timer)
    if (this._mq) {
      if (this._mq.removeEventListener) this._mq.removeEventListener('change', this.syncMobile)
      else if (this._mq.removeListener) this._mq.removeListener(this.syncMobile)
    }
  },
  methods: {
    bindMobileMq () {
      if (typeof window === 'undefined' || !window.matchMedia) {
        this.isMobile = true
        return
      }
      this._mq = window.matchMedia(MOBILE_MQ)
      this.syncMobile()
      if (this._mq.addEventListener) this._mq.addEventListener('change', this.syncMobile)
      else if (this._mq.addListener) this._mq.addListener(this.syncMobile)
    },
    syncMobile () {
      this.isMobile = !!(this._mq && this._mq.matches)
      this.$nextTick(() => {
        this.updateAceHeight()
        this.resizeEditor()
      })
    },
    onWinResize () {
      this.updateAceHeight()
      this.resizeEditor()
    },
    /** 按编辑区容器实测高度喂给 Ace（整数 px） */
    updateAceHeight () {
      const el = this.$refs.editorBody
      if (!el || !el.clientHeight) return
      const h = Math.max(200, Math.round(el.clientHeight))
      if (h !== this.acePixelHeight) this.acePixelHeight = h
    },
    onModeChange () {
      this.code = TEMPLATES[this.mode] || ''
      this.$emit('mode-change', this.mode)
      this.runPreview()
      this.$nextTick(() => this.updateAceHeight())
    },
    onCodeChange (val) {
      this.$emit('input', val)
      this.$emit('change', val)
      if (!this.autoRun) return
      if (this._timer) clearTimeout(this._timer)
      this._timer = setTimeout(() => this.runPreview(), AUTO_RUN_MS)
    },
    resetCode () {
      this.code = TEMPLATES[this.mode] || ''
      this.runPreview()
    },
    /** srcdoc + 递增 key：移动端可靠刷新预览 */
    runPreview () {
      this.runError = ''
      let html = ''
      try {
        html = buildPreviewDocument(this.mode, this.code)
      } catch (e) {
        this.runError = (e && e.message) || String(e)
        html = `<!DOCTYPE html><pre style="color:#b91c1c;padding:16px;font-family:monospace">${this.runError}</pre>`
      }
      this.frameReady = false
      this.previewHtml = html
      this.frameKey += 1
      this.$nextTick(() => {
        this.frameReady = true
        this.updateAceHeight()
        this.resizeEditor()
      })
      this.$emit('run', { mode: this.mode, code: this.code })
    },
    resizeEditor () {
      const ed = this.$refs.editor
      if (ed && typeof ed.resizeEditor === 'function') ed.resizeEditor()
      if (ed && typeof ed.syncEditorMetrics === 'function') ed.syncEditorMetrics()
    },
  },
}
</script>

<style scoped>
.gp-code-playground {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: calc(100vh - 160px);
  max-width: 100%;
}

.gp-code-playground.is-compact {
  min-height: 480px;
}

.gp-code-playground.is-mobile {
  min-height: auto;
}

.gp-cp-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.gp-cp-toolbar__left,
.gp-cp-toolbar__right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.gp-cp-label {
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.gp-cp-mode-select {
  width: 160px;
}

.gp-cp-panes {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

@media (min-width: 900px) {
  .gp-cp-panes {
    flex-direction: row;
  }
  .gp-cp-pane {
    width: 50%;
  }
}

.gp-cp-pane {
  display: flex;
  flex-direction: column;
  min-height: 220px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.gp-cp-pane__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

/* 固定高度容器 + 绝对铺满子元素（解决移动端 textarea height:100% 失效） */
.gp-cp-pane__body {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  height: clamp(240px, 42vh, 640px);
  min-height: 240px;
  overflow: hidden;
}

.gp-code-playground.is-mobile .gp-cp-pane__body {
  height: 42vh;
  min-height: 260px;
}

.gp-cp-fill {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  max-width: none;
  box-sizing: border-box;
}

/* Ace 不用 absolute 铺满；高度由 :height 像素传入，宿主勿再 height:100% 叠一层 */
.gp-cp-ace-host {
  display: block;
  width: 100%;
}

.gp-cp-textarea {
  margin: 0;
  padding: 10px 12px;
  border: 0;
  resize: none;
  outline: none;
  display: block;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0;
  word-spacing: normal;
  font-variant-ligatures: none;
  color: #303133;
  background: #fff;
  -webkit-overflow-scrolling: touch;
  tab-size: 2;
}

.gp-cp-frame {
  border: 0;
  background: #fff;
  display: block;
}

.gp-cp-error {
  color: #f56c6c;
  font-weight: 400;
  font-size: 12px;
}
</style>
