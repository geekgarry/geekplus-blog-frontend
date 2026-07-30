<template>
  <!--
    BlogShell：博客前台唯一外壳入口（路由 name=webApp 的 component）。
    不在此处写 router-view——嵌套出口在 Vertical/Horizontal 内部；
    切换 blogLayout 只换壳，子路由与 URL 保持不变（见 docs/v2/01）。
  -->
  <component :is="layoutComp" />
</template>

<script>
import VerticalBlog from '@/layout/blog/vertical/index'
import HorizontalBlog from '@/layout/blog/horizontal/index'

export default {
  name: 'BlogShell',
  components: {
    VerticalBlog,
    HorizontalBlog
  },
  computed: {
    // settings.blogLayout：'top' | 'side'，持久化在 localStorage
    blogLayout() {
      return (this.$store.state.settings && this.$store.state.settings.blogLayout) || 'top'
    },
    // 命名易混：top → Vertical（顶栏）；side → Horizontal（侧栏）
    layoutComp() {
      return this.blogLayout === 'side' ? 'HorizontalBlog' : 'VerticalBlog'
    }
  }
}
</script>
