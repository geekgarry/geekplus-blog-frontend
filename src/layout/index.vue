<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <!--当 adminMenuLayout=sidebar 显示侧栏；topbar 显示顶栏菜单；workbench 隐藏传统菜单-->
    <sidebar class="sidebar-container" v-if="device==='mobile'||showAdminSidebar" />
    <div :class="{hasTagsView:needTagsView, 'main-container':showAdminSidebar}">
      <div :class="{'fixed-header':fixedHeader, topMenuBar: !showAdminSidebar}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel>
        <settings />
      </right-panel>
      <admin-watermark />
      <realtime-chat-entry />
      <!-- <right-panel v-if="false">
      </right-panel> -->
    </div>
  </div>
</template>

<script>
/**
 * 管理端 Layout：侧栏/顶栏 + Settings 抽屉
 * admin.scss / element-admin 在此加载；挂载后 refreshAfterElementCss 压过 Element 默认色
 */
import { Navbar, Sidebar, Topbar, AppMain, TagsView, Settings } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import RightPanel from '@/components/RightPanel'
import AdminWatermark from '@/components/AdminWatermark/index.vue'
import RealtimeChatEntry from '@/components/RealtimeChat/Entry.vue'
import { markBootReady } from '@/utils/bootLoader'
import { refreshAfterElementCss } from '@/theme'
import '@/styles/admin.scss'
import '@/styles/sidebar.scss'
/* admin.scss 在 layout 懒加载，再盖一层圆角变量，避免写死 4px 盖掉设置 */
import '@/styles/gp-border-radius.css'
import '@/plugins/element-admin'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    Topbar,
    AppMain,
    RightPanel,
    TagsView,
    Settings,
    AdminWatermark,
    RealtimeChatEntry
  },
  mixins: [ResizeMixin],
  mounted() {
    // 维护链路：admin.scss + 按需 Element CSS 就绪后，重申 --theme-color 与 override 顺序
    refreshAfterElementCss()
    this.$nextTick(() => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => markBootReady())
      } else {
        markBootReady()
      }
    })
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    switchLangs(){
      return this.$store.state.settings.switchLangs
    },
    needTagsView(){
       return this.$store.state.settings.tagsView == '1' ? true : false
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader == '1' ? true : false
    },
    //获取menuInLeft值（与 adminMenuLayout 同步，workbench 时视为顶栏宽布局）
    leftMenuBar() {
      return this.$store.state.settings.leftMenuBar == '1' ? true : false
    },
    adminMenuLayout() {
      const val = this.$store.state.settings.adminMenuLayout
      if (val === 'sidebar' || val === 'topbar' || val === 'workbench') return val
      return this.leftMenuBar ? 'sidebar' : 'topbar'
    },
    showAdminSidebar() {
      return this.adminMenuLayout === 'sidebar'
    },
    isAdminWorkbenchNav() {
      return this.adminMenuLayout === 'workbench'
    },
    classObj() {
      return {
        showTopMenuBar: this.device!=='mobile' && this.adminMenuLayout === 'topbar',
        hideSidebar: !this.sidebar.opened && (this.device==='mobile' || this.showAdminSidebar),
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile',
        adminWorkbenchNav: this.isAdminWorkbenchNav
      }
    }
  },
  created() {
    // document.body.removeAttribute("theme-mode");
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";
  /* 侧栏样式已在 script 中全局引入；此处不再重复 @import sidebar */

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    /*&.mobile.openSidebar{
      position: fixed;
      top: 0;
    }*/
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: fixed;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .fixed-header.topMenuBar {
    width: 100%;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
