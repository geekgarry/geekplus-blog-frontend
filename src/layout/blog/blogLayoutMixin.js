/**
 * 前台布局切换：top=顶栏 | side=侧栏 | workbench=工作台导航
 * 状态在 settings.blogLayout，经 localStorage 持久化。
 * workbench 模式仍走 Vertical 壳，顶栏隐藏 BlogNavMenu，改展示「应用工作台」入口。
 */
import { getGpWebTitleInfo } from '@/api/geekplus/geekplus'
import { runWhenIdle } from '@/utils/deferRequest'

const BLOG_LAYOUT_ORDER = ['top', 'side', 'workbench']

const BLOG_LAYOUT_META = {
  top: { title: '顶部导航', nextTitle: '切换为侧栏导航', icon: 'topbar' },
  side: { title: '侧栏导航', nextTitle: '切换为工作台导航', icon: 'sidebar' },
  workbench: { title: '工作台导航', nextTitle: '切换为顶部导航', icon: 'menu-line' }
}

export default {
  computed: {
    blogLayout() {
      const val = (this.$store.state.settings && this.$store.state.settings.blogLayout) || 'top'
      return BLOG_LAYOUT_ORDER.includes(val) ? val : 'top'
    },
    blogLayoutToggleTitle() {
      const meta = BLOG_LAYOUT_META[this.blogLayout] || BLOG_LAYOUT_META.top
      return meta.nextTitle
    },
    blogLayoutModeIcon() {
      const meta = BLOG_LAYOUT_META[this.blogLayout] || BLOG_LAYOUT_META.top
      return meta.icon
    },
    isWorkbenchNavLayout() {
      return this.blogLayout === 'workbench'
    }
  },
  methods: {
    toggleBlogLayout() {
      const idx = BLOG_LAYOUT_ORDER.indexOf(this.blogLayout)
      const next = BLOG_LAYOUT_ORDER[(idx + 1) % BLOG_LAYOUT_ORDER.length]
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
