<template>
  <div :class="{'has-header-logo':showLogo}">
    <logo v-if="showLogo" :collapse="false" />
    <!-- <el-scrollbar wrap-class="scrollbar-wrapper"> -->
    <div class="top-menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        background-color="#f7f7f7"
        text-color="#393939"
        :unique-opened="false"
        :active-text-color="themeColor||variables.menuActiveText"
        :collapse-transition="false"
        mode="horizontal" >
        <horizontal-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </div>
    <!-- </el-scrollbar> -->
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Logo from './Logo'
import HorizontalItem from './HorizontalItem'
import variables from '@/styles/variables.scss'

export default {
  components: { HorizontalItem, Logo },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters([
      'permission_routes',
      'sidebar'
    ]),
    // routes() {
    //   return this.$router.options.routes
    // },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo == '1' ? true : false
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    themeColor() {
      return this.$store.state.settings.themeColor;
    }
  }
}
</script>

<style lang="scss" scoped>
.top-menu-wrapper {
  overflow-x: auto;
  flex: 1;
  width: 0;
  white-space: nowrap;
  height: 50px;
  line-height: 50px;
  border: none;
  //background: #eeeeee;
}

.top-menu-wrapper::-webkit-scrollbar {
  display: none; /* 这仅在Webkit内核浏览器中隐藏滚动条 */
}

.top-menu-wrapper {
  -ms-overflow-style: none; /* IE和Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
