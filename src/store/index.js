import Vue from "vue";
import Vuex from "vuex";
import getters from './getters'

Vue.use(Vuex);

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

export default new Vuex.Store({
  state: {
    navbar: JSON.parse(localStorage.getItem("navbar") || '{"visible": false, "enter": true}'),
    sortInfo: JSON.parse(localStorage.getItem("sortInfo") || '[]'),
    currentUser: JSON.parse(localStorage.getItem("currentUser") || '{}'),
    currentAdmin: JSON.parse(localStorage.getItem("currentAdmin") || '{}'),
    sysConfig: JSON.parse(localStorage.getItem("sysConfig") || '{}'),
    hotArticleList: JSON.parse(localStorage.getItem("hotArticleList") || '[]'),
    webInfo: JSON.parse(localStorage.getItem("webInfo") || '{"gpWebName": "极客普拉斯", "gpWebTitle": "", "notices": [], "randomCover": [], "footer": "", "backgroundImage": "", "avatar": ""}'),
    darkMode: localStorage.getItem("theme-mode") ? (localStorage.getItem("theme-mode") === "dark" ? true : false) : null,
    mobileMode: window.innerWidth < 992
  },
  getters: {
    articleTotal: state => {
      if (state.sortInfo !== null && state.sortInfo.length !== 0) {
        if (state.sortInfo.length === 1) {
          return state.sortInfo[0].countOfSort;
        } else {
          return state.sortInfo.reduce((prev, curr) => {
            if (typeof prev === "number") {
              return prev + curr.countOfSort;
            } else {
              return prev.countOfSort + curr.countOfSort;
            }
          });
        }
      } else {
        return 0;
      }
    },
    navigationBar: state => {
      if (state.sortInfo !== null && state.sortInfo.length !== 0) {
        return state.sortInfo.filter(f => f.sortType === 0);
      } else {
        return [];
      }
    },
    hotArticleList: state => state.hotArticleList,
    ...getters
  },
  mutations: {
    changeNavbarStatus(state, navbarState) {
      state.navbar = navbarState;
      localStorage.setItem("navbar", JSON.stringify(navbarState));
    },
    loadSortInfo(state, sortInfo) {
      if (sortInfo !== null && sortInfo.length !== 0) {
        state.sortInfo = sortInfo.sort((s1, s2) => s1.priority - s2.priority);
        localStorage.setItem("sortInfo", JSON.stringify(sortInfo.sort((s1, s2) => s1.priority - s2.priority)));
      }
    },
    loadCurrentUser(state, user) {
      state.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
    },
    loadSysConfig(state, sysConfig) {
      state.sysConfig = sysConfig;
      localStorage.setItem("sysConfig", JSON.stringify(sysConfig));
    },
    loadCurrentAdmin(state, user) {
      state.currentAdmin = user;
      localStorage.setItem("currentAdmin", JSON.stringify(user));
    },
    setHotArticleList(state, hotArticleList) {
      state.hotArticleList = hotArticleList;
      localStorage.setItem("hotArticleList", JSON.stringify(hotArticleList));
    },
    loadWebInfo(state, webInfo) {
      state.webInfo = webInfo;
      localStorage.setItem("webInfo", JSON.stringify(webInfo));
    },
    changeDarkMode(state, darkMode) {
      state.darkMode = darkMode;
      if (darkMode)
        localStorage.setItem("theme-mode", "dark");
      else
        localStorage.setItem("theme-mode", "light");
    },
    updateMobileMode(state, mobileMode) {
      state.mobileMode = mobileMode;
    }
  },
  actions: {},
  modules: modules
});
