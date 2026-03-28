import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listExperience(query) {
  return request({
    url: '/function/workexperience/list',
    method: 'get',
    params: query
  })
}
// 查询【请填写功能名称】列表
export function listProjectExperience(query) {
  return request({
    url: '/function/projectexperience/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getExperience(id) {
  return request({
    url: '/function/workexperience/' + id,
    method: 'get'
  })
}

// 查询【请填写功能名称】详细
export function getProjectExperience(id) {
  return request({
    url: '/function/projectexperience/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addExperience(data) {
  return request({
    url: '/function/workexperience',
    method: 'post',
    data: data
  })
}

// 新增【请填写功能名称】
export function addProjectExperience(data) {
  return request({
    url: '/function/projectexperience',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateExperience(data) {
  return request({
    url: '/function/workexperience',
    method: 'put',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateProjectExperience(data) {
  return request({
    url: '/function/projectexperience',
    method: 'put',
    data: data
  })
}
// 删除【请填写功能名称】
export function delExperience(id) {
  return request({
    url: '/function/workexperience/' + id,
    method: 'delete'
  })
}

// 删除【请填写功能名称】
export function delProjectExperience(id) {
  return request({
    url: '/function/projectexperience/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportExperience(query) {
  return request({
    url: '/function/workexperience/export',
    method: 'get',
    params: query
  })
}


