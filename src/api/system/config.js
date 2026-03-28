import request from '@/utils/request'

// 查询参数列表
export function listConfig(query) {
  return request({
    url: '/sys/config/list',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getConfig(query) {
  return request({
    url: '/sys/config/detail',
    method: 'get',
    params: query
  })
}

// 根据参数键名查询参数值
export function getConfigKey(configKey) {
  return request({
    url: '/sys/config/configKey/' + configKey,
    method: 'get'
  })
}

// 新增参数配置
export function addConfig(data) {
  return request({
    url: '/sys/config/add',
    method: 'post',
    data: data
  })
}

// 修改参数配置
export function updateConfig(data) {
  return request({
    url: '/sys/config/update',
    method: 'post',
    data: data
  })
}

// 删除参数配置
export function delConfig(configIds) {
  return request({
    url: '/sys/config/'+configIds,
    method: 'delete'
  })
}

// 清理参数缓存
export function clearCache(params) {
  return request({
    url: '/sys/config/delete',
    method: 'get',
    params: params
  })
}

// 导出参数
export function exportConfig(query) {
  return request({
    url: '/sys/config/export',
    method: 'get',
    params: query
  })
}

// 刷新参数缓存
export function refreshCache(params) {
  return request({
    url: '/sys/config/refreshCache',
    method: 'get',
    params: params
  })
}
