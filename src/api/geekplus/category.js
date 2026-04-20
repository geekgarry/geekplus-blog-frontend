import request from '@/utils/request'

// 查询文章类型目录列表
export function listCategory(query) {
  return request({
    url: '/geekplus/category/list',
    method: 'get',
    params: query
  })
}

// 查询父目录文章类型目录列表
export function listParentCategory() {
  return request({
    url: '/geekplus/category/listParentCategory',
    method: 'get',
  })
}

// 查询父子目录菜单循环递归文章类型目录列表
export function listSubParentCategory() {
  return request({
    url: '/geekplus/category/listSubParentCategory',
    method: 'get',
  })
}

// 查询子目录菜单文章类型目录列表
export function listSubCategory() {
  return request({
    url: '/geekplus/category/listSubCategory',
    method: 'get',
  })
}

// 查询文章类型目录详细
export function getCategory(id) {
  return request({
    url: '/geekplus/category/' + id,
    method: 'get'
  })
}

// 新增文章类型目录
export function addCategory(data) {
  return request({
    url: '/geekplus/category',
    method: 'post',
    data: data
  })
}

// 修改文章类型目录
export function updateCategory(data) {
  return request({
    url: '/geekplus/category',
    method: 'put',
    data: data
  })
}

// 删除文章类型目录
export function delCategory(id) {
  return request({
    url: '/geekplus/category/' + id,
    method: 'delete'
  })
}

// 导出文章类型目录
export function exportCategory(query) {
  return request({
    url: '/geekplus/category/export',
    method: 'get',
    params: query
  })
}