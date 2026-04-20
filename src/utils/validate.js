/**
 * Created by GeekPlus on 23/11/18.
 */
export function illegalEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmail(email) {
  if (email.indexOf('@') === -1 || email.lastIndexOf('.') === -1) {
      return false;
  }
  if (email.lastIndexOf('.') < email.indexOf('@') || email.lastIndexOf('.') === email.length - 1) {
      return false;
  }
  return true;
}

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  // const valid_map = ['admin', 'editor','abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ']
  // return valid_map.indexOf(str.trim()) >= 0
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(str);
}

/**
 * @description 校验密码是否小于6位
 * @param str
 * @returns {boolean}
 */
export function isPassword(str) {
  return str.length >= 6
}
/**
 * @description 判断是否是字符串
 * @param str
 * @returns {boolean}
 */
export function isString(str) {
  return typeof str === 'string' || str instanceof String
}
/**
 * @description 判断是否是数组
 * @param arg
 * @returns {arg is any[]|boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}
/**
 * @description 判断是否是手机号
 * @param str
 * @returns {boolean}
 */
export function isPhone(str) {
  const reg = /^1\d{10}$/
  return reg.test(str)
}
