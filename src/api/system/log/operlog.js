import request from '@/utils/request'

// 查询操作日志列表
export function listOperLog(query) {
  return request({
    url: '/sys/operateLog/list',
    method: 'get',
    params: query
  })
}

// 查询所有操作日志列表
export function getViewCount() {
  return request({
    url: '/sys/operateLog/getViewCount',
    method: 'get'
  })
}

// 删除操作日志
export function delOperlog(operId) {
  return request({
    url: '/sys/operateLog/' + operId,
    method: 'delete'
  })
}

// 清空操作日志
export function cleanOperlog() {
  return request({
    url: '/sys/operateLog/clean',
    method: 'delete'
  })
}

// 导出操作日志
export function exportOperlog(query) {
  return request({
    url: '/sys/operateLog/export',
    method: 'get',
    params: query
  })
}