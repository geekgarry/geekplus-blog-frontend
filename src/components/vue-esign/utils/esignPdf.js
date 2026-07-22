/**
 * 电子签名 PDF 工具（Vue2 / Vue3 通用纯 JS）
 * 依赖：pdf-lib、pdfjs-dist
 *
 * 安装：
 *   npm i pdf-lib pdfjs-dist@4.10.38
 */

import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

export const SIGNATURE_KEYWORDS = [
  '签名',
  '签字',
  '签章',
  '签署',
  '手签',
  '甲方签名',
  '乙方签名',
  '本人签名',
  'signature',
  'sign here',
  'sign:',
  'signed by'
]

export const DEFAULT_SIG_W = 0.18
export const DEFAULT_SIG_H = 0.06

export const IMAGE_EXT = /\.(png|jpe?g|webp|gif|bmp)$/i
export const PDF_EXT = /\.pdf$/i

let pdfWorkerReady = null

/**
 * 初始化 pdf.js Worker
 * 优先 Blob（解决 Nginx 把 .mjs 当成 octet-stream 的问题），失败回退 CDN
 * @param {string} [workerAssetUrl] - 可选：打包后的 worker 资源地址
 */
export function ensurePdfWorker(workerAssetUrl) {
  if (!pdfWorkerReady) {
    pdfWorkerReady = (async () => {
      try {
        if (workerAssetUrl) {
          const res = await fetch(workerAssetUrl)
          const code = await res.text()
          const blob = new Blob([code], { type: 'text/javascript' })
          pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob)
          return
        }
      } catch (e) {
        console.warn('[esign] blob worker 失败，改用 CDN', e)
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://unpkg.com/pdfjs-dist@' +
        pdfjsLib.version +
        '/build/pdf.worker.min.mjs'
    })()
  }
  return pdfWorkerReady
}

function loadHtmlImage(src) {
  return new Promise(function (resolve, reject) {
    const img = new Image()
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function () {
      reject(new Error('图片加载失败'))
    }
    img.src = src
  })
}

/**
 * 将图片字节转为 PDF（Uint8Array）
 */
export async function imageBytesToPdf(bytes, fileName, mimeHint) {
  const pdf = await PDFDocument.create()
  const lower = (fileName || '').toLowerCase()
  const mime = (mimeHint || '').toLowerCase()
  const raw = new Uint8Array(bytes)

  let image
  try {
    if (mime.indexOf('png') >= 0 || lower.slice(-4) === '.png') {
      image = await pdf.embedPng(raw)
    } else if (
      mime.indexOf('jpeg') >= 0 ||
      mime.indexOf('jpg') >= 0 ||
      /\.jpe?g$/i.test(lower)
    ) {
      image = await pdf.embedJpg(raw)
    } else {
      throw new Error('need-canvas')
    }
  } catch (e) {
    const blob = new Blob([raw], { type: mime || 'image/*' })
    const url = URL.createObjectURL(blob)
    try {
      const img = await loadHtmlImage(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法处理该图片')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL('image/png')
      const pngBytes = await fetch(pngUrl).then(function (r) {
        return r.arrayBuffer()
      })
      image = await pdf.embedPng(pngBytes)
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const maxSide = 1600
  let w = image.width
  let h = image.height
  if (Math.max(w, h) > maxSide) {
    const scale = maxSide / Math.max(w, h)
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }
  const page = pdf.addPage([w, h])
  page.drawImage(image, { x: 0, y: 0, width: w, height: h })
  return pdf.save()
}

/**
 * 识别 PDF 中签名关键词位置
 * @returns {Promise<Array<{pageIndex,x,y,width,height,label}>>}
 */
export async function detectSignatureSlots(pdfData, workerAssetUrl) {
  await ensurePdfWorker(workerAssetUrl)
  const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) })
  const pdf = await loadingTask.promise
  const slots = []

  for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex + 1)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()

    for (let i = 0; i < textContent.items.length; i++) {
      const item = textContent.items[i]
      if (!item.str || !String(item.str).trim()) continue
      const text = String(item.str).trim().toLowerCase()
      let matched = null
      for (let k = 0; k < SIGNATURE_KEYWORDS.length; k++) {
        if (text.indexOf(SIGNATURE_KEYWORDS[k].toLowerCase()) >= 0) {
          matched = SIGNATURE_KEYWORDS[k]
          break
        }
      }
      if (!matched) continue

      const tx = item.transform[4]
      const ty = item.transform[5]
      const fontHeight = Math.abs(item.transform[3]) || 12
      const slotX = Math.min(tx + item.width + 8, viewport.width * 0.7)
      const slotY = viewport.height - ty - fontHeight * 0.2

      slots.push({
        pageIndex: pageIndex,
        x: slotX / viewport.width,
        y: slotY / viewport.height,
        width: DEFAULT_SIG_W,
        height: DEFAULT_SIG_H,
        label: String(item.str).trim()
      })
    }
  }

  return slots
}

export function guessNameFromUrl(url) {
  const part = url.split('/').pop() || 'online-document'
  return part.split('?')[0] || 'online-document'
}

/** 兼容无 file.arrayBuffer 的旧环境 */
export function readFileAsArrayBuffer(file) {
  if (file.arrayBuffer) {
    return file.arrayBuffer()
  }
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    reader.onload = function () {
      resolve(reader.result)
    }
    reader.onerror = function () {
      reject(new Error('读取文件失败'))
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function renderPdfPageToDataUrl(doc, pageNum, scale) {
  const page = await doc.getPage(pageNum)
  const viewport = page.getViewport({ scale: scale || 1.5 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法渲染页面')
  await page.render({ canvasContext: ctx, viewport: viewport }).promise
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height
  }
}

/**
 * 将签名叠加到 PDF 并返回 Blob
 * placements: [{ pageIndex, x, y, width, height, image }]
 * 兼容旧调用：buildSignedPdfBlob(pdfBytes, signatureImageDataUrl, placements)
 */
export async function buildSignedPdfBlob(pdfBytes, signatureOrPlacements, maybePlacements) {
  let placements = maybePlacements
  let fallbackImage = null
  if (Array.isArray(signatureOrPlacements)) {
    placements = signatureOrPlacements
  } else {
    fallbackImage = signatureOrPlacements
  }
  if (!placements || !placements.length) {
    throw new Error('没有签名位置')
  }

  const pdfDocLib = await PDFDocument.load(pdfBytes.slice(0))
  const pages = pdfDocLib.getPages()
  const imageCache = {}

  for (let i = 0; i < placements.length; i++) {
    const p = placements[i]
    const page = pages[p.pageIndex]
    if (!page) continue
    const imgUrl = p.image || fallbackImage
    if (!imgUrl) continue
    if (!imageCache[imgUrl]) {
      const pngBytes = await fetch(imgUrl).then(function (r) {
        return r.arrayBuffer()
      })
      imageCache[imgUrl] = await pdfDocLib.embedPng(pngBytes)
    }
    const pngImage = imageCache[imgUrl]
    const size = page.getSize()
    const width = size.width
    const height = size.height
    const sigW = p.width * width
    const sigH = p.height * height
    const x = p.x * width
    const y = height - p.y * height - sigH
    page.drawImage(pngImage, { x: x, y: y, width: sigW, height: sigH })
  }

  const out = await pdfDocLib.save()
  return new Blob([new Uint8Array(out)], { type: 'application/pdf' })
}

export { pdfjsLib, PDFDocument }
