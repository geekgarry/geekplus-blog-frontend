import request from '@/utils/request'

export function list_file(query) {
  return request({
    url: '/sys/file-manager/list',
      method: 'get',
      params: query
  })
}

export function search_file(query) {
  return request({
    url: '/sys/file-manager/search',
      method: 'get',
      params: query
  })
}

export function delete_batch_file(reqData) {
  return request({
    url: '/sys/file-manager/delete/batch',
      method: 'post',
      data: reqData
  })
}

export function delete_file(param) {
  return request({
    url: '/sys/file-manager/delete',
      method: 'post',
      params: param
  })
}

export function copy_file(reqData) {
  return request({
    url: '/sys/file-manager/copy',
      method: 'post',
      data: reqData
  })
}

export function move_file(reqData) {
  return request({
    url: '/sys/file-manager/move',
      method: 'post',
      data: reqData
  })
}

export function compress_file(reqData) {
  return request({
    url: '/sys/file-manager/compress',
      method: 'post',
      data: reqData
  })
}

export function rename_file(param) {
  return request({
    url: '/sys/file-manager/rename',
      method: 'post',
      params: param
  })
}

//通用上传文件
export function upload_file(formData) {
  return request({
    url: '/sys/file-manager/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function list_recycle_file() {
  return request({
    url: '/sys/file-manager/recycle/list',
      method: 'get'
  })
}

export function restore_recycle_file(reqData) {
  return request({
    url: '/sys/file-manager/recycle/restore',
      method: 'post',
      data: reqData
  })
}

export function delete_recycle_file(reqData) {
  return request({
    url: '/sys/file-manager/recycle/delete',
      method: 'post',
      data: reqData
  })
}

export function create_file(param) {
  return request({
    url: '/sys/file-manager/create',
      method: 'post',
      params: param
  })
}
