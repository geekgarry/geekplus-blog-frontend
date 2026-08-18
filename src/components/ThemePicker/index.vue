<template>
  <el-color-picker
    v-model="themeColor"
    :predefine="['#5f7d80', '#8ea9a7', '#6f8f72', '#9a8f86', '#6f8b96', '#11a983', '#409EFF', '#6959CD']"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
    @change="onPick"
  />
</template>

<script>
import '@/plugins/element-admin'
import { applyElementTheme } from '@/utils/elementTheme'

export default {
  data() {
    return {
      themeColor: ''
    }
  },
  computed: {
    defaultTheme() {
      return this.$store.state.settings.themeColor
    }
  },
  watch: {
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
    async onPick(val) {
      if (typeof val !== 'string') return
      const $message = this.$message({
        message: (this.$t && this.$t('theme.changeColor')) || '正在应用主题色…',
        customClass: 'theme-message',
        type: 'success',
        duration: 0,
        iconClass: 'el-icon-loading'
      })
      try {
        // 全站统一：CSS 变量 + Element 覆盖（前台博客同样吃 --theme-color）
        await applyElementTheme(val, { defer: false })
        this.$emit('change', val)
      } finally {
        $message.close()
      }
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
