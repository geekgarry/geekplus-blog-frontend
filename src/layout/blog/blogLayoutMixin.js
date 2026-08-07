/**
 * 前台布局切换：top = 顶部导航(Vertical)，side = 侧栏(Horizontal)
 * 状态在 settings.blogLayout，经 localStorage 持久化。
 * 由 BlogShell 读取同名状态决定渲染哪套壳；本 mixin 挂在两套 layout 上提供切换按钮。
 */
import { getGpWebTitleInfo } from '@/api/geekplus/geekplus'
import { runWhenIdle } from '@/utils/deferRequest'

export default {
  computed: {
    blogLayout() {
      return (this.$store.state.settings && this.$store.state.settings.blogLayout) || 'top'
    },
    blogLayoutToggleTitle() {
      return this.blogLayout === 'side' ? '切换为顶部导航' : '切换为侧栏导航'
    }
  },
  methods: {
    toggleBlogLayout() {
      const next = this.blogLayout === 'side' ? 'top' : 'side'
      this.$store.dispatch('settings/changeSetting', { key: 'blogLayout', value: next })
    },
    /** 两套壳共用：有 session 缓存则秒开，避免侧栏布局缺站名 */
    ensureWebInfo() {
      const CACHE_KEY = 'gp_web_title_info_v1'
      const CACHE_AT = 'gp_web_title_info_v1_at'
      const TTL = 30 * 60 * 1000
      try {
        const at = Number(sessionStorage.getItem(CACHE_AT) || 0)
        const raw = sessionStorage.getItem(CACHE_KEY)
        if (raw && Date.now() - at < TTL) {
          const data = JSON.parse(raw)
          if (data && !this.$common.isEmpty(data)) {
            this.$store.commit('loadWebInfo', data)
            return
          }
        }
      } catch (e) { /* ignore */ }

      getGpWebTitleInfo({ id: 1 }).then((res) => {
        if (!this.$common.isEmpty(res.data)) {
          this.$store.commit('loadWebInfo', res.data)
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.data))
            sessionStorage.setItem(CACHE_AT, String(Date.now()))
          } catch (e) { /* ignore */ }
        }
      }).catch(() => {})
    },
    /** 预取文章入口 chunk，减轻首页点进正文的卡顿 */
    prefetchArticleChunk() {
      runWhenIdle(() => {
        import(/* webpackPrefetch: true */ '@/views/article/ArticleEntry.vue').catch(() => {})
      }, 2500)
    }
  }
}
