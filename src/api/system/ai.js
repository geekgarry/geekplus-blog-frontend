import request from '@/utils/request'

/** AI 源列表 */
export function listAiSource() {
  return request({ url: '/system/ai/source/list', method: 'get' })
}

export function getAiSource(id) {
  return request({ url: '/system/ai/source/' + id, method: 'get' })
}

export function addAiSource(data) {
  return request({ url: '/system/ai/source', method: 'post', data })
}

export function updateAiSource(data) {
  return request({ url: '/system/ai/source', method: 'put', data })
}

export function setDefaultAiSource(id) {
  return request({ url: '/system/ai/source/default/' + id, method: 'put' })
}

export function delAiSource(id) {
  return request({ url: '/system/ai/source/' + id, method: 'delete' })
}

export function listAiProviders() {
  return request({ url: '/system/ai/source/providers', method: 'get' })
}

/** AI 源连通性测试 / 预览（GET/POST） */
export function testAiSource(data) {
  return request({ url: '/system/ai/source/test', method: 'post', data, timeout: 90000 })
}

/** Gemini 官方 models.list */
export function listGeminiModels(params) {
  return request({ url: '/system/ai/gemini/models', method: 'get', params })
}

export function getGeminiModel(modelId, params) {
  return request({
    url: '/system/ai/gemini/models/' + encodeURIComponent(modelId),
    method: 'get',
    params
  })
}

export function probeGeminiKey(params) {
  return request({ url: '/system/ai/gemini/probe', method: 'get', params })
}

export function getGeminiCapabilities() {
  return request({ url: '/system/ai/gemini/capabilities', method: 'get' })
}
