/**
 * Mock 公共工具：响应包装、路径双注册、简单分页。
 * 前缀与 .env 中 VUE_APP_BASE_API 默认 /dev-api 对齐。
 */

const API_PREFIX = process.env.VUE_APP_BASE_API || '/dev-api'

function ok (data, msg) {
  return { code: 200, msg: msg || '操作成功', data: data === undefined ? null : data }
}

function okRows (rows, total, msg) {
  return {
    code: 200,
    msg: msg || '查询成功',
    rows: rows || [],
    total: total != null ? total : (rows ? rows.length : 0),
  }
}

function fail (msg, code) {
  return { code: code != null ? code : 500, msg: msg || '操作失败', data: null }
}

/** 同一 handler 同时注册 `/path` 与 `/dev-api/path`，避免前缀遗漏 */
function mount (routes) {
  const out = {}
  Object.keys(routes).forEach((key) => {
    const handler = routes[key]
    const space = key.indexOf(' ')
    const method = key.slice(0, space).toUpperCase()
    let path = key.slice(space + 1)
    if (!path.startsWith('/')) path = '/' + path

    out[`${method} ${path}`] = handler
    if (path === API_PREFIX || path.indexOf(API_PREFIX + '/') === 0) {
      const stripped = path.slice(API_PREFIX.length) || '/'
      out[`${method} ${stripped}`] = handler
    } else {
      out[`${method} ${API_PREFIX}${path}`] = handler
    }
  })
  return out
}

function pageSlice (list, query) {
  const q = query || {}
  const pageNum = Math.max(1, parseInt(q.pageNum, 10) || 1)
  const pageSize = Math.max(1, parseInt(q.pageSize, 10) || 10)
  const start = (pageNum - 1) * pageSize
  return {
    rows: list.slice(start, start + pageSize),
    total: list.length,
  }
}

function readBody (req) {
  if (!req) return {}
  if (req.body && typeof req.body === 'object') return req.body
  return {}
}

function readQuery (req) {
  return (req && req.query) || {}
}

function getToken (req) {
  const h = (req && req.headers) || {}
  const header = h['plus-token'] || h['Plus-Token'] || h['PLUS-TOKEN']
  if (header) return String(header)
  const q = readQuery(req)
  if (q['Plus-Token']) return String(q['Plus-Token'])
  if (q.token) return String(q.token)
  const cookie = h.cookie || ''
  const m = String(cookie).match(/(?:^|;\s*)Plus-Token=([^;]*)/)
  if (m && m[1]) {
    try { return decodeURIComponent(m[1]) } catch (e) { return m[1] }
  }
  return ''
}

function requireAuth (req, res) {
  const token = getToken(req)
  if (!token || String(token).indexOf('mock-token-') !== 0) {
    res.status(401).send(fail('未登录或 Token 无效', 401))
    return null
  }
  const username = String(token).replace(/^mock-token-/, '')
  return { token, username }
}

module.exports = {
  API_PREFIX,
  ok,
  okRows,
  fail,
  mount,
  pageSlice,
  readBody,
  readQuery,
  getToken,
  requireAuth,
}
