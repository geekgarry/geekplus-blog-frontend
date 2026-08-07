<template>
  <!-- 按设备只加载一套文章页，避免桌面/移动两套同进首包 -->
  <component :is="activeView" v-if="activeView" />
  <div v-else class="article-boot-placeholder" aria-hidden="true" />
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
  name: 'ArticleEntry',
  data() {
    return {
      activeView: null,
      preferMobile: resolvePreferMobile()
    }
  },
  async created() {
    try {
      if (this.preferMobile) {
        const mod = await import(
          /* webpackChunkName: "web-view-article-mobile" */ '@/views/article/mobile.vue'
        )
        this.activeView = mod.default || mod
      } else {
        const mod = await import(
          /* webpackChunkName: "web-view-article" */ '@/views/article/index.vue'
        )
        this.activeView = mod.default || mod
      }
    } catch (e) {
      console.error('加载文章页失败', e)
    }
  }
}
</script>

<style scoped>
.article-boot-placeholder {
  min-height: 50vh;
}
</style>
