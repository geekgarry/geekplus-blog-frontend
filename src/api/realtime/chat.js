import request from '@/utils/request'

export function fetchOnlineUsers() {
  return request({
    url: '/realtime/onlineUsers',
    method: 'get'
  })
}

export function sendChatMessage(data) {
  return request({
    url: '/realtime/chat/send',
    method: 'post',
    data
  })
}

export function fetchChatHistory(peerClientId) {
  return request({
    url: '/realtime/chat/history',
    method: 'get',
    params: { peerClientId }
  })
}

/** 信令：超时与失败由通话层自行处理，避免全局弹窗刷屏 */
export function sendWebRtcSignal(data) {
  return request({
    url: '/realtime/webrtc/signal',
    method: 'post',
    data,
    timeout: 12000,
    __suppressErrorTip: true
  })
}
