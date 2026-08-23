/**
 * 骨架 Schema → HTML / CSS（支持 row / stack 嵌套）
 */
import { isContainerType, toCssSize } from './skeletonSchema'

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function flexStyleAttr(node) {
  const parts = []
  if (node.flex !== undefined && node.flex !== null && node.flex !== '') {
    const f = Number(node.flex)
    if (!Number.isNaN(f) && f > 0) parts.push(`flex:${f}`, 'min-width:0')
  }
  if (node.width !== undefined && node.width !== null && node.width !== '') {
    parts.push(`width:${toCssSize(node.width)}`)
  }
  return parts.length ? parts.join(';') : ''
}

function nodeToHtml(node, indent) {
  const sp = '  '.repeat(indent)
  const id = esc(node.id)
  const flexCss = flexStyleAttr(node)

  if (node.type === 'row') {
    const gap = toCssSize(node.gap, '12px')
    const align = node.align || 'center'
    const justify = node.justify || 'flex-start'
    const w = node.width ? `width:${toCssSize(node.width)};` : 'width:100%;'
    const kids = (node.children || []).map((c) => nodeToHtml(c, indent + 1)).join('\n')
    return `${sp}<div class="gp-skel-row" data-id="${id}" style="${w}gap:${gap};align-items:${align};justify-content:${justify}">\n${kids}\n${sp}</div>`
  }

  if (node.type === 'stack') {
    const gap = toCssSize(node.gap, '8px')
    const extra = flexCss ? flexCss + ';' : ''
    const kids = (node.children || []).map((c) => nodeToHtml(c, indent + 1)).join('\n')
    return `${sp}<div class="gp-skel-stack" data-id="${id}" style="${extra}gap:${gap}">\n${kids}\n${sp}</div>`
  }

  const wrapFlex = flexCss ? ` style="${flexCss}"` : ''

  switch (node.type) {
    case 'circle': {
      const s = toCssSize(node.size, '48px')
      const style = `width:${s};height:${s}${flexCss ? ';' + flexCss : ''}`
      return `${sp}<div class="gp-skel gp-skel--circle" data-id="${id}" style="${style}"></div>`
    }
    case 'line': {
      const w = toCssSize(node.width, '70%')
      const h = toCssSize(node.height, '14px')
      const r = toCssSize(node.radius, '4px')
      const style = `width:${w};height:${h};border-radius:${r}${flexCss ? ';' + flexCss : ''}`
      return `${sp}<div class="gp-skel gp-skel--line" data-id="${id}" style="${style}"></div>`
    }
    case 'lines': {
      const count = Math.max(1, Number(node.count) || 1)
      const h = toCssSize(node.height, '12px')
      const gap = toCssSize(node.gap, '8px')
      const r = toCssSize(node.radius, '4px')
      const w = toCssSize(node.width, '100%')
      const lastW = toCssSize(node.lastWidth, '55%')
      const lines = []
      for (let i = 0; i < count; i++) {
        const lw = i === count - 1 ? lastW : w
        lines.push(
          `${sp}  <div class="gp-skel gp-skel--line" style="width:${lw};height:${h};border-radius:${r}"></div>`
        )
      }
      const outer = flexCss ? ` style="${flexCss};gap:${gap}"` : ` style="gap:${gap}"`
      return `${sp}<div class="gp-skel-lines" data-id="${id}"${outer}>\n${lines.join('\n')}\n${sp}</div>`
    }
    case 'block': {
      const w = toCssSize(node.width, '100%')
      const h = toCssSize(node.height, '120px')
      const r = toCssSize(node.radius, '8px')
      const style = `width:${w};height:${h};border-radius:${r}${flexCss ? ';' + flexCss : ''}`
      return `${sp}<div class="gp-skel gp-skel--block" data-id="${id}" style="${style}"></div>`
    }
    case 'field':
    case 'textarea': {
      const w = toCssSize(node.width, '100%')
      const h = toCssSize(node.height, node.type === 'textarea' ? '88px' : '36px')
      const r = toCssSize(node.radius, '6px')
      const cls = node.type === 'textarea' ? 'gp-skel gp-skel--textarea' : 'gp-skel gp-skel--field'
      const style = `width:${w};height:${h};border-radius:${r}${flexCss ? ';' + flexCss : ''}`
      return `${sp}<div class="${cls}" data-id="${id}" style="${style}"></div>`
    }
    case 'gap': {
      const h = toCssSize(node.height, '16px')
      return `${sp}<div class="gp-skel-gap" data-id="${id}" style="height:${h}" aria-hidden="true"${wrapFlex}></div>`
    }
    default:
      return `${sp}<!-- unknown: ${esc(node.type)} -->`
  }
}

export function exportLayoutHtml(schema) {
  const c = (schema && schema.canvas) || {}
  const nodes = (schema && schema.nodes) || []
  const width = toCssSize(c.width, '375px')
  const pad = toCssSize(c.padding, '16px')
  const gap = toCssSize(c.gap, '12px')
  const body = nodes.map((n) => nodeToHtml(n, 1)).join('\n')
  return `<div class="gp-skel-root" style="width:${width};padding:${pad};gap:${gap}">\n${body}\n</div>`
}

export function exportStyleCss(schema) {
  const c = (schema && schema.canvas) || {}
  const bg = c.background || 'var(--background-origin, #fffcf8)'
  return `/* GeekPlus 骨架屏导出 — ${esc(schema && schema.name) || 'skeleton'} */
.gp-skel-root {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${bg};
  margin: 0 auto;
}

.gp-skel-root *,
.gp-skel-root *::before,
.gp-skel-root *::after {
  box-sizing: border-box;
}

/* 横向行：左右布局 */
.gp-skel-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}

/* 纵向组：嵌在 row 内组成「左图右文」等 */
.gp-skel-stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
}

.gp-skel-lines {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.gp-skel-gap {
  flex-shrink: 0;
  width: 100%;
  pointer-events: none;
}

.gp-skel {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--border-color, #ebe6e0);
  pointer-events: none;
}

.gp-skel--circle {
  border-radius: 50%;
}

.gp-skel--line,
.gp-skel--block {
  max-width: 100%;
}

/* 表单控件外形占位：边框感，与实心 block 区分 */
.gp-skel--field,
.gp-skel--textarea {
  max-width: 100%;
  background: var(--background-2, #f3f0eb) !important;
  box-shadow: inset 0 0 0 1px var(--border-color-2, #d4cfc8);
}

.gp-skel::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    hsla(0, 0%, 100%, 0) 0%,
    hsla(0, 0%, 100%, 0.45) 50%,
    hsla(0, 0%, 100%, 0) 100%
  );
  animation: gp-skel-shimmer 1.35s ease-in-out infinite;
}

@keyframes gp-skel-shimmer {
  100% {
    transform: translateX(100%);
  }
}
`
}

export function exportCombinedSnippet(schema) {
  return `<style>\n${exportStyleCss(schema)}</style>\n\n${exportLayoutHtml(schema)}\n`
}

export function exportVueSfc(schema) {
  const name = (schema && schema.name) || 'GpSkeleton'
  const safeName = String(name).replace(/[^\w\u4e00-\u9fa5-]/g, '') || 'GpSkeleton'
  const html = exportLayoutHtml(schema)
    .split('\n')
    .map((l) => (l ? '  ' + l : l))
    .join('\n')
  return `<template>
${html}
</template>

<script>
export default {
  name: '${safeName}',
}
</script>

<style scoped>
${exportStyleCss(schema)}</style>
`
}

export function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function downloadLayoutAndStyle(schema) {
  const base = ((schema && schema.name) || 'skeleton').replace(/[\\/:*?"<>|]/g, '_')
  downloadTextFile(base + '-layout.html', exportLayoutHtml(schema), 'text/html;charset=utf-8')
  setTimeout(() => {
    downloadTextFile(base + '-style.css', exportStyleCss(schema), 'text/css;charset=utf-8')
  }, 120)
}

// 供静态检查：容器类型导出
export { isContainerType }
