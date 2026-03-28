import request from '@/utils/request'

// 查询文章标签列表
export function listTags(query) {
  return request({
    url: '/geekplus/articletags/list',
    method: 'get',
    params: query
  })
}

// 查询文章标签详细
export function getTags(id) {
  return request({
    url: '/geekplus/articletags/' + id,
    method: 'get'
  })
}

// 新增文章标签
export function addTags(data) {
  return request({
    url: '/geekplus/articletags',
    method: 'post',
    data: data
  })
}

// 修改文章标签
export function updateTags(data) {
  return request({
    url: '/geekplus/articletags',
    method: 'put',
    data: data
  })
}

// 删除文章标签
export function delTags(id) {
  return request({
    url: '/geekplus/articletags/' + id,
    method: 'delete'
  })
}

// 导出文章标签
export function exportTags(query) {
  return request({
    url: '/geekplus/articletags/export',
    method: 'get',
    params: query
  })
}

// 根据文章ID查询文章标签详细
export function getTagByArticleId(id) {
  return request({
    url: '/geekplus/articletags/getTagByArticleId',
    method: 'get',
    params:id
  })
}

// 新增文章标签
export function addArticleMapTag(data) {
  return request({
    url: '/geekplus/articletags/insertGpArticleMapTag',
    method: 'post',
    data: data
  })
}

// 新增文章标签
export function deleteGpArticleMapTag(queryParams) {
  return request({
    url: '/geekplus/articletags/deleteGpArticleMapTag',
    method: 'get',
    params: queryParams
  })
}