<template>
  <!-- Vue2 必须单根节点；升 Vue3 时可改为多根 -->
  <div class="esign-pad-root" :class="rootClass">
    <section class="esign-pad" style="overscroll-behavior: contain">
      <div class="esign-pad__head">
        <h2 class="esign-pad__title">✎ 请在下方区域签名</h2>
        <button
          type="button"
          class="esign-btn esign-btn--primary esign-pad__fs-btn"
          @click="openFullscreen"
        >
          ⛶ 全屏横屏签名
        </button>
      </div>

      <!-- 移动端预览 -->
      <div class="esign-pad__mobile">
        <div class="esign-pad__mobile-preview">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="签名"
            class="esign-pad__preview-img"
            draggable="false"
          />
          <button
            v-else
            type="button"
            class="esign-pad__mobile-hint"
            @click="openFullscreen"
          >
            点击进入全屏横屏手写板
          </button>
        </div>
        <div v-if="previewUrl" class="esign-pad__mobile-actions">
          <button
            type="button"
            class="esign-btn esign-btn--primary esign-btn--block"
            @click="openFullscreen"
          >
            继续编辑
          </button>
          <button
            type="button"
            class="esign-btn esign-btn--danger"
            @click="clearCanvas"
          >
            清空
          </button>
        </div>
      </div>

      <!-- 桌面端画板（全屏时隐藏，避免双实例） -->
      <div v-if="!isFullscreen" class="esign-pad__desktop">
        <div
          ref="container"
          class="esign-canvas-box esign-canvas-box--desktop"
          :style="canvasBoxStyle"
        >
          <canvas
            ref="canvas"
            class="esign-canvas"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          />
          <div v-if="isEmpty" class="esign-canvas-empty">横屏书写签名…</div>
        </div>
        <div class="esign-toolbar">
          <div class="esign-toolbar__left esign-toolbar__left--dark">
            <label class="esign-toolbar__item">
              <span>粗细</span>
              <input v-model.number="lineWidth" type="range" min="1" max="10" />
            </label>
            <label class="esign-toolbar__item">
              <span>颜色</span>
              <input v-model="strokeColor" type="color" class="esign-color" />
            </label>
          </div>
          <div class="esign-toolbar__right">
            <button type="button" class="esign-btn esign-btn--danger" @click="clearCanvas">
              清空
            </button>
            <button
              type="button"
              class="esign-btn"
              :disabled="isEmpty"
              @click="undoLastStroke"
            >
              撤销
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 强制横屏全屏手写板 -->
    <div
      v-if="isFullscreen"
      class="esign-fs"
      style="touch-action: none; overscroll-behavior: none"
    >
      <div class="esign-fs__inner" :style="fsInnerStyle">
        <div class="esign-fs__bar">
          <button type="button" class="esign-btn esign-btn--ghost" @click="closeFullscreen">
            ✕ 返回
          </button>
          <span class="esign-fs__title">横屏手写签名</span>
          <button type="button" class="esign-btn esign-btn--success" @click="closeFullscreen">
            ✓ 完成
          </button>
        </div>

        <div class="esign-fs__body">
          <div
            ref="container"
            class="esign-canvas-box esign-canvas-box--fs"
            :style="canvasBoxStyle"
          >
            <canvas
              ref="canvas"
              class="esign-canvas"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            />
            <div v-if="isEmpty" class="esign-canvas-empty">横屏书写签名…</div>
          </div>
          <div class="esign-toolbar">
            <div class="esign-toolbar__left esign-toolbar__left--light">
              <label class="esign-toolbar__item">
                <span>粗细</span>
                <input v-model.number="lineWidth" type="range" min="1" max="10" />
              </label>
              <label class="esign-toolbar__item">
                <span>颜色</span>
                <input v-model="strokeColor" type="color" class="esign-color" />
              </label>
            </div>
            <div class="esign-toolbar__right">
              <button type="button" class="esign-btn esign-btn--danger" @click="clearCanvas">
                清空
              </button>
              <button
                type="button"
                class="esign-btn"
                :disabled="isEmpty"
                @click="undoLastStroke"
              >
                撤销
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * SignaturePad.vue — Vue2 Options API（可直接在 Vue3 使用）
 * 事件：@change / @input / @update:modelValue  → dataUrl | null
 */
function getLocalPoint(e, canvas, useCssRotate) {
  var rect = canvas.getBoundingClientRect()
  if (!useCssRotate) {
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.clientWidth,
      y: ((e.clientY - rect.top) / rect.height) * canvas.clientHeight
    }
  }
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 }
  return {
    x: ((e.clientY - rect.top) / rect.height) * canvas.clientWidth,
    y: ((rect.right - e.clientX) / rect.width) * canvas.clientHeight
  }
}

function normalizeStrokes(strokes, width, height) {
  if (width <= 0 || height <= 0) return strokes
  return strokes.map(function (stroke) {
    return stroke.map(function (p) {
      return {
        x: p.x / width,
        y: p.y / height,
        width: p.width / width,
        color: p.color
      }
    })
  })
}

function denormalizeStrokes(strokes, width, height) {
  if (width <= 0 || height <= 0) return strokes
  return strokes.map(function (stroke) {
    return stroke.map(function (p) {
      return {
        x: p.x * width,
        y: p.y * height,
        width: Math.max(1, p.width * width),
        color: p.color
      }
    })
  })
}

function renderStrokesToDataUrl(strokes, width, height) {
  if (!strokes.length || width < 2 || height < 2) return null
  var dpr = Math.min(window.devicePixelRatio || 1, 2)
  var off = document.createElement('canvas')
  off.width = Math.floor(width * dpr)
  off.height = Math.floor(height * dpr)
  var ctx = off.getContext('2d')
  if (!ctx) return null
  ctx.scale(dpr, dpr)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  strokes.forEach(function (stroke) {
    if (stroke.length < 2) return
    ctx.beginPath()
    ctx.strokeStyle = stroke[0].color
    ctx.lineWidth = stroke[0].width
    ctx.moveTo(stroke[0].x, stroke[0].y)
    for (var i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y)
    }
    ctx.stroke()
  })
  return off.toDataURL('image/png')
}

export default {
  name: 'SignaturePad',
  props: {
    rootClass: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      strokes: [],
      lineWidth: 3,
      strokeColor: '#000000',
      isFullscreen: false,
      previewUrl: null,
      forceCssLandscape: true,
      _ctx: null,
      _strokes: [],
      _currentStroke: [],
      _isDrawing: false,
      _size: { w: 0, h: 0 },
      _onOrient: null
    }
  },
  computed: {
    isEmpty: function () {
      return this.strokes.length === 0
    },
    useCssRotate: function () {
      return this.isFullscreen && this.forceCssLandscape
    },
    canvasBoxStyle: function () {
      return {
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }
    },
    fsInnerStyle: function () {
      if (this.forceCssLandscape) {
        return {
          position: 'absolute',
          width: '100vh',
          height: '100vw',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          padding: '10px 12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a'
        }
      }
      return {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        padding: '10px 12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a'
      }
    }
  },
  watch: {
    strokes: function (val) {
      this._strokes = val
      this.paintStrokes(val)
    },
    isFullscreen: function (val) {
      var self = this
      if (val) {
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
        this._bindOrient()
        this.$nextTick(function () {
          setTimeout(function () {
            self.initCanvas(true)
          }, 60)
        })
      } else {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
        this._unbindOrient()
        this.$nextTick(function () {
          setTimeout(function () {
            self.initCanvas(true)
          }, 40)
        })
      }
    }
  },
  mounted: function () {
    this._strokes = this.strokes
    this._currentStroke = []
    this._isDrawing = false
    this._size = { w: 0, h: 0 }
    var self = this
    this.$nextTick(function () {
      self.initCanvas(true)
    })
  },
  beforeDestroy: function () {
    this._teardown()
  },
  beforeUnmount: function () {
    this._teardown()
  },
  methods: {
    _teardown: function () {
      this._unbindOrient()
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    },
    _bindOrient: function () {
      var self = this
      this._onOrient = function () {
        self.forceCssLandscape = window.innerHeight >= window.innerWidth
        setTimeout(function () {
          self.initCanvas(true)
        }, 80)
      }
      this._onOrient()
      window.addEventListener('resize', this._onOrient)
      window.addEventListener('orientationchange', this._onOrient)
    },
    _unbindOrient: function () {
      if (this._onOrient) {
        window.removeEventListener('resize', this._onOrient)
        window.removeEventListener('orientationchange', this._onOrient)
        this._onOrient = null
      }
    },
    emitChange: function (url) {
      this.previewUrl = url
      this.$emit('change', url)
      this.$emit('input', url)
      this.$emit('update:modelValue', url)
    },
    commitSignature: function (allStrokes) {
      var w = this._size.w || 800
      var h = this._size.h || 320
      var url = renderStrokesToDataUrl(allStrokes, w, h)
      this.emitChange(url)
    },
    paintStrokes: function (allStrokes) {
      var canvas = this.$refs.canvas
      var ctx = this._ctx
      if (!canvas || !ctx) return
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ;(allStrokes || []).forEach(function (stroke) {
        if (stroke.length < 2) return
        ctx.beginPath()
        ctx.strokeStyle = stroke[0].color
        ctx.lineWidth = stroke[0].width
        ctx.moveTo(stroke[0].x, stroke[0].y)
        for (var i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y)
        }
        ctx.stroke()
      })
    },
    initCanvas: function (force) {
      var canvas = this.$refs.canvas
      var container = this.$refs.container
      if (!canvas || !container) return false

      var cssW = Math.max(1, Math.floor(container.clientWidth || container.offsetWidth))
      var cssH = Math.max(1, Math.floor(container.clientHeight || container.offsetHeight))
      if (cssW < 8 || cssH < 8) return false

      var prevW = this._size.w
      var prevH = this._size.h
      var sizeChanged = Math.abs(cssW - prevW) >= 2 || Math.abs(cssH - prevH) >= 2
      if (!force && !sizeChanged && this._ctx) return false

      var nextStrokes = this._strokes
      if (sizeChanged && prevW > 0 && prevH > 0 && nextStrokes.length > 0) {
        nextStrokes = denormalizeStrokes(
          normalizeStrokes(nextStrokes, prevW, prevH),
          cssW,
          cssH
        )
        this._strokes = nextStrokes
        this.strokes = nextStrokes
      }

      var dpr = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = cssW + 'px'
      canvas.style.height = cssH + 'px'

      var ctx = canvas.getContext('2d')
      if (!ctx) return false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      this._ctx = ctx
      this._size = { w: cssW, h: cssH }
      this.paintStrokes(this._strokes)
      return true
    },
    onPointerDown: function (e) {
      var canvas = this.$refs.canvas
      if (!canvas) return
      e.preventDefault()
      e.stopPropagation()
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId)
      this._isDrawing = true
      var pos = getLocalPoint(e, canvas, this.useCssRotate)
      this._currentStroke = [
        { x: pos.x, y: pos.y, width: this.lineWidth, color: this.strokeColor }
      ]
    },
    onPointerMove: function (e) {
      if (!this._isDrawing) return
      var canvas = this.$refs.canvas
      var ctx = this._ctx
      if (!canvas || !ctx) return
      e.preventDefault()
      e.stopPropagation()
      var pos = getLocalPoint(e, canvas, this.useCssRotate)
      var prev = this._currentStroke
      var nextPoint = {
        x: pos.x,
        y: pos.y,
        width: this.lineWidth,
        color: this.strokeColor
      }
      if (prev.length > 0) {
        var p1 = prev[prev.length - 1]
        ctx.beginPath()
        ctx.strokeStyle = nextPoint.color
        ctx.lineWidth = nextPoint.width
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(nextPoint.x, nextPoint.y)
        ctx.stroke()
      }
      this._currentStroke = prev.concat([nextPoint])
    },
    onPointerUp: function (e) {
      if (!this._isDrawing) return
      e.preventDefault()
      this._isDrawing = false
      try {
        if (this.$refs.canvas && this.$refs.canvas.releasePointerCapture) {
          this.$refs.canvas.releasePointerCapture(e.pointerId)
        }
      } catch (err) { /* ignore */ }
      var finished = this._currentStroke
      this._currentStroke = []
      if (finished.length > 0) {
        var next = this._strokes.concat([finished])
        this._strokes = next
        this.strokes = next
        this.commitSignature(next)
      }
    },
    clearCanvas: function () {
      this._strokes = []
      this._currentStroke = []
      this.strokes = []
      this.emitChange(null)
      this.paintStrokes([])
    },
    undoLastStroke: function () {
      var next = this._strokes.slice(0, -1)
      this._strokes = next
      this.strokes = next
      this.commitSignature(next)
    },
    openFullscreen: function () {
      this.forceCssLandscape = window.innerHeight >= window.innerWidth
      this.isFullscreen = true
    },
    closeFullscreen: function () {
      this.commitSignature(this._strokes)
      this.isFullscreen = false
    }
  }
}
</script>

<style src="../styles/esign.css"></style>
