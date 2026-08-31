/**
 * @module theme
 *
 * 全站主题色 + 圆角公共 API（可移植边界）。实现引擎：utils/elementTheme.js、theme/borderRadius.js
 *
 * ━━━ 用户改色（单链路）━━━
 *   ThemePicker @change
 *     → Settings.themeChange → commitUserThemeColor(store, color)
 *     → settings/changeSetting → applyThemeColor
 *
 * ━━━ 圆角双轨 ━━━
 *   Settings 控件圆角 → applyBorderRadius → --gp-border-radius-base
 *   Settings 博客圆角 → applyBlogSurfaceRadius → --gp-surface-radius*
 *   冷启动：applySiteRadii()
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

export {
  BORDER_RADIUS_SETTING_KEY,
  BLOG_SURFACE_RADIUS_SETTING_KEY,
  BORDER_RADIUS_OPTIONS,
  BLOG_SURFACE_RADIUS_OPTIONS,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_BLOG_SURFACE_RADIUS,
  normalizeBorderRadius,
  normalizeBlogSurfaceRadius,
  normalizeRadiusPx,
  resolveStoredBorderRadius,
  resolveStoredBlogSurfaceRadius,
  applyBorderRadius,
  applyBlogSurfaceRadius,
  applySiteRadii
} from './borderRadius'

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
