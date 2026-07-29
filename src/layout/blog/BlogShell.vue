<template>
  <!-- 博客外壳：同一套子路由，按偏好切换顶部 / 侧栏导航布局 -->
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
    blogLayout() {
      return (this.$store.state.settings && this.$store.state.settings.blogLayout) || 'top'
    },
    layoutComp() {
      return this.blogLayout === 'side' ? 'HorizontalBlog' : 'VerticalBlog'
    }
  }
}
</script>
