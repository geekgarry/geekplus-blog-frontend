/**
 * 浏览器指纹 + 本机机器号（localStorage），用于文件中传限流识别
 */
const FP_KEY = 'gp_browser_fp'
const MACHINE_KEY = 'gp_machine_id'

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16)
}

export function getMachineId() {
  try {
    let id = localStorage.getItem(MACHINE_KEY)
    if (!id) {
      id = 'm_' + hashString(String(Math.random()) + Date.now()) + Date.now().toString(36)
      localStorage.setItem(MACHINE_KEY, id)
    }
    return id
  } catch (e) {
    return 'm_unknown'
  }
}

export function getBrowserFingerprint() {
  try {
    let cached = localStorage.getItem(FP_KEY)
    if (cached) return cached
    const nav = typeof navigator !== 'undefined' ? navigator : {}
    const scr = typeof screen !== 'undefined' ? screen : {}
    const raw = [
      nav.userAgent || '',
      nav.language || '',
      nav.platform || '',
      scr.width || '',
      scr.height || '',
      scr.colorDepth || '',
      new Date().getTimezoneOffset(),
      (nav.hardwareConcurrency || ''),
      (nav.deviceMemory || '')
    ].join('|')
    const fp = 'fp_' + hashString(raw)
    localStorage.setItem(FP_KEY, fp)
    return fp
  } catch (e) {
    return 'fp_unknown'
  }
}

export function transferIdentityHeaders() {
  return {
    'X-Fingerprint': getBrowserFingerprint(),
    'X-Machine-Id': getMachineId()
  }
}
