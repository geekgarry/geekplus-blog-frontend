/**
 * 非 Element 项目示例适配器（可复制后改成 Ant Design Vue / Naive / Vant / 自研 Toast）
 *
 * Ant Design Vue 3 示例：
 *   import { message, Modal } from 'ant-design-vue'
 *   export function createAntdvUiAdapter() {
 *     return {
 *       showError(msg, duration = 3000) {
 *         message.error(msg, duration / 1000)
 *       },
 *       confirmRelogin({ title, message: content, confirmText, cancelText }) {
 *         return new Promise((resolve, reject) => {
 *           Modal.confirm({
 *             title,
 *             content,
 *             okText: confirmText,
 *             cancelText,
 *             onOk: () => resolve(),
 *             onCancel: () => reject(new Error('cancel'))
 *           })
 *         })
 *       }
 *     }
 *   }
 */

/** 纯 console + window.confirm，零 UI 依赖，便于单测或无 UI 脚手架 */
export function createConsoleUiAdapter() {
  return {
    showError(msg) {
      if (typeof console !== 'undefined') console.error('[http]', msg)
    },
    confirmRelogin({ title, message, confirmText }) {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        const ok = window.confirm(`${title}\n${message}`)
        return ok ? Promise.resolve() : Promise.reject(new Error('cancel'))
      }
      return Promise.resolve()
    }
  }
}

export default createConsoleUiAdapter
