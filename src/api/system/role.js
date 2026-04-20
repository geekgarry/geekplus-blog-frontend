import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/sys/role/list',
    method: 'get',
    params: query
  })
}

// 查询所以角色列表
export function listAllRole(query) {
  return request({
    url: '/sys/role/listAll',
    method: 'get',
    params: query
  })
}

//导出
export function exportRole(query){
  return request({
    url: '/sys/role/export',
    method: 'get',
    params: query
  })
}

//获取角色
export function getRole(query){
  return request({
    url: '/sys/role/detail',
    method: 'get',
    params: query
  })
}

//删除
export function deleteRole(query){
  return request({
    url: '/sys/role/delete',
    method: 'get',
    params: query
  })
}

//删除
export function delRole(ids){
  return request({
    url: '/sys/role/'+ids,
    method: 'delete'
  })
}

//添加role
export function addRole(data) {
  return request({
    url: '/sys/role/add',
    method: 'post',
    data: data
  })
}

//更新role
export function updateRole(data) {
  return request({
    url: '/sys/role/update',
    method: 'post',
    data: data
  })
}

//更改角色状态
export function changeRoleStatus(data) {
  return request({
    url: '/sys/role/update',
    method: 'post',
    data: data
  })
}

//查看用户的角色
export function listUserRoles(query) {
  return request({
    url: '/sys/userRole/listAll',
    method: 'get',
    params: query
  })
}

//添加用户的角色
export function addUserRoles(data) {
  return request({
    url: '/sys/userRole/add',
    method: 'post',
    data: data
  })
}

//批量添加用户的角色
export function batchAddUserRoles(data) {
  return request({
    url: '/sys/userRole/batchAdd',
    method: 'post',
    data: data
  })
}

//删除用户所属的角色
export function deleteUserRoles(query) {
  return request({
    url: '/sys/userRole/deleteUserRole',
    method: 'get',
    params: query
  })
}

//删除用户所属的角色
export function batchDeleteUserRoles(dataForm) {
  return request({
    url: '/sys/userRole/batchDeleteUserRole',
    method: 'put',
    data: dataForm
  })
}