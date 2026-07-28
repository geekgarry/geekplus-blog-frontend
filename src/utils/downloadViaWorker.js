/**
 * 统一文件下载：优先 Web Worker / Service Worker，减轻主线程压力
 * 复用 public/worker/downloadWorker.js 与 downloadServiceWorker.js
 */
import store from '@/store'

const SIZE_50MB = 50 * 1024 * 1024
const SIZE_200MB = 200 * 1024 * 1024

function triggerBlobSave(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename || 'download.bin'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}

function parseFilename(disposition, fallback) {
  if (!disposition) return fallback
  const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
  if (m) {
    try {
      return decodeURIComponent(m[1] || m[2])
    } catch (e) {
      return m[1] || m[2] || fallback
    }
  }
  return fallback
}

/**
 * Web Worker 下载（适合 < ~50–100MB，支持自定义 method/headers）
 * @returns {Promise<{blob: Blob, filename: string}>}
 */
export function downloadByWebWorker({
  url,
  filename,
  method = 'GET',
  headers = {},
  body,
  timeout = 180000,
  onProgress
}) {
  return new Promise((resolve, reject) => {
    if (!window.Worker) {
      reject(new Error('Web Worker not supported'))
      return
    }
    const worker = new Worker('/worker/downloadWorker.js')
    const timer = setTimeout(() => {
      worker.terminate()
      reject(new Error('Download timeout'))
    }, timeout + 5000)

    worker.onmessage = (e) => {
      const msg = e.data || {}
      if (msg.type === 'progress') {
        if (typeof onProgress === 'function') onProgress(msg)
      } else if (msg.type === 'success') {
        clearTimeout(timer)
        const name = parseFilename(msg.disposition, filename || msg.filename)
        worker.terminate()
        resolve({ blob: msg.blob, filename: name })
      } else if (msg.type === 'error') {
        clearTimeout(timer)
        worker.terminate()
        reject(new Error(msg.error || 'Download failed'))
      }
    }
    worker.onerror = (err) => {
      clearTimeout(timer)
      worker.terminate()
      reject(err)
    }
    worker.postMessage({ url, filename, method, headers, body, timeout })
  })
}

/**
 * Service Worker 流式下载（适合大文件，浏览器原生落盘；密码走 query）
 * 需已注册 /worker/downloadServiceWorker.js
 */
export function downloadByServiceWorker({ url, filename, onProgress }) {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      reject(new Error('Service Worker not ready'))
      return
    }
    const sep = url.indexOf('?') >= 0 ? '&' : '?'
    const swUrl = `${url}${sep}sw_download=true`

    const onMessage = (event) => {
      const msg = event.data || {}
      if (msg.url && msg.url.indexOf(url.split('?')[0]) === -1) return
      if (msg.type === 'sw_progress' && typeof onProgress === 'function') {
        onProgress(msg)
      } else if (msg.type === 'sw_success') {
        navigator.serviceWorker.removeEventListener('message', onMessage)
        resolve({ filename })
      } else if (msg.type === 'sw_error') {
        navigator.serviceWorker.removeEventListener('message', onMessage)
        reject(new Error(msg.error || 'SW download failed'))
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.title = filename || 'download'
    iframe.src = swUrl
    document.body.appendChild(iframe)
    setTimeout(() => {
      try { iframe.remove() } catch (e) { /* ignore */ }
    }, 60000)
  })
}

/**
 * 按文件大小自动选择策略
 * @param {object} opts
 * @param {string} opts.url
 * @param {string} opts.filename
 * @param {number} [opts.fileSize]
 * @param {string} [opts.method]
 * @param {object} [opts.headers]
 * @param {object|string} [opts.body]
 * @param {string} [opts.password] — 大文件走 SW/原生时拼到 query
 * @param {function} [opts.onProgress]
 * @param {boolean} [opts.save=true] — Worker 成功后是否自动触发保存
 */
export async function smartDownload(opts) {
  const {
    url,
    filename,
    fileSize = 0,
    method = 'GET',
    headers = {},
    body,
    password,
    onProgress,
    save = true
  } = opts

  const swReady = !!(store.getters && store.getters.swRegistered &&
    navigator.serviceWorker && navigator.serviceWorker.controller)

  const withPasswordQuery = (u) => {
    if (!password) return u
    const sep = u.indexOf('?') >= 0 ? '&' : '?'
    return `${u}${sep}password=${encodeURIComponent(password)}`
  }

  // 中大文件：走 SW / 原生流式落盘（密码改 query，避免整文件进内存）
  if (fileSize >= SIZE_50MB && fileSize < SIZE_200MB && swReady) {
    await downloadByServiceWorker({
      url: withPasswordQuery(url),
      filename,
      onProgress
    })
    return { mode: 'service-worker', filename }
  }

  if (fileSize >= SIZE_200MB || (fileSize >= SIZE_50MB && !swReady)) {
    const a = document.createElement('a')
    a.href = withPasswordQuery(url)
    a.rel = 'noopener'
    a.download = filename || ''
    document.body.appendChild(a)
    a.click()
    a.remove()
    return { mode: 'native', filename }
  }

  // 小文件：Web Worker（支持密码 POST / Header，进度更细）
  const result = await downloadByWebWorker({
    url,
    filename,
    method,
    headers,
    body,
    onProgress
  })
  if (save) {
    triggerBlobSave(result.blob, result.filename)
  }
  return { mode: 'web-worker', ...result }
}

export { triggerBlobSave, parseFilename, SIZE_50MB, SIZE_200MB }
