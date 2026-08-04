<template>
  <div>
    <!-- 抽屉菜单 -->
    <div class="drawer-overlay" v-show="isDrawerOpen && isMobile" @click="toggleDrawer"></div>
    <div class="drawer" v-show="isMobile" :class="{ open: isDrawerOpen }">
      <div class="drawer-header">
        <div class="drawer-header-title">
          <div class="navbar-title">
            <router-link class="drawer-user-center" :to="!$common.isEmpty(username) ? '/admin/user/profile' : '/'">
              <img class="drawer-user-avatar" :src="!$common.isEmpty(username) ? userAvatar : iLogo">
            </router-link>
            <span class="web-title">{{ nickname || 'GeekPlus' }}</span>
          </div>
          <button class="close-button" @click="toggleDrawer">×</button>
        </div>
        <div class="drawer-header-login">
          <div class="nav-menu-login">
            <span class="nav-login-btn" @click="showUserSignin"
              v-if="$common.isEmpty(username)">登录</span>
            <span class="nav-logout-btn" @click="logout" v-else>退出登录</span>
          </div>
        </div>
      </div>
      <blog-nav-menu
        mode="drawer"
        :menus="addNavMenuRoutes"
        :show-admin-entry="!$common.isEmpty(username)"
        @navigate="onNavMenuNavigate"
      />
    </div>
    <div class="search-wrapper" v-show="isSearchDrawerOpen">
      <div class="search-overlay" @click="toggleSearch"></div>
      <div class="search-drawer" :class="{ open: isSearchDrawerOpen }">
        <div class="search-drawer__main">
          <div class="search-drawer__header">
            <div class="search-drawer__close-btn" @click="toggleSearch">
              <i class="el-icon-close"></i>
            </div>
          </div>
          <div class="drawer__search-container">
            <!-- 搜索抽屉：原生 input，去掉 el-input 依赖 -->
            <div class="gp-input-group">
              <input
                class="gp-input"
                placeholder="搜索文章"
                v-model="searchQuery"
                @keyup.enter="searchArticles"
              >
              <button type="button" class="gp-btn gp-btn--append" @click="searchArticles">
                <i class="el-icon-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="navbar_occupy" v-if="isMobile"></div> -->
    <!-- el过渡动画 -->
    <transition name="el-fade-in-linear">
      <!-- 导航栏 -->
      <div class="navbar-content" ref="navbar" v-show="navbar.visible || isMobile" @mouseenter="hoverEnter = true" @mouseleave="hoverEnter = false"
        :class="[{ enter: navbar.enter }, { hoverEnter: (hoverEnter || this.$route.path === '/favorite' || this.$route.path === '/travel') && !navbar.enter }]">
        <!-- 模糊背景单独一层，避免 backdrop-filter 成为下拉菜单的 containing block 导致裁切 -->
        <div class="navbar-content__bg" aria-hidden="true"></div>
        <div class="navbar-container flex-between">
          <div v-if="isMobile" class="navbar-mobile-menu" :class="{ enter: navbar.enter }">
            <div class="mobile-menu-item" @click="toggleDrawer">
              <span class="menu-btn" style="font-size: 25px;">
                <svg-icon icon-class="nav-menu" />
              </span>
            </div>
          </div>
          <!-- 网站名称 -->
          <router-link to="/">
            <div class="navbar-title">
              <img class="web-logo" :src="iLogo">
              <span class="web-title">{{ $store.state.webInfo.gpWebName }}</span>
            </div>
          </router-link>

          <!-- 导航列表：独立 BlogNavMenu，桌面溢出自动收进「更多」 -->
          <blog-nav-menu
            v-if="!isMobile"
            mode="desktop"
            :menus="addNavMenuRoutes"
            @navigate="onNavMenuNavigate"
          />

          <!-- 导航搜索按钮 -->
          <div class="navbar-header-menu" :class="{ enter: navbar.enter }">
            <div class="header-menu-item">
              <transition name="slide-fade">
                <div class="search-box" :class="{ active: showSearch }">
                  <input placeholder="请输入内容" @click="getSearchTips" class="input" ref="searchInputBox" />
                  <!-- <el-card class="box-card popover-card" v-if="showSearchTips">
                                        <div v-for="o in 4" :key="o" class="text item">
                                          {{'列表内容 ' + o }}
                                        </div>
                                    </el-card> -->
                </div>
              </transition>
              <span class="menu-btn" @click="toggleSearch" style="font-size: 25px;">
                <!-- <i class="el-icon-search"></i> -->
                <svg-icon class-name="search-icon" icon-class="search-icon" />
                <!-- <svg t="1732243120971" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5767" width="22" height="22"><path d="M689.067 631.467L889.6 832c38.4 38.4-19.2 96-57.6 57.6L631.467 689.067C576 731.733 505.6 757.333 430.933 757.333 249.6 757.333 102.4 610.133 102.4 428.8s147.2-326.4 328.533-326.4 328.534 147.2 328.534 328.533c-2.134 74.667-27.734 145.067-70.4 200.534z m-258.134 44.8c136.534 0 245.334-110.934 245.334-245.334S565.333 183.467 430.933 183.467 183.467 294.4 183.467 430.933 294.4 676.267 430.933 676.267z" fill="currentColor" p-id="5768"></path></svg> -->
              </span>
            </div>
            <!-- 个人中心：自研下拉，去掉 el-dropdown -->
            <div class="header-menu-item" v-if="!isMobile">
              <blog-user-menu
                :username="username"
                :avatar="userAvatar"
                @login="showUserLogin"
                @logout="logout"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="gp-blog-main" :style="{ paddingTop: navbarHeight + 'px' }">
      <!-- <transition name="fade-transform" mode="out-in"> -->
      <keep-alive>
        <router-view :key="keyMenuPath"></router-view>
      </keep-alive>
      <!-- </transition> -->
    </div>

    <!--    <div href="#" class="cd-top" v-if="isMobile" @click="toTop()"></div>-->
    <!-- 回到顶部按钮 -->
    <div class="tool-button">
      <div class="backTop float__circle-button" v-if="toolButton" @click="toTop()">
        <!-- 回到顶部按钮 -->
        <!-- <svg t="1732145339985" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20785" width="30" height="30"><path d="M896.257 573.196c-14.336-24.186-302.86-350.11-327.583-391.412a41.448 41.448 0 0 0-71.143 0c-18.14 29.696-308.176 357.474-328.412 392.68a39.302 39.302 0 0 0 35.158 59.44h185.002v287.403c0 33.987 27.648 61.538 61.586 61.538h164.28c34.035 0 61.537-27.648 61.537-61.538V633.905h184.125c30.574 0 53.345-30.574 35.45-60.758zM204.52 89.722h657.116a41.106 41.106 0 0 0 0-82.115H204.52a41.106 41.106 0 0 0 0 82.115z" fill="currentColor" p-id="20786"></path></svg> -->
        <svg-icon icon-class="back-top" />
      </div>

      <el-popover placement="left" :close-delay="500" trigger="click">
        <div slot="reference" class="tool-wrapper float__circle-button">
          <svg-icon icon-class="settings" />
        </div>
        <div class="my-setting">
          <div title="切换主题">
            <!-- 太阳按钮 -->
            <i v-if="isDarkMode" class="el-icon-sunny iconRotate" @click="changeColor()"></i>
            <!-- 月亮按钮 -->
            <i v-else class="el-icon-moon" aria-hidden="true" @click="changeColor()"></i>
          </div>
          <div :title="blogLayoutToggleTitle">
            <!-- <i
              :class="blogLayout === 'side' ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
              aria-hidden="true"
              @click="toggleBlogLayout()"
            ></i> -->
            <i>
              <svg-icon aria-hidden="true" @click="toggleBlogLayout()" :icon-class="blogLayout === 'side' ? 'topbar' : 'sidebar'" />
            </i>
          </div>
          <div :title="mouseAnimation ? '关闭点击飘字' : '开启点击飘字'">
            <i class="el-icon-magic-stick" aria-hidden="true" @click="changeMouseAnimation()"></i>
          </div>
          <div title="阅读进度复位">
            <i class="el-icon-reading" aria-hidden="true" @click="toTop()"></i>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 阅读进度条（站点特色，替代 anime 粒子） -->
    <div class="gp-read-progress" aria-hidden="true">
      <div class="gp-read-progress__bar" :style="{ width: readProgress + '%' }"></div>
    </div>

    <!-- <canvas id="search-canvas" class="search-canvas"></canvas> -->

    <!-- 图片预览 -->
    <div id="outerImg">
      <div id="innerImg" style="position:absolute">
        <img id="bigImg" src="" />
      </div>
    </div>

    <el-dialog append-to-body :visible.sync="showLoginSignup" :center="true" :close-on-click-modal="false">
      <login-signup></login-signup>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import LoginSignup from '@/components/LoginSignup/index'
import BlogNavMenu from '@/components/BlogNavMenu/index'
import BlogUserMenu from '@/components/BlogUserMenu/index'
import { getGpWebTitleInfo, selectGpArticlesListByKeyWords, getMostViewedArticle, getClickTextWords } from '@/api/geekplus/geekplus'
import { enableClickFloat, disableClickFloat, setClickFloatWords } from '@/utils/clickFloat'
import { runWhenIdle, cancelIdle } from '@/utils/deferRequest'
import blogLayoutMixin from '@/layout/blog/blogLayoutMixin'
// import '@/utils/TweenMax.min.js';
// import '@/utils/paopaoScript.js';

export default {
  mixins: [blogLayoutMixin],
  components: {
    LoginSignup,
    BlogNavMenu,
    BlogUserMenu
  },
  data() {
    return {
      redirect: undefined,
      isDark: false,
      toolButton: false,
      hoverEnter: false,
      mouseAnimation: false,
      readProgress: 0,
      scrollTop: 0,
      mobile: false,//根据网页宽度判断是否是移动端
      windowHeight: 0,
      windowWidth: 0,
      isDrawerOpen: false, //左侧滑动抽屉导航菜单
      isSearchDrawerOpen: false, //顶部滑动搜索抽屉
      showSearch: false,
      showSearchTips: false,
      showLoginSignup: false, //显示登录注册
      navbarHeight: 60,//默认导航栏高度
      searchQuery: "",// 搜索关键词
      navMenuLit: [
        { name: "kj", path: "/kj", categoryName: "📱 科技社", icon: '', id: 2, children: [{ name: "kj", path: "/xw", categoryName: "📱 新闻", icon: '', id: 21 }, { name: "kjdt", path: "/kjdt", categoryName: "📱 科技动态", icon: '', id: 22 }] },
        { name: "fl", path: "/fl", categoryName: "🎁 福利社", icon: '', id: 3, children: [{ name: "yh", path: "/yh", categoryName: "🎁 优惠", icon: '', id: 31 }, { name: "cj", path: "/cj", categoryName: "🎁 抽奖", icon: '', id: 32 }] },
        { name: "zy", path: "/zy", categoryName: "🧰 资源社", icon: '', id: 4, children: [{ name: "xz", path: "/xz", categoryName: "🧰 下载", icon: '', id: 41 }, { name: "jc", path: "/jc", categoryName: "🧰 教程", icon: '', id: 42 }] },
        { name: "jl", path: "/jl", categoryName: "📝 记录", icon: '', id: 5 },
        { name: "yqlj", path: "/yqlj", categoryName: "👬 友情频道", icon: '', id: 6 },
        // { name: "gyxz", path: "/gyxz", categoryName: "🍺 关于小站", icon: '', id: 7, children: [{ name: "js", path: "/js", categoryName: "介绍", icon: '', id: 71 }, { name: "lxwm", path: "/lxwm", categoryName: "联系我们", icon: '', id: 72 }] },
      ],
      gridData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }],
      iLogo: require("@/assets/logo.png"),
      //网站背景音乐是否在播放
      bgMusicPlaying: false
    }
  },
  created() {
    // this.isDark = this.darkMode != null ? this.darkMode : !this.isDay;
    let navbarStatus = {
      enter: false,
      visible: true,
    };
    this.$store.commit("changeNavbarStatus", navbarStatus);
    this.getWebInfo();
    // 热门文章非首屏关键：idle 后再拉，减轻与首页/正文的瞬时并发
    this._hotIdleId = runWhenIdle(() => {
      this.getMostViewedArticles();
    }, 2200);
    // this.getSysConfig();
    // this.getSortInfo();

    this.updateScreenSize();
  },
  mounted() {
    const savedFloat = localStorage.getItem('gp-click-float')
    if (savedFloat === '1') {
      this.mouseAnimation = true
      this.bootClickFloat()
    }

    window.addEventListener("scroll", this.onScrollPage);
    /* 把window.onresize事件挂在到mounted函数上 */
    window.addEventListener('resize', this.updateScreenSize);
    // window.onresize = () => {return (() => {})();};

    //判断变量是否第一次打开,如果webOpenDialog不存在，就要请求后台通知内容，
    //然后赋值webOpenDialog给cookie，14天后过期删除，再次打开就不会弹出
    // let openDialog=this.getCookie("webOpenDialog");
    // if(!openDialog){
      //打开后,将变量赋值,后续就不会再次出发,除非刷新
      // window.firstOpenDialogFlag = true;
      // getWebPopUpNotice({id: 2}).then(response=>{
      //   response.data.noticeContent;
      // }).catch(error=>{})
      // this.setCookie("webOpenDialog","ok",{ expires: 11 });
    // }
  },
  destroyed() {
    cancelIdle(this._hotIdleId);
    disableClickFloat();
    window.removeEventListener("scroll", this.onScrollPage);
    window.removeEventListener('resize', this.updateScreenSize);
  },
  watch: {
    scrollTop(scrollTop, oldScrollTop) {
      //如果滑动距离超过屏幕高度三分之一视为进入页面，背景改为白色
      let enter = scrollTop > window.innerHeight / 2;
      const top = scrollTop < this.navbarHeight || scrollTop - oldScrollTop < 0;
      let isShow = scrollTop - window.innerHeight > 30;
      this.toolButton = isShow;
      if (isShow && !this.isMobile) {
        if (window.innerHeight > 950) {
          // $(".cd-top").css("top", "0");
        } else {
          // $(".cd-top").css("top", window.innerHeight - 950 + "px");
        }
      } else if (!isShow && !this.isMobile) {
        // $(".cd-top").css("top", "-900px");
      }

      //导航栏显示与颜色
      let navbarStatus = {
        enter: enter,
        visible: top,
      };
      this.$store.commit("changeNavbarStatus", navbarStatus);
    },
    windowWidth(newVal) {
      // 页面宽度小于992px时，操作
    },
    $route: {
      handler(route) {
        this.redirect = (route.query && route.query.redirect) || '/'
      },
      immediate: true,
    }
  },
  computed: {
    nickname() {
      return this.$store.getters.nickname;
    },
    username() {
      return this.$store.getters.username;
    },
    userAvatar() {
      return this.$store.getters.avatar;
    },
    navbar() {
      return this.$store.state.navbar;
    },
    sortInfo() {
      return this.$store.state.sortInfo;
    },
    isMobile() {
      //根据用户浏览设备的用户信息和浏览器窗口大小判断是否是移动设备
      return this.$common.isMobile() || this.$store.state.mobileMode;
    },
    darkMode() {
      return this.$store.state.darkMode;
    },
    isDarkMode() {
      return this.$store.state.darkMode != null ? this.$store.state.darkMode : !this.isDay;
    },
    isDay() {
      return this.isLightDay();
    },
    addNavMenuRoutes() {
      return this.$store.getters.addMenuRoutes;
    },
    navigationMenu() {
      return this.menuToNavMenu(this.navMenuLit);
    },
    keyMenuPath() {
      // console.log(this.$route.path);
      return this.$route.fullPath;
    },
    showLoginDialog() {
      return this.$store.getters.showLogin;
    }
  },
  methods: {
    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen;
    },
    toggleSearch() {
      this.isSearchDrawerOpen = !this.isSearchDrawerOpen;
      // this.showSearch = !this.showSearch;
      // if (this.showSearch) {
      //     this.$nextTick(function () {
      //         this.$refs.searchInputBox.focus();
      //     });
      // }
    },
    getSearchTips() {
      this.showSearchTips = true;
      // this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
    },
    /** BlogNavMenu 导航后关闭抽屉（组件内已 push 路由） */
    onNavMenuNavigate() {
      this.isDrawerOpen = false;
    },
    //菜单标题转换，Tina记一个属性isOpen
    menuToNavMenu(menus) {
      menus.forEach(item => {
        if (item.children && item.children.length > 0) {
          this.$set(item, 'isOpen', false)
        }
      })
      return menus;
    },

    toNavMenu(data) {
      this.$router.push(data, onComplete => { }, onAbort => { });
      this.isDrawerOpen = false;
    },

    /** 拼接父子栏目 path，子项缺失时回退到父 path，避免读 undefined.path */
    navChildPath(parent, child) {
      if (!parent || !parent.path) return "/";
      if (!child || !child.path) return parent.path;
      const p = String(parent.path).replace(/\/$/, "");
      const c = String(child.path).replace(/^\//, "");
      return p + "/" + c;
    },

    navBarLogout() {
      this.logout();
      this.isDrawerOpen = false;
    },

    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } }, onComplete => { }, onAbort => { });
      this.isSearchDrawerOpen = false;
      this.searchQuery = "";
    },

    showUserLogin() {
      this.isDrawerOpen = false;
      this.$router.push({ path: '/user', query: { method: 'login' } });
    },

    //显示登录注册弹出框
    showUserSignin() {
      this.isDrawerOpen = false;
      this.showLoginSignup = true;
    },

    goIm() {
      if (this.$common.isEmpty(this.$store.state.currentUser)) {
        this.$message({
          message: "请先登录！",
          type: "error"
        });
      } else {
        let userToken = this.$common.encrypt(localStorage.getItem("userToken"));
        window.open(this.$constant.imBaseURL + "?userToken=" + userToken + "&defaultStoreType=" + localStorage.getItem("defaultStoreType"));
      }
    },

    goAdmin() {
      window.open(this.$constant.webURL + "/admin");
    },

    logout() {
      this.isDrawerOpen = false;
      this.$confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //this.websocketClose();
        this.$store.dispatch('user/logout').then(() => {
          //location.href = '/';
          // location.reload();
          this.$router.push({ path: this.redirect || '/' })
        })
      })
      // this.$http.get(this.$constant.baseURL + "/user/logout")
      //   .then((res) => {
      //   })
      //   .catch((error) => {
      //     this.$message({
      //       message: error.message,
      //       type: "error"
      //     });
      //   });
      // this.$store.commit("loadCurrentUser", {});
      // localStorage.removeItem("userToken");
      // this.$router.push({ path: '/' });
    },
    getMostViewedArticles() {
      getMostViewedArticle().then((res) => {
        if (!this.$common.isEmpty(res.data)) {
          this.$store.commit("setHotArticleList", res.data);
        }
      })
    },
    getWebInfo() {
      getGpWebTitleInfo({ id: 1 }).then((res) => {
        if (!this.$common.isEmpty(res.data)) {
          this.$store.commit("loadWebInfo", res.data);
        }
      }).catch((error) => {
        this.$message({
          message: error.msg || error,
          type: "error"
        });
      });
    },
    getSysConfig() {
      this.$http.get(this.$constant.baseURL + "/sysConfig/listSysConfig")
        .then((res) => {
          if (!this.$common.isEmpty(res.data)) {
            this.$store.commit("loadSysConfig", res.data);
            this.buildCssPicture();
          }
        })
        .catch((error) => {
          this.$message({
            message: error.message,
            type: "error"
          });
        });
    },
    buildCssPicture() {
      let root = document.querySelector(":root");
      let webStaticResourcePrefix = this.$store.state.sysConfig['webStaticResourcePrefix'];
      root.style.setProperty("--commentURL", "url(" + webStaticResourcePrefix + "assets/commentURL.png)");
      root.style.setProperty("--springBg", "url(" + webStaticResourcePrefix + "assets/springBg.png)");
      root.style.setProperty("--admireImage", "url(" + webStaticResourcePrefix + "assets/admireImage.jpg)");
      root.style.setProperty("--toTop", "url(" + webStaticResourcePrefix + "assets/toTop.png)");
      root.style.setProperty("--bannerWave1", "url(" + webStaticResourcePrefix + "assets/bannerWave1.png) repeat-x");
      root.style.setProperty("--bannerWave2", "url(" + webStaticResourcePrefix + "assets/bannerWave2.png) repeat-x");
      root.style.setProperty("--backgroundPicture", "url(" + webStaticResourcePrefix + "assets/backgroundPicture.jpg)");
      root.style.setProperty("--navbar", "url(" + webStaticResourcePrefix + "assets/navbar.jpg)");
      root.style.setProperty("--love", "url(" + webStaticResourcePrefix + "assets/love.jpg)");
      const font = new FontFace("poetize-font", "url(" + webStaticResourcePrefix + "assets/font.woff2)");
      font.load();
      document.fonts.add(font);
    },
    getSortInfo() {
      this.$http.get(this.$constant.baseURL + "/webInfo/getSortInfo")
        .then((res) => {
          if (!this.$common.isEmpty(res.data)) {
            this.$store.commit("loadSortInfo", res.data);
          }
        })
        .catch((error) => {
          this.$message({
            message: error.message,
            type: "error"
          });
        });
    },
    changeColor() {
      var isDark = !this.isDarkMode;
      // console.log(this.getLocalStore("theme-mode"));
      if (isDark) {
        document.body.setAttribute("theme-mode", "dark");
        this.$store.commit("changeDarkMode", isDark);
        // localStorage.setItem("theme-mode", "dark");
        // this.setCookieStorage("theme-mode", "dark", { expires: 17 });
      } else {
        document.body.removeAttribute("theme-mode", "dark");
        this.$store.commit("changeDarkMode", isDark);
        // localStorage.setItem("theme-mode", "light");
        // this.setCookieStorage("theme-mode", "light", { expires: 17 });
      }
    },
    toTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },
    onScrollPage() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      this.updateReadProgress();
    },
    changeMouseAnimation() {
      this.mouseAnimation = !this.mouseAnimation
      localStorage.setItem('gp-click-float', this.mouseAnimation ? '1' : '0')
      if (this.mouseAnimation) {
        this.bootClickFloat()
        this.$message && this.$message.success('已开启点击飘字')
      } else {
        disableClickFloat()
        this.$message && this.$message.info('已关闭点击飘字')
      }
    },
    bootClickFloat() {
      enableClickFloat()
      getClickTextWords().then((res) => {
        const list = (res && res.data) || []
        setClickFloatWords(list)
      }).catch(() => {})
    },
    updateReadProgress() {
      const doc = document.documentElement
      const scrollTop = window.pageYOffset || doc.scrollTop || 0
      const height = (doc.scrollHeight || 0) - (window.innerHeight || 1)
      this.readProgress = height > 0 ? Math.min(100, Math.round((scrollTop / height) * 100)) : 0
    },
    updateScreenSize() {
      this.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // 高
      this.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; // 宽
      // this.mobile = this.windowWidth < 992;
      this.$store.commit('updateMobileMode', this.windowWidth < 992);
    },
    //修改padding边距，就是导航栏的高度
    changeBodyPaddingTop() {
      this.navbarHeight = this.$refs.navbar ? (this.$refs.navbar.offsetHeight || 60) : 60;
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar_occupy {
  height: 60px;
  position: relative;
}

.drawer-user-center {
  display: flex;
}

.drawer-user-center>.drawer-user-avatar {
  width: 40px;
  height: 40px;
  margin: 0 5px;
  border-radius: 50%;
}

.web-logo {
  width: 25px;
  height: 25px;
  margin-right: 5px;
  border-radius: 50%;
}

.web-title {
  font: caption;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: min(28vw, 180px);
}

/* 顶部滑动抽屉搜索区域 */
.search-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  background: #0a0a0a70;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  z-index: 999;
  padding-top: 3em;
  padding-bottom: 3em;
  transition: all 0.3s ease-in-out;
}

.search-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: slide-top 0.15s both;
}

/* 搜索抽屉：与顶栏/侧栏同一表面，避免旧硬阴影割裂 */
.search-drawer {
  background: transparent;
  flex-direction: column;
  justify-content: center;
  display: flex;
  transform: translateY(-20%);
  transition: transform 0.5s ease-in-out;
  animation: slide-top 0.3s both;
  width: calc(-20px + 100vw);
  max-height: calc(-5em + 100vh);
  max-width: 580px;
  border-radius: var(--gp-surface-radius, 12px);
  background: var(--gp-surface-bg, var(--navbarBackground));
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
  box-shadow: var(--gp-surface-shadow-hover, 0 6px 18px rgba(15, 23, 42, 0.06));
}

.search-drawer.open {
  transform: translateY(0);
}

.search-drawer__main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-drawer__header {
  height: 60px;
  line-height: 60px;
  text-align: center;
}

.search-drawer__close-btn {
  height: 35px;
  width: 100%;
  font-size: 20px;
  cursor: pointer;
}

.search-drawer__close-btn i {
  cursor: pointer;
  transition: all 0.6s;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.search-drawer__close-btn i:hover {
  transform: rotate(180deg);
}

.drawer__search-container {
  padding: 20px;
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

/* 移动端抽屉导航：对齐管理端侧栏表面 Token */
.drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 225px;
  height: 100%;
  background: var(--gp-surface-bg, var(--background-color));
  transform: translateX(-100%);
  transition: transform 0.4s ease;
  box-shadow: var(--gp-nav-shadow, 2px 0 8px rgba(0, 0, 0, 0.2));
  border-right: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
  z-index: 10000;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--gp-surface-bg, var(--navbarBackground));
  border-bottom: 1px solid var(--gp-surface-border, var(--border-color, #ddd));
}

.drawer-header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header-login {
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-menu-login .nav-login-btn {
  display: block;
  height: 22px;
  line-height: 20px;
  margin: 5px auto;
  padding: 0 10px;
  border: 1px solid var(--theme-color);
  color: var(--theme-color);
  border-radius: 22px;
  font-size: 11px;
  cursor: pointer;
}

.nav-menu-login .nav-logout-btn {
  display: block;
  height: 22px;
  line-height: 20px;
  margin: 5px auto;
  padding: 0 10px;
  border: 1px solid #c01919dd;
  color: hsla(8, 77%, 40%, 0.875);
  border-radius: 22px;
  font-size: 11px;
  cursor: pointer;
}

.nav-menu-login .nav-login-btn:hover {
  background-color: var(--background);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  margin: 0 5px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow: auto;
  color: var(--text-color-2, #0a0a0a);
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  position: relative;
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
  border-radius: 8px;
  background: var(--gp-surface-bg, var(--navbarBackground, #f1f1f0));
  &:hover {
    background: #dfdfdf88;
  }
}

.menu-icon {
  margin-right: 5px;
}

.menu-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  white-space: nowrap;
}

.menu-item {
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 1.5s ease-in-out;
}

.submenu {
  width: 100%;
  list-style: none;
  padding: 0 16px;
  margin: 0;
  transition: transform 1s ease;
}

.submenu li {
  margin: 8px 0;
  padding: 0;
  /* background: var(--background-color, #f1f1f0); */
  height: 35px;
  line-height: 35px;
}

.arrow {
  font-size: 12px;
}

/* 左侧滑动抽屉导航菜单结束 */

/* 主内容区：替代 el-container，仅负责顶栏占位 */
.gp-blog-main {
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 40vh;
}

/* 主页面才是区域 */
.main-container {
  height: auto;
  width: 100%;
}

.navbar-content {
  width: 100%;
  height: auto;
  line-height: 60px;
  color: var(--navbarFont);
  background: transparent;
  position: fixed;
  z-index: 100;
  user-select: none;
  transition: all 0.3s ease-in-out;
  padding: 0 14px;
  /* blur 挪到 __bg，避免成为 fixed 下拉的 containing block */
  border-bottom: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
  overflow: visible;
}

.navbar-content__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: var(--gp-surface-bg, var(--navbarBackground));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--gp-nav-shadow, 0 4px 18px rgba(15, 23, 42, 0.06));
  -webkit-box-shadow: var(--gp-nav-shadow, 0 4px 18px rgba(15, 23, 42, 0.06));
}

.navbar-content > .navbar-container {
  position: relative;
  z-index: 1;
}

.navbar-content.enter {
  color: var(--navbarFont);
}

.navbar-content.enter .navbar-content__bg {
  box-shadow: 0 1px 3px 0 rgba(0, 34, 77, 0.05);
}

.navbar-content.hoverEnter .navbar-content__bg {
  background: var(--navbarBackgroundHover);
  box-shadow: 0 1px 3px 0 rgba(0, 34, 77, 0.05);
}

.navbar-title {
  height: 60px;
  cursor: pointer;
  line-height: 60px;
  font-size: 18px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
  min-width: 0;
}

.navbar-mobile-menu {
  font-size: 22px;
  cursor: pointer;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-items: center;
  flex-shrink: 0;
}

.mobile-menu-item {
  margin: 0 10px;
  position: relative;
}

.navbar-header-menu {
  font-size: 22px;
  cursor: pointer;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-items: center;
  /* 右侧操作区不参与挤压，避免菜单把头像挤换行 */
  flex-shrink: 0;
}

.header-menu-item {
  margin: 0 10px;
  position: relative;
  /* 新增居中显示 */
  text-align: center;
  line-height: 1; /* 新增垂直居中显示,lineHeight为1表示行高为1 */
}

.menu-btn {
  position: relative;
  line-height: 1;
  display: grid;
}

/* 顶栏三区：品牌 | 可收缩菜单 | 操作；菜单过多由 BlogNavMenu 溢出折叠 */
.navbar-container.flex-between {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  min-width: 0;
}

.navbar-container.flex-between > a {
  flex-shrink: 0;
  min-width: 0;
}

.desktop-menu-container {
  flex: 1 1 auto;
  min-width: 0;
}

.scroll-menu {
  margin: 0;
  display: flex;
  justify-content: flex-end;
  padding: 0;
  flex-wrap: nowrap;
}

.scroll-menu li {
  list-style: none;
  margin: 0 10px;
  font-size: 15px;
  height: 60px;
  line-height: 60px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.scroll-menu li:hover .my-menu span {
  color: var(--themeBackground);
}

.scroll-menu li:hover .my-menu i {
  color: var(--themeBackground);
  animation: scale 1.5s ease-in-out infinite;
}

.scroll-menu li .my-menu:after {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  height: 6px;
  background-color: var(--themeBackground);
  width: 100%;
  max-width: 0;
  transition: max-width 0.25s ease-in-out;
}

.scroll-menu li:hover .my-menu:after {
  max-width: 100%;
}

.sortMenu {
  margin-left: 44px;
  font-size: 17px;
  position: relative;
}

.sortMenu:after {
  top: 32px;
  width: 35px;
  left: 0;
  height: 2px;
  background: var(--background-color);
  content: "";
  border-radius: 1px;
  position: absolute;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.search-box {
  position: absolute;
  top: 0;
  right: -6px;
  height: 60px;
  line-height: 60px;
  display: inline-flex;
  z-index: inherit;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
}

.search-box .input {
  height: 35px;
  border-radius: 35px;
  padding: 0;
  width: 0px;
  background: none;
  color: transparent;
  border: none;
  outline: none;
  color: var(--text-color-2);
  font-size: 15px;
  /* transform: translate(0, 0); */
  transition: width 0.3s ease-in-out;

  &:focus {
    border: 1px solid var(--border-color);
    outline: none;
  }
}

.search-box.active {
  .input {
    padding: 0 10px;
    width: 220px;
    background: var(--background);
    border: 1px solid var(--border-color-2);
    /* transform: translate(0, 0) scale(1, 1); */
    /* 其他动画样式 */
  }
}

.popover-card {
  position: fixed;
  top: 50px;
}

//.search-box:hover,
//.popover-card:hover {}

/* 网站右下角悬浮工具 */
.tool-button {
  position: fixed;
  right: 20px;
  bottom: 60px;
  animation: slide-bottom 0.5s ease-in-out both;
  z-index: 100;
  cursor: pointer;
  font-size: 25px;
  width: 35px;
  text-align: center;
  transition: all 0.3s ease-in-out;
}

.tool-wrapper {
  line-height: 35px;
  height: 35px;
  width: 35px;
}

.my-setting {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  cursor: pointer;
  font-size: 20px;
}

.my-setting i {
  padding: 5px;
}

.my-setting i:hover {
  color: var(--theme-color);
}

.gp-read-progress {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 3px;
  z-index: 1300;
  pointer-events: none;
  background: transparent;
}

.gp-read-progress__bar {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--theme-color-soft, #9aafb1), var(--theme-color, #6e8b8e));
  transition: width 0.12s ease-out;
}

/* .cd-top {
  background: var(--toTop) no-repeat center;
  position: fixed;
  right: 5vh;
  top: -900px;
  z-index: 99;
  width: 70px;
  height: 900px;
  background-size: contain;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
} */

.backTop {
  transition: all 0.3s ease-in;
  position: relative;
  top: 0;
  left: 0;
  margin-bottom: 10px;
  line-height: 35px;
  height: 35px;
  width: 35px;
}

.backTop:hover {
  top: -10px;
}

#outerImg {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10;
  width: 100%;
  height: 100%;
  display: none;
}

@media screen and (max-width: 400px) {
  .tool-button {
    bottom: 60px;
    right: 8px;
  }
}

// 离开淡出动画
/* .fade-transform {
  &-leave {
    &-active{
      position: absolute;
      width: 100%;
      transition: opacity .5s .2s;
      z-index: 1;
    }
    &-to {
      opacity: 0;
    }
  }
} */
</style>
