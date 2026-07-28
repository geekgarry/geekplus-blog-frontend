<template>
  <!--
    PlusCarousel：自研轮播（首页主用）
    - 无缝循环：首尾克隆 + transitionend 瞬移（对齐 el-carousel loop）
    - 移动端：触摸跟手滑动
    - 桌面端：箭头、鼠标滚轮、mousedown 拖拽跟手
  -->
  <div
    class="plus-carousel"
    :class="['is-' + mode, { 'is-dragging': dragging }]"
    :style="{ height: computedHeight }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @wheel.prevent="onWheel"
  >
    <div
      ref="track"
      class="plus-carousel__track"
      :style="trackStyle"
      @transitionend="onTrackTransitionEnd"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <!-- loopTrack： [末页克隆, ...真实页, 首页克隆]，拖动/自动播可跨边界无缝衔接 -->
      <div
        v-for="(item, index) in loopTrack"
        :key="item._key"
        class="plus-carousel__slide"
      >
        <a
          class="plus-carousel__link"
          :href="item.link || 'javascript:void(0);'"
          @click.prevent="onSlideClick(item, $event)"
        >
          <img
            class="plus-carousel__img"
            :src="item.img"
            :alt="item.title || ''"
            draggable="false"
            @error="onImgError($event)"
          >
          <div v-if="item.title" class="plus-carousel__caption">
            <span>{{ item.title }}</span>
          </div>
        </a>
      </div>
    </div>

    <!-- 桌面端左右箭头（hover 显示） -->
    <button
      v-if="showArrows && slides.length > 1 && mode === 'desktop'"
      type="button"
      class="plus-carousel__arrow is-prev"
      aria-label="上一张"
      @click="prev"
    >
      <i class="el-icon-arrow-left"></i>
    </button>
    <button
      v-if="showArrows && slides.length > 1 && mode === 'desktop'"
      type="button"
      class="plus-carousel__arrow is-next"
      aria-label="下一张"
      @click="next"
    >
      <i class="el-icon-arrow-right"></i>
    </button>

    <!-- 底部指示点（按逻辑页，不含克隆） -->
    <div v-if="showIndicators && slides.length > 1" class="plus-carousel__dots">
      <button
        v-for="(item, index) in slides"
        :key="'dot-' + index"
        type="button"
        class="plus-carousel__dot"
        :class="{ active: index === current }"
        @click="go(index)"
      />
    </div>
  </div>
</template>

<script>
/**
 * PlusCarousel — 自研触控/鼠标友好轮播（无缝 loop）
 *
 * 无缝原理（与 Element UI el-carousel loop 同类）：
 *   轨道渲染为 [最后一张克隆] + 真实 slides + [第一张克隆]
 *   trackIndex 指向轨道位置；动画到克隆页后，在 transitionend 无动画跳回真实页
 *   这样从末页→首页、首页→末页时是连续滑动，而不是取模瞬间跳变
 *
 * props.items 兼容：carouselImg/title/link 与 img/title/link
 * 若需 Element UI 原版行为，请改用 @/components/ElCarouselBanner
 */
export default {
  name: 'PlusCarousel',
  props: {
    /** 轮播项列表 */
    items: {
      type: Array,
      default: () => []
    },
    /** desktop | mobile，影响默认高度与箭头展示 */
    mode: {
      type: String,
      default: 'desktop'
    },
    /** 容器高度，数字视为 px */
    height: {
      type: [String, Number],
      default: ''
    },
    /** 是否自动轮播 */
    autoplay: {
      type: Boolean,
      default: true
    },
    /** 自动轮播间隔 ms */
    interval: {
      type: Number,
      default: 4000
    },
    /** 是否无缝循环（首尾衔接）；关闭则到边界停住 */
    loop: {
      type: Boolean,
      default: true
    },
    /** 是否显示左右箭头（仅 desktop 模式生效） */
    showArrows: {
      type: Boolean,
      default: true
    },
    /** 是否显示底部指示点 */
    showIndicators: {
      type: Boolean,
      default: true
    },
    /** 是否启用触摸滑动 */
    touch: {
      type: Boolean,
      default: true
    },
    /** 是否启用桌面鼠标拖拽（mousedown/up） */
    mouseDrag: {
      type: Boolean,
      default: true
    },
    /** 是否启用鼠标滚轮切页 */
    mouseWheel: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      /** 逻辑页下标 0..n-1（指示点用） */
      current: 0,
      /**
       * 轨道下标：有 loop 时 0=末克隆，1..n=真实页，n+1=首克隆
       * 无 loop / 单页时与 current 相同
       */
      trackIndex: 0,
      /** 瞬移回真实页时关闭 transition，避免闪回动画 */
      suppressTransition: false,
      dragging: false,
      startX: 0,
      startY: 0,
      deltaX: 0,
      lockDir: '',
      timer: null,
      hoverPause: false,
      trackWidth: 0,
      // 区分「拖拽」与「点击」，避免拖完误触发跳转
      didDrag: false,
      // 滚轮节流时间戳
      lastWheelAt: 0,
      // 窗口级鼠标监听（拖拽过程）
      _onMouseMove: null,
      _onMouseUp: null,
      // 防止 transitionend 重复处理瞬移
      _snapping: false,
      /**
       * 松手切页时的过渡补偿（%）：
       * 先无动画停在「跟手视觉位置」，再清零并开 transition，才能从拖拽处滑到目标页
       */
      settleOffsetPct: 0
    }
  },
  computed: {
    /** 归一化幻灯片数据 */
    slides() {
      return (this.items || []).map((it) => ({
        img: it.carouselImg || it.img || it.image || '',
        title: it.carouselTitle || it.title || '',
        link: it.carouselLink || it.link || it.href || ''
      })).filter((s) => s.img)
    },
    /** 是否启用克隆无缝轨道 */
    useLoop() {
      return this.loop && this.slides.length > 1
    },
    /**
     * 实际渲染轨道：
     * - loop：末克隆 + 真实 + 首克隆
     * - 否则：仅真实页
     */
    loopTrack() {
      const list = this.slides
      if (!list.length) return []
      if (!this.useLoop) {
        return list.map((s, i) => ({ ...s, _key: 's-' + i, _real: i }))
      }
      const last = list[list.length - 1]
      const first = list[0]
      return [
        { ...last, _key: 'clone-tail', _real: list.length - 1, _clone: true },
        ...list.map((s, i) => ({ ...s, _key: 's-' + i, _real: i })),
        { ...first, _key: 'clone-head', _real: 0, _clone: true }
      ]
    },
    computedHeight() {
      if (this.height) {
        return typeof this.height === 'number' ? this.height + 'px' : this.height
      }
      return this.mode === 'mobile' ? '180px' : '280px'
    },
    /** 轨道位移：用「视口宽度 px」计算，避免 % 相对整条 track 导致白屏偏移 */
    trackStyle() {
      const w = this.trackWidth || 0
      const basePx = -this.trackIndex * w
      let dragPx = this.dragging ? this.deltaX : 0
      // 非 loop 时在边界阻尼，避免拖出空白
      if (this.dragging && !this.useLoop && this.slides.length && w) {
        const atFirst = this.trackIndex === 0 && this.deltaX > 0
        const atLast = this.trackIndex === this.slides.length - 1 && this.deltaX < 0
        if (atFirst || atLast) dragPx = this.deltaX * 0.35
      }
      // settleOffsetPct 为相对视口的百分比补偿，换算为 px
      const settlePx = w ? (this.settleOffsetPct / 100) * w : 0
      const x = basePx + dragPx + settlePx
      return {
        transform: `translate3d(${x}px, 0, 0)`,
        transition: (this.dragging || this.suppressTransition || !w)
          ? 'none'
          : 'transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)'
      }
    }
  },
  watch: {
    slides: {
      handler() {
        this.resetToStart()
        this.$nextTick(() => {
          this.measure()
          this.resetTimer()
        })
      }
    },
    loop() {
      this.resetToStart()
    },
    autoplay() {
      this.resetTimer()
    },
    interval() {
      this.resetTimer()
    }
  },
  mounted() {
    // 先量宽再复位，避免首帧 trackWidth=0 时 transform 停在错误位置出现白屏
    this.$nextTick(() => {
      this.measure()
      this.resetToStart()
      this.resetTimer()
    })
    window.addEventListener('resize', this.measure)
  },
  beforeDestroy() {
    this.clearTimer()
    this.unbindWindowMouse()
    window.removeEventListener('resize', this.measure)
  },
  methods: {
    /** 数据变化后回到第一张真实页 */
    resetToStart() {
      this.current = 0
      this.trackIndex = this.useLoop ? 1 : 0
      this.suppressTransition = false
      this.settleOffsetPct = 0
      this._snapping = false
      this.deltaX = 0
      this.dragging = false
    },
    measure() {
      const el = this.$el
      const next = el ? el.clientWidth : 0
      // 宽度从 0→有值时强制无动画对齐，消除首屏白块
      const wasZero = !this.trackWidth && next > 0
      this.trackWidth = next
      if (wasZero) {
        this.suppressTransition = true
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            this.suppressTransition = false
          })
        })
      }
    },
    /** 图片加载失败时用本地占位，避免灰底白屏 */
    onImgError(e) {
      const img = e && e.target
      if (!img || img.dataset.fallback === '1') return
      img.dataset.fallback = '1'
      try {
        img.src = require('@/assets/images/cover1.jpeg')
      } catch (err) {
        img.style.background = '#2a2f38'
      }
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    /** 重启自动播放；悬停/拖拽/瞬移中不启动 */
    resetTimer() {
      this.clearTimer()
      if (!this.autoplay || this.slides.length < 2 || this.hoverPause || this.dragging) return
      this.timer = setInterval(() => {
        this.next()
      }, Math.max(2000, this.interval || 4000))
    },
    onMouseEnter() {
      // 桌面悬停暂停自动播放，便于滚轮/拖拽
      if (this.mode !== 'desktop') return
      this.hoverPause = true
      this.clearTimer()
    },
    onMouseLeave() {
      if (this.mode !== 'desktop') return
      // 若仍按住拖拽，不在 leave 时复位，等 mouseup
      if (this.dragging) return
      this.hoverPause = false
      this.resetTimer()
    },
    /** 逻辑页 → 轨道下标 */
    logicalToTrack(logical) {
      return this.useLoop ? logical + 1 : logical
    },
    /** 轨道下标 → 逻辑页（克隆映射到对应真实页） */
    trackToLogical(trackIdx) {
      const n = this.slides.length
      if (!n) return 0
      if (!this.useLoop) return Math.min(Math.max(trackIdx, 0), n - 1)
      if (trackIdx <= 0) return n - 1
      if (trackIdx >= n + 1) return 0
      return trackIdx - 1
    },
    syncCurrentFromTrack() {
      this.current = this.trackToLogical(this.trackIndex)
    },
    /**
     * 跳到逻辑页（指示点/外部调用）
     * 始终落到真实轨道位，不经过克隆
     */
    go(index) {
      if (!this.slides.length) return
      // 指示点跳转：先落到真实页再切，避免从克隆位误动画
      this.snapIfOnClone(true)
      const len = this.slides.length
      const logical = ((index % len) + len) % len
      this.settleOffsetPct = 0
      this.suppressTransition = false
      this.trackIndex = this.logicalToTrack(logical)
      this.current = logical
      this.$emit('change', this.current)
      this.resetTimer()
    },
    prev() {
      if (!this.slides.length) return
      if (this.snapIfOnClone(false)) {
        // 已在末克隆（视觉=末页）点上一张 → 先瞬移到真实末页，下一帧再 -1
        this.queueAfterSnap(() => {
          if (!this.useLoop && this.trackIndex <= 0) return
          this.suppressTransition = false
          this.trackIndex -= 1
          this.syncCurrentFromTrack()
          this.$emit('change', this.current)
          this.resetTimer()
        })
        return
      }
      if (!this.useLoop && this.trackIndex <= 0) return
      this.settleOffsetPct = 0
      this.suppressTransition = false
      this.trackIndex -= 1
      this.syncCurrentFromTrack()
      this.$emit('change', this.current)
      this.resetTimer()
    },
    next() {
      if (!this.slides.length) return
      if (this.snapIfOnClone(false)) {
        // 已在首克隆（视觉=首页）点下一张 → 先瞬移到真实首页，下一帧再 +1
        this.queueAfterSnap(() => {
          const max = this.useLoop ? this.slides.length + 1 : this.slides.length - 1
          if (!this.useLoop && this.trackIndex >= max) return
          this.suppressTransition = false
          this.trackIndex += 1
          this.syncCurrentFromTrack()
          this.$emit('change', this.current)
          this.resetTimer()
        })
        return
      }
      const max = this.useLoop ? this.slides.length + 1 : this.slides.length - 1
      if (!this.useLoop && this.trackIndex >= max) return
      this.settleOffsetPct = 0
      this.suppressTransition = false
      this.trackIndex += 1
      this.syncCurrentFromTrack()
      this.$emit('change', this.current)
      this.resetTimer()
    },
    /**
     * 若当前停在克隆页则无动画跳到对应真实页。
     * @param {boolean} syncDom 是否立刻写 DOM（指示点跳转用）
     * @returns {boolean} 是否发生了瞬移
     */
    snapIfOnClone(syncDom) {
      if (!this.useLoop) return false
      const n = this.slides.length
      let target = null
      if (this.trackIndex === 0) target = n
      else if (this.trackIndex === n + 1) target = 1
      if (target == null) return false
      this.settleOffsetPct = 0
      this.suppressTransition = true
      this.trackIndex = target
      this.syncCurrentFromTrack()
      if (syncDom) {
        const track = this.$refs.track
        const w = this.trackWidth || 0
        if (track && w) {
          track.style.transition = 'none'
          track.style.transform = `translate3d(${-target * w}px, 0, 0)`
          // eslint-disable-next-line no-unused-expressions
          track.offsetWidth
          track.style.transition = ''
          track.style.transform = ''
        }
        this.suppressTransition = false
      }
      return true
    },
    /** 瞬移绘制后再执行切页，避免从克隆位长距离回滑 */
    queueAfterSnap(fn) {
      this.$nextTick(() => {
        const track = this.$refs.track
        if (track) {
          // eslint-disable-next-line no-unused-expressions
          track.offsetWidth
        }
        requestAnimationFrame(() => {
          this.suppressTransition = false
          fn && fn()
        })
      })
    },
    /**
     * 动画落到克隆页后：无过渡跳回对应真实页，视觉上形成无限循环
     * 只处理 transform 结束，忽略子元素冒泡的其它 transition
     */
    onTrackTransitionEnd(e) {
      if (e.target !== this.$refs.track) return
      if (e.propertyName && e.propertyName !== 'transform') return
      if (!this.useLoop || this.dragging || this._snapping) return
      const n = this.slides.length
      // 落到「末页克隆」(index 0) → 瞬移到真实末页 n
      if (this.trackIndex === 0) {
        this.snapTrackTo(n)
        return
      }
      // 落到「首页克隆」(index n+1) → 瞬移到真实首页 1
      if (this.trackIndex === n + 1) {
        this.snapTrackTo(1)
      }
    },
    /** 关闭动画后改 trackIndex，再下一帧恢复 transition */
    snapTrackTo(index) {
      this._snapping = true
      this.suppressTransition = true
      this.trackIndex = index
      this.syncCurrentFromTrack()
      this.$nextTick(() => {
        // 强制 reflow，确保浏览器先应用无动画位移
        const track = this.$refs.track
        if (track) {
          // eslint-disable-next-line no-unused-expressions
          track.offsetWidth
        }
        requestAnimationFrame(() => {
          this.suppressTransition = false
          this._snapping = false
        })
      })
    },
    /**
     * 桌面鼠标滚轮切页
     * - 纵向滚轮向下 / 横向滚轮向右 → 下一张
     * - 节流 420ms，避免一次滚动翻多页
     */
    onWheel(e) {
      if (!this.mouseWheel || this.slides.length < 2) return
      const now = Date.now()
      if (now - this.lastWheelAt < 420) return
      const dx = e.deltaX || 0
      const dy = e.deltaY || 0
      const dominant = Math.abs(dx) > Math.abs(dy) ? dx : dy
      if (Math.abs(dominant) < 2) return
      this.lastWheelAt = now
      if (dominant > 0) this.next()
      else this.prev()
    },
    onSlideClick(item, e) {
      // 拖拽结束后的 click 需要吞掉，避免误跳转
      if (this.didDrag) {
        this.didDrag = false
        e && e.preventDefault && e.preventDefault()
        return
      }
      this.$emit('item-click', item)
      if (item.link && item.link !== 'javascript:void(0);') {
        if (/^https?:\/\//i.test(item.link)) {
          window.open(item.link, '_blank')
        } else if (this.$router) {
          this.$router.push(item.link)
        }
      }
    },
    /* ========== 移动端触摸 ========== */
    onTouchStart(e) {
      if (!this.touch || this.slides.length < 2) return
      // 若正停在克隆位（极端竞态），先瞬移到真实页再开拖
      this.ensureRealTrackBeforeDrag()
      const t = e.touches[0]
      this.dragging = true
      this.didDrag = false
      this.startX = t.clientX
      this.startY = t.clientY
      this.deltaX = 0
      this.lockDir = ''
      this.clearTimer()
    },
    onTouchMove(e) {
      if (!this.dragging) return
      const t = e.touches[0]
      const dx = t.clientX - this.startX
      const dy = t.clientY - this.startY
      if (!this.lockDir) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          this.lockDir = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        }
      }
      // 竖滑交给页面滚动
      if (this.lockDir === 'y') {
        this.dragging = false
        this.deltaX = 0
        this.resetTimer()
        return
      }
      if (this.lockDir === 'x') {
        e.preventDefault()
        this.deltaX = dx
        if (Math.abs(dx) > 6) this.didDrag = true
      }
    },
    onTouchEnd() {
      if (!this.dragging && !this.deltaX) {
        this.resetTimer()
        return
      }
      this.finishDrag()
    },
    /* ========== 桌面鼠标拖拽：mousedown / mousemove / mouseup ========== */
    onMouseDown(e) {
      if (!this.mouseDrag || this.slides.length < 2) return
      if (e.button !== 0) return
      e.preventDefault()
      this.ensureRealTrackBeforeDrag()
      this.dragging = true
      this.didDrag = false
      this.startX = e.clientX
      this.startY = e.clientY
      this.deltaX = 0
      this.lockDir = 'x'
      this.clearTimer()
      // 绑定到 window，避免鼠标移出组件后丢失 mouseup
      this._onMouseMove = (ev) => {
        if (!this.dragging) return
        const dx = ev.clientX - this.startX
        this.deltaX = dx
        if (Math.abs(dx) > 6) this.didDrag = true
      }
      this._onMouseUp = () => {
        this.finishDrag()
        this.unbindWindowMouse()
      }
      window.addEventListener('mousemove', this._onMouseMove)
      window.addEventListener('mouseup', this._onMouseUp)
    },
    unbindWindowMouse() {
      if (this._onMouseMove) {
        window.removeEventListener('mousemove', this._onMouseMove)
        this._onMouseMove = null
      }
      if (this._onMouseUp) {
        window.removeEventListener('mouseup', this._onMouseUp)
        this._onMouseUp = null
      }
    },
    /** 拖拽开始前若仍在克隆页，先无动画落到真实页，避免跟手错位 */
    ensureRealTrackBeforeDrag() {
      this.snapIfOnClone(true)
    },
    /**
     * 根据位移阈值切页并复位拖拽状态。
     * loop 开启时允许滑向克隆页，由 transitionend 完成无缝复位。
     * 松手时先锚定跟手视觉位置，再过渡到目标页，避免「先跳回再滑」的断层。
     */
    finishDrag() {
      const threshold = Math.min(80, (this.trackWidth || 300) * 0.18)
      const width = this.trackWidth || 1
      const dx = this.deltaX
      // 与 trackStyle 中跟手位移一致（含非 loop 边界阻尼），避免松手时视觉跳变
      let dragPct = (dx / width) * 100
      if (!this.useLoop && this.slides.length) {
        const atFirst = this.trackIndex === 0 && dragPct > 0
        const atLast = this.trackIndex === this.slides.length - 1 && dragPct < 0
        if (atFirst || atLast) dragPct *= 0.35
      }
      const fromPct = -this.trackIndex * 100 + dragPct
      let target = this.trackIndex

      if (dx > threshold) {
        // 右滑 → 上一张（首张时进入末克隆）
        if (this.useLoop || this.trackIndex > 0) target -= 1
      } else if (dx < -threshold) {
        // 左滑 → 下一张（末张时进入首克隆）
        const max = this.useLoop ? this.slides.length + 1 : this.slides.length - 1
        if (this.useLoop || this.trackIndex < max) target += 1
      }

      this.lockDir = ''
      this.dragging = false
      this.deltaX = 0
      // 无动画停在当前跟手位置
      this.suppressTransition = true
      this.trackIndex = target
      this.settleOffsetPct = fromPct + target * 100
      const prevLogical = this.current
      this.syncCurrentFromTrack()
      if (this.current !== prevLogical) {
        this.$emit('change', this.current)
      }

      this.$nextTick(() => {
        const track = this.$refs.track
        if (track) {
          // eslint-disable-next-line no-unused-expressions
          track.offsetWidth
        }
        // 开启动画，补偿清零 → 滑到目标页（含回弹）
        this.suppressTransition = false
        this.settleOffsetPct = 0
      })

      // 短暂保留 didDrag，供随后的 click 判断
      window.setTimeout(() => {
        this.didDrag = false
      }, 80)
      if (!this.hoverPause) this.resetTimer()
      else if (this.mode === 'desktop') {
        this.clearTimer()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.plus-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #e8ecf1;
  user-select: none;
  -webkit-user-select: none;
  /* 桌面拖拽手型 */
  cursor: grab;
}

.plus-carousel__track {
  display: flex;
  /* 限定为视口宽：子项 flex-basis:100% 以此为基准；位移改用 px 后仍需此约束 */
  width: 100%;
  height: 100%;
  will-change: transform;
  touch-action: pan-y;
}

.plus-carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  /* 防止 flex 子项被内容撑破导致跟手错位 */
  min-width: 0;
  flex-shrink: 0;
  box-sizing: border-box;
}

.plus-carousel__link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  color: inherit;
}

.plus-carousel__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  pointer-events: none;
}

.plus-carousel__caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28px 14px 12px;
  background: linear-gradient(180deg, transparent, rgba(20, 24, 32, 0.62));
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  pointer-events: none;

  span {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.plus-carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: #333;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

  &.is-prev { left: 12px; }
  &.is-next { right: 12px; }
}

.plus-carousel.is-desktop:hover .plus-carousel__arrow,
.plus-carousel.is-desktop:focus-within .plus-carousel__arrow {
  opacity: 1;
}

.plus-carousel__dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 2;
  pointer-events: none;
}

.plus-carousel__dot {
  pointer-events: auto;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;

  &.active {
    width: 16px;
    border-radius: 8px;
    background: #fff;
  }
}

.plus-carousel.is-mobile {
  border-radius: 10px;
  cursor: default;

  .plus-carousel__caption {
    font-size: 13px;
    padding: 22px 12px 10px;
  }

  .plus-carousel__dots {
    bottom: 8px;
  }
}

.plus-carousel.is-dragging {
  cursor: grabbing;
}
</style>
