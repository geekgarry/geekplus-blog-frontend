import request from '@/utils/request'

// 查询文章列表
export function listArticles(query) {
  return request({
    url: '/geekplus/articles/list',
    method: 'get',
    params: query
  })
}

// 查询文章详细
export function getArticles(id) {
  return request({
    url: '/geekplus/articles/' + id,
    method: 'get'
  })
}

// 新增文章
export function addArticles(data) {
  return request({
    url: '/geekplus/articles',
    method: 'post',
    data: data
  })
}

// 修改文章
export function updateArticles(data) {
  return request({
    url: '/geekplus/articles',
    method: 'put',
    data: data
  })
}

//更新文章展示状态
export function changeArticleStatus(id,isDisplay){
  let dataForm={id: id, isDisplay: isDisplay}
  return request({
    url: '/geekplus/articles',
    method: 'put',
    data: dataForm
  })
}

// 删除文章
export function delArticles(id) {
  return request({
    url: '/geekplus/articles/' + id,
    method: 'delete'
  })
}

// 导出文章
export function exportArticles(query) {
  return request({
    url: '/geekplus/articles/export',
    method: 'get',
    params: query
  })
}

//获取某个文件夹下的所有文件和文件夹
export function readAllFileList(queryParams) {
  return request({
    url: '/geekplus/articles/readFileList',
    method: 'get',
    params:queryParams,
  })
}

//获取某个文件夹下的图片list
export function getAllImageList(filePath) {
  return request({
    url: '/geekplus/articles/getImageList',
    method: 'get',
    params:filePath
  })
}
