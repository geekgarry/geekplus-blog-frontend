/**
 * Element UI 适配器：把 Message / MessageBox 接到可移植 createRequest。
 * 非 Element 项目请改用 ui.naive.js / ui.antdv.js 或自写 showError + confirmRelogin。
 *
 * @param {object} deps
 * @param {Function} deps.Message element-ui Message
 * @param {Function} deps.MessageBox element-ui MessageBox
 */
export function createElementUiAdapter(deps = {}) {
  const Message = deps.Message
  const MessageBox = deps.MessageBox

  return {
    showError(msg, duration = 3000) {
      if (typeof Message === 'function') {
        Message({ message: msg, type: 'error', duration })
        return
      }
      if (typeof console !== 'undefined') console.error('[http]', msg)
    },
    /**
     * @returns {Promise} resolve=确认重新登录；reject=取消
     */
    confirmRelogin({ title, message, confirmText, cancelText }) {
      if (!MessageBox || typeof MessageBox.confirm !== 'function') {
        return Promise.resolve()
      }
      return MessageBox.confirm(message, title, {
        confirmButtonText: confirmText || '重新登录',
        cancelButtonText: cancelText || '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      })
    }
  }
}

export default createElementUiAdapter
