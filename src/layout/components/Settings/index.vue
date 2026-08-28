<template>
  <div class="drawer-container">
    <div>
      <h3 class="drawer-title">{{ $t("settings.title") }}</h3>

      <div class="drawer-item">
        <span>网页置灰</span>
        <el-switch :active-value="true" :inactive-value="false" v-model="webGrey" @change="setWebGrey"
          class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>{{ $t("settings.theme") }}</span>
        <theme-picker style="float: right;height: 26px;margin: -3px 8px 0 0;" @change="themeChange" />
      </div>

      <div class="drawer-item">
        <span>{{ $t("settings.tagsView") }}</span>
        <el-switch active-value="1" inactive-value="0" v-model="tagsView" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>{{ $t("settings.fixedHeader") }}</span>
        <el-switch active-value="1" inactive-value="0" v-model="fixedHeader" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>{{ $t("settings.sidebarLogo") }}</span>
        <el-switch active-value="1" inactive-value="0" v-model="sidebarLogo" class="drawer-switch" />
      </div>

      <!--增加切换按钮（兼容旧版：仅侧栏/顶栏二选一）-->
      <div class="drawer-item">
        <span>管理端菜单形式</span>
        <el-radio-group v-model="adminMenuLayout" size="mini" class="drawer-radio">
          <el-radio-button label="sidebar">侧栏</el-radio-button>
          <el-radio-button label="topbar">顶栏</el-radio-button>
          <el-radio-button label="workbench">工作台</el-radio-button>
        </el-radio-group>
      </div>

      <div class="drawer-item drawer-item--legacy">
        <span>{{ $t("settings.leftMenuBar") }}（旧）</span>
        <el-switch active-value="1" inactive-value="0" v-model="leftMenuBar" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>管理端水印</span>
        <el-switch active-value="1" inactive-value="0" v-model="adminWatermark" class="drawer-switch" />
      </div>

      <!-- 黑/亮色：与其它布局项一样用 switch -->
      <div class="drawer-item">
        <span>深色模式</span>
        <el-switch
          :active-value="true"
          :inactive-value="false"
          v-model="isDarkMode"
          class="drawer-switch"
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 管理端右侧设置抽屉（布局 + 主题色 + 深/浅色）
 *
 * 主题相关：
 * - theme-picker → themeChange → commitUserThemeColor（用户改色单链路）
 * - isDarkMode → refreshAfterModeChange（维护链路，不换 hex）
 */
import ThemePicker from '@/components/ThemePicker'
import { commitUserThemeColor, refreshAfterModeChange } from '@/theme'

export default {
  components: { ThemePicker },
  data() {
    return {
      settings: {
        title: '系统布局配置',
        theme: '主题颜色',
        tagsView: '开启 Tags-View',
        fixedHeader: '固定 Header',
        sidebarLogo: '侧边栏 Logo'
      }
    }
  },
  computed: {
    webGrey: {
      get() {
        return this.$store.state.settings.webGrey
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'webGrey',
          value: val
        })
      }
    },
    fixedHeader: {
      get() {
        return this.$store.state.settings.fixedHeader
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'fixedHeader',
          value: val
        })
      }
    },
    tagsView: {
      get() {
        return this.$store.state.settings.tagsView
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'tagsView',
          value: val
        })
      }
    },
    sidebarLogo: {
      get() {
        return this.$store.state.settings.sidebarLogo
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'sidebarLogo',
          value: val
        })
      }
    },
    leftMenuBar: {
      get() {
        return this.$store.state.settings.leftMenuBar
      },
      set(val) {
        const mode = val === '1' ? 'sidebar' : 'topbar'
        this.$store.dispatch('settings/changeSetting', { key: 'adminMenuLayout', value: mode })
      }
    },
    adminMenuLayout: {
      get() {
        const val = this.$store.state.settings.adminMenuLayout
        if (val === 'sidebar' || val === 'topbar' || val === 'workbench') return val
        return this.$store.state.settings.leftMenuBar === '1' ? 'sidebar' : 'topbar'
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', { key: 'adminMenuLayout', value: val })
      }
    },
    adminWatermark: {
      get() {
        return this.$store.state.settings.adminWatermark
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'adminWatermark',
          value: val
        })
      }
    },
    /** 深色模式：true=暗色，false=亮色（与 body[theme-mode] / localStorage 同步） */
    isDarkMode: {
      get() {
        return this.$store.state.darkMode === true
      },
      set(val) {
        const dark = val === true
        if (dark) {
          document.body.setAttribute('theme-mode', 'dark')
        } else {
          document.body.removeAttribute('theme-mode')
        }
        this.$store.dispatch('changeDarkMode', dark)
        // 维护链路：深/浅色切换后重算 token（见 @/theme/README.md）
        refreshAfterModeChange()
      }
    }
  },
  methods: {
    setWebGrey(val) {
      if (this.webGrey) {
        document.body.style.filter = 'grayscale(100%)';
      } else {
        document.body.style.removeProperty('filter');
      }
    },
    themeChange(val) {
      // 用户改色单链路入口，内部 dispatch settings/changeSetting → applyThemeColor
      commitUserThemeColor(this.$store, val)
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: var(--text-color-2, rgba(0, 0, 0, .85));
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: var(--text-color-2, rgba(0, 0, 0, .65));
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }
}
</style>
