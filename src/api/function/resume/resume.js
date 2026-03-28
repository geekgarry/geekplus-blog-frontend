import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listResume(query) {
  return request({
    url: '/function/resume/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getResume(id) {
  return request({
    url: '/function/resume/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addResume(data) {
  return request({
    url: '/function/resume',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateResume(data) {
  return request({
    url: '/function/resume',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delResume(id) {
  return request({
    url: '/function/resume/' + id,
    method: 'delete'
  })
}

//查询简历信息
export function getPersonalResume(query){
  return request({
    url: '/function/resume/getPersonalResumeInfo',
    method:'get',
    params:query
  })
}
// 导出【请填写功能名称】
export function exportResume(query) {
  return request({
    url: '/function/resume/export',
    method: 'get',
    params: query
  })
}
