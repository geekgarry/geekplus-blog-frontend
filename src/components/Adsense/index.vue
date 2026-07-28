<template>
  <!--
    自研 Adsense 占位：同步注册，避免页面早于 vue-google-adsense 异步加载时出现 Unknown custom element。
    真正广告脚本空闲后再注入；失败时仅保留占位高度，不影响页面结构。
  -->
  <div class="gp-adsense" :class="{ 'is-ready': ready }">
    <ins
      ref="ins"
      class="adsbygoogle"
      :style="insStyle"
      :data-ad-client="client"
      :data-ad-slot="slot"
      :data-ad-format="format || undefined"
      :data-full-width-responsive="fullWidth || undefined"
    />
  </div>
</template>

<script>
let adsScriptPromise = null

function ensureAdsScript() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.adsbygoogle && window.adsbygoogle.loaded) return Promise.resolve()
  if (adsScriptPromise) return adsScriptPromise
  adsScriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-gp-adsense="1"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => resolve())
      // 已存在时也尽快 resolve，避免卡住
      setTimeout(resolve, 50)
      return
    }
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    s.dataset.gpAdsense = '1'
    s.onload = () => resolve()
    s.onerror = () => resolve()
    document.head.appendChild(s)
  })
  return adsScriptPromise
}

export default {
  name: 'Adsense',
  inheritAttrs: false,
  props: {
    dataAdClient: { type: String, default: '' },
    dataAdSlot: { type: String, default: '' },
    dataAdFormat: { type: String, default: '' },
    dataFullWidthResponsive: { type: [String, Boolean], default: '' }
  },
  data() {
    return { ready: false, pushed: false }
  },
  computed: {
    client() {
      return this.dataAdClient || this.$attrs['data-ad-client'] || ''
    },
    slot() {
      return this.dataAdSlot || this.$attrs['data-ad-slot'] || ''
    },
    format() {
      return this.dataAdFormat || this.$attrs['data-ad-format'] || ''
    },
    fullWidth() {
      const v = this.dataFullWidthResponsive || this.$attrs['data-full-width-responsive']
      return v === true || v === 'true' || v === 'yes' ? 'true' : (v || undefined)
    },
    insStyle() {
      return { display: 'block', minHeight: '90px', width: '100%' }
    }
  },
  mounted() {
    this.boot()
  },
  methods: {
    async boot() {
      if (!this.client || !this.slot) return
      try {
        await ensureAdsScript()
        await this.$nextTick()
        if (this.pushed) return
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        this.pushed = true
        this.ready = true
      } catch (e) {
        this.ready = false
      }
    }
  }
}
</script>

<style scoped>
.gp-adsense {
  width: 100%;
  min-height: 90px;
  overflow: hidden;
  background: transparent;
}
.gp-adsense:not(.is-ready) {
  background: var(--gp-surface-bg, rgba(127, 127, 127, 0.06));
  border-radius: 8px;
}
</style>
