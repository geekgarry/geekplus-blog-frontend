/**
 * SSE 推送客户端（预警/通知/聊天信令）
 * 与 wesocket.js 并存；推荐管理端改用本模块，降低长连接资源。
 * 事件仍派发 window 'onmessageWS'，兼容原有 NotificationMsg 监听。
 */
import { getToken } from '@/utils/auth'
import store from '@/store'
import { Notification } from 'element-ui'

let es = null
let reconnectTimer = null
let lockReconnect = false
let reconnectAttempts = 0
const MAX_RECONNECT = 8

function buildUrl(clientId) {
  const base = process.env.VUE_APP_BASE_API || ''
  const token = getToken() || ''
  const q = encodeURIComponent(token)
  // EventSource 无法带 Header，Token 走 query（后端 JwtFilter 已兼容）
  return `${base}/sse/subscribe/${encodeURIComponent(clientId)}?Plus-Token=${q}`
}

function dispatchPayload(raw) {
  let obj = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch (e) {
      obj = { type: 'notify', message: raw }
    }
  }
  if (!obj || typeof obj !== 'object') return
  if (obj.type === 'heartBeat' || obj.type === 'online') return
  window.dispatchEvent(new CustomEvent('onmessageWS', { detail: obj }))
  window.dispatchEvent(new CustomEvent('onmessageSSE', { detail: obj }))
}

function reconnect(clientId) {
  if (lockReconnect) return
  if (reconnectAttempts >= MAX_RECONNECT) {
    Notification({
      title: '提示',
      message: '实时通道重连失败，请刷新页面',
      type: 'warning'
    })
    return
  }
  lockReconnect = true
  reconnectAttempts += 1
  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    lockReconnect = false
    ssePush.Init(clientId)
  }, Math.min(15000, 2000 * reconnectAttempts))
}

const ssePush = {
  Init(clientId) {
    if (!clientId) {
      clientId = store.getters.userId
    }
    if (!clientId || !getToken()) return
    if (typeof window.EventSource === 'undefined') {
      Notification({
        title: '提示',
        message: '当前浏览器不支持 SSE，无法接收实时通知',
        type: 'warning',
        duration: 0
      })
      return
    }
    this.Close()
    try {
      es = new EventSource(buildUrl(clientId))
    } catch (e) {
      reconnect(clientId)
      return
    }

    es.addEventListener('connected', (e) => {
      reconnectAttempts = 0
      dispatchPayload(e.data)
    })
    es.addEventListener('message', (e) => {
      reconnectAttempts = 0
      dispatchPayload(e.data)
    })
    es.onmessage = (e) => {
      reconnectAttempts = 0
      dispatchPayload(e.data)
    }
    es.onerror = () => {
      this.Close()
      reconnect(clientId)
    }
  },
  Close() {
    clearTimeout(reconnectTimer)
    if (es) {
      try {
        es.close()
      } catch (e) { /* ignore */ }
      es = null
    }
  },
  getStatus() {
    if (!es) return '未连接'
    // 0 CONNECTING 1 OPEN 2 CLOSED
    if (es.readyState === 0) return '连接中'
    if (es.readyState === 1) return '已连接'
    return '已关闭'
  }
}

export default ssePush
