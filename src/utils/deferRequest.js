/**
 * 网络请求调度：空闲/延后执行非关键请求，避免首屏瞬时并发打满导致失败。
 * 参考成熟站点做法：关键内容优先 → 浏览量延迟+会话去重 → 侧栏/推荐 idle 加载。
 */

/** requestIdleCallback 兜底 */
export function runWhenIdle(fn, timeout = 2000) {
  if (typeof window === 'undefined') {
    fn()
    return 0
  }
  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(() => { fn() }, { timeout })
  }
  return window.setTimeout(fn, Math.min(800, timeout))
}

/** 延迟执行（可取消） */
export function runAfter(fn, ms = 1200) {
  if (typeof window === 'undefined') return 0
  return window.setTimeout(fn, ms)
}

export function cancelIdle(id) {
  if (id == null || typeof window === 'undefined') return
  if (typeof window.cancelIdleCallback === 'function') {
    try { window.cancelIdleCallback(id) } catch (e) { /* ignore */ }
  }
  window.clearTimeout(id)
}

/**
 * 文章浏览量：会话内同篇只计 1 次；停留后再上报；页隐藏时补发。
 * @param {object} opts
 * @param {string|number} opts.articleId
 * @param {Function} opts.send - 实际发请求的函数，返回 Promise 可选
 * @param {number} [opts.dwellMs=3000] 最短停留，过滤秒退
 * @param {string} [opts.storagePrefix='gp_viewed_']
 * @returns {{ cancel: Function }}
 */
export function scheduleArticleViewCount(opts) {
  const {
    articleId,
    send,
    dwellMs = 3000,
    storagePrefix = 'gp_viewed_'
  } = opts || {}
  if (!articleId || typeof send !== 'function') {
    return { cancel() {} }
  }
  const key = storagePrefix + String(articleId)
  let sent = false
  let timer = null
  let idleId = null

  const already = () => {
    try {
      return sessionStorage.getItem(key) === '1'
    } catch (e) {
      return false
    }
  }

  const mark = () => {
    try { sessionStorage.setItem(key, '1') } catch (e) { /* ignore */ }
  }

  const doSend = () => {
    if (sent || already()) return
    sent = true
    mark()
    try {
      const p = send()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } catch (e) { /* ignore */ }
  }

  if (already()) {
    return { cancel() {} }
  }

  // 停留达标后再 idle 发送，避免与正文抢带宽
  timer = window.setTimeout(() => {
    idleId = runWhenIdle(doSend, 1500)
  }, dwellMs)

  const onHide = () => {
    if (document.visibilityState === 'hidden') doSend()
  }
  const onPageHide = () => { doSend() }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', onPageHide)

  return {
    cancel() {
      if (timer) window.clearTimeout(timer)
      cancelIdle(idleId)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
    }
  }
}

/**
 * 按队列串行/限流执行任务，降低瞬时并发。
 * @param {Array<Function>} tasks 返回 Promise 的函数
 * @param {number} concurrency
 */
export async function runWithConcurrency(tasks, concurrency = 2) {
  const list = (tasks || []).filter(Boolean)
  let i = 0
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (i < list.length) {
      const idx = i++
      try {
        await list[idx]()
      } catch (e) { /* 单任务失败不阻断队列 */ }
    }
  })
  await Promise.all(workers)
}
