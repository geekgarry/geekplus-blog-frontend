import request from '@/utils/request'

//获取
export function getMenu() {
  return request({
    url: '/sys/menu/getMenu',
    method: 'get',
  })
}

//添加
export function addMenu(dataForm) {
  return request({
    url: '/sys/menu/add',
    method: 'post',
    data: dataForm
  })
}

//修改
export function updateMenu(data){
  return request({
    url: '/sys/menu/update',
    method: 'post',
    data: data
  })
}

//删除
export function deleteMenu(query){
  return request({
    url: '/sys/menu/delete',
    method: 'get',
    params: query
  })
}

//批量删除
export function batchDeleteMenu(ids){
  return request({
    url: '/sys/menu/'+ids,
    method: 'delete'
  })
}

//获取菜单详情
export function getMenuDetail(query){
  return request({
    url: '/sys/menu/detail',
    method: 'get',
    params: query
  })
}

//根据userId查询菜单权限
export function getMenuListByUserId(userId){
  return request({
    url: '/sys/menu/getMenuByUserId',
    method: 'get',
    params: userId
  })
}

//根据角色查询菜单权限
export function getMenuListByRoleId(roleId){
  return request({
    url: '/sys/menu/getMenuByRoleId',
    method: 'get',
    params: roleId
  })
}

//查询分页菜单列表
export function listMenu(query){
  return request({
    url: '/sys/menu/list',
    method: 'get',
    params: query
  })
}

//查询所有菜单列表
export function listAllMenu(query){
  return request({
    url: '/sys/menu/listAll',
    method: 'get',
    params: query
  })
}

//获取角色的菜单权限树
export function getMenuTreeSelectedByRoleId(query){
  return request({
    url: '/sys/menu/getMenuTreeSelected',
    method: 'get',
    params: query
  })
}

//获取所有菜单权限树
export function getAllMenuListTree(){
  return request({
    url: '/sys/menu/getMenuTreeList',
    method: 'get',
  })
}

//获取所有菜单权限树
export function getAllMenuIdList(){
  return request({
    url: '/sys/menu/getAllMenuIdList',
    method: 'get',
  })
}

//添加角色菜单权限
export function addRoleMenus(data){
  return request({
    url: '/sys/roleMenu/add',
    method: 'post',
    data: data
  })
}

//批量添加角色菜单权限
export function batchAddRoleMenus(dataList){
  return request({
    url: '/sys/roleMenu/batchAdd',
    method: 'post',
    data: dataList
  })
}

//删除角色菜单权限
export function deleteRoleMenus(query){
  return request({
    url: '/sys/roleMenu/delete',
    method: 'get',
    params: query
  })
}

//批量删除角色菜单权限
export function batchDeleteRoleMenus(dataList){
  return request({
    url: '/sys/roleMenu/batchDeleteRoleMenu',
    method: 'put',
    data: dataList
  })
}