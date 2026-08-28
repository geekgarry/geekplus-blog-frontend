<template>
  <!-- 默认首页：经典文章流（桌面/移动按视口异步分包） -->
  <component :is="activeView" v-if="activeView" />
  <div v-else class="index-boot-placeholder" aria-hidden="true" />
</template>

<script>
function resolvePreferMobile() {
  if (typeof window === 'undefined') return false
  const narrow = window.innerWidth < 768
  const ua = navigator.userAgent || ''
  const uaMobile =
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
      ua
    ) || typeof window.orientation !== 'undefined'
  return narrow || uaMobile
}

export default {
  name: 'IndexView',
  data() {
    return {
      activeView: null,
      preferMobile: resolvePreferMobile()
    }
  },
  async created() {
    await this.loadActiveView()
  },
  methods: {
    async loadActiveView() {
      const mobile = this.preferMobile
      try {
        if (mobile) {
          const mod = await import(
            /* webpackChunkName: "web-view-mobile-IndexView" */ '@/views/mobile/IndexView.vue'
          )
          this.activeView = mod.default || mod
        } else {
          const mod = await import(
            /* webpackChunkName: "web-view-desktop-IndexView" */ '@/views/desktop/IndexView.vue'
          )
          this.activeView = mod.default || mod
        }
      } catch (e) {
        console.error('加载首页失败', e)
      }
    }
  }
}
</script>

<style scoped>
.index-boot-placeholder {
  min-height: 50vh;
}
</style>
