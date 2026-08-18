const DEFAULT_AVATAR = require('@/assets/mai.jpg')

export function resolveAvatarUrl(raw) {
  if (!raw) return DEFAULT_AVATAR
  const s = String(raw).trim()
  if (!s || s === 'null' || s === 'undefined') return DEFAULT_AVATAR
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s
  const base = process.env.VUE_APP_BASE_API || ''
  if (base && s.indexOf(base) === 0) return s
  if (s.charAt(0) === '/') return base + s
  return base + '/' + s.replace(/^\//, '')
}

/** 统一 peer / 推送里的 clientId → userId 字符串 */
export function normalizeClientId(raw) {
  if (raw == null || raw === '') return ''
  let id = String(raw).trim()
  if (id.includes(':')) {
    const parts = id.split(':')
    id = parts[parts.length - 1]
  }
  return id
}

export function resolveMediaUrl(raw) {
  if (!raw) return ''
  const s = String(raw).trim()
  if (!s) return ''
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s
  const base = process.env.VUE_APP_BASE_API || ''
  if (base && s.indexOf(base) === 0) return s
  if (s.charAt(0) === '/') return base + s
  return base + '/' + s.replace(/^\//, '')
}

export { DEFAULT_AVATAR }
