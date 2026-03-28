import request from '@/utils/request'

// 查询文章标签映射列表
export function listTag(query) {
  return request({
    url: '/geekplus/articlemaptag/list',
    method: 'get',
    params: query
  })
}

// 查询文章标签映射详细
export function getTag(aticleId) {
  return request({
    url: '/geekplus/articlemaptag/' + aticleId,
    method: 'get'
  })
}

// 新增文章标签映射
export function addTag(data) {
  return request({
    url: '/geekplus/articlemaptag',
    method: 'post',
    data: data
  })
}

// 修改文章标签映射
export function updateTag(data) {
  return request({
    url: '/geekplus/articlemaptag',
    method: 'put',
    data: data
  })
}

// 删除文章标签映射
export function delTag(aticleId) {
  return request({
    url: '/geekplus/articlemaptag/' + aticleId,
    method: 'delete'
  })
}

// 导出文章标签映射
export function exportTag(query) {
  return request({
    url: '/geekplus/articlemaptag/export',
    method: 'get',
    params: query
  })
}