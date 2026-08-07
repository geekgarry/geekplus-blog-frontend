<template>
  <!--
    BlogShell：博客前台唯一外壳入口（路由 name=webApp 的 component）。
    双布局按需异步加载，避免顶栏+侧栏两套壳同时打进首屏包。
    切换 blogLayout 只换壳，子路由与 URL 保持不变（见 docs/v2/01）。
  -->
  <component :is="layoutComp" v-if="layoutComp" />
  <div v-else class="blog-shell-boot" aria-hidden="true" />
</template>

<script>
export default {
  name: 'BlogShell',
  data() {
    return {
      VerticalBlog: null,
      HorizontalBlog: null
    }
  },
  computed: {
    blogLayout() {
      return (this.$store.state.settings && this.$store.state.settings.blogLayout) || 'top'
    },
    layoutComp() {
      return this.blogLayout === 'side' ? this.HorizontalBlog : this.VerticalBlog
    }
  },
  watch: {
    blogLayout: {
      immediate: true,
      handler(val) {
        this.ensureLayout(val)
      }
    }
  },
  methods: {
    async ensureLayout(mode) {
      try {
        if (mode === 'side') {
          if (!this.HorizontalBlog) {
            const mod = await import(
              /* webpackChunkName: "blog-layout-side" */ '@/layout/blog/horizontal/index'
            )
            this.HorizontalBlog = mod.default || mod
          }
        } else if (!this.VerticalBlog) {
          const mod = await import(
            /* webpackChunkName: "blog-layout-top" */ '@/layout/blog/vertical/index'
          )
          this.VerticalBlog = mod.default || mod
        }
      } catch (e) {
        console.error('加载博客布局失败', e)
      }
    }
  }
}
</script>

<style scoped>
.blog-shell-boot {
  min-height: 40vh;
}
</style>
