<template>
  <MobileIndexView v-if="isMobile" />
  <DesktopIndexView v-else />
</template>
<script>
import DesktopIndexView from "@/views/desktop/IndexView.vue"
import MobileIndexView from "@/views/mobile/IndexView.vue"

export default {
  components: {
    DesktopIndexView,
    MobileIndexView
  },
  data() {
    return {

    }
  },
  created() {

  },
  mounted() {

  },
  computed: {
    isMobile() {
      //根据用户吧浏览设备的用户信息判断是否是移动设备
      return this.$common.isMobile();
    }
  },
  methods: {

  }
}
</script>
