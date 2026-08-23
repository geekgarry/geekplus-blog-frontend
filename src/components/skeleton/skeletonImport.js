/**
 * P1：粘贴 / 上传布局文件 → 骨架 Schema（零新 npm，DOMParser）。
 * 支持：本工作室 Schema JSON、HTML 片段、Vue SFC 的 &lt;template&gt;。
 */
import { createSkeletonNode, defaultCanvas, isContainerType } from './skeletonSchema'

const MAX_NODES = 80

/**
 * @returns {{ schema: object, source: string } | { error: string }}
 */
export function importLayoutText(raw, fileName) {
  const text = String(raw || '').trim()
  if (!text) return { error: '内容为空' }

  // 1) Schema JSON
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const obj = JSON.parse(text)
      const schema = normalizeImportedSchema(obj)
      if (!schema) return { error: 'JSON 中未找到有效 nodes' }
      return { schema, source: 'json' }
    } catch (e) {
      /* 继续当 HTML 试 */
    }
  }

  // 2) Vue SFC：抽出 template
  let html = text
  const tpl = text.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  if (tpl) {
    html = tpl[1]
  }

  // 去掉 style/script
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '')

  if (!/<[a-z]/i.test(html)) {
    return { error: '无法识别为 Schema JSON 或 HTML/Vue 布局' }
  }

  try {
    const nodes = parseHtmlToNodes(html)
    if (!nodes.length) return { error: 'HTML 中未解析出可用结构' }
    return {
      schema: {
        version: 2,
        name: (fileName && String(fileName).replace(/\.[^.]+$/, '')) || '导入布局',
        canvas: defaultCanvas(),
        nodes,
      },
      source: tpl ? 'vue-sfc' : 'html',
    }
  } catch (e) {
    return { error: (e && e.message) || 'HTML 解析失败' }
  }
}

function normalizeImportedSchema(obj) {
  if (!obj) return null
  if (Array.isArray(obj)) {
    return { version: 2, name: '导入布局', canvas: defaultCanvas(), nodes: reIdTree(obj) }
  }
  if (Array.isArray(obj.nodes)) {
    return {
      version: obj.version || 2,
      name: obj.name || '导入布局',
      canvas: { ...defaultCanvas(), ...(obj.canvas || {}) },
      nodes: reIdTree(obj.nodes),
    }
  }
  return null
}

function reIdTree(nodes) {
  return (nodes || []).map((n) => {
    if (!n || !n.type) return null
    const { id: _i, children, ...rest } = n
    const next = createSkeletonNode(n.type, rest)
    if (isContainerType(n.type)) {
      next.children = reIdTree(children || [])
    }
    return next
  }).filter(Boolean)
}

/** HTML → 节点树（启发式，适合粗骨架） */
export function parseHtmlToNodes(html) {
  const doc = new DOMParser().parseFromString(
    `<div id="gp-skel-import-root">${html}</div>`,
    'text/html'
  )
  const root = doc.getElementById('gp-skel-import-root')
  if (!root) return []
  const nodes = []
  walkChildren(root, nodes, 0)
  return nodes.slice(0, MAX_NODES)
}

function walkChildren(parent, out, depth) {
  if (depth > 6 || out.length >= MAX_NODES) return
  const kids = Array.from(parent.children || [])
  if (!kids.length) {
    const t = (parent.textContent || '').trim()
    if (t.length > 8) out.push(createSkeletonNode('lines', { count: Math.min(4, Math.ceil(t.length / 40)) }))
    return
  }

  // 横向感：多个同级块且父级像 flex/row
  const style = (parent.getAttribute && parent.getAttribute('style')) || ''
  const className = String(parent.className || '')
  const looksRow =
    /flex-direction\s*:\s*row/i.test(style) ||
    /\b(row|flex-row|horizontal|nav|navbar|header-bar)\b/i.test(className)

  if (looksRow && kids.length >= 2 && kids.length <= 6) {
    const row = createSkeletonNode('row', { align: 'center', gap: 10, children: [] })
    kids.forEach((el) => {
      const piece = mapElement(el, depth + 1)
      if (piece) row.children.push(piece)
    })
    if (row.children.length) out.push(row)
    return
  }

  kids.forEach((el) => {
    if (out.length >= MAX_NODES) return
    const mapped = mapElement(el, depth + 1)
    if (mapped) out.push(mapped)
  })
}

function mapElement(el, depth) {
  if (!el || !el.tagName) return null
  const tag = el.tagName.toLowerCase()
  const cls = String(el.className || '')
  const role = (el.getAttribute && el.getAttribute('role')) || ''

  if (tag === 'script' || tag === 'style' || tag === 'link' || tag === 'meta') return null

  if (tag === 'img' || tag === 'svg' || /\bavatar\b/i.test(cls)) {
    const w = parseInt(el.getAttribute('width'), 10) || 0
    if (w && w <= 64) return createSkeletonNode('circle', { size: Math.max(28, w) })
    if (/\bavatar|round|circle\b/i.test(cls)) return createSkeletonNode('circle', { size: 48 })
    return createSkeletonNode('block', { height: 120, radius: 8 })
  }

  if (tag === 'input') {
    const t = (el.getAttribute('type') || 'text').toLowerCase()
    if (t === 'checkbox' || t === 'radio') return createSkeletonNode('circle', { size: 18 })
    return createSkeletonNode('field', { height: 36 })
  }
  if (tag === 'textarea') return createSkeletonNode('textarea', { height: 88 })
  if (tag === 'button' || (tag === 'a' && /\bbtn|button\b/i.test(cls))) {
    return createSkeletonNode('field', { width: '30%', height: 36, radius: 8 })
  }

  if (/^h[1-6]$/.test(tag)) {
    return createSkeletonNode('line', { width: '75%', height: tag === 'h1' ? 22 : 16 })
  }
  if (tag === 'p' || tag === 'span' || tag === 'label') {
    const len = (el.textContent || '').trim().length
    if (len < 4) return null
    if (len < 40) return createSkeletonNode('line', { width: '60%', height: 12 })
    return createSkeletonNode('lines', { count: Math.min(4, Math.ceil(len / 50)) })
  }

  if (tag === 'hr') return createSkeletonNode('gap', { height: 12 })
  if (tag === 'br') return null

  // 列表项 / 帖子卡片
  if (tag === 'li' || /\b(post|article-card|feed-item|list-item)\b/i.test(cls) || role === 'article') {
    return buildPostLikeItem(el)
  }

  if (tag === 'ul' || tag === 'ol') {
    const stack = createSkeletonNode('stack', { gap: 12, children: [] })
    Array.from(el.children || []).slice(0, 5).forEach((li) => {
      const item = mapElement(li, depth + 1)
      if (item) stack.children.push(item)
    })
    return stack.children.length ? stack : null
  }

  if (tag === 'nav' || tag === 'header') {
    const row = createSkeletonNode('row', {
      justify: 'space-between',
      align: 'center',
      children: [
        createSkeletonNode('block', { width: '28%', height: 28, radius: 6 }),
        createSkeletonNode('row', {
          width: '50%',
          gap: 8,
          justify: 'flex-end',
          children: [
            createSkeletonNode('line', { width: 40, height: 12 }),
            createSkeletonNode('line', { width: 40, height: 12 }),
            createSkeletonNode('circle', { size: 28 }),
          ],
        }),
      ],
    })
    return row
  }

  // 通用容器：有图文结构则当帖子，否则递归
  const imgs = el.querySelectorAll && el.querySelectorAll('img')
  const hasImg = imgs && imgs.length > 0
  const textLen = (el.textContent || '').trim().length
  if (hasImg && textLen > 20 && depth <= 3) {
    return buildPostLikeItem(el)
  }

  if (el.children && el.children.length) {
    const stack = createSkeletonNode('stack', { gap: 8, children: [] })
    walkChildren(el, stack.children, depth)
    if (stack.children.length === 1) return stack.children[0]
    return stack.children.length ? stack : null
  }

  if (textLen > 12) return createSkeletonNode('lines', { count: 2 })
  return createSkeletonNode('block', { height: 48, radius: 6 })
}

/** 帖子/列表项：左图或头像 + 右文案 */
function buildPostLikeItem(el) {
  const hasAvatar =
    el.querySelector &&
    (el.querySelector('img.avatar, .avatar img, img[class*="avatar"]') ||
      (el.querySelector('img') && (el.querySelector('img').width || 0) <= 72))
  const cover = el.querySelector && el.querySelector('img')
  const textStack = createSkeletonNode('stack', {
    flex: 1,
    gap: 8,
    children: [
      createSkeletonNode('line', { width: '70%', height: 14 }),
      createSkeletonNode('lines', { count: 2, height: 11, lastWidth: '55%' }),
    ],
  })
  if (hasAvatar) {
    return createSkeletonNode('row', {
      align: 'flex-start',
      gap: 10,
      children: [createSkeletonNode('circle', { size: 44 }), textStack],
    })
  }
  if (cover) {
    return createSkeletonNode('row', {
      align: 'stretch',
      gap: 10,
      children: [
        createSkeletonNode('block', { width: '32%', height: 72, radius: 8, flex: '' }),
        textStack,
      ],
    })
  }
  return createSkeletonNode('stack', {
    gap: 8,
    children: [
      createSkeletonNode('line', { width: '80%', height: 14 }),
      createSkeletonNode('lines', { count: 2 }),
    ],
  })
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

/** 压缩图片为 JPEG base64（去 dataURL 前缀），限制边长 */
export function compressImageToBase64(file, maxSide) {
  const side = maxSide || 1280
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        let { width: w, height: h } = img
        const scale = Math.min(1, side / Math.max(w, h))
        w = Math.max(1, Math.round(w * scale))
        h = Math.max(1, Math.round(h * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        URL.revokeObjectURL(url)
        const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '')
        resolve({ base64, mimeType: 'image/jpeg', width: w, height: h })
      } catch (e) {
        URL.revokeObjectURL(url)
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}
