import axios from 'axios'
import { getToken } from '@/utils/auth'

const mimeMap = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
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
  return axios({
    method: 'get',
    url: url,
    // params:queryParams,
    responseType: 'blob',
    headers: { 'Plus-Token': getToken() }//'Bearer ' +
  }).then(res => {
    return resolveInlineBlob(res)// 返回以便获取previewUrl
  }).catch(error => {
    console.error(`${actionType}失败:`, error);
    return Promise.reject(error);
  });
}

/**
 * 解析blob响应内容并下载
 * @param {*} res blob响应内容
 * @param {String} mimeType MIME类型
 */
export function resolveBlob(res, mimeType) {
  // 兼容 IE 浏览器
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // 从headers中获取filename
    var patT = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
    var contentDisposition = decodeURI(res.headers['content-disposition'] || '')
    var result = patT.exec(contentDisposition)
    var fileName = result ? result[1].replace(/\"/g, '') : 'download'
    var blob = new Blob([res.data], { type: mimeType });
    window.navigator.msSaveOrOpenBlob(blob, fileName);
    return;
  }
  const aLink = document.createElement('a')
  var blob = null
  try {
    // 现代浏览器
    blob = new Blob([res.data], { type: mimeType })
  } catch (e) {
    // 旧版安卓兼容（如微信浏览器）
    const BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    if (BlobBuilder) {
      const builder = new BlobBuilder();
      builder.append(res.data);
      blob = builder.getBlob(mimeType);
    }
    // else {
    //   // 终极降级：Base64 Data URL（适合小图）
    //   const base64 = btoa(String.fromCharCode(...new Uint8Array(res.data)));
    //   url = `${res.headers['content-type']};base64,${base64}`;
    // }
  }
  // //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
  var patT = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
  var contentDisposition = decodeURI(res.headers['content-disposition'])
  var result = patT.exec(contentDisposition)
  var fileName = result[1]
  fileName = fileName.replace(/\"/g, '')
  aLink.style.display = 'none';
  aLink.href = URL.createObjectURL(blob)
  aLink.setAttribute('download', fileName) // 设置下载文件名称
  document.body.appendChild(aLink)
  aLink.click()
  document.body.removeChild(aLink)
  URL.revokeObjectURL(blob)
}

//分别处理下载和预览两种情况，按照照后端返回的Content-disposition头中的inline或attachment来判断是预览还是下载,
// 如果是inline，直接在浏览器中打开；否则，按照attachment处理下载，避免使用res.responseText
export function resolveInlineBlob(res) {
  // 兼容 IE 浏览器
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // 从headers中获取filename
    var patT = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
    var contentDisposition = decodeURI(res.headers['content-disposition'] || '')
    var result = patT.exec(contentDisposition)
    var fileName = result ? result[1].replace(/\"/g, '') : 'download'
    var blob = new Blob([res.data], { type: res.headers['content-type'] });
    window.navigator.msSaveOrOpenBlob(blob, fileName);
    return Promise.resolve('downloaded');
  }
  const aLink = document.createElement('a')
  var blob = null;
  var url = null;
  var isBlobUrl = false;
  try {
    // 现代浏览器
    blob = new Blob([res.data], { type: res.headers['content-type'] });
    url = URL.createObjectURL(blob);
    isBlobUrl = true;
  } catch (e) {
    // 旧版安卓兼容（如微信浏览器）
    const BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    if (BlobBuilder) {
      const builder = new BlobBuilder();
      builder.append(res.data);
      blob = builder.getBlob(res.headers['content-type']);
      url = URL.createObjectURL(blob);
      isBlobUrl = true;
    } else {
      // 终极降级：Base64 Data URL（适合小图）
      const base64 = btoa(String.fromCharCode(...new Uint8Array(res.data)));
      url = `data:${res.headers['content-type']};base64,${base64}`;
      isBlobUrl = false;
    }
  }
  // 从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
  var patT = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
  var contentDisposition = decodeURI(res.headers['content-disposition'] || '')
  var dispositionType = contentDisposition.split(';')[0].trim().toLowerCase();
  var result = patT.exec(contentDisposition)
  var fileName = result ? result[1].replace(/\"/g, '') : 'download'
  if (dispositionType === 'inline') {
    // 如果是inline，返回预览信息对象
    return Promise.resolve({ previewUrl: url, isBlobUrl });
  } else {
    // 否则，按照attachment处理下载
    aLink.style.display = 'none';
    aLink.href = url;
    aLink.setAttribute('download', fileName) // 设置下载文件名称
    document.body.appendChild(aLink)
    aLink.click()
    document.body.removeChild(aLink)
    // 下载后立即revoke blob URL
    if (isBlobUrl) {
      URL.revokeObjectURL(url);
    }
    return Promise.resolve('downloaded');
  }
}
function getFileNameFromHeaders(headers) {
  const contentDisposition = decodeURI(headers['content-disposition'] || '')
  const patT = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
  const result = patT.exec(contentDisposition)
  if (result && result[1]) {
    return result[1].replace(/\"/g, '')
  }
  return ''
}
function getDataArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsArrayBuffer(blob);
  });
}
