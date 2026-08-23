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

/** 仅修改简历显示名称，不覆盖正文 */
export function renameResume(userId, id, title) {
  return request({
    url: `/api/resume/${id}/title`,
    method: 'put',
    params: { userId },
    data: { title }
  })
}

export function generateResumeAI(payload) {
  return request({
    url: '/api/resume/ai/generate',
    method: 'post',
    data: payload,
    // 附件 base64 较大，适当放宽超时
    timeout: 120000,
  })
}

/** 岗位/行业分析、人岗匹配、按岗优化简历 */
export function analyzeResumeAI(payload) {
  return request({
    url: '/api/resume/ai/analyze',
    method: 'post',
    data: payload,
    timeout: 120000,
  })
}

/** 岗位检索：优先新路径 /api/job/search，失败时可仍走旧 /api/resume/ai/job-search */
export function searchJobsAI(payload) {
  return request({
    url: '/api/job/search',
    method: 'post',
    data: payload,
    timeout: 90000,
  }).catch((err) => {
    // 旧后端未部署 job 模块时回退
    return request({
      url: '/api/resume/ai/job-search',
      method: 'post',
      data: payload,
      timeout: 90000,
    })
  })
}

/** @deprecated 请用 @/api/ppt generatePpt */
export function generatePptAI(payload) {
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
