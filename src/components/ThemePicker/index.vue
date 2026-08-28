<template>
  <!-- 仅 UI：改色后 $emit('change')，由 Settings.themeChange → commitUserThemeColor 持久化 -->
  <el-color-picker
    v-model="themeColor"
    :predefine="['#5f7d80', '#8ea9a7', '#6f8f72', '#9a8f86', '#6f8b96', '#11a983', '#409EFF', '#6959CD']"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
    @change="onPick"
  />
</template>

<script>
/**
 * 管理端主题色选择器（Settings 抽屉内）
 *
 * 职责边界：
 * - 本组件：展示色块、同步 store 到 picker、抛出 change
 * - 不调用 applyThemeColor / 不写 localStorage（避免与 store action 双触发）
 * - 父组件 Settings.themeChange → commitUserThemeColor
 *
 * ColorPicker 由 layout 引入 element-admin 全局注册，本组件不 import element-admin
 */
export default {
  data() {
    return {
      /** 与 el-color-picker v-model 绑定，由 defaultTheme 同步 */
      themeColor: ''
    }
  },
  computed: {
    defaultTheme() {
      return this.$store.state.settings.themeColor
    }
  },
  watch: {
    /** store 被其它 Tab/冷启动更新时，回显到 picker */
    defaultTheme: {
      handler(val) {
        if (typeof val === 'string' && val && val !== this.themeColor) {
          this.themeColor = val
        }
      },
      immediate: true
    }
  },
  methods: {
    onPick(val) {
      if (typeof val !== 'string') return
      this.$emit('change', val)
    }
  }
}
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
