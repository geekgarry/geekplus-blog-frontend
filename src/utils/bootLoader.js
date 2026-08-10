/**
 * 首屏 boot loader：DOM 在 #app 外，避免 Vue.$mount 时被清空。
 * 防 FOUC：等 stylesheet 可用 + 双 rAF 后再揭开 #app / 收起骨架。
 */

function doubleRaf() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      window.setTimeout(resolve, 32)
      return
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

/** 等待已插入的 link[rel=stylesheet] 完成（含异步 chunk 注入的 CSS） */
export function waitForStylesheets(timeoutMs = 2500) {
  if (typeof document === 'undefined') return Promise.resolve()

  const links = Array.prototype.slice.call(
    document.querySelectorAll('link[rel="stylesheet"]')
  )

  const pending = links.filter((link) => {
    if (!link || link.disabled) return false
    // 已能读 sheet 视为就绪；跨域 sheet 可能读不到，靠 load 事件
    try {
      if (link.sheet) return false
    } catch (e) {
      return false
    }
    return true
  })

  if (!pending.length) return doubleRaf()

  return new Promise((resolve) => {
    let left = pending.length
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      doubleRaf().then(resolve)
    }
    const onOne = () => {
      left -= 1
      if (left <= 0) finish()
    }
    pending.forEach((link) => {
      link.addEventListener('load', onOne, { once: true })
      link.addEventListener('error', onOne, { once: true })
    })
    window.setTimeout(finish, timeoutMs)
  })
}

export function revealApp() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove('gp-booting')
}

export function hideBootLoader(delayMs = 120) {
  if (typeof window === 'undefined') return
  revealApp()
  if (typeof window.__gpHideBootLoader === 'function') {
    window.__gpHideBootLoader(delayMs)
    return
  }
  const el = document.getElementById('loader-wrapper')
  if (!el || el.classList.contains('is-done')) return
  el.classList.add('is-hiding')
  window.setTimeout(() => {
    el.classList.add('is-done')
    el.setAttribute('aria-hidden', 'true')
    window.__gpBootLoaderHidden = true
  }, Math.max(0, delayMs))
}

/** 布局已挂载：等样式落地后再收骨架，避免「先裸 HTML 后出样式」 */
export function markBootReady() {
  if (typeof window === 'undefined') return
  waitForStylesheets(2500).then(() => {
    if (typeof window.__gpMarkBootReady === 'function') {
      window.__gpMarkBootReady()
    } else {
      hideBootLoader(160)
    }
  })
}

export function isBootLoaderHidden() {
  return !!(typeof window !== 'undefined' && window.__gpBootLoaderHidden)
}
