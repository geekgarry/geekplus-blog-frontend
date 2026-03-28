<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <!--当 leftMenuBar===true，左菜单栏显示,顶部隐藏-->
    <sidebar class="sidebar-container" v-if="device==='mobile'||leftMenuBar" />
    <div :class="{hasTagsView:needTagsView, 'main-container':leftMenuBar}">
      <div :class="{'fixed-header':fixedHeader, topMenuBar: !leftMenuBar}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
      <!-- <right-panel v-if="false">
      </right-panel> -->
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, Topbar, AppMain, TagsView, Settings } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import RightPanel from '@/components/RightPanel'

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
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    showSettings(){
      return this.$store.state.settings.showSettings
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
    //获取menuInLeft值
    leftMenuBar() {
      return this.$store.state.settings.leftMenuBar == '1' ? true : false
    },
    classObj() {
      return {
        showTopMenuBar: this.device!=='mobile'&&!this.leftMenuBar, //显示顶部菜单的样式
        hideSidebar: !this.sidebar.opened && (this.device==='mobile' || this.leftMenuBar),
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
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
  /* @import 'element-theme-dark/lib/index.css'; */

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
