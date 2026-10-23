import request from '@/utils/request'

/** 上传单个文件，返回附件元数据 */
export function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)
  return request({
    url: '/oa/files/upload',
    method: 'post',
    data: form,
    timeout: 120000
  })
}

/** 批量上传 */
export function uploadFiles(fileList) {
  const form = new FormData()
  fileList.forEach(f => form.append('files', f))
  return request({
    url: '/oa/files/upload/batch',
    method: 'post',
    data: form,
    timeout: 180000
  })
}

export function fileUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  // 后端上传可能返回带 ?ts=&sign= 的短时签名路径，原样拼接即可
  const base = process.env.VUE_APP_BASE_API || '/dev-api'
  return base + (path.startsWith('/') ? path : '/' + path)
}

export function deleteFile(fileId) {
  return request({
    url: '/oa/files/' + fileId,
    method: 'delete'
  })
}
