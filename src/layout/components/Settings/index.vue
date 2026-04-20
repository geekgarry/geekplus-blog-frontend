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

      <!--增加切换按钮-->
      <div class="drawer-item hidden-sm-and-down">
        <span>{{ $t("settings.leftMenuBar") }}</span>
        <el-switch active-value="1" inactive-value="0" v-model="leftMenuBar" class="drawer-switch" />
      </div>

      <!--增加黑白主题切换按钮-->
      <div class="drawer-item">
        <div class="dark-setting">
          <!-- 太阳按钮 -->
          <i v-if="isDarkMode" class="el-icon-sunny" @click="changeColor"></i>
          <!-- 月亮按钮 -->
          <i v-else class="el-icon-moon" aria-hidden="true" @click="changeColor"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThemePicker from '@/components/ThemePicker'

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
    // 增加绑定的leftMenuBar值
    leftMenuBar: {
      get() {
        return this.$store.state.settings.leftMenuBar
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'leftMenuBar',
          value: val
        })
      }
    },
    isDarkMode: {
      get() {
        return this.$store.state.darkMode != null ? this.$store.state.darkMode : !this.isDay;
      }
    },
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
      this.$store.dispatch('settings/changeSetting', {
        key: 'themeColor',
        value: val
      })
    },
    changeColor() {
      var isDark = !this.isDarkMode;
      if (isDark) {
        document.body.setAttribute("theme-mode", "dark");
        this.$store.commit("changeDarkMode", isDark);
      } else {
        document.body.removeAttribute("theme-mode", "dark");
        this.$store.commit("changeDarkMode", isDark);
      }
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
    color: var(--fontColor, rgba(0, 0, 0, .85));
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: var(--fontColor, rgba(0, 0, 0, .65));
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }

  .dark-setting {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dark-setting i {
    padding: 5px;
    cursor: pointer;
  }
}
</style>
