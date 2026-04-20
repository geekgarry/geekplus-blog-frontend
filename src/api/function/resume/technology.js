import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listTechnology(query) {
  return request({
    url: '/function/technology/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getTechnology(id) {
  return request({
    url: '/function/technology/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addTechnology(data) {
  return request({
    url: '/function/technology',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateTechnology(data) {
  return request({
    url: '/function/technology',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delTechnology(id) {
  return request({
    url: '/function/technology/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportTechnology(query) {
  return request({
    url: '/function/technology/export',
    method: 'get',
    params: query
  })
}