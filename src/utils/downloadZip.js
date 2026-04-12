import axios from 'axios'
import { getToken } from '@/utils/auth'

const mimeMap = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  file: 'application/*'
}

const baseUrl = process.env.VUE_APP_BASE_API
export function downLoadZip(requestUrl,filename) {
  var url = baseUrl + requestUrl
  axios({
    method: 'get',
    url: url,
    // params:queryParams,
    responseType: 'blob',
    headers: { 'Plus-Token': getToken() }//'Bearer ' +
  }).then(res => {
    resolveBlob(res, mimeMap.zip)
  })
}

// 通用文件下载
export function downloadFile(requestUrl) {
  var url = baseUrl + requestUrl
  axios({
    method: 'get',
    url: url,
    // params:queryParams,
    responseType: '*',
    headers: { 'Plus-Token': getToken() }//'Bearer ' +
  }).then(res => {
    resolveBlob(res, mimeMap.file)
  })
}

/**
 * 解析blob响应内容并下载
 * @param {*} res blob响应内容
 * @param {String} mimeType MIME类型
 */
export function resolveBlob(res, mimeType) {
  const aLink = document.createElement('a')
  var blob = new Blob([res.data], { type: mimeType })
  // //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
  var patT = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
  var contentDisposition = decodeURI(res.headers['content-disposition'])
  var result = patT.exec(contentDisposition)
  var fileName = result[1]
  fileName = fileName.replace(/\"/g, '')
  aLink.href = URL.createObjectURL(blob)
  aLink.setAttribute('download', fileName) // 设置下载文件名称
  document.body.appendChild(aLink)
  aLink.click()
  document.body.appendChild(aLink)
}
