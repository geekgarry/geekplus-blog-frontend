import Cookies from 'js-cookie'

const TokenKey = 'Plus-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setTokenExpires(token) {
  //设置过期时间为7天
  return Cookies.set(TokenKey, token, { expires: 90 })
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
