import request from '@/utils/request'

// 分页查询数据列表
export function listSysDict(query) {
  return request({
    url: '/sys/dict/list',
    method: 'get',
    params: query
  })
}

// 查询单条数据
export function getSysDict(query) {
  return request({
    url: '/sys/dict/detail',
    method: 'get',
    params: query
  })
}

// 删除单条数据
export function deleteSysDict(query) {
return request({
    url: '/sys/dict/remove',
    method: 'get',
    params: query
  })
}

// 批量删除数据
export function delSysDict(ids) {
  return request({
    url: '/sys/dict/' + ids,
    method: 'delete'
  })
}

// 修改数据
export function updateSysDict(data) {
  return request({
    url: '/sys/dict/edit',
    method: 'post',
    data: data
  })
}

// 添加数据
export function addSysDict(data) {
  return request({
    url: '/sys/dict/add',
    method: 'post',
    data: data
  })
}

//导出数据列表
export function exportSysDict(query){
  return request({
    url: '/sys/dict/export',
    method: 'get',
    params: query
  })
}

//刷新字典数据缓存
export function refreshCache() {
  return request({
    url: '/sys/dict/refreshCache',
    method: 'get'
  })
}
