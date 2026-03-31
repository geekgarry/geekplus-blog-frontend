import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
const _Message = Message;
import store from '@/store'
import errorCode from '@/utils/errorCode'
import { getToken, setToken } from '@/utils/auth'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 20000, // request timeout
  // withCredentials: true // 是否允许跨域请求携带cookie
})

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
    const res = response.data

    //续期token放在响应header中返回，和直接cookie返回实现一样的效果，但是cookie有可能会出现不支持的情况
    // const plusToken = response.headers['Plus-Token'];
    // if(plusToken){
    //   //store.commit('SET_TOKEN',plusToken);
    //   setToken(plusToken)
    // }

    const status = response.status
    const message = res.msg || errorCode[status] || errorCode['default']

    // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    if (res.code === 403 || res.code === 401 || res.code === 208 || res.code === 214 || res.code === 215 || res.code === 219 || res.code === 206) {
      //if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      // to re-login
      MessageBox.confirm('未登录, 需要重新登录', '退出登录', {
        //MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/logout').then(() => {
          //store.dispatch('user/resetToken').then(() => {
          // location.reload()
          location.href = '/user';
          // store.dispatch('settings/showLogin', true)
        })
      })
      // .catch(() => {
      //   store.dispatch('user/logout').then(() => {
      //     // location.href = '/';
      //     location.reload()
      //   })
      // })
      return Promise.reject(message)
    } else if (res.code === 500) {
      _Message({ message: message, type: 'error' })
      return Promise.reject(new Error(message || 'Error'))
    } else if (res.code === 400 || res.code === 404 || res.code === 429 || res.code === 209 || res.code === 409 || res.code === 415 || res.code === 501) {
      // if the custom code is not 20000, it is judged as an error.
      _Message({
        message: message,
        type: 'error',
        duration: 3 * 1000
      })
      return Promise.reject(new Error(message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    //console.log('err' + error) // for debug
    let { message, response, status } = error;
    const res = response.data;
    // if(status === 401 || status === 403) {
    //   message = errorCode[status]
    //   store.dispatch('user/logout').then(() => {
    //     location.href = '/';
    //   })
    // }
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    _Message({
      message: message,
      type: 'error',
      duration: 4 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
