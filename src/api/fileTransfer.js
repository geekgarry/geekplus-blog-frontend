import request from '@/utils/request'
import { transferIdentityHeaders } from '@/utils/deviceIdentity'
import axios from 'axios'
import { getToken } from '@/utils/auth'

/**
 * 临时文件中转 API（免登录）
 */

export function uploadTransferFiles(formData, onUploadProgress) {
  return request({
    url: '/geekplusapp/transfer/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      isToken: false,
      ...transferIdentityHeaders()
    },
    timeout: 120000,
    retry: 0,
    onUploadProgress
  })
}

export function getTransferInfo(shareCode) {
  return request({
    url: '/geekplusapp/transfer/info/' + encodeURIComponent(shareCode),
    method: 'get',
    headers: { isToken: false },
    retry: 0
  })
}

export function revokeTransfer(shareCode) {
  return request({
    url: '/geekplusapp/transfer/revoke/' + encodeURIComponent(shareCode),
    method: 'post',
    headers: {
      isToken: false,
      ...transferIdentityHeaders()
    },
    retry: 0
  })
}

/** 带密码下载：用 axios blob，避免业务拦截器吃掉二进制流 */
export function downloadTransferBlob(shareCode, password) {
  const base = process.env.VUE_APP_BASE_API || ''
  const headers = {
    ...transferIdentityHeaders()
  }
  if (password) {
    headers['X-Transfer-Password'] = password
  }
  const token = getToken()
  if (token) headers['Plus-Token'] = token
  return axios({
    url: base + '/geekplusapp/transfer/download/' + encodeURIComponent(shareCode),
    method: 'post',
    data: password ? { password } : {},
    headers,
    responseType: 'blob',
    timeout: 120000
  })
}
