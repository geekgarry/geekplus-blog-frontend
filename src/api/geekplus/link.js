import request from '@/utils/request'

// 查询网站友情链接列表
export function listLink(query) {
  return request({
    url: '/geekplus/link/list',
    method: 'get',
    params: query
  })
}

// 查询网站友情链接详细
export function getLink(id) {
  return request({
    url: '/geekplus/link/' + id,
    method: 'get'
  })
}

// 新增网站友情链接
export function addLink(data) {
  return request({
    url: '/geekplus/link',
    method: 'post',
    data: data
  })
}

// 修改网站友情链接
export function updateLink(data) {
  return request({
    url: '/geekplus/link',
    method: 'put',
    data: data
  })
}

// 删除网站友情链接
export function delLink(id) {
  return request({
    url: '/geekplus/link/' + id,
    method: 'delete'
  })
}

// 导出网站友情链接
export function exportLink(query) {
  return request({
    url: '/geekplus/link/export',
    method: 'get',
    params: query
  })
}