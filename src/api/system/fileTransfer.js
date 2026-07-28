import request from '@/utils/request'

/** 后台：临时文件中转管理 */
export function listFileTransfer(params) {
  return request({
    url: '/geekplus/fileTransfer/list',
    method: 'get',
    params
  })
}

export function cleanupFileTransfer() {
  return request({
    url: '/geekplus/fileTransfer/cleanup',
    method: 'post'
  })
}

export function deleteFileTransfer(id) {
  return request({
    url: '/geekplus/fileTransfer/' + id,
    method: 'delete'
  })
}
