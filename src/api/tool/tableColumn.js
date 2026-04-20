import request from '@/utils/request'

// 分页查询数据列表
export function listGenTableColumn(query) {
  return request({
    url: '/generator/genTableColumn/list',
    method: 'get',
    params: query
  })
}

// 查询单条数据
export function getGenTableColumn(query) {
  return request({
    url: '/generator/genTableColumn/detail',
    method: 'get',
    params: query
  })
}

// 删除单条数据
export function deleteGenTableColumn(query) {
return request({
    url: '/generator/genTableColumn/delete',
    method: 'get',
    params: query
  })
}

// 批量删除数据
export function delGenTableColumn(ids) {
  return request({
    url: '/generator/genTableColumn/' + ids,
    method: 'delete'
  })
}

// 修改数据
export function updateGenTableColumn(data) {
  return request({
    url: '/generator/genTableColumn/update',
    method: 'post',
    data: data
  })
}

// 添加数据
export function addGenTableColumn(data) {
  return request({
    url: '/generator/genTableColumn/add',
    method: 'post',
    data: data
  })
}

//导出数据列表
export function exportGenTableColumn(query){
  return request({
    url: '/generator/genTableColumn/export',
    method: 'get',
    params: query
  })
}

// 清空生成数据表
export function cleanGenTable() {
  return request({
      url: '/generator/genTableColumn/clean',
      method: 'delete'
  })
}
