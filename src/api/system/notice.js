import request from '@/utils/request'

// 查询通知列表
export function listNotice(query) {
  return request({
    url: '/sys/notice/list',
    method: 'get',
    params: query
  })
}

// 查询通知详情
export function getNotice(query) {
  return request({
    url: '/sys/notice/detail',
    method: 'get',
    params: query
  })
}

// 删除通知详情
export function deleteNotice(query) {
  return request({
    url: '/sys/notice/delete',
    method: 'get',
    params: query
  })
}

// 批量删除通知详情
export function delNotice(ids) {
  return request({
    url: '/sys/notice/' + ids,
    method: 'delete'
  })
}

// 修改通知详情
export function updateNotice(data) {
  return request({
    url: '/sys/notice/update',
    method: 'post',
    data: data
  })
}

// 添加通知详情
export function addNotice(data) {
  return request({
    url: '/sys/notice/add',
    method: 'post',
    data: data
  })
}

//导出
export function exportNotice(query){
  return request({
    url: '/sys/notice/export',
    method: 'get',
    params: query
  })
}