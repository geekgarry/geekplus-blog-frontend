import request from '@/utils/request'

// 分页查询数据列表
export function listSysDictData(query) {
  return request({
    url: '/sys/dictData/list',
    method: 'get',
    params: query
  })
}

// 查询单条数据
export function getSysDictData(query) {
  return request({
    url: '/sys/dictData/detail',
    method: 'get',
    params: query
  })
}

// 删除单条数据
export function deleteSysDictData(query) {
return request({
    url: '/sys/dictData/remove',
    method: 'get',
    params: query
  })
}

// 批量删除数据
export function delSysDictData(ids) {
  return request({
    url: '/sys/dictData/' + ids,
    method: 'delete'
  })
}

// 修改数据
export function updateSysDictData(data) {
  return request({
    url: '/sys/dictData/edit',
    method: 'post',
    data: data
  })
}

// 添加数据
export function addSysDictData(data) {
  return request({
    url: '/sys/dictData/add',
    method: 'post',
    data: data
  })
}

//导出数据列表
export function exportSysDictData(query){
  return request({
    url: '/sys/dictData/export',
    method: 'get',
    params: query
  })
}
