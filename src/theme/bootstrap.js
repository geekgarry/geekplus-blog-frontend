/**
 * 主题冷启动（根 App.created 专用）
 *
 * 顺序不可颠倒：
 * 1. initThemeModeFromStorage — 先写 body[theme-mode]，引擎内 mutedFrom 才分得清明暗
 * 2. bootstrapSiteTheme — 迁移旧色 → 对齐 store → applyElementTheme(defer)
 *
 * 一体 SPA / 仅博客 / 仅管理端均只调 initSiteTheme(store, { isDay })。
 */
import {
  applyElementTheme,
  DEFAULT_THEME,
  resolveStoredThemeColor
} from '@/utils/elementTheme'
import {
  SETTINGS_NS,
  THEME_MODE_STORAGE_KEY,
  THEME_SETTING_KEY,
  THEME_STORAGE_KEY
} from './constants'

/** 历史默认色；命中则迁到 DEFAULT_THEME，避免老用户 localStorage 残留 */
const LEGACY_THEME_RE = /^#(0badb6|13c2c2|6e8b8e)$/i

/**
 * 仅写 localStorage，不触发 Vuex / CSS
 * 在首屏 apply 之前统一修正存储值
 */
export function migrateLegacyThemeColor() {
  if (typeof localStorage === 'undefined') return
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (!stored || LEGACY_THEME_RE.test(stored)) {
      localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME)
    }
  } catch (e) { /* SSR / 隐私模式 */ }
}

/**
 * 把 localStorage 中的色同步到 settings.themeColor
 * 用 commit 而非 dispatch，避免冷启动误走 changeSetting 里的 apply（由 bootstrap 统一 apply 一次）
 */
export function syncThemeColorToStore(store) {
  if (!store || !store.state.settings) return
  const color = resolveStoredThemeColor()
  if (store.state.settings[THEME_SETTING_KEY] !== color) {
    store.commit(`${SETTINGS_NS}/CHANGE_SETTING`, {
      key: THEME_SETTING_KEY,
      value: color
    })
  }
}

/**
 * 冷启动写 CSS 变量：defer 空闲再拉 Element chalk，不挡首屏
 * 勿在用户改色链路中调用
 */
export function bootstrapSiteTheme(store) {
  if (typeof document === 'undefined') return
  migrateLegacyThemeColor()
  syncThemeColorToStore(store)
  applyElementTheme(resolveStoredThemeColor(), { defer: true })
}

/**
 * 恢复深浅色模式到 DOM（与 store changeDarkMode / localStorage theme-mode 一致）
 * @param {{ isDay?: boolean }} [options] 无缓存时：白天默认亮色，夜间默认 dark
 */
export function initThemeModeFromStorage(options = {}) {
  if (typeof document === 'undefined') return
  const isDay = options.isDay !== false
  const key = THEME_MODE_STORAGE_KEY
  const themeMode = localStorage.getItem(key)
  if (themeMode) {
    if (themeMode.includes('dark')) {
      document.body.setAttribute(key, themeMode)
    } else if (themeMode.includes('light')) {
      document.body.removeAttribute(key)
    }
  } else if (isDay) {
    document.body.removeAttribute(key)
  } else {
    document.body.setAttribute(key, 'dark')
  }
}

/**
 * 根组件 created 唯一入口（先于 BlogShell / 管理端 Layout 渲染）
 * @param {import('vuex').Store} store
 * @param {{ isDay?: boolean }} [options] 传给 initThemeModeFromStorage
 */
export function initSiteTheme(store, options = {}) {
  initThemeModeFromStorage(options)
  bootstrapSiteTheme(store)
}

/** @deprecated 与 bootstrapSiteTheme 相同，保留兼容旧 import */
export const bootstrapElementTheme = bootstrapSiteTheme
