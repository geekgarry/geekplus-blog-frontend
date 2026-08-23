/**
 * 简历附件本地解析：先抽文本再交给 AI，避免 JSON 传 File 丢内容导致空简历。
 * PDF 用已有 pdfjs；DOCX 用 mammoth；图片不抽文本（走 base64 多模态）。
 */
import { fileToBase64 } from '@/utils/gputil'

const PDF_MIME = 'application/pdf'
const DOC_MIME = 'application/msword'
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/**
 * @param {File} file
 * @returns {Promise<{ text: string, base64: string, mimeType: string, fileName: string, extractOk: boolean, extractNote: string }>}
 */
export async function parseResumeUploadFile(file) {
  if (!file) {
    throw new Error('未选择文件')
  }
  const mimeType = file.type || guessMimeByName(file.name)
  const fileName = file.name || 'resume'
  const base64 = await fileToBase64(file)
  let text = ''
  let extractOk = false
  let extractNote = ''

  try {
    if (mimeType === PDF_MIME || /\.pdf$/i.test(fileName)) {
      text = await extractPdfText(file)
      extractOk = !!(text && text.trim())
      extractNote = extractOk
        ? `已从 PDF 提取约 ${text.trim().length} 字`
        : 'PDF 未能提取文字（可能是扫描件），将改用文件原文交给 AI 识别'
    } else if (mimeType === DOCX_MIME || /\.docx$/i.test(fileName)) {
      text = await extractDocxText(file)
      extractOk = !!(text && text.trim())
      extractNote = extractOk
        ? `已从 Word 提取约 ${text.trim().length} 字`
        : 'Word 未能提取文字，将改用附件原文交给 AI'
    } else if (mimeType === DOC_MIME || /\.doc$/i.test(fileName)) {
      // 旧版 .doc mammoth 支持弱，主要依赖多模态 / 后端
      extractNote = '旧版 .doc 建议另存为 .docx；本次将尝试直接解析附件'
    } else if (/^image\//.test(mimeType)) {
      extractNote = '图片简历将交给 AI 识图提取'
    } else {
      extractNote = '未知类型，将尝试以附件形式解析'
    }
  } catch (err) {
    extractNote =
      (err && err.message) || '本地解析失败，将尝试把原文件交给 AI'
  }

  return {
    text: (text || '').trim(),
    base64,
    mimeType,
    fileName,
    extractOk,
    extractNote,
  }
}

function guessMimeByName(name) {
  const n = (name || '').toLowerCase()
  if (n.endsWith('.pdf')) return PDF_MIME
  if (n.endsWith('.docx')) return DOCX_MIME
  if (n.endsWith('.doc')) return DOC_MIME
  if (n.endsWith('.png')) return 'image/png'
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

async function extractPdfText(file) {
  const mod = await import('pdfjs-dist/build/pdf')
  const pdfjs = mod.default || mod
  // webpack 下 worker 走 CDN 同版本，避免本地 worker 路径在不同构建目标下失效
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
  }
  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjs.getDocument({ data }).promise
  const parts = []
  const maxPages = Math.min(doc.numPages || 0, 40)
  for (let i = 1; i <= maxPages; i += 1) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const line = (content.items || [])
      .map((item) => (item && item.str) || '')
      .join(' ')
    if (line.trim()) parts.push(line)
  }
  try {
    await doc.destroy()
  } catch (e) {
    /* ignore */
  }
  return parts.join('\n')
}

async function extractDocxText(file) {
  const mod = await import('mammoth')
  const mammoth = mod.default || mod
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return (result && result.value) || ''
}

/** 判断 AI 返回的结构化简历是否实质为空（常见于未读到附件内容） */
export function isEmptyResumePayload(parsed) {
  if (!parsed || typeof parsed !== 'object') return true
  const basics = parsed.basics || {}
  const hasBasics =
    !!(basics.name && String(basics.name).trim()) ||
    !!(basics.email && String(basics.email).trim()) ||
    !!(basics.phone && String(basics.phone).trim()) ||
    !!(basics.summary && String(basics.summary).trim())
  const hasList =
    (Array.isArray(parsed.work) && parsed.work.some((w) => w && (w.company || w.position || w.description))) ||
    (Array.isArray(parsed.education) &&
      parsed.education.some((e) => e && (e.school || e.degree))) ||
    (Array.isArray(parsed.projects) &&
      parsed.projects.some((p) => p && (p.name || p.description)))
  const hasSkills = !!(parsed.skills && String(parsed.skills).trim())
  return !(hasBasics || hasList || hasSkills)
}
