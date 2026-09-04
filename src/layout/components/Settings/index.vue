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

      <!-- 管理端菜单：仅侧栏 / 顶栏；后台工作台未落地，勿再提供 workbench 选项（前台 /workbench 另属博客） -->
      <div class="drawer-item drawer-item--stack">
        <span>管理端菜单形式</span>
        <el-radio-group v-model="adminMenuLayout" size="mini" class="drawer-radio drawer-radio--fill">
          <el-radio-button label="sidebar">侧栏</el-radio-button>
          <el-radio-button label="topbar">顶栏</el-radio-button>
        </el-radio-group>
      </div>

      <div class="drawer-item">
        <span>管理端水印</span>
        <el-switch active-value="1" inactive-value="0" v-model="adminWatermark" class="drawer-switch" />
      </div>

      <!-- 控件圆角：管理端 Element / TagsView / 侧栏菜单等 -->
      <div class="drawer-item">
        <span>控件圆角</span>
        <el-select
          v-model="borderRadius"
          size="mini"
          class="drawer-select"
          placeholder="圆角"
          popper-append-to-body
          popper-class="gp-settings-radius-popper"
        >
          <el-option
            v-for="opt in borderRadiusOptions"
            :key="'c-' + opt"
            :label="opt === 0 ? '0px（直角）' : `${opt}px`"
            :value="opt"
          />
        </el-select>
      </div>
      <p class="drawer-hint">管理端常规按钮/输入/弹层、TagsView、侧栏菜单等（分段按钮组除外）。</p>

      <!-- 博客表面圆角：前台 --gp-surface-radius*，与控件圆角独立 -->
      <div class="drawer-item">
        <span>博客圆角</span>
        <el-select
          v-model="blogSurfaceRadius"
          size="mini"
          class="drawer-select"
          placeholder="博客"
          popper-append-to-body
          popper-class="gp-settings-radius-popper"
        >
          <el-option
            v-for="opt in blogSurfaceRadiusOptions"
            :key="'b-' + opt"
            :label="opt === 0 ? '0px（直角）' : `${opt}px`"
            :value="opt"
          />
        </el-select>
      </div>
      <p class="drawer-hint">前台卡片/轮播/欢迎条等（--gp-surface-radius；小表面用 --gp-surface-radius-sm = 该值 − 4px）。</p>

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
 * 管理端右侧设置抽屉（布局 + 主题色 + 深/浅色 + 控件/博客双轨圆角）
 *
 * - borderRadius → applyBorderRadius（--gp-border-radius-base）
 * - blogSurfaceRadius → applyBlogSurfaceRadius（--gp-surface-radius*）
 */
import ThemePicker from '@/components/ThemePicker'
import {
  commitUserThemeColor,
  refreshAfterModeChange,
  BORDER_RADIUS_OPTIONS,
  BLOG_SURFACE_RADIUS_OPTIONS,
  BORDER_RADIUS_SETTING_KEY,
  BLOG_SURFACE_RADIUS_SETTING_KEY
} from '@/theme'

export default {
  components: { ThemePicker },
  data() {
    return {
      borderRadiusOptions: BORDER_RADIUS_OPTIONS,
      blogSurfaceRadiusOptions: BLOG_SURFACE_RADIUS_OPTIONS
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
    adminMenuLayout: {
      get() {
        const val = this.$store.state.settings.adminMenuLayout
        // 历史 workbench 已废弃，展示为侧栏
        if (val === 'topbar') return 'topbar'
        return 'sidebar'
      },
      set(val) {
        const next = val === 'topbar' ? 'topbar' : 'sidebar'
        this.$store.dispatch('settings/changeSetting', { key: 'adminMenuLayout', value: next })
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
    /** 控件圆角（px）→ --gp-border-radius-base */
    borderRadius: {
      get() {
        return this.$store.state.settings.borderRadius
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: BORDER_RADIUS_SETTING_KEY,
          value: val
        })
      }
    },
    /** 博客前台表面圆角（px）→ --gp-surface-radius / --gp-surface-radius-sm */
    blogSurfaceRadius: {
      get() {
        return this.$store.state.settings.blogSurfaceRadius
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: BLOG_SURFACE_RADIUS_SETTING_KEY,
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
    setWebGrey() {
      // v-model 已写入 store；此处仅同步 body 滤镜
      if (this.webGrey) {
        document.body.style.filter = 'grayscale(100%)'
      } else {
        document.body.style.removeProperty('filter')
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
  box-sizing: border-box;
  /* 高度随内容；纵向滚动由父级 .rightPanel 承担 */

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
    overflow: hidden;
  }

  /* 标签在上、控件占满行宽：供菜单形式等宽内容使用 */
  .drawer-item--stack {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    overflow: visible;
  }

  .drawer-switch {
    float: right
  }

  .drawer-select {
    float: right;
    width: 120px;
  }

  .drawer-hint {
    margin: -4px 0 8px;
    clear: both;
    font-size: 12px;
    line-height: 1.45;
    color: var(--muted-1-color, #909399);
  }

  .drawer-radio {
    float: right;
  }

  .drawer-radio--fill {
    float: none;
    width: 100%;
    display: flex;

    ::v-deep .el-radio-button {
      flex: 1;
      min-width: 0;
    }

    ::v-deep .el-radio-button__inner {
      width: 100%;
      padding-left: 4px;
      padding-right: 4px;
      text-align: center;
    }
  }
}
</style>

<!-- 非 scoped：下拉挂 body，须高于 RightPanel z-index:40000 -->
<style>
.gp-settings-radius-popper {
  z-index: 50010 !important;
}
</style>
