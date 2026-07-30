/**
 * 页面可见性（可移植，无 UI 依赖）
 * 桌面切标签 / 手机切 App → document.hidden
 */

export function isPageVisible() {
  if (typeof document === 'undefined') return true
  return document.visibilityState !== 'hidden'
}

/**
 * 等到页面重新可见，或网络恢复且已可见。
 * @param {number} [timeoutMs=180000]
 */
export function waitUntilPageVisible(timeoutMs = 180000) {
  if (isPageVisible()) return Promise.resolve()
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('online', onOnline)
      resolve()
    }
    const onVis = () => {
      if (document.visibilityState === 'visible') finish()
    }
    const onOnline = () => {
      if (isPageVisible()) finish()
    }
    const timer = setTimeout(finish, timeoutMs)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('online', onOnline)
  })
}
