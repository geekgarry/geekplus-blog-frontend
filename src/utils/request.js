/**
 * 请求封装：统一鉴权头、错误提示、可选重试。
 * 注意：默认不重试；登录失效弹窗全局去重，避免并发 401 刷屏。
 */
import axios from 'axios'
// 与 permission.js 一致走 lib 深路径，避免与全量 Element / babel-plugin-component 冲突
import { Notification, MessageBox, Message, Loading } from 'element-ui'
const _Message = Message;
import store from '@/store'
import errorCode from '@/utils/errorCode'
import { getToken } from '@/utils/auth'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
const pendingRequests = new Map()

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 25000
})

/** 登录失效弹窗单例，防止多接口同时 401 弹出多个框 */
let isReloginShowing = false
/** 短时间内相同错误文案只提示一次 */
let lastTipAt = 0
let lastTipMsg = ''

const getRequestKey = config => {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function tipError(msg, duration = 3000) {
  if (!msg) return
  const now = Date.now()
  if (msg === lastTipMsg && now - lastTipAt < 2500) return
  lastTipMsg = msg
  lastTipAt = now
  _Message({ message: msg, type: 'error', duration })
}

function showReloginConfirm() {
  if (isReloginShowing) return
  isReloginShowing = true
  MessageBox.confirm('未登录, 需要重新登录', '退出登录', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
    distinguishCancelAndClose: true
  }).then(() => {
    store.dispatch('user/logout').then(() => {
      location.href = '/user'
    })
  }).catch(() => {
    // 取消不跳转
  }).finally(() => {
    // 稍延后解锁，避免同一波并发再次弹
    setTimeout(() => {
      isReloginShowing = false
    }, 800)
  })
}

function isAuthCode(code) {
  return [401, 403, 208, 214, 215, 219, 206].includes(code)
}

function isRetriableError(error) {
  if (!error) return false
  // 鉴权失败不重试
  const status = error.response && error.response.status
  if (status === 401 || status === 403) return false
  if (error.isAuthError) return false
  // 仅网络类 / 超时可重试（且调用方显式开启 retry）
  if (error.code === 'ECONNABORTED') return true
  if (error.message === 'Network Error') return true
  if (typeof error.message === 'string' && error.message.includes('timeout')) return true
  // 无响应的网络中断
  if (!error.response && error.request) return true
  return false
}

service.interceptors.request.use(
  config => {
    // 是否需要设置 token store.getters.token
    //这里是判断isToken的true/false：首先获取headers判断是否存在，假定不存在则为空对象{}，此时取isToken不存在，为空。此时===false的判断就永远为false；
    //而最后getToken() && isToken的判断取决于getToken()=true则为true，否则为false
    //下面是假定config.headers存在：如果设置了headers.isToken=false,此时===false判断为true，下面的getToken() && !isToken就永远为false；
    //如果设置了headers.isToken=true，此时===false判断为false，所以getToken() && !isToken的判断取决于getToken()=true则判断为true，否则为false
    const isToken = (config.headers || {}).isToken === false
    //判断是否需要将cookie值加上请求头，开启验证授权访问，这里isToken是在apiJS文件中写的请求头headers:{'isToken':true/false}
    if (getToken() && !isToken) {
      // let each request carry token
      // ['Plus-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Plus-Token'] = getToken() //'Bearer ' +  让每个请求携带自定义token 请根据实际情况自行修改
    }
    if (config.headers && !config.headers['Cache-Control']) {
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    }
    // 默认不重试：避免超时连弹「系统接口请求超时」；需要时在 api 里显式 retry: 1
    if (typeof config.retry !== 'number') {
      config.retry = 0
    }
    return config
  },
  error => {
    tipError('请求发送失败')
    return Promise.reject(error)
  }
)

// response interceptor 响应拦截器，在请求发送后，收到响应前的拦截器
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  //response是响应对象，包含了响应数据、响应头、响应状态码等信息
  response => {
    const res = response.data !== undefined ? response.data : response
    if (response.config && response.config.deduplicate !== false) {
      pendingRequests.delete(getRequestKey(response.config))
    }
    //续期token放在响应header中返回，和直接cookie返回实现一样的效果，但是cookie有可能会出现不支持的情况
    // const plusToken = response.headers['Plus-Token'];
    // if(plusToken){
    //   //store.commit('SET_TOKEN',plusToken);
    //   setToken(plusToken)
    // }

    // HTTP 2xx 时用业务 code 判断；HTTP 401/500 等不会进入本分支
    const status = response.status
    const code = res && res.code !== undefined ? res.code : status
    const message =
      (res && (res.msg || res.message)) ||
      errorCode[code] ||
      errorCode[String(code)] ||
      errorCode['default']

    if (isAuthCode(code)) {
      showReloginConfirm()
      const err = new Error(message)
      err.isHandled = true
      err.isAuthError = true
      return Promise.reject(err)
    }

    if ([400, 404, 429, 209, 409, 415, 500, 501, 502, 503, 504].includes(code)) {
      // 中间重试轮次不弹 tip，由最终失败统一提示
      if (!response.config || !response.config.__suppressErrorTip) {
        tipError(message)
      }
      const err = new Error(message || 'Error')
      err.isHandled = true
      return Promise.reject(err)
    }

    return res
  },
  error => {
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
      errorCode['default']

    if (error.code === 'ECONNABORTED' || (typeof message === 'string' && message.includes('timeout'))) {
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

    if ([401, 403].includes(status)) {
      showReloginConfirm()
      return rejectHandled(errorMsg, { isAuthError: true })
    }

    // 将重试的中间失败静默；最终一轮再提示
    if (!config.__suppressErrorTip) {
      tipError(errorMsg, 4000)
    }
    return rejectHandled(errorMsg)
  }
)

async function request(config) {
  const requestKey = getRequestKey(config)
  const method = (config.method || 'get').toLowerCase()
  // 未指定时：GET 也不默认重试（旧逻辑 retry=2 会放大超时提示）
  const maxRetry = typeof config.retry === 'number' ? config.retry : 0

  if (config.deduplicate !== false && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)
  }

  const runner = (async () => {
    let attempt = 0
    while (true) {
      const willRetryRemain = attempt < maxRetry
      try {
        return await service({
          ...config,
          __suppressErrorTip: willRetryRemain
        })
      } catch (err) {
        attempt += 1
        const canRetry =
          attempt <= maxRetry &&
          ['get', 'head'].includes(method) &&
          isRetriableError(err)
        if (!canRetry) {
          // 若之前被 suppress，最终失败补一次提示
          if (willRetryRemain && err && err.message && !err.isAuthError && !err.isHandled) {
            tipError(err.message, 4000)
          }
          throw err
        }
        await sleep(400 * attempt)
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

export default request
