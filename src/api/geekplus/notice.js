import request from '@/utils/request'

// 查询网站通知列表
export function listNotice(query) {
  return request({
    url: '/geekplus/notice/list',
    method: 'get',
    params: query
  })
}

// 查询网站通知详细
export function getNotice(id) {
  return request({
    url: '/geekplus/notice/' + id,
    method: 'get'
  })
}

// 新增网站通知
export function addNotice(data) {
  return request({
    url: '/geekplus/notice',
    method: 'post',
    data: data
  })
}

// 修改网站通知
export function updateNotice(data) {
  return request({
    url: '/geekplus/notice',
    method: 'put',
    data: data
  })
}

// 删除网站通知
export function delNotice(id) {
  return request({
    url: '/geekplus/notice/' + id,
    method: 'delete'
  })
}

// 导出网站通知
export function exportNotice(query) {
  return request({
    url: '/geekplus/notice/export',
    method: 'get',
    params: query
  })
}