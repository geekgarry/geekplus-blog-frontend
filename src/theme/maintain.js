/**
 * 主题维护链路（不换色，只重算衍生 token 或压过 Element 默认 #409EFF）
 *
 * 与用户改色（commitUserThemeColor）严格分离：
 * - refreshAfterModeChange：body[theme-mode] 变化后 muted/菜单字色依赖明暗，需按同色重算
 * - refreshAfterElementCss：管理端按需 chunk CSS 晚于主题注入时，把 #gp-element-theme-override 挪到 head 末尾
 */
import {
  bumpElementThemeStyles,
  reassertElementTheme
} from '@/utils/elementTheme'

/** 博客顶栏/侧栏、Settings 抽屉切换深/浅色后调用 */
export function refreshAfterModeChange() {
  return reassertElementTheme()
}

/** 管理端 Layout mounted、element-admin 注册组件后调用 */
export function refreshAfterElementCss() {
  bumpElementThemeStyles()
  return reassertElementTheme()
}

/** @deprecated 请用 refreshAfterModeChange / refreshAfterElementCss，语义更清晰 */
export { reassertElementTheme }
