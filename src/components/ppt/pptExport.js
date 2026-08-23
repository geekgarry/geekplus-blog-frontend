/**
 * PPT 导出与幻灯片 HTML 构建：固定 16:9 画幅，对齐真实演示文稿比例。
 */
import jsPDF from 'jspdf'
import * as htmlToImage from 'html-to-image'
import { fontStackById } from './pptThemes'

/** 标准 16:9 幻灯片像素尺寸（导出 / 截图） */
export const PPT_SLIDE_WIDTH = 1280
export const PPT_SLIDE_HEIGHT = 720

/**
 * 全局设置优先于单页 transition（设置抽屉「幻灯片切换」）
 * 单页 transition 非空时覆盖全局（编辑里选了具体动画）
 */
export function resolveSlideTransition(slide, settings) {
  if (slide && slide.transition) return slide.transition
  if (settings && settings.transition) return settings.transition
  return 'fade'
}

/** AI 常填 fade，视为「跟随全局」 */
export function normalizeStoredTransition(t) {
  if (!t || t === 'fade') return ''
  return t
}

/** 合并设置 / 单页 / 主题 的视觉参数 */
export function slideVisuals(slide, settings, theme) {
  const set = settings || {}
  const th = theme || {}
  const s = slide || {}
  return {
    bg: set.backgroundColor || s.backgroundColor || th.solidBg || '#fffcf8',
    fg: set.fontColor || s.textColor || th.solidText || '#2c2a28',
    titleColor: set.titleColor || s.accentColor || th.solidAccent || '#1a2e32',
    accent: set.primaryColor || th.solidAccent || '#5f7d80',
    secondary: set.secondaryColor || th.solidAccent || '#8aa0a2',
    fontFamily: fontStackById(set.fontFamily),
  }
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function splitLines(c) {
  return String(c || '')
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/** 单页正文 HTML（与舞台布局一致） */
export function buildSlideBodyHtml(slide, classPrefix = 'ppt') {
  if (!slide) return ''
  const layout = slide.layout || 'bullets'
  const content = slide.content || ''
  const p = classPrefix

  if (layout === 'quote') {
    return `<blockquote class="${p}-quote">${esc(content)}</blockquote>`
  }
  if (layout === 'two-column') {
    const parts = String(content).split('|')
    const left = splitLines(parts[0] || '')
    const right = splitLines(parts.slice(1).join('|'))
    const mk = (lines) => lines.map((l) => `<p>${esc(l)}</p>`).join('')
    return `<div class="${p}-two-col"><div>${mk(left)}</div><div>${mk(right)}</div></div>`
  }
  if (layout === 'section') {
    return ''
  }
  const lines = splitLines(content)
  return `<div class="${p}-slide-body">${lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`
}

/** 独立放映 HTML 内联样式（16:9 居中 + 翻页） */
export const PPT_DECK_CSS = `
html,body{margin:0;height:100%;scroll-snap-type:y mandatory;overflow-y:scroll;background:#0d0d0d}
.ppt-deck-slide{width:100vw;height:100vh;scroll-snap-align:start;display:flex;align-items:center;justify-content:center;box-sizing:border-box}
.ppt-deck-frame{width:min(100vw,calc(100vh * 16 / 9));height:min(100vh,calc(100vw * 9 / 16));aspect-ratio:16/9;box-sizing:border-box;padding:6% 7%;display:flex;flex-direction:column;justify-content:center;position:relative;border-radius:4px;overflow:hidden}
.ppt-deck-title{margin:0 0 18px;font-size:clamp(28px,4.2vw,44px);font-weight:800;line-height:1.25}
.ppt-deck-body p{margin:0 0 10px;font-size:clamp(15px,2vw,22px);line-height:1.55}
.ppt-deck-two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.ppt-deck-two-col p{margin:0 0 10px;font-size:clamp(15px,2vw,22px);line-height:1.55}
.ppt-deck-quote{margin:0;font-size:clamp(20px,2.8vw,30px);line-height:1.5;border-left:4px solid var(--ppt-accent);padding-left:16px}
.ppt-deck-section{letter-spacing:.2em;font-size:12px;opacity:.85;margin:0 0 8px}
.ppt-deck-no{position:absolute;right:16px;bottom:12px;font-size:12px;opacity:.55}
.tr-fade{animation:pptFade .45s ease}
.tr-slide{animation:pptSlide .45s ease}
.tr-zoom{animation:pptZoom .45s ease}
@keyframes pptFade{from{opacity:0}to{opacity:1}}
@keyframes pptSlide{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
@keyframes pptZoom{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
`

/**
 * 构建完整可放映 HTML（每屏一页 16:9 幻灯片）
 */
export function buildDeckHtml(title, slides, settings, theme) {
  const set = settings || {}
  const pages = (slides || []).map((s, i) => {
    const v = slideVisuals(s, set, theme)
    const tr = resolveSlideTransition(s, set)
    const sectionLabel =
      s.layout === 'section'
        ? `<p class="ppt-deck-section" style="color:${v.secondary}">SECTION</p>`
        : ''
    return `<section class="ppt-deck-slide"><div class="ppt-deck-frame tr-${tr}" style="background:${v.bg};color:${v.fg};font-family:${v.fontFamily};--ppt-accent:${v.accent}">
${sectionLabel}
<h1 class="ppt-deck-title" style="color:${v.titleColor}">${esc(s.title)}</h1>
${buildSlideBodyHtml(s, 'ppt-deck')}
<div class="ppt-deck-no">${i + 1} / ${slides.length}</div>
</div></section>`
  }).join('\n')

  return `<!DOCTYPE html><html lang="zh-cn"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title><style>${PPT_DECK_CSS}</style></head><body>
${pages}
<script>
document.addEventListener('keydown',function(e){
  var slides=[...document.querySelectorAll('.ppt-deck-slide')];
  var idx=Math.max(0,slides.findIndex(function(x){return x.getBoundingClientRect().top>=-20}));
  if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){
    slides[Math.min(slides.length-1,idx+1)].scrollIntoView({behavior:'smooth'});
    e.preventDefault();
  }
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
    slides[Math.max(0,idx-1)].scrollIntoView({behavior:'smooth'});
    e.preventDefault();
  }
});
</script></body></html>`
}

/** 离屏 DOM：供 html-to-image 截图单页 */
export function createSlideCaptureElement(slide, index, total, settings, theme) {
  const v = slideVisuals(slide, settings, theme)
  const el = document.createElement('div')
  el.className = 'ppt-export-capture'
  el.style.cssText = [
    `width:${PPT_SLIDE_WIDTH}px`,
    `height:${PPT_SLIDE_HEIGHT}px`,
    `background:${v.bg}`,
    `color:${v.fg}`,
    `font-family:${v.fontFamily}`,
    'box-sizing:border-box',
    'padding:56px 72px 64px',
    'position:relative',
    'display:flex',
    'flex-direction:column',
    'justify-content:center',
    'overflow:hidden',
  ].join(';')

  const title = document.createElement('h1')
  title.style.cssText = `margin:0 0 20px;font-size:42px;font-weight:800;line-height:1.25;color:${v.titleColor}`
  title.textContent = slide.title || ''
  el.appendChild(title)

  const bodyWrap = document.createElement('div')
  bodyWrap.innerHTML = buildSlideBodyHtml(slide)
    .replace(/class="ppt-slide-body"/g, 'style="font-size:22px;line-height:1.55"')
    .replace(/class="ppt-two-col"/g, 'style="display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:20px;line-height:1.55"')
    .replace(/class="ppt-quote"/g, `style="margin:0;font-size:28px;line-height:1.5;border-left:4px solid ${v.accent};padding-left:16px"`)
  el.appendChild(bodyWrap)

  const no = document.createElement('div')
  no.style.cssText = 'position:absolute;right:20px;bottom:16px;font-size:14px;opacity:0.55'
  no.textContent = `${index + 1} / ${total}`
  el.appendChild(no)

  return el
}

/**
 * 导出 PDF：每页一张 16:9 幻灯片
 * @param {Function} [onProgress] (current, total)
 */
export async function exportPptPdf(title, slides, settings, theme, onProgress) {
  if (!slides || !slides.length) throw new Error('没有可导出的幻灯片')

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [PPT_SLIDE_WIDTH, PPT_SLIDE_HEIGHT],
    hotfixes: ['px_scaling'],
  })

  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-99999px;top:0;pointer-events:none'
  document.body.appendChild(host)

  try {
    for (let i = 0; i < slides.length; i++) {
      const slideEl = createSlideCaptureElement(slides[i], i, slides.length, settings, theme)
      host.appendChild(slideEl)
      const canvas = await htmlToImage.toCanvas(slideEl, {
        width: PPT_SLIDE_WIDTH,
        height: PPT_SLIDE_HEIGHT,
        pixelRatio: 2,
        backgroundColor: slideVisuals(slides[i], settings, theme).bg,
      })
      host.removeChild(slideEl)
      if (i > 0) {
        pdf.addPage([PPT_SLIDE_WIDTH, PPT_SLIDE_HEIGHT], 'landscape')
      }
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        PPT_SLIDE_WIDTH,
        PPT_SLIDE_HEIGHT,
        undefined,
        'FAST'
      )
      if (onProgress) onProgress(i + 1, slides.length)
    }
    pdf.save(`${(title || '演示文稿').replace(/[/\\?%*:|"<>]/g, '-')}.pdf`)
  } finally {
    if (host.parentNode) host.parentNode.removeChild(host)
  }
}

export function downloadTextFile(name, content, type) {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
