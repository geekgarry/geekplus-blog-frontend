/**
 * 用户改色单链路（管理端 ThemePicker 专用）
 *
 * ThemePicker @change
 *   → Settings.themeChange
 *   → commitUserThemeColor(store, hex)  【本文件】
 *   → settings/changeSetting
 *   → applyThemeColor（写 CSS 变量 + Element 覆盖）
 *
 * 不在此处直接 applyThemeColor，避免与 store action 双写、链路分叉。
 */
import { CHANGE_SETTING_ACTION, THEME_SETTING_KEY } from './constants'

/**
 * 将用户选色提交到 Vuex；持久化与应用由 changeSetting action 内完成
 * @param {import('vuex').Store} store
 * @param {string} color 合法 hex，如 #5f7d80
 * @returns {Promise<any>|void} dispatch 返回值
 */
export function commitUserThemeColor(store, color) {
  if (!store || typeof color !== 'string') return
  return store.dispatch(CHANGE_SETTING_ACTION, {
    key: THEME_SETTING_KEY,
    value: color
  })
}
