import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
const _Message = Message;
import store from '@/store'
import errorCode from '@/utils/errorCode'
import { getToken, setToken } from '@/utils/auth'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
const pendingRequests = new Map()
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 20000, // request timeout
  // withCredentials: true // 是否允许跨域请求携带cookie
})

const getRequestKey = config => {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// request interceptor
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
    if (typeof config.retry !== 'number') {
      config.retry = 2
    }
    return config
  },
  error => {
    // do something with request error
    // console.log(error) // for debug
    _Message.error("请求超时！！！");
    return Promise.reject(error)
  }
)

// response interceptor
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

    const status = response.status
    const code = res && res.code !== undefined ? res.code : status
    const message = (res && (res.msg || res.message)) || errorCode[status] || errorCode['default']

    // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    if ([401, 403, 208, 214, 215, 219, 206].includes(code)) {
      // to re-login
      MessageBox.confirm('未登录, 需要重新登录', '退出登录', {
        //MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/logout').then(() => {
          // location.reload()
          location.href = '/user';
          // store.dispatch('settings/showLogin', true)
        })
      })
      return Promise.reject(message)
    } else if (res.code === 500) {
      _Message({ message: message, type: 'error' })
      return Promise.reject(new Error(message || 'Error'))
    } else if ([400, 404, 429, 209, 409, 415, 501].includes(code)) {
      // if the custom code is not 20000, it is judged as an error.
      _Message({
        message: message,
        type: 'error',
        duration: 3000
      })
      return Promise.reject(new Error(message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // for debug
    const { message = '', response, config = {}, status } = error;
    if (config && config.deduplicate !== false) {
      pendingRequests.delete(getRequestKey(config))
    }
    let errorMsg = message
    if (message == "Network Error") {
      errorMsg = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      errorMsg = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      // errorMsg = "系统接口" + errorMsg.substr(errorMsg.length - 3) + "异常";
      errorMsg = `系统接口${(response && response.status) || ''}异常`
    } else if (response && response.data && response.data.msg) {
      errorMsg = response.data.msg
    }
    _Message({
      message: errorMsg,
      type: 'error',
      duration: 4000
    })
    return Promise.reject(error)
  }
)

async function request(config) {
  const requestKey = getRequestKey(config)
  const method = (config.method || 'get').toLowerCase()
  const maxRetry = typeof config.retry === 'number' ? config.retry : (['get', 'head'].includes(method) ? 2 : 0)

  if (config.deduplicate !== false && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)
  }

  const runner = (async () => {
    let attempt = 0
    while (true) {
      try {
        return await service(config)
      } catch (err) {
        attempt += 1
        if (attempt > maxRetry || !['get', 'head'].includes(method)) {
          throw err
        }
        await sleep(500 * attempt)
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
