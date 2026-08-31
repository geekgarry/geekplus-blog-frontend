import defaultSettings from '@/settings'
import {
  applyThemeColor,
  applyBorderRadius,
  applyBlogSurfaceRadius,
  DEFAULT_THEME,
  THEME_SETTING_KEY,
  BORDER_RADIUS_SETTING_KEY,
  BLOG_SURFACE_RADIUS_SETTING_KEY,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_BLOG_SURFACE_RADIUS,
  normalizeBorderRadius,
  normalizeBlogSurfaceRadius,
  resolveStoredBorderRadius,
  resolveStoredBlogSurfaceRadius
} from '@/theme'

/**
 * 站点偏好 settings 模块（博客 blogLayout + 管理端布局项 + 主题色 + 双轨圆角）
 *
 * 圆角契约：
 * - borderRadius → --gp-border-radius-base（控件）
 * - blogSurfaceRadius → --gp-surface-radius*（前台博客表面）
 */
const {
  showSettings,
  leftMenuBar,
  tagsView,
  fixedHeader,
  sidebarLogo,
  webGrey,
  blogLayout,
  adminMenuLayout,
  adminWatermark,
  borderRadius,
  blogSurfaceRadius
} = defaultSettings

function readAdminMenuLayout() {
  try {
    const saved = localStorage.getItem('adminMenuLayout')
    if (saved === 'sidebar' || saved === 'topbar' || saved === 'workbench') {
      return saved
    }
    const legacy = localStorage.getItem('leftMenuBar')
    if (legacy === '0') return 'topbar'
    if (legacy === '1') return 'sidebar'
  } catch (e) {
    /* ignore */
  }
  return adminMenuLayout || 'sidebar'
}

function adminMenuLayoutToLeftMenuBar(mode) {
  if (mode === 'topbar') return '0'
  return '1'
}

function readBorderRadius() {
  try {
    return resolveStoredBorderRadius()
  } catch (e) {
    return normalizeBorderRadius(borderRadius != null ? borderRadius : DEFAULT_BORDER_RADIUS)
  }
}

function readBlogSurfaceRadius() {
  try {
    return resolveStoredBlogSurfaceRadius()
  } catch (e) {
    return normalizeBlogSurfaceRadius(
      blogSurfaceRadius != null ? blogSurfaceRadius : DEFAULT_BLOG_SURFACE_RADIUS
    )
  }
}

function readBlogLayout() {
  try {
    const raw = localStorage.getItem('blogLayout')
    if (raw === 'side') return 'side'
    if (raw === 'workbench') {
      // 废弃顶栏「应用工作台」替换导航：迁回 top
      localStorage.setItem('blogLayout', 'top')
      return 'top'
    }
    if (raw === 'top') return 'top'
  } catch (e) { /* ignore */ }
  return blogLayout === 'side' ? 'side' : 'top'
}

const state = {
  webGrey: JSON.parse(localStorage.getItem('webGrey')) || webGrey,
  themeColor: localStorage.getItem(THEME_SETTING_KEY) || DEFAULT_THEME,
  /** 控件圆角 px */
  borderRadius: readBorderRadius(),
  /** 博客前台表面圆角 px（--gp-surface-radius） */
  blogSurfaceRadius: readBlogSurfaceRadius(),
  showSettings: showSettings,
  leftMenuBar: localStorage.getItem('leftMenuBar') || (leftMenuBar ? '1' : '0'),
  tagsView: localStorage.getItem('tagsView') || (tagsView ? '1' : '0'),
  fixedHeader: localStorage.getItem('fixedHeader') || (fixedHeader ? '1' : '0'),
  sidebarLogo: localStorage.getItem('sidebarLogo') || (sidebarLogo ? '1' : '0'),
  /** top | side —— 前台外壳；历史 workbench 已迁回 top */
  blogLayout: readBlogLayout(),
  adminMenuLayout: readAdminMenuLayout(),
  adminWatermark: localStorage.getItem('adminWatermark') != null
    ? localStorage.getItem('adminWatermark')
    : (adminWatermark ? '1' : '0'),
  showLogin: false
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      let next = value
      if (key === BORDER_RADIUS_SETTING_KEY) next = normalizeBorderRadius(value)
      else if (key === BLOG_SURFACE_RADIUS_SETTING_KEY) next = normalizeBlogSurfaceRadius(value)
      else if (key === 'blogLayout') {
        // 拒绝再写入 workbench
        next = value === 'side' ? 'side' : 'top'
      }
      state[key] = next
      localStorage.setItem(key, next)
      if (key === 'adminMenuLayout') {
        state.leftMenuBar = adminMenuLayoutToLeftMenuBar(value)
        localStorage.setItem('leftMenuBar', state.leftMenuBar)
      }
    }
  },
  SWITCH_MENU_BAR: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
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
    if (!data || !data.key) return
    if (data.key === THEME_SETTING_KEY && typeof data.value === 'string') {
      applyThemeColor(data.value, { defer: false })
      return
    }
    if (data.key === BORDER_RADIUS_SETTING_KEY) {
      applyBorderRadius(data.value)
      return
    }
    if (data.key === BLOG_SURFACE_RADIUS_SETTING_KEY) {
      applyBlogSurfaceRadius(data.value)
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
