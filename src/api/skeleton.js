import request from '@/utils/request'

/** P2：后端代理抓取 URL 正文 HTML */
export function fetchSkeletonUrl(url) {
  return request({
    url: '/api/skeleton/fetch-url',
    method: 'post',
    data: { url },
    timeout: 30000,
  })
}

/** P3：截图/设计图 → 骨架 Schema JSON 文本 */
export function skeletonFromImage(payload) {
  return request({
    url: '/api/skeleton/from-image',
    method: 'post',
    data: payload,
    timeout: 120000,
  })
}
