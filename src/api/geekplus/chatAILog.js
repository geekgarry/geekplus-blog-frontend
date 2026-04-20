import request from '@/utils/request'

// 查询Chatgpt聊天记录日志
//列表
export function listLog(query) {
  return request({
    url: '/geekplus/chatAILog/list',
    method: 'get',
    params: query
  })
}

// 查询Chatgpt聊天记录日志
//详细
export function getLog(id) {
  return request({
    url: '/geekplus/chatAILog/' + id,
    method: 'get'
  })
}

// 新增Chatgpt聊天记录日志

export function addLog(data) {
  return request({
    url: '/geekplus/chatAILog',
    method: 'post',
    data: data
  })
}

// 修改Chatgpt聊天记录日志

export function updateLog(data) {
  return request({
    url: '/geekplus/chatAILog',
    method: 'put',
    data: data
  })
}

// 删除Chatgpt聊天记录日志

export function delLog(id) {
  return request({
    url: '/geekplus/chatAILog/' + id,
    method: 'delete'
  })
}

// 导出Chatgpt聊天记录日志

export function exportLog(query) {
  return request({
    url: '/geekplus/chatAILog/export',
    method: 'get',
    params: query
  })
}