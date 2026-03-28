import request from '@/utils/request'

//通用上传文件
export function uploadFile(formData) {
  return request({
    url: '/common/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

//上传图片文件,适用于文章等特殊场景
export function uploadFileForArticle(formData) {
  return request({
    url: '/common/uploadFile',
    method: 'post',
    data: formData,
    headers:{'Content-Type': 'multipart/form-data'}
  })
}

// 获取某个文件夹下的图片，删除文件资源
export function deleteFile(filePath) {
  return request({
    url: '/common/deleteFile',
    method: 'get',
    params:filePath
  })
}

// 获取某个文件夹下的图片list,批量删除
export function deleteFileList(filePath) {
  return request({
    url: '/common/deleteFileList',
    method: 'post',
    data:filePath
  })
}

//获取二维码
export function getQRCodeImg(textStr) {
  let queryParams = { qrCodeText: textStr }
  return request({
    url: '/common/getQRCode',
    method: 'get',
    params: queryParams
  })
}