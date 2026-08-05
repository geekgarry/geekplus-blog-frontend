/**
 * 本项目 HTTP 出口（业务请继续 `import request from '@/utils/request'`）
 *
 * 实现已拆到可移植层：
 * - `@/utils/http/createRequest`  核心（无 Element 硬依赖）
 * - `@/utils/http/ui.element`     Element UI 提示/确认框
 * - `@/utils/http/pageVisibility` 切后台续传用
 *
 * 移植到其它 Element 项目：复制整个 `utils/http` + 本文件改 getToken/onRelogin 即可。
 * 移植到非 Element：换 ui 适配器（见 ui.console.js 内 Ant Design 示例）。
 */
import axios from 'axios'
// 与 permission.js 一致走 lib 深路径，避免与全量 Element / babel-plugin-component 冲突
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import errorCode from '@/utils/errorCode'
import { getToken } from '@/utils/auth'
import { createRequest } from '@/utils/http/createRequest'
import { createElementUiAdapter } from '@/utils/http/ui.element'

const request = createRequest({
  axios,
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 25000,
  getToken,
  // 本站自定义头；其它项目可改为 'Authorization' + formatToken: t => `Bearer ${t}`
  tokenHeader: 'Plus-Token',
  errorCode,
  ui: createElementUiAdapter({ Message, MessageBox }),
  onRelogin: () =>
    store.dispatch('user/logout').then(() => {
      const redirect = encodeURIComponent(
        (typeof location !== 'undefined' && location.pathname + location.search + location.hash) || '/'
      )
      location.href = `/user?method=login&redirect=${redirect}`
    }),
  // 点「取消」：只清本地 token，不跳转，让当前页继续请求公开接口
  onReloginCancel: () => store.dispatch('user/resetToken'),
  reloginTitle: '退出登录',
  reloginMessage: '未登录, 需要重新登录',
  reloginConfirmText: '重新登录',
  reloginCancelText: '取消'
})

export default request

// 兼容旧用法：业务可从 request 同路径取可见性工具
export { isPageVisible, waitUntilPageVisible } from '@/utils/http/pageVisibility'
