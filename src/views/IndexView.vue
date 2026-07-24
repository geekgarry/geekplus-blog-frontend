<template>
  <MobileIndexView v-if="isMobile" />
  <DesktopIndexView v-else />
</template>
<script>
import DesktopIndexView from "@/views/desktop/IndexView.vue"
import MobileIndexView from "@/views/mobile/IndexView.vue"

export default {
  name: "IndexView",
  components: {
    DesktopIndexView,
    MobileIndexView
  },
  data() {
    return {
      // 同时看 UA 与视口宽度，窗口缩放时也能切换布局
      viewportMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false
    }
  },
  computed: {
    isMobile() {
      const uaMobile = this.$common && this.$common.isMobile ? this.$common.isMobile() : false
      return uaMobile
    }
  },
  mounted() {
    this._onResize = () => {
      this.viewportMobile = window.innerWidth < 768
    }
    window.addEventListener("resize", this._onResize)
    this._onResize()
  },
  beforeDestroy() {
    if (this._onResize) {
      window.removeEventListener("resize", this._onResize)
    }
  }
}
</script>
