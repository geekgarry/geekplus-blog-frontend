/**
 * 实时通道（预警 / 在线聊天推送）
 * - 优先同源 wss://当前站/pro-api/websocket（安卓对跨域证书更友好）
 * - 再尝试 VUE_APP_WS_URL 直连 API
 * - 全部失败则降级 SSE（保证在线身份仍可被别人看到、能收消息）
 */
import { Notification } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import ssePush from '@/utils/ssePush'

let ws = null
let reconnectTimer = null
let lockReconnect = false
let reconnectAttempts = 0
let manualClose = false
let urlIndex = 0
let usingSseFallback = false
const MAX_RECONNECT_ATTEMPTS = 10

function withToken(baseUrl) {
  const token = getToken()
  if (!token) return baseUrl
  const join = baseUrl.indexOf('?') >= 0 ? '&' : '?'
  return `${baseUrl}${join}Plus-Token=${encodeURIComponent(token)}`
}

function sameOriginWsBase(clientId) {
  const id = encodeURIComponent(String(clientId))
  const base = (process.env.VUE_APP_BASE_API || '').trim()
  if (typeof location === 'undefined') {
    return `ws://127.0.0.1${base}/websocket/${id}`
  }
  if (/^https?:\/\//i.test(base)) {
    return `${base.replace(/^http/i, 'ws').replace(/\/$/, '')}/websocket/${id}`
  }
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const prefix = base ? base.replace(/\/$/, '') : ''
  return `${proto}//${location.host}${prefix}/websocket/${id}`
}

function directWsBase(clientId) {
  const id = encodeURIComponent(String(clientId))
  const custom = (process.env.VUE_APP_WS_URL || '').trim()
  const fallback = (process.env.VUE_APP_WS_URL_FALLBACK || '').trim()
  const pick = custom || fallback
  if (!pick) return ''
  return `${pick.replace(/\/$/, '')}/${id}`
}

/** 返回去重后的候选 WS URL（已带 Token） */
export function buildWsUrlCandidates(clientId) {
  const list = []
  const a = sameOriginWsBase(clientId)
  const b = directWsBase(clientId)
  ;[a, b].forEach((u) => {
    if (u && list.indexOf(u) < 0) list.push(u)
  })
  return list.map(withToken)
}

/** 兼容旧调用：取第一个候选 */
export function buildWsUrl(clientId) {
  const list = buildWsUrlCandidates(clientId)
  return list[0] || withToken(sameOriginWsBase(clientId))
}

function emitPresence(type, extra) {
  const detail = Object.assign({ type, userId: store.getters.userId }, extra || {})
  window.dispatchEvent(new CustomEvent('onmessageWS', { detail }))
  window.dispatchEvent(new CustomEvent('gp-realtime-presence', { detail }))
}

function messageHandle(message) {
  let obj
  try {
    obj = typeof message === 'string' ? JSON.parse(message) : message
  } catch (e) {
    return
  }
  if (!obj || typeof obj !== 'object') return

  switch (obj.type) {
    case 'error':
      if (ws) ws.close()
      break
    case 'heartBeat':
    case 'success':
    case 'onlineUser':
      break
    case 'online':
    case 'offline':
      emitPresence(obj.type, obj)
      break
    default:
      // 业务推送（operationLog/systemNotice 等）→ Navbar.applyRealtimePushDetail，契约见 @/utils/pushNotify.js
      window.dispatchEvent(new CustomEvent('onmessageWS', { detail: obj }))
      break
  }
}

function startSseFallback(clientId) {
  usingSseFallback = true
  try {
    ssePush.Init(clientId)
    emitPresence('online', { channel: 'sse' })
    console.warn('[realtime] WS unavailable, using SSE fallback')
  } catch (e) {
    console.warn('[realtime] SSE fallback failed', e)
  }
}

function reconnect(sockid) {
  if (lockReconnect || manualClose) return
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    startSseFallback(sockid)
    Notification({
      title: '提示',
      message: '实时通道已切换为兼容模式，若仍异常请刷新页面',
      type: 'warning',
      duration: 5000
    })
    return
  }
  lockReconnect = true
  reconnectAttempts += 1
  // 轮换下一个候选 URL
  urlIndex += 1
  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    lockReconnect = false
    websocket.Init(sockid, { force: true })
  }, Math.min(12000, 1500 * reconnectAttempts))
}

const heartCheck = {
  timeout: 25000,
  timeoutObj: null,
  serverTimeoutObj: null,
  start() {
    this.stop()
    this.timeoutObj = setTimeout(() => {
      if (ws && ws.readyState === 1) {
        const uid = store.getters.userId
        try {
          ws.send(JSON.stringify({
            type: 'heartBeat',
            message: 'heartBeat',
            fromUser: uid,
            toUser: uid
          }))
        } catch (e) {
          reconnect(uid)
        }
      } else {
        reconnect(store.getters.userId)
      }
      this.serverTimeoutObj = setTimeout(() => {
        if (ws && ws.readyState !== 1) {
          try { ws.close() } catch (e) { /* ignore */ }
        }
      }, this.timeout)
    }, this.timeout)
  },
  stop() {
    clearTimeout(this.timeoutObj)
    clearTimeout(this.serverTimeoutObj)
  }
}

const websocket = {
  Init(clientId, opts) {
    if (!clientId) clientId = store.getters.userId
    if (!clientId) return
    if (!getToken()) {
      console.warn('[ws] no token, skip connect')
      return
    }
    if (typeof WebSocket === 'undefined') {
      startSseFallback(clientId)
      return
    }

    const force = opts && opts.force
    if (!force && ws && ws.readyState <= 1 && ws.__gpClientId === String(clientId) && !usingSseFallback) {
      return
    }

    this.CloseWebscoket({ keepSse: true })
    manualClose = false
    usingSseFallback = false

    const candidates = buildWsUrlCandidates(clientId)
    if (!candidates.length) {
      startSseFallback(clientId)
      return
    }
    if (urlIndex >= candidates.length) urlIndex = 0
    const url = candidates[urlIndex % candidates.length]

    let opened = false
    try {
      ws = new WebSocket(url)
      ws.__gpClientId = String(clientId)
      ws.__gpUrl = url
    } catch (e) {
      reconnect(clientId)
      return
    }

    ws.onmessage = (e) => {
      reconnectAttempts = 0
      messageHandle(e.data)
      heartCheck.start()
    }

    ws.onclose = () => {
      heartCheck.stop()
      if (!opened) {
        // 握手失败：换下一个地址
        if (!manualClose) reconnect(clientId)
        return
      }
      emitPresence('offline', { channel: 'ws' })
      if (!manualClose) reconnect(clientId)
    }

    ws.onopen = () => {
      opened = true
      reconnectAttempts = 0
      usingSseFallback = false
      try { ssePush.Close() } catch (e) { /* ignore */ }
      emitPresence('online', { channel: 'ws', url })
      heartCheck.start()
      console.info('[realtime] WS connected', url.replace(/Plus-Token=[^&]+/, 'Plus-Token=***'))
    }

    ws.onerror = () => {
      // 交给 onclose 换线/重连
    }
  },

  CloseWebscoket(opts) {
    manualClose = true
    heartCheck.stop()
    clearTimeout(reconnectTimer)
    lockReconnect = false
    if (ws) {
      const sock = ws
      ws = null
      sock.onclose = null
      sock.onerror = null
      sock.onmessage = null
      try {
        sock.close(1000, 'Normal closure')
      } catch (e) { /* ignore */ }
    }
    if (!(opts && opts.keepSse)) {
      try { ssePush.Close() } catch (e) { /* ignore */ }
      usingSseFallback = false
    }
  },

  Send(sender, reception, body, flag) {
    if (!ws || ws.readyState !== 1) return
    ws.send(JSON.stringify({ sender, reception, body, flag }))
  },

  getWebSocket() {
    return ws
  },

  getStatus() {
    if (usingSseFallback) return 'SSE兼容'
    if (!ws) return '未连接'
    if (ws.readyState === 0) return '连接中'
    if (ws.readyState === 1) return '已连接'
    if (ws.readyState === 2) return '连接正在关闭'
    return '连接已关闭'
  },

  isSseFallback() {
    return usingSseFallback
  }
}

export default websocket
