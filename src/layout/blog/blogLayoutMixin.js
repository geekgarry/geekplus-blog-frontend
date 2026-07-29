/**
 * 前台布局切换：top = 顶部导航(Vertical)，side = 侧栏(Horizontal)
 * 状态在 settings.blogLayout，经 localStorage 持久化。
 */
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
    }
  }
}
