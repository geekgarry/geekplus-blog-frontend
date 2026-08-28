/**
 * @module theme
 *
 * 全站主题色公共 API（可移植边界）。实现引擎：utils/elementTheme.js
 *
 * ━━━ 用户改色（单链路）━━━
 *   ThemePicker @change
 *     → Settings.themeChange → commitUserThemeColor(store, color)
 *     → settings/changeSetting → applyThemeColor
 *
 * ━━━ 冷启动 ━━━
 *   根 App.created → initSiteTheme(store, { isDay })
 *
 * ━━━ 维护 ━━━
 *   博客深/浅色：refreshAfterModeChange()
 *   管理端 Element CSS：refreshAfterElementCss()
 *
 * 拆 SPA 说明见 ./README.md
 */

export {
  DEFAULT_THEME,
  ELEMENT_ORIGINAL_THEME,
  THEME_MODE_STORAGE_KEY,
  THEME_SETTING_KEY,
  THEME_STORAGE_KEY,
  CHANGE_SETTING_ACTION,
  SETTINGS_NS,
  normalizeHex
} from './constants'

/** 冷启动：initSiteTheme / bootstrapSiteTheme */
export {
  bootstrapSiteTheme,
  bootstrapElementTheme,
  initSiteTheme,
  initThemeModeFromStorage,
  migrateLegacyThemeColor,
  syncThemeColorToStore
} from './bootstrap'

/** 用户改色：commitUserThemeColor */
export { commitUserThemeColor } from './userChange'

/** 维护：refreshAfterModeChange / refreshAfterElementCss */
export {
  refreshAfterModeChange,
  refreshAfterElementCss,
  reassertElementTheme
} from './maintain'

/** 引擎能力别名：applyThemeColor = applyElementTheme */
export {
  applyElementTheme as applyThemeColor,
  resolveStoredThemeColor,
  bumpElementThemeStyles
} from '@/utils/elementTheme'
