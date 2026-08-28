/**
 * 主题模块契约常量
 *
 * 拆成「仅博客 SPA / 仅管理端 SPA」时，只要复制相同键名，localStorage 与 Vuex 即可互通。
 * 业务代码应 import 本文件或 @/theme，不要硬编码 'themeColor' 字符串。
 */
export {
  DEFAULT_THEME,
  ELEMENT_ORIGINAL_THEME,
  normalizeHex
} from '@/utils/elementTheme'

/** localStorage 键；与 settings 模块 CHANGE_SETTING 写入键、public/index.html FOUC 占位一致 */
export const THEME_STORAGE_KEY = 'themeColor'

/** body[theme-mode] 属性名；与 store darkMode、changeDarkMode mutation 同步 */
export const THEME_MODE_STORAGE_KEY = 'theme-mode'

/** Vuex settings 模块 namespace（namespaced: true） */
export const SETTINGS_NS = 'settings'

/** settings.state 上主题色字段名 */
export const THEME_SETTING_KEY = 'themeColor'

/** 用户改色唯一 dispatch 路径：ThemePicker → commitUserThemeColor → 此 action */
export const CHANGE_SETTING_ACTION = 'settings/changeSetting'
