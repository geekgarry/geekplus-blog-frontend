import defaultSettings from '@/settings'
import { applyThemeColor, DEFAULT_THEME, THEME_SETTING_KEY } from '@/theme'
// import sidebarVariables from '@/styles/variables.scss'

/**
 * 站点偏好 settings 模块（博客 blogLayout + 管理端布局项 + 主题色）
 *
 * 主题色契约：
 * - state.themeColor 与 localStorage themeColor 同步（CHANGE_SETTING）
 * - 用户改色：仅 changeSetting + key===themeColor 时调用 applyThemeColor
 * - 冷启动对齐 store 用 commit，不走 action，见 @/theme/bootstrap syncThemeColorToStore
 */
const { showSettings, leftMenuBar, tagsView, fixedHeader, sidebarLogo, webGrey, blogLayout, adminMenuLayout, adminWatermark } = defaultSettings

function readAdminMenuLayout() {
  try {
    const saved = localStorage.getItem('adminMenuLayout')
    if (saved === 'sidebar' || saved === 'topbar' || saved === 'workbench') {
      return saved
    }
    // 兼容旧版 leftMenuBar：1=侧栏，0=顶栏
    const legacy = localStorage.getItem('leftMenuBar')
    if (legacy === '0') return 'topbar'
    if (legacy === '1') return 'sidebar'
  } catch (e) {
    /* ignore */
  }
  return adminMenuLayout || 'sidebar'
}

/** 与 adminMenuLayout 同步，供仍读 leftMenuBar 的旧模板使用 */
function adminMenuLayoutToLeftMenuBar(mode) {
  if (mode === 'topbar') return '0'
  return '1'
}

const state = {
  webGrey: JSON.parse(localStorage.getItem('webGrey')) || webGrey,
  /** 全站主题 hex；键名见 @/theme/constants THEME_SETTING_KEY */
  themeColor: localStorage.getItem(THEME_SETTING_KEY) || DEFAULT_THEME,
  showSettings: showSettings,
  leftMenuBar: localStorage.getItem('leftMenuBar') || (leftMenuBar ? '1' : '0'),
  tagsView: localStorage.getItem('tagsView') || (tagsView ? '1' : '0'),
  fixedHeader: localStorage.getItem('fixedHeader') || (fixedHeader ? '1' : '0'),
  sidebarLogo: localStorage.getItem('sidebarLogo') || (sidebarLogo ? '1' : '0'),
  /** top | side | workbench —— 博客前台 BlogShell 布局偏好 */
  blogLayout: localStorage.getItem('blogLayout') || blogLayout || 'top',
  /** sidebar | topbar | workbench —— 管理端菜单形式 */
  adminMenuLayout: readAdminMenuLayout(),
  /** 管理端水印 */
  adminWatermark: localStorage.getItem('adminWatermark') != null
    ? localStorage.getItem('adminWatermark')
    : (adminWatermark ? '1' : '0'),
  showLogin: false
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
      localStorage.setItem(key, value)
      // adminMenuLayout 变更时同步 leftMenuBar，避免 Navbar/Layout 旧逻辑分叉
      if (key === 'adminMenuLayout') {
        state.leftMenuBar = adminMenuLayoutToLeftMenuBar(value)
        localStorage.setItem('leftMenuBar', state.leftMenuBar)
      }
      // 使用浏览器本地存储；远程全站下发见 utils/siteTheme.js（暂未启用）
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
  /**
   * 通用设置写入。主题色是唯一会触发 applyThemeColor 的 key（用户改色单链路落点）
   * 调用方：ThemePicker → commitUserThemeColor → 本 action
   */
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
    if (data && data.key === THEME_SETTING_KEY && typeof data.value === 'string') {
      // defer:false 立刻覆盖 Element，避免选色后控件仍闪 #409EFF
      applyThemeColor(data.value, { defer: false })
    }
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

