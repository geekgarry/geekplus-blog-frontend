import request from '@/utils/request'

//查询所有音乐文件列表
export function readMusicFile(query){
  return request({
    url: '/geekplus/music/readMusicFileList',
    method: 'get',
    params: query
  })
}

// 分页查询数据列表
export function listGpMusic(query) {
  return request({
    url: '/geekplus/music/list',
    method: 'get',
    params: query
  })
}

// 查询单条数据
export function getGpMusic(query) {
  return request({
    url: '/geekplus/music/detail',
    method: 'get',
    params: query
  })
}

// 删除单条数据
export function deleteGpMusic(query) {
return request({
    url: '/geekplus/music/delete',
    method: 'get',
    params: query
  })
}

// 批量删除数据
export function delGpMusic(ids) {
  return request({
    url: '/geekplus/music/' + ids,
    method: 'delete'
  })
}

// 修改数据
export function updateGpMusic(data) {
  return request({
    url: '/geekplus/music/update',
    method: 'post',
    data: data
  })
}

// 添加数据
export function addGpMusic(data) {
  return request({
    url: '/geekplus/music/add',
    method: 'post',
    data: data
  })
}

//上传音乐文件
export function uploadMusicFile(formData) {
  return request({
    url: '/geekplus/music/uploadFile',
    method: 'post',
    data: formData,
    headers:{'Content-Type': 'multipart/form-data'}
  })
}

//导出数据列表
export function exportGpMusic(query){
  return request({
    url: '/geekplus/music/export',
    method: 'get',
    params: query
  })
}
