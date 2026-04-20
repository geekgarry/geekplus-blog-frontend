import defaultSettings from '@/settings'
import variables from '@/styles/element-variables.module.scss'
// import sidebarVariables from '@/styles/variables.scss'

const { showSettings, leftMenuBar, tagsView, fixedHeader, sidebarLogo, webGrey } = defaultSettings

const state = {
  webGrey: JSON.parse(localStorage.getItem('webGrey')) || webGrey,
  themeColor: localStorage.getItem('themeColor') || variables.themeColor, //|| '#0badb6'
  showSettings: showSettings,
  leftMenuBar: localStorage.getItem('leftMenuBar') || (leftMenuBar ? '1' : '0'),
  tagsView: localStorage.getItem('tagsView') || (tagsView ? '1' : '0'),
  fixedHeader: localStorage.getItem('fixedHeader') || (fixedHeader ? '1' : '0'),
  sidebarLogo: localStorage.getItem('sidebarLogo') || (sidebarLogo ? '1' : '0'),
  showLogin: false
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
      localStorage.setItem(key,value)
      //使用浏览器本地存储保存设置，你也可以使用后端redis等缓存保存设置
    }
  },
  SWITCH_MENU_BAR: (state, { key, value }) => {
    if (state.hasOwnProperty(key)){
      state[key] = value
    }
  },
  SHOW_LOGIN: (state, value) => {
    state.showLogin = value
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  switchMenuBar({ commit }, data) {
    commit('SWITCH_MENU_BAR', data)
  },
  showLogin({ commit }, data) {
    commit('SHOW_LOGIN', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

