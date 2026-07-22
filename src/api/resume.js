import request from '@/utils/request'

export function getResume(userId) {
  return request({
    url: '/api/resume',
    method: 'get',
    params: { userId }
  })
}

export function saveResume(payload) {
  return request({
    url: '/api/resume',
    method: 'post',
    data: payload
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
