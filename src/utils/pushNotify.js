/**
 * 管理端实时推送（WS / SSE → onmessageWS）→ 顶栏 NotificationMsg 适配层
 *
 * ## 后端契约（RealtimePushBroker / WebSocketServer，见 GeekPlus-Blog-API）
 *
 * 操作/公告广播示例（注意 notifyMsg 仅为文案，不是「在线用户」通道）：
 * ```json
 * {
 *   "type": "notifyMsg",
 *   "notifyMsg": "新增操作日志",
 *   "operationLog": "add",
 *   "systemNotice": "add"
 * }
 * ```
 *
 * 用户上线广播（WebSocketServer.onOpen → sendMessageAll）：
 * ```json
 * { "type": "online", "userId": "123", "onlineCount": 5 }
 * ```
 *
 * ### v1 · 未读标记（当前生产）
 * - `operationLog` / `systemNotice` 为 `"add"` → 操作日志 / 系统通知红点
 * - **`notifyMsg` 字段不要映射到 UI**，仅为后端广播说明文字
 * - **`onlineUser` 仅由 type=online 且非本人 userId 触发**（见 applyRealtimePushDetail）
 *
 * ### v2 · 消息正文（后期升级，前端已预留）
 * - 通道字段改为对象，推荐字段（均可选，按后端实际增补）：
 * ```json
 * {
 *   "operationLog": {
 *     "action": "add",
 *     "title": "用户管理",
 *     "content": "admin 修改用户 zhangsan",
 *     "operId": 1001,
 *     "time": "2026-08-26 14:00:00"
 *   }
 * }
 * ```
 * - 也支持扁平：`{ "title": "...", "content": "...", "message": "..." }`
 * - 升级时**只需改后端 push 体**；前端 normalize 后 UI 自动展示 summary，无需改 Navbar 分发逻辑
 *
 * ## 前端统一结构 PushPayload（normalize 输出）
 * @typedef {Object} PushPayload
 * @property {boolean} unread - 是否显示红点
 * @property {string} [action] - 如 add / update
 * @property {string} [title] - 标题（v2）
 * @property {string} [content] - 正文（v2）
 * @property {string} [summary] - 下拉预览一行，由 title/content/message 推导
 * @property {*} [raw] - 原始片段，调试或跳转带参用
 */

/** 与 Navbar / NotificationMsg 绑定的通道 key，增新类型时在此登记并在 apply 列表中加入 */
export const PUSH_CHANNELS = {
  SYSTEM_NOTICE: 'systemNotice',
  OPERATION_LOG: 'operationLog',
  /** 顶栏「在线用户」红点，仅 WS type=online 且他人上线时写入 */
  ONLINE_USER: 'onlineUser'
}

const MARKER_ADD = 'add'

/**
 * 将 WS detail 某通道的原始值规范为 PushPayload
 * @param {*} raw detail.operationLog | detail.systemNotice 等
 * @param {string} [channelKey] 通道名，便于后续按类型定制
 * @returns {PushPayload|undefined}
 */
export function normalizePushPayload(raw, channelKey = '') {
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }

  // v1：字符串标记（当前后端 "add"）
  if (typeof raw === 'string') {
    const isMarker = raw === MARKER_ADD || raw.length > 0
    if (!isMarker) return undefined
    return {
      unread: true,
      action: raw === MARKER_ADD ? MARKER_ADD : raw,
      title: '',
      content: raw === MARKER_ADD ? '' : raw,
      summary: raw === MARKER_ADD ? defaultSummary(channelKey) : raw,
      raw
    }
  }

  if (typeof raw !== 'object') {
    return undefined
  }

  // v2：对象正文（后期后端直接推消息体）
  const action = raw.action || MARKER_ADD
  const title = pickText(raw.title)
  const content = pickText(raw.content) || pickText(raw.message) || pickText(raw.msg) || pickText(raw.body)
  const summary = pickText(raw.summary) || content || title || defaultSummary(channelKey)

  return {
    unread: raw.unread !== false,
    action,
    title,
    content,
    summary,
    raw
  }
}

function pickText(v) {
  if (v === undefined || v === null) return ''
  const s = String(v).trim()
  return s
}

function defaultSummary(channelKey) {
  const map = {
    [PUSH_CHANNELS.SYSTEM_NOTICE]: '有新系统通知',
    [PUSH_CHANNELS.OPERATION_LOG]: '有新操作记录',
    [PUSH_CHANNELS.ONLINE_USER]: '有用户上线'
  }
  return map[channelKey] || '有新动态'
}

/**
 * 用户上线推送 → 在线用户菜单红点（排除自己连接时的广播）
 * @param {Object} detail WS detail，需 type=online
 * @param {string|number} [currentUserId] 当前登录用户，与 detail.userId 相同则不提醒
 */
export function normalizeOnlinePresence(detail, currentUserId) {
  if (!detail || detail.type !== 'online') {
    return undefined
  }
  const remoteId = detail.userId != null ? String(detail.userId) : ''
  const selfId = currentUserId != null ? String(currentUserId) : ''
  // 自己刚连上 WS 也会收到全员广播，不应点亮「在线用户」提醒
  if (remoteId && selfId && remoteId === selfId) {
    return undefined
  }
  const count = detail.onlineCount
  const summary = remoteId
    ? `用户 ${remoteId} 已上线${count != null ? `（在线 ${count} 人）` : ''}`
    : (count != null ? `在线 ${count} 人` : defaultSummary(PUSH_CHANNELS.ONLINE_USER))
  return {
    unread: true,
    action: 'online',
    title: '用户上线',
    content: summary,
    summary,
    raw: detail
  }
}

/** 是否显示未读红点 */
export function hasPushUnread(payload) {
  return !!(payload && payload.unread)
}

/** 下拉菜单副标题 / 后期气泡预览文案 */
export function getPushPreview(payload, maxLen = 48) {
  if (!payload) return ''
  const text = payload.summary || payload.content || payload.title || ''
  if (!text) return ''
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
}

/**
 * 解析 onmessageWS / onmessageSSE 的 detail，写入 Vue 组件 data
 * @param {Object} detail CustomEvent.detail
 * @param {Object} vm 目标组件（需 operationLog / systemNotice / onlineUser 等 data 字段）
 * @param {Object} [opts]
 * @param {string|number} [opts.currentUserId] 用于过滤本人上线广播
 * @param {string[]} [opts.channelKeys] 默认仅 operationLog + systemNotice（不含 notifyMsg）
 */
export function applyRealtimePushDetail(detail, vm, opts) {
  if (!detail || !vm) return
  const options = opts || {}
  const keys = options.channelKeys || [
    PUSH_CHANNELS.OPERATION_LOG,
    PUSH_CHANNELS.SYSTEM_NOTICE
  ]
  keys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(detail, key)) {
      return
    }
    vm[key] = normalizePushPayload(detail[key], key)
  })
  // 在线用户：仅他人 WS 上线（type=online），与操作日志里的 notifyMsg 文案无关
  const onlinePayload = normalizeOnlinePresence(detail, options.currentUserId)
  if (onlinePayload) {
    vm[PUSH_CHANNELS.ONLINE_USER] = onlinePayload
  }
}

/**
 * 后期若要在收到 v2 正文时弹 Element 通知，在 getSocketData 里调用即可（示例）：
 * @param {PushPayload|undefined} payload
 * @param {Object} opts Notification 选项
 */
export function notifyPushToast(payload, opts = {}) {
  if (!hasPushUnread(payload)) return
  const preview = getPushPreview(payload)
  if (!preview) return
  // 延迟 require 避免非管理端打包拉 element-ui 通知（调用方通常在 Navbar）
  const { Notification } = require('element-ui')
  Notification({
    title: payload.title || opts.title || '系统提醒',
    message: preview,
    type: 'info',
    duration: 4500,
    ...opts
  })
}
