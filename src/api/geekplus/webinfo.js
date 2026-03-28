import request from '@/utils/request'

// 查询关于网站信息，关于我的的介绍，和网站标头与尾部信息，如果有备案包括备案信息列表
export function listWeb(query) {
  return request({
    url: '/geekplus/webInfo/list',
    method: 'get',
    params: query
  })
}

// 查询关于网站信息，关于我的的介绍，和网站标头与尾部信息，如果有备案包括备案信息详细
export function getWeb(id) {
  return request({
    url: '/geekplus/webInfo/' + id,
    method: 'get'
  })
}

// 新增关于网站信息，关于我的的介绍，和网站标头与尾部信息，如果有备案包括备案信息
export function addWeb(data) {
  return request({
    url: '/geekplus/webInfo',
    method: 'post',
    data: data
  })
}

// 修改关于网站信息，关于我的的介绍，和网站标头与尾部信息，如果有备案包括备案信息
export function updateWeb(data) {
  return request({
    url: '/geekplus/webInfo',
    method: 'put',
    data: data
  })
}

// 删除关于网站信息，关于我的的介绍，和网站标头与尾部信息，如果有备案包括备案信息
export function delWeb(id) {
  return request({
    url: '/geekplus/webInfo/' + id,
    method: 'delete'
  })
}

// 导出关于网站信息，关于我的的介绍，和网站标头与尾部信息，如果有备案包括备案信息
export function exportWeb(query) {
  return request({
    url: '/geekplus/webInfo/export',
    method: 'get',
    params: query
  })
}