<template>
  <div class="gp-ace-editor" :style="wrapStyle">
    <editor
      v-if="ready"
      ref="ace"
      v-model="content"
      :lang="aceLang"
      theme="chrome"
      :options="mergedOptions"
      :width="width"
      :height="editorHeight"
      :readonly="disabled"
      @init="onEditorInit"
    />
  </div>
</template>

<script>
/**
 * Ace（brace）封装。
 * 光标错位常见原因：
 * 1) 全局 `* { font-family }` 覆盖 Ace token span（比例字体 vs 等宽度量 → 光标偏右）
 * 2) CSS line-height / 半像素行高（纵向偏移）
 * 字体必须用 !important 打到 .ace_editor *；容器尽量传像素高度。
 */
import Editor from 'vue2-ace-editor'

// 等宽栈；须与下方 CSS「.ace_editor *」一致，否则全局 *{font-family} 会让光标横向漂移
const ACE_FONT_FAMILY = "Menlo, Monaco, Consolas, 'Courier New', monospace"

const LANG_ALIAS = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  vue: 'html',
  htm: 'html',
  html: 'html',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  less: 'less',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
  sql: 'sql',
  java: 'java',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'sh',
  bash: 'sh',
  properties: 'properties',
  ini: 'properties',
  txt: 'text',
  log: 'text',
  csv: 'text',
  text: 'text',
  javascript: 'javascript',
  typescript: 'typescript',
}

export function resolveAceLang (nameOrExt) {
  if (!nameOrExt) return 'text'
  const raw = String(nameOrExt).toLowerCase().trim()
  const ext = raw.includes('.') ? raw.split('.').pop() : raw
  return LANG_ALIAS[ext] || LANG_ALIAS[raw] || 'text'
}

function preloadAceAssets (lang) {
  require('brace/ext/language_tools')
  require('brace/theme/chrome')
  switch (lang) {
    case 'javascript':
      require('brace/mode/javascript')
      break
    case 'typescript':
      require('brace/mode/typescript')
      break
    case 'json':
      require('brace/mode/json')
      break
    case 'sql':
      require('brace/mode/sql')
      break
    case 'markdown':
      require('brace/mode/markdown')
      break
    case 'css':
      require('brace/mode/css')
      break
    case 'less':
      require('brace/mode/less')
      break
    case 'scss':
      require('brace/mode/scss')
      break
    case 'xml':
      require('brace/mode/xml')
      break
    case 'java':
      require('brace/mode/java')
      break
    case 'yaml':
      require('brace/mode/yaml')
      break
    case 'sh':
      require('brace/mode/sh')
      break
    case 'properties':
      require('brace/mode/properties')
      break
    case 'text':
      require('brace/mode/text')
      break
    case 'html':
    default:
      require('brace/mode/html')
  }
}

export default {
  name: 'AceEditor',
  components: { Editor },
  props: {
    value: { type: String, default: '' },
    lang: { type: String, default: 'text' },
    /** 优先传数字像素，如 420；避免 '100%' 在复杂布局下度量错误 */
    height: { type: [Number, String], default: 360 },
    minHeight: { type: [Number, String], default: 240 },
    width: { type: String, default: '100%' },
    disabled: { type: Boolean, default: false },
    /** 建议偶数 px，降低半像素行高概率 */
    fontSize: { type: Number, default: 14 },
    tabSize: { type: Number, default: 2 },
    showPrintMargin: { type: Boolean, default: false },
    options: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      content: this.value || '',
      ready: false,
      aceLang: 'text',
      _ro: null,
    }
  },
  computed: {
    /** vue2-ace-editor 要带 px 的字符串或数字 */
    editorHeight () {
      const h = this.height
      if (typeof h === 'number' && Number.isFinite(h)) return Math.max(120, Math.round(h))
      if (typeof h === 'string' && /^\d+(\.\d+)?px$/.test(h.trim())) {
        return Math.round(parseFloat(h))
      }
      if (typeof h === 'string' && /^\d+$/.test(h.trim())) {
        return Math.round(Number(h))
      }
      // 百分比等：仍原样交给组件，但会尽量在 resize 时校正
      return h
    },
    wrapStyle () {
      const min = this.minHeight
      const minH = typeof min === 'number' ? `${min}px` : min
      const style = { minHeight: minH }
      if (typeof this.editorHeight === 'number') {
        style.height = `${this.editorHeight}px`
      } else if (this.editorHeight === '100%') {
        style.height = '100%'
      }
      return style
    },
    mergedOptions () {
      const size = Math.round(Number(this.fontSize) || 14)
      return {
        enableBasicAutocompletion: !this.disabled,
        enableSnippets: !this.disabled,
        enableLiveAutocompletion: !this.disabled,
        tabSize: this.tabSize,
        fontSize: size,
        fontFamily: ACE_FONT_FAMILY,
        showPrintMargin: this.showPrintMargin,
        wrap: false,
        useWorker: false,
        fixedWidthGutter: true,
        scrollPastEnd: 0,
        ...this.options,
      }
    },
  },
  watch: {
    value (val) {
      if (val !== this.content) this.content = val || ''
    },
    content (val) {
      this.$emit('input', val)
      this.$emit('change', val)
    },
    lang () {
      this.mountEditor()
    },
    disabled (val) {
      this.applyReadonly(val)
    },
    fontSize () {
      this.syncEditorMetrics()
    },
    height () {
      this.$nextTick(() => this.syncEditorMetrics())
    },
  },
  created () {
    this.mountEditor()
  },
  mounted () {
    this.bindResizeObserver()
  },
  beforeDestroy () {
    if (this._ro) {
      try { this._ro.disconnect() } catch (e) { /* ignore */ }
      this._ro = null
    }
    const editor = (this.$refs.ace && this.$refs.ace.editor) || this._editor
    if (editor && editor.renderer && this._onCharSize) {
      try { editor.renderer.off('changeCharacterSize', this._onCharSize) } catch (e) { /* ignore */ }
      this._onCharSize = null
    }
  },
  methods: {
    mountEditor () {
      this.ready = false
      const mode = resolveAceLang(this.lang)
      preloadAceAssets(mode)
      this.aceLang = mode
      this.$nextTick(() => {
        this.ready = true
        this.$nextTick(() => {
          this.bindResizeObserver()
          this.syncEditorMetrics()
        })
      })
    },
    bindResizeObserver () {
      if (typeof ResizeObserver === 'undefined') return
      if (this._ro) {
        try { this._ro.disconnect() } catch (e) { /* ignore */ }
      }
      const el = this.$el
      if (!el) return
      this._ro = new ResizeObserver(() => {
        this.syncEditorMetrics()
      })
      this._ro.observe(el)
    },
    onEditorInit (editor) {
      this._editor = editor
      this.applyReadonly(this.disabled)
      editor.renderer.setScrollMargin(0, 0, 0, 0)
      editor.renderer.setPadding(0)
      if (this.content) {
        editor.setValue(this.content, -1)
      }
      editor.clearSelection()
      // Ace 每 500ms 轮询字号；轮询后可能再次变成半像素行高，需再收一次
      if (!this._onCharSize) {
        this._onCharSize = () => this.forceIntegerLineHeight(editor.renderer)
        editor.renderer.on('changeCharacterSize', this._onCharSize)
      }
      this.$nextTick(() => this.syncEditorMetrics())
      // 字体异步就绪后再度量一次（避免首屏半像素行高）
      setTimeout(() => this.syncEditorMetrics(), 50)
      setTimeout(() => this.syncEditorMetrics(), 200)
    },
    /**
     * 重新度量字符宽高，并把行高 / scroll 收成整数，消除光标偏移。
     * Ace 用 getBoundingClientRect 量字高，Retina/浏览器缩放时常得到 17.5 等半像素，
     * 进而出现 ace_content { margin-top: -4.5px }，光标与文字错位。
     */
    syncEditorMetrics () {
      const editor = (this.$refs.ace && this.$refs.ace.editor) || this._editor
      if (!editor || !editor.renderer) return
      const size = Math.round(Number(this.fontSize) || 14)
      try {
        editor.setOption('fontFamily', ACE_FONT_FAMILY)
        editor.setFontSize(size)
        const r = editor.renderer
        this.patchFontMetricsRound(r)
        if (typeof r.updateFontSize === 'function') r.updateFontSize()
        if (typeof r.updateCharacterSize === 'function') r.updateCharacterSize()
        this.forceIntegerLineHeight(r)
        // 半像素 scroll → ace_content 负 margin 带 .5
        const top = r.getScrollTop()
        if (typeof top === 'number' && top % 1 !== 0) {
          r.scrollToY(Math.round(top))
        }
        const left = r.getScrollLeft && r.getScrollLeft()
        if (typeof left === 'number' && left % 1 !== 0 && r.scrollToX) {
          r.scrollToX(Math.round(left))
        }
        editor.resize(true)
        if (typeof r.$computeLayerConfig === 'function') {
          r.$computeLayerConfig()
        }
      } catch (e) {
        try { editor.resize(true) } catch (e2) { /* ignore */ }
      }
    },
    /**
     * 劫持 $measureSizes：量到的字高直接 round，从源头杜绝半像素行高。
     * 只包装一次，避免与 Ace 500ms 轮询互相覆盖。
     */
    patchFontMetricsRound (r) {
      const fm = (r && r.$fontMetrics) ||
        (r && r.$textLayer && r.$textLayer.$fontMetrics)
      if (!fm || typeof fm.$measureSizes !== 'function' || fm._gpRoundPatched) return
      fm._gpRoundPatched = true
      const orig = fm.$measureSizes.bind(fm)
      fm.$measureSizes = function () {
        const measured = orig()
        if (!measured) return measured
        if (typeof measured.height === 'number' && measured.height > 0) {
          measured.height = Math.round(measured.height) || Math.ceil(measured.height)
        }
        return measured
      }
    },
    /** 把度量出的半像素行高收成整数，并写回 textLayer / fontMetrics */
    forceIntegerLineHeight (r) {
      if (!r) return
      const raw = r.lineHeight
      if (!(typeof raw === 'number' && raw > 0)) return
      const lh = Math.round(raw) || Math.ceil(raw)
      if (lh === raw) return
      r.lineHeight = lh
      if (r.layerConfig) r.layerConfig.lineHeight = lh
      const layers = [r.$textLayer, r.$fontMetrics]
      layers.forEach((layer) => {
        if (layer && layer.$characterSize) {
          layer.$characterSize.height = lh
        }
      })
    },
    resizeEditor () {
      this.syncEditorMetrics()
    },
    applyReadonly (flag) {
      const editor = (this.$refs.ace && this.$refs.ace.editor) || this._editor
      if (editor) editor.setReadOnly(!!flag)
    },
  },
}
</script>

<style scoped>
.gp-ace-editor {
  width: 100%;
  height: 100%;
  border: 0;
  overflow: hidden;
  background: #fff;
  letter-spacing: 0;
  word-spacing: 0;
  font-variant-ligatures: none;
}

/*
 * 根因：全局 `* { font-family: Helvetica/PingFang… }` 会作用到每个 Ace token span，
 * 文字变成比例字体，而 FontMetrics 量的是等宽「X」→ characterWidth 偏大 → 光标漂在字右侧。
 * 必须用 !important 覆盖 Ace 内全部后代（含 span），且不要设 line-height。
 */
.gp-ace-editor >>> .ace_editor,
.gp-ace-editor >>> .ace_editor * {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace !important;
  letter-spacing: 0 !important;
  word-spacing: 0 !important;
  font-variant-ligatures: none !important;
}

.gp-ace-editor >>> .ace_editor {
  width: 100% !important;
  height: 100% !important;
  font-size: 14px !important;
}
</style>
