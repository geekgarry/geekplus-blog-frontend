/**
 * 可移植 HTTP 请求工厂（与 UI 框架解耦）
 *
 * - 仅依赖 axios + 注入的 ui / getToken / errorCode
 * - Element / Ant Design Vue / Naive / 自研 Toast：换 ui 适配器即可
 * - 能力：鉴权头、业务码、错误去重、401 单例、可选 retry、切后台续传、in-flight 去重
 *
 * @example
 * import axios from 'axios'
 * import { createRequest } from '@/utils/http/createRequest'
 * import { createElementUiAdapter } from '@/utils/http/ui.element'
 * const request = createRequest({
 *   axios,
 *   baseURL: process.env.VUE_APP_BASE_API,
 *   getToken: () => Cookies.get('Admin-Token'),
 *   ui: createElementUiAdapter({ Message, MessageBox }),
 *   onRelogin: () => store.dispatch('user/logout').then(() => { location.href = '/login' })
 * })
 */

import {
  isPageVisible as defaultIsPageVisible,
  waitUntilPageVisible as defaultWaitUntilPageVisible
} from './pageVisibility'

const DEFAULT_AUTH_CODES = [401, 403, 208, 214, 215, 219, 206]
const DEFAULT_BIZ_ERROR_CODES = [400, 404, 429, 209, 409, 415, 500, 501, 502, 503, 504]

const DEFAULT_ERROR_CODE = {
  401: '认证失败，无法访问系统资源',
  403: '没有权限，请联系管理员授权',
  404: '资源不存在',
  429: '请求过于频繁或配额不足，请稍后重试',
  500: '服务器内部错误，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务不可用，请稍后重试',
  504: '网关超时，请稍后重试',
  default: '系统未知错误,请反馈给管理员'
}

/** 无 UI 时的兜底：console + confirm，保证非 Element 项目也能跑 */
function createFallbackUi() {
  return {
    showError(msg) {
      if (typeof console !== 'undefined') console.error('[http]', msg)
    },
    confirmRelogin({ title, message, confirmText }) {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        const ok = window.confirm(`${title}\n${message}\n\n${confirmText || '确定'}？`)
        return ok ? Promise.resolve() : Promise.reject(new Error('cancel'))
      }
      return Promise.resolve()
    }
  }
}

/**
 * @param {object} options
 * @param {import('axios').AxiosStatic|Function} options.axios axios 实例或库
 * @param {string} [options.baseURL]
 * @param {number} [options.timeout=25000]
 * @param {() => string|null|undefined} [options.getToken]
 * @param {string} [options.tokenHeader='Plus-Token'] 鉴权请求头名（可改 Authorization）
 * @param {(token:string)=>string} [options.formatToken] 如 t => `Bearer ${t}`
 * @param {Record<string|number,string>} [options.errorCode]
 * @param {number[]} [options.authCodes] 业务层视为登录失效的 code
 * @param {number[]} [options.businessErrorCodes] 业务失败 code（提示后 reject）
 * @param {{ showError?: Function, confirmRelogin?: Function }} [options.ui]
 * @param {() => (void|Promise<void>)} [options.onRelogin] 用户确认重新登录后的回调
 * @param {() => (void|Promise<void>)} [options.onReloginCancel] 用户点取消：应清本地 token，让页面以游客继续
 * @param {string} [options.reloginTitle]
 * @param {string} [options.reloginMessage]
 * @param {string} [options.reloginConfirmText]
 * @param {string} [options.reloginCancelText]
 * @param {() => boolean} [options.isPageVisible]
 * @param {(ms?:number)=>Promise<void>} [options.waitUntilPageVisible]
 * @param {object} [options.axiosConfig] 传给 axios.create 的其余项
 */
export function createRequest(options = {}) {
  const axiosLib = options.axios
  if (!axiosLib || typeof axiosLib.create !== 'function') {
    throw new Error('[createRequest] options.axios 必填（传入 axios 库）')
  }

  const getToken = typeof options.getToken === 'function' ? options.getToken : () => null
  const tokenHeader = options.tokenHeader || 'Plus-Token'
  const formatToken = typeof options.formatToken === 'function'
    ? options.formatToken
    : (t) => t

  const errorCode = Object.assign({}, DEFAULT_ERROR_CODE, options.errorCode || {})
  const authCodes = options.authCodes || DEFAULT_AUTH_CODES
  const businessErrorCodes = options.businessErrorCodes || DEFAULT_BIZ_ERROR_CODES

  const ui = Object.assign(createFallbackUi(), options.ui || {})
  const onRelogin = typeof options.onRelogin === 'function' ? options.onRelogin : null
  const onReloginCancel =
    typeof options.onReloginCancel === 'function' ? options.onReloginCancel : null

  const isPageVisible = options.isPageVisible || defaultIsPageVisible
  const waitUntilPageVisible = options.waitUntilPageVisible || defaultWaitUntilPageVisible

  const reloginTitle = options.reloginTitle || '退出登录'
  const reloginMessage = options.reloginMessage || '未登录, 需要重新登录'
  const reloginConfirmText = options.reloginConfirmText || '重新登录'
  const reloginCancelText = options.reloginCancelText || '取消'

  if (axiosLib.defaults && axiosLib.defaults.headers) {
    axiosLib.defaults.headers['Content-Type'] =
      axiosLib.defaults.headers['Content-Type'] || 'application/json;charset=utf-8'
  }

  const pendingRequests = new Map()
  const service = axiosLib.create(
    Object.assign(
      {
        baseURL: options.baseURL,
        timeout: options.timeout != null ? options.timeout : 25000
      },
      options.axiosConfig || {}
    )
  )

  let isReloginShowing = false
  /** 用户点「取消」后抑制重复弹窗，直到重新拿到有效 token */
  let authPromptSuppressed = false
  let lastTipAt = 0
  let lastTipMsg = ''

  const getRequestKey = (config) => {
    const { method, url, params, data } = config
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const resolveMessage = (code, res) => {
    return (
      (res && (res.msg || res.message)) ||
      errorCode[code] ||
      errorCode[String(code)] ||
      errorCode.default
    )
  }

  function tipError(msg, duration = 3000) {
    if (!msg) return
    if (!isPageVisible()) return
    const now = Date.now()
    if (msg === lastTipMsg && now - lastTipAt < 2500) return
    lastTipMsg = msg
    lastTipAt = now
    if (typeof ui.showError === 'function') {
      ui.showError(msg, duration)
    }
  }

  function clearLocalAuthQuietly() {
    if (!onReloginCancel) return Promise.resolve()
    return Promise.resolve()
      .then(() => onReloginCancel())
      .catch(() => {})
  }

  function showReloginConfirm() {
    // 重新登录成功后 getToken 有值，解除抑制
    if (authPromptSuppressed) {
      if (getToken()) {
        authPromptSuppressed = false
      } else {
        return
      }
    }
    if (isReloginShowing) return
    if (!isPageVisible()) {
      const once = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', once)
          showReloginConfirm()
        }
      }
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', once)
      }
      return
    }
    isReloginShowing = true
    const finish = () => {
      setTimeout(() => {
        isReloginShowing = false
      }, 400)
    }
    const runLogout = () => {
      authPromptSuppressed = false
      if (!onRelogin) return Promise.resolve()
      return Promise.resolve().then(() => onRelogin()).catch(() => {})
    }
    const runCancel = () => {
      // 取消：清本地登录态，抑制后续 401 弹窗，页面可继续以游客加载公开内容
      authPromptSuppressed = true
      return clearLocalAuthQuietly()
    }

    const confirmFn = ui.confirmRelogin
    if (typeof confirmFn !== 'function') {
      runLogout().finally(finish)
      return
    }

    Promise.resolve(
      confirmFn({
        title: reloginTitle,
        message: reloginMessage,
        confirmText: reloginConfirmText,
        cancelText: reloginCancelText
      })
    )
      .then(() => runLogout())
      .catch(() => runCancel())
      .finally(finish)
  }

  function isAuthCode(code) {
    return authCodes.indexOf(code) > -1
  }

  function isRetriableError(error) {
    if (!error) return false
    const status = error.response && error.response.status
    if (status === 401 || status === 403) return false
    if (error.isAuthError) return false
    if (error.code === 'ECONNABORTED') return true
    if (error.message === 'Network Error') return true
    if (typeof error.message === 'string' && error.message.includes('timeout')) return true
    if (!error.response && error.request) return true
    return false
  }

  service.interceptors.request.use(
    (config) => {
      const headers = config.headers || (config.headers = {})
      // headers.isToken === false 时跳过鉴权头（公开接口）
      const skipToken = headers.isToken === false
      const token = getToken()
      if (token && !skipToken) {
        headers[tokenHeader] = formatToken(token)
      }
      if (!headers['Cache-Control']) {
        headers['Cache-Control'] = 'no-cache'
        headers.Pragma = 'no-cache'
      }
      if (typeof config.retry !== 'number') {
        config.retry = 0
      }
      if (config.resumeOnVisible == null) {
        const m = (config.method || 'get').toLowerCase()
        config.resumeOnVisible = m === 'get' || m === 'head'
      }
      return config
    },
    (error) => {
      tipError('请求发送失败')
      return Promise.reject(error)
    }
  )

  service.interceptors.response.use(
    (response) => {
      const res = response.data !== undefined ? response.data : response
      if (response.config && response.config.deduplicate !== false) {
        pendingRequests.delete(getRequestKey(response.config))
      }

      const status = response.status
      const code = res && res.code !== undefined ? res.code : status
      const message = resolveMessage(code, res)

      if (isAuthCode(code)) {
        showReloginConfirm()
        const err = new Error(message)
        err.isHandled = true
        err.isAuthError = true
        return Promise.reject(err)
      }

      if (businessErrorCodes.indexOf(code) > -1) {
        if (!response.config || !response.config.__suppressErrorTip) {
          tipError(message)
        }
        const err = new Error(message || 'Error')
        err.isHandled = true
        return Promise.reject(err)
      }

      return res
    },
    (error) => {
      const { message = '', response, config = {} } = error
      if (config && config.deduplicate !== false) {
        pendingRequests.delete(getRequestKey(config))
      }
      const status = response && response.status
      const resData = response && response.data
      const statusText =
        status != null ? errorCode[status] || errorCode[String(status)] : ''
      let errorMsg =
        (resData && resData.msg) ||
        statusText ||
        (resData && resData.message) ||
        errorCode.default

      if (
        error.code === 'ECONNABORTED' ||
        (typeof message === 'string' && message.includes('timeout'))
      ) {
        errorMsg = '系统接口请求超时'
      } else if (message === 'Network Error') {
        errorMsg = '后端接口连接异常'
      }

      const rejectHandled = (msg, extra = {}) => {
        const err = new Error(msg)
        err.isHandled = true
        err.response = response
        Object.assign(err, extra)
        return Promise.reject(err)
      }

      if (status === 401 || status === 403) {
        showReloginConfirm()
        return rejectHandled(errorMsg, { isAuthError: true })
      }

      if (!config.__suppressErrorTip) {
        tipError(errorMsg, 4000)
      }
      return rejectHandled(errorMsg)
    }
  )

  /**
   * @param {object} config axios 配置
   * @param {number} [config.retry=0]
   * @param {boolean} [config.resumeOnVisible] GET/HEAD 默认 true
   * @param {number} [config.resumeBudget=3]
   * @param {boolean} [config.deduplicate=true]
   * @param {boolean} [config.headers.isToken] false 时不带 token
   */
  async function request(config) {
    const requestKey = getRequestKey(config)
    const method = (config.method || 'get').toLowerCase()
    const maxRetry = typeof config.retry === 'number' ? config.retry : 0
    const resumeOnVisible =
      config.resumeOnVisible !== false && (method === 'get' || method === 'head')
    const resumeBudget =
      typeof config.resumeBudget === 'number' ? config.resumeBudget : 3

    if (config.deduplicate !== false && pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)
    }

    const runner = (async () => {
      let attempt = 0
      let resumeUsed = 0
      while (true) {
        const willExplicitRetry = attempt < maxRetry
        let hiddenDuringFlight = !isPageVisible()
        const markHidden = () => {
          if (
            typeof document !== 'undefined' &&
            document.visibilityState === 'hidden'
          ) {
            hiddenDuringFlight = true
          }
        }
        if (typeof document !== 'undefined') {
          document.addEventListener('visibilitychange', markHidden)
        }
        try {
          if (resumeOnVisible && !isPageVisible()) {
            await waitUntilPageVisible()
            await sleep(200)
          }
          return await service({
            ...config,
            __suppressErrorTip:
              willExplicitRetry || (resumeOnVisible && resumeUsed < resumeBudget)
          })
        } catch (err) {
          attempt += 1

          if (
            resumeOnVisible &&
            resumeUsed < resumeBudget &&
            isRetriableError(err) &&
            (hiddenDuringFlight || !isPageVisible())
          ) {
            resumeUsed += 1
            await waitUntilPageVisible()
            await sleep(280 + resumeUsed * 120)
            continue
          }

          const canRetry =
            attempt <= maxRetry &&
            (method === 'get' || method === 'head') &&
            isRetriableError(err)
          if (!canRetry) {
            if (
              (willExplicitRetry || resumeUsed > 0) &&
              err &&
              err.message &&
              !err.isAuthError
            ) {
              tipError(err.message, 4000)
            }
            throw err
          }
          await sleep(400 * attempt)
        } finally {
          if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', markHidden)
          }
        }
      }
    })()

    if (config.deduplicate !== false) {
      pendingRequests.set(requestKey, runner)
      runner.finally(() => {
        if (pendingRequests.get(requestKey) === runner) {
          pendingRequests.delete(requestKey)
        }
      })
    }

    return runner
  }

  // 便于调试或扩展拦截器
  request.service = service
  request.tipError = tipError
  return request
}

export default createRequest
