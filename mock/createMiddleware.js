/**
 * 轻量 Mock 中间件（不依赖 umi-mock-middleware）
 * 路由表：mock/index.js（键为 `METHOD /path`，已由 mount 双注册 /dev-api 前缀）
 */

function attachSend (res) {
  if (typeof res.send === 'function') return
  res.send = function send (body) {
    if (body == null) {
      res.statusCode = res.statusCode || 200
      return res.end()
    }
    if (Buffer.isBuffer(body) || typeof body === 'string') {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      }
      return res.end(body)
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.end(JSON.stringify(body))
  }
}

function createMockMiddleware () {
  // 每次请求再 require，开发改 mock 文件后可在重启前部分热更（仍建议重启）
  return function geekPlusMockMiddleware (req, res, next) {
    let routes
    try {
      delete require.cache[require.resolve('./index')]
      routes = require('./index')
    } catch (e) {
      return next(e)
    }

    const raw = (req.originalUrl || req.url || '').split('?')[0]
    const path = raw || '/'
    const key = `${String(req.method || 'GET').toUpperCase()} ${path}`
    const handler = routes[key]
    if (!handler) return next()

    attachSend(res)
    try {
      return handler(req, res, next)
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = createMockMiddleware
