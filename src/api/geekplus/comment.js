import request from '@/utils/request'

// 查询用户评论回复留言列表
export function listComment(query) {
  return request({
    url: '/geekplus/comment/list',
    method: 'get',
    params: query
  })
}

// 查询用户文章评论回复留言列表
export function listArticleComment(query) {
  return request({
    url: '/geekplus/articlecomment/list',
    method: 'get',
    params: query
  })
}

// 查询用户评论回复留言详细
export function getComment(id) {
  return request({
    url: '/geekplus/comment/' + id,
    method: 'get'
  })
}

// 查询用户文章评论回复留言详细
export function getArticleComment(id) {
  return request({
    url: '/geekplus/articlecomment/' + id,
    method: 'get'
  })
}

// 新增用户评论回复留言
export function addComment(data) {
  return request({
    url: '/geekplus/comment',
    method: 'post',
    data: data
  })
}

// 新增用户文章评论回复留言
export function addArticleComment(data) {
  return request({
    url: '/geekplus/articlecomment',
    method: 'post',
    data: data
  })
}

// 修改用户评论回复留言
export function updateComment(data) {
  return request({
    url: '/geekplus/comment',
    method: 'put',
    data: data
  })
}

// 修改用户文章评论回复留言
export function updateArticleComment(data) {
  return request({
    url: '/geekplus/articlecomment',
    method: 'put',
    data: data
  })
}

// 删除用户评论回复留言
export function delComment(id) {
  return request({
    url: '/geekplus/comment/' + id,
    method: 'delete'
  })
}

// 删除用户评论回复留言
export function delArticleComment(id) {
  return request({
    url: '/geekplus/articlecomment/' + id,
    method: 'delete'
  })
}

// 导出用户评论回复留言
export function exportComment(query) {
  return request({
    url: '/geekplus/comment/export',
    method: 'get',
    params: query
  })
}

// 导出用户评论回复留言
export function exportArticleComment(query) {
  return request({
    url: '/geekplus/articlecomment/export',
    method: 'get',
    params: query
  })
}