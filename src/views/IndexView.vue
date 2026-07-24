<template>
  <!-- 视口宽度优先：缩放窗口也能切移动/桌面首页，避免仅靠 UA 误判 -->
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
