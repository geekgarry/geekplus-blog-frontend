<template>
  <div>
    <div class="navbar_occupy hidden-sm-and-up"></div>
    <div class="navbar" v-if="isMobile">
      <!-- 抽屉菜单按钮 -->
      <!-- <button @click="toggleDrawer" class="drawer-button">菜单</button> -->
      <div id="hamburger-container" class="hamburger-container" :is-active="isDrawerOpen" @click="toggleDrawer">
        <div style="padding: 0 15px;">
          <svg t="1731952319419" class="hamburger" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="7818" width="200" height="200">
            <path
              d="M954.88 237.056H69.12a43.52 43.52 0 1 1 0-87.04h885.248c24.064 0 43.52 19.456 43.52 43.52s-18.944 43.52-43.008 43.52zM954.88 555.52H69.12a43.52 43.52 0 1 1 0-87.04h885.248c24.064 0 43.52 19.456 43.52 43.52s-18.944 43.52-43.008 43.52zM954.88 874.496H69.12a43.52 43.52 0 1 1 0-87.04h885.248c24.064 0 43.52 19.456 43.52 43.52 0.512 24.064-18.944 43.52-43.008 43.52z"
              fill="currentColor" p-id="7819"></path>
          </svg>
        </div>
      </div>
      <div class="logo-title-container">
        <div>GeekPlus</div>
      </div>
      <div class="right-menu">
        <template v-if="device !== 'mobile'">

          <el-tooltip content="Global Size" effect="dark" placement="bottom">
            <div class="right-menu-item hover-effect">
              <i class="el-icon-chat-dot-round"></i>
            </div>
          </el-tooltip>

        </template>

        <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="iLogo" class="user-avatar">
          </div>
          <el-dropdown-menu slot="dropdown">
            <router-link to="/profile/index">
              <el-dropdown-item>Profile</el-dropdown-item>
            </router-link>
            <router-link to="/">
              <el-dropdown-item>Dashboard</el-dropdown-item>
            </router-link>
            <a target="_blank" href="https://github.com/PanJiaChen/vue-element-admin/">
              <el-dropdown-item>Github</el-dropdown-item>
            </a>
            <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
              <el-dropdown-item>Docs</el-dropdown-item>
            </a>
            <el-dropdown-item divided @click.native="logout">
              <span style="display:block;">Log Out</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- 抽屉菜单遮罩层 -->
    <div class="drawer-overlay hidden-sm-and-up" v-show="isDrawerOpen" @click="toggleDrawer">
    </div>
    <el-container class="container" direction="horizontal">
      <!-- <div class="drawer hidden-sm-and-up" :class="{ open: isDrawerOpen }">
                <div class="drawer-header">
                    <span class="logo">GeekPlus</span>
                    <button class="close-button" @click="toggleDrawer">×</button>
                </div>
                <ul class="menu-list">
                    <li v-for="(item, index) in navMenuLit" :key="index" class="menu-item">
                        <div class="menu-title" @click="toggleItem(index)">
                            <span v-if="item.children">{{ item.categoryName }}</span>
                            <span v-else><router-link to="/">{{ item.categoryName }}</router-link></span>
                            <span v-if="item.children" class="arrow">
                                <i :class="openIndex === index ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                            </span>
                        </div>
                        <ul v-if="item.children && openIndex === index" class="submenu">
                            <li v-for="(subItem, subIndex) in item.children" :key="subIndex">
                                {{ subItem.categoryName }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div> -->
      <el-aside class="sidebar-menu" :class="{ drawer: isMobile, open: isDrawerOpen }" width="220px">
        <div class="drawer-header">
          <span class="logo">
            <img alt="" :src="iLogo" />
          </span>
          <!-- <span class="title">GeekPlus</span> -->
          <button class="close-button" v-show="isMobile" @click="toggleDrawer">×</button>
        </div>
        <ul class="menu-list">
          <li v-for="(item, index) in navMenuLit" :key="index" class="menu-item">
            <div class="menu-title" @click="toggleItem(index)">
              <span v-if="item.children">{{ item.categoryName }}</span>
              <span v-else><router-link to="/">{{ item.categoryName }}</router-link></span>
              <!-- 如果有子菜单，显示箭头 -->
              <span v-if="item.children" class="arrow">
                <!-- {{ openIndex === index ? "▲" : "▼" }} -->
                <i :class="openIndex === index ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </span>
            </div>
            <!-- 子菜单 -->
            <ul v-if="item.children && openIndex === index" class="submenu">
              <li v-for="(subItem, subIndex) in item.children" :key="subIndex">
                {{ subItem.categoryName }}
              </li>
            </ul>
          </li>
        </ul>
        <div class="settings-container">
          <div class="setting-item">
            <!-- 太阳按钮 -->
            <i v-if="isDark" class="el-icon-sunny iconRotate" @click="changeColor()"></i>
            <!-- 月亮按钮 -->
            <i v-else class="el-icon-moon" aria-hidden="true" @click="changeColor()"></i>
          </div>
        </div>
      </el-aside>
      <el-main class="main-content-container">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
            <plus-breadcrumb></plus-breadcrumb>
            <router-view></router-view>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
            <div class="sidebar-right">
              <h2>忆香博客</h2>
              <p>记录每一天的精彩</p>
              <h2>精选文章</h2>
              <ul>
                <li><router-link to="/post/1">微信JSAPI支付</router-link></li>
                <li><router-link to="/post/3">阿里云-获取短信验证码</router-link></li>
                <li><a href="#">NodeJS require()源码解析</a></li>
                <li><a href="#">JQuery逐渐退出前端历史舞台?</a></li>
              </ul>

              <h2>友情链接</h2>
              <div class="links">
                <a href="#">#####</a> <a href="#">#####</a>
                <a href="#">#####</a> <a href="#">#####</a>
              </div>
            </div>
            <plus-footer></plus-footer>
          </el-col>
        </el-row>
      </el-main>
      <!-- <div :style="isMobile ? { width: '100%' } : { height: '100vh', overflow: 'auto' }">
                <div :style="[isMobile ? { padding: '10px' } : { padding: '0px', backgroundSize: 'cover', display: 'flex', flexDirection: 'column', }]">
                </div>
            </div>
            <el-aside v-if="!isMobile" width="250px" style="padding: 10px;">
            </el-aside> -->
    </el-container>
    <!-- <div class="main-view-container"></div> -->
  </div>
</template>

<script>
// @ is an alias to /src
import ResizeMixin from '../../mixin/ResizeHandler'
import { mapState } from 'vuex'
import PlusFooter from '../../components/Footer/index.vue'
import PlusBreadcrumb from '@/layout/components/Breadcrumb'

export default {
  components: {
    PlusFooter,
    PlusBreadcrumb
  },
  data() {
    return {
      redirect: undefined,
      isDark: false,
      windowWidth: 0,  // Initialize window width
      isMobile: false,
      isDrawerOpen: false,
      openIndex: null, // 当前展开的菜单索引
      //还有一种对有子菜单的菜单项添加一个open字段实现控制张开折叠
      navMenuLit: [
        { name: "kj", path: "/kj", categoryName: "📱 科技社", icon: '', id: 2, children: [{ name: "kj", path: "/xw", categoryName: "📱 新闻", icon: '', id: 21 }, { name: "kjdt", path: "/kjdt", categoryName: "📱 科技动态", icon: '', id: 22 }] },
        { name: "fl", path: "/fl", categoryName: "🎁 福利社", icon: '', id: 3, children: [{ name: "yh", path: "/yh", categoryName: "🎁 优惠", icon: '', id: 31 }, { name: "cj", path: "/cj", categoryName: "🎁 抽奖", icon: '', id: 32 }] },
        { name: "zy", path: "/zy", categoryName: "🧰 资源社", icon: '', id: 4, children: [{ name: "xz", path: "/xz", categoryName: "🧰 下载", icon: '', id: 41 }, { name: "jc", path: "/jc", categoryName: "🧰 教程", icon: '', id: 42 }] },
        { name: "jl", path: "/jl", categoryName: "📝 记录", icon: '', id: 5 },
        { name: "yqlj", path: "/yqlj", categoryName: "👬 友情频道", icon: '', id: 6 },
        { name: "gyxz", path: "/gyxz", categoryName: "🍺 关于小站", icon: '', id: 7, children: [{ name: "js", path: "/js", categoryName: "介绍", icon: '', id: 71 }, { name: "lxwm", path: "/lxwm", categoryName: "联系我们", icon: '', id: 72 }] },
      ],
      iLogo: require("@/assets/logo.png")
    }
  },
  created() {
    this.isDark = this.darkMode;
  },
  mounted() {
    this.handleResize(); // Get initial window width
    window.addEventListener('resize', this.handleResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = (route.query && route.query.redirect) || '/'
      },
      immediate: true,
    }
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader,
      darkMode: state => state.darkMode,
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
  },
  methods: {
    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen;
    },
    toggleItem(index) {
      this.openIndex = this.openIndex === index ? null : index;
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.isMobile = this.windowWidth < 768;
    },
    changeColor() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.body.setAttribute("theme-mode", "dark");
        localStorage.setItem("theme-mode", "dark");
        // this.setCookieStorage("theme-mode", "dark", { expires: 17 });
      } else {
        document.body.removeAttribute("theme-mode", "dark");
        localStorage.setItem("theme-mode", "light");
        // this.setCookieStorage("theme-mode", "light", { expires: 17 });
      }
    },
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";

.navbar_occupy {
  height: 50px;
  position: relative;
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--background, #fff);
  color: var(--fontColor, #272727);
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  z-index: 888;

  .hamburger-container {
    line-height: 50px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: var(--hover-background, rgba(0, 0, 0, .025));
    }

    .hamburger {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
    }
  }

  .logo-title-container {
    flex: 1;
    line-height: 50px;
    height: 100%;
    text-align: center;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 5px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 40px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.sidebar-menu {
  height: 100vh;
  width: 220px;
  padding: 0;
  margin: 0 auto;
  color: var(--fontColor, #0a0a0a);
  background: var(--navbarBackground);
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
}

/* 左侧滑动抽屉导航菜单 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  background: #0a0a0a70;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--navbarBackground);
  transform: translateX(-100%);
  transition: transform 0.4s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border-color, #ddd);

  .logo {
    height: 50px;

    img {
      height: 50px;
    }
  }

  .title {
    color: var(--fontColor);
  }
}

.close-button {
  background: none;
  color: var(--fontColor);
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow: auto;
  color: var(--fontColor, #0a0a0a);
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  position: relative;
}

.menu-item {
  margin: 2px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 1.5s ease-in-out;
}

.menu-title {
  width: 100%;
  height: 35px;
  line-height: 35px;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 3px;

  &:hover {
    background: var(--color-background, #f1f1f0);
  }

  .arrow {
    height: 25px;
    line-height: 25px;
    width: 25px;
    border-radius: 20px;
    text-align: center;
    font-size: 12px;
    transition: background .2s ease-in-out;

    &:hover {
      background: var(--hover-background, #eee);
    }
  }
}

.submenu {
  width: 100%;
  list-style: none;
  padding: 0 16px;
  margin: 0;
  transition: transform .3s ease-in-out;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.submenu li {
  margin: 8px 2px;
  padding: 0 10px;
  background: var(--color-background, #f1f1f0);
  height: 35px;
  line-height: 35px;
  border-radius: 3px;
}

.settings-container {
  padding: 10px 0;
  widows: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;

  .setting-item {
    cursor: pointer;
  }
}

/* 左侧滑动抽屉导航菜单结束 */
/* .main-view-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
} */

.main-content-container {
  height: 100vh;
  overflow: auto;
}

.sidebar-right {
  width: 100%;
  padding: 10px;
  /* Space between content and sidebar */
  margin-top: auto;
  /* Push to bottom on larger screens */
}
</style>
