import request from '@/utils/request'

/**
 * 独立 PPT 生成：resume | text | file
 * 优先 /api/ppt/generate，旧后端回退 /api/resume/ai/generate-ppt
 */
export function generatePpt(payload) {
  return request({
    url: '/api/ppt/generate',
    method: 'post',
    data: payload,
    timeout: 120000,
  }).catch(() =>
    request({
      url: '/api/resume/ai/generate-ppt',
      method: 'post',
      data: payload,
      timeout: 120000,
    })
  )
}
