import Cookies from 'js-cookie'

const TokenKey = 'Plus-Token'

/** 与后端 token.expireTime（默认 30 天）对齐 */
const BLOG_TOKEN_DAYS = 30

export function getToken() {
  return Cookies.get(TokenKey)
}

/**
 * 写入登录凭证
 * @param {string} token
 * @param {boolean} [rememberMe=true] 勾选则长期 Cookie；否则会话级（关浏览器失效）
 */
export function setTokenExpires(token, rememberMe = true) {
  if (rememberMe) {
    return Cookies.set(TokenKey, token, { expires: BLOG_TOKEN_DAYS })
  }
  return Cookies.set(TokenKey, token)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
