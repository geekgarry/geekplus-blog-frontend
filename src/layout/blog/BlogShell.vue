<template>
  <!--
    BlogShell：博客前台唯一外壳入口（路由 name=webApp 的 component）。
    双布局按需异步加载，避免顶栏+侧栏两套壳同时打进首屏包。
    切换 blogLayout 只换壳，子路由与 URL 保持不变（见 docs/v2/01）。
  -->
  <component :is="layoutComp" v-if="layoutComp" />
  <div v-else class="blog-shell-boot" aria-busy="true" aria-live="polite">
    <div class="blog-shell-boot__dots" aria-hidden="true">
      <span /><span /><span />
    </div>
  </div>
</template>

<script>
import { markBootReady, hideBootLoader } from '@/utils/bootLoader'

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
    },
    layoutComp(val) {
      if (val) {
        this.$nextTick(() => {
          // 等布局 DOM 贴上一帧再收起骨架，减少闪白
          requestAnimationFrame(() => markBootReady())
        })
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
        hideBootLoader(0)
      }
    }
  }
}
</script>

<style scoped>
.blog-shell-boot {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gp-page-wash, var(--background-color, #f0f3f4));
}

.blog-shell-boot__dots {
  display: inline-flex;
  gap: 8px;
}

.blog-shell-boot__dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--theme-color, #5f7d80);
  animation: blog-shell-beat 0.7s infinite linear;
}

.blog-shell-boot__dots span:nth-child(odd) {
  animation-delay: 0.35s;
}

@keyframes blog-shell-beat {
  50% {
    opacity: 0.25;
    transform: scale(0.75);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
