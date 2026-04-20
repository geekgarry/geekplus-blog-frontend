import request from '@/utils/request'

// 分页查询数据列表
export function listUsers(query) {
  return request({
    url: '/users/list',
    method: 'get',
    params: query
  })
}

// 查询单条数据
export function getUsers(query) {
  return request({
    url: '/users/detail',
    method: 'get',
    params: query
  })
}

// 删除单条数据
export function deleteUsers(query) {
return request({
    url: '/users/delete',
    method: 'get',
    params: query
  })
}

// 批量删除数据
export function delUsers(ids) {
  return request({
    url: '/users/' + ids,
    method: 'delete'
  })
}

// 修改数据
export function updateUsers(data) {
  return request({
    url: '/users/update',
    method: 'post',
    data: data
  })
}

// 添加数据
export function addUsers(data) {
  return request({
    url: '/users/add',
    method: 'post',
    data: data
  })
}

//导出数据列表
export function exportUsers(query){
  return request({
    url: '/users/export',
    method: 'get',
    params: query
  })
}
