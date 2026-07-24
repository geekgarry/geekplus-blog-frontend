import request from '@/utils/request'

/** 默认加载用户最新一份简历 */
export function getResume(userId) {
  return request({
    url: '/api/resume',
    method: 'get',
    params: { userId }
  })
}

/**
 * 保存简历
 * - payload.id 有值：更新该份
 * - 无 id：新建一份
 * 返回保存后的记录（含 id）
 */
export function saveResume(userId, payload) {
  return request({
    url: '/api/resume',
    method: 'post',
    params: { userId },
    data: payload
  })
}

/** 当前用户全部简历 */
export function getMyResumeList(userId) {
  return request({
    url: '/api/resume/mine',
    method: 'get',
    params: { userId }
  })
}

export function getTemplates() {
  return request({
    url: '/api/resume/templates',
    method: 'get'
  })
}

export function saveTemplate(payload) {
  return request({
    url: '/api/resume/templates',
    method: 'post',
    data: payload
  })
}

export function deleteTemplate(templateId) {
  return request({
    url: `/api/resume/templates/${templateId}`,
    method: 'delete'
  })
}

export function getResumeList(params) {
  return request({
    url: '/api/resume/list',
    method: 'get',
    params
  })
}

export function getResumeById(id) {
  return request({
    url: `/api/resume/${id}`,
    method: 'get'
  })
}

export function deleteResume(id) {
  return request({
    url: `/api/resume/${id}`,
    method: 'delete'
  })
}

export function generateResumeAI(payload) {
  return request({
    url: '/api/resume/ai/generate',
    method: 'post',
    data: payload
  })
}
