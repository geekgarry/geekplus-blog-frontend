import request from '@/utils/request'

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/sys/dept/listAll',
    method: 'get',
    params: query
  })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/sys/dept/list/exclude/' + deptId,
    method: 'get'
  })
}

// 查询部门详细
export function getDept(queryParams) {
  return request({
    url: '/sys/dept/detail',
    method: 'get',
    params: queryParams
  })
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return request({
    url: '/sys/dept/getSysDeptTree',
    method: 'get'
  })
}

// 根据角色ID查询部门树结构
export function roleDeptTreeselect(roleId) {
  return request({
    url: '/sys/dept/roleDeptTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/sys/dept/add',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/sys/dept/update',
    method: 'post',
    data: data
  })
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/sys/dept/' + deptId,
    method: 'delete'
  })
}