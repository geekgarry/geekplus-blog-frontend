/**
 * 将编辑器源码组装为 iframe 文档字符串。
 * 外部运行时走 jsDelivr；失败时页面内展示错误，避免宿主白屏。
 */

const CDN = {
  vue2: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js',
  vue3: 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.js',
  react: 'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js',
  reactDom: 'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js',
  babel: 'https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.9/babel.min.js',
  marked: 'https://cdn.jsdelivr.net/npm/marked@15.0.2/marked.min.js',
}

function escapeClosingScript (code) {
  return String(code || '').replace(/<\/script/gi, '<\\/script')
}

function escapeHtml (s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * CDN 经典脚本不能含 import/export（会报 Cannot use import statement outside a module）。
 * 代码生成器产出的 Vue/JS 常带 ESM，预览前剥掉并尽量改成可挂载选项对象。
 */
export function stripEsModuleSyntax (code) {
  let s = String(code || '')
  // 多行 import ... from '...'
  s = s.replace(/\bimport\s+type\s+[^;]*;?/g, '/* import type stripped */\n')
  s = s.replace(/\bimport\s*(?:[\w*\s{},$]+\s*from\s*)?['"][^'"]+['"]\s*;?/g, '/* import stripped */\n')
  // export { a, b }
  s = s.replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '/* export stripped */\n')
  // export default / export function / export const
  s = s.replace(/^\s*export\s+default\s+/gm, '')
  s = s.replace(/^\s*export\s+(async\s+)?function\s+/gm, '$1function ')
  s = s.replace(/^\s*export\s+(const|let|var|class)\s+/gm, '$1 ')
  return s
}

/** Vue 单文件里 export default { ... } → CDN new Vue / createApp */
function adaptVueCdnScript (js, vue3) {
  let s = String(js || '')
  const hasExportDefaultObj = /export\s+default\s*\{/.test(s)
  if (hasExportDefaultObj) {
    s = s.replace(/export\s+default\s*\{/, 'var __GP_OPTS = {')
  }
  s = stripEsModuleSyntax(s)
  if (hasExportDefaultObj) {
    if (vue3) {
      s += `
; (function () {
  var el = document.getElementById('app')
  if (!el) { el = document.createElement('div'); el.id = 'app'; document.body.appendChild(el) }
  Vue.createApp(__GP_OPTS).mount('#app')
})();
`
    } else {
      s += `
; (function () {
  var el = document.getElementById('app')
  if (!el) { el = document.createElement('div'); el.id = 'app'; document.body.appendChild(el) }
  new Vue(Object.assign({ el: '#app' }, __GP_OPTS))
})();
`
    }
  }
  return s
}

/** 从 Vue SFC 抽出 template 内容作为挂载根（CDN 运行时编译） */
function extractVueSfcTemplate (body) {
  const raw = String(body || '')
  const m = raw.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  if (!m) {
    return { mountHtml: raw.trim() || '<div id="app"></div>', template: null }
  }
  const inner = m[1].trim()
  // 若模板根不是单节点，包一层
  const template = inner
  return {
    mountHtml: '<div id="app"></div>',
    template,
  }
}

function injectVueTemplateOption (js, template) {
  if (!template) return js
  const tplLit = JSON.stringify(template)
  // 已有 __GP_OPTS 时写入 template 字段
  if (/\b__GP_OPTS\b/.test(js)) {
    return `${js}\n;__GP_OPTS.template = __GP_OPTS.template || ${tplLit};\n`
  }
  return js
}

function extractStyleAndScript (raw) {
  const src = String(raw || '')
  const styles = []
  const scripts = []
  let body = src

  body = body.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    styles.push(css)
    return ''
  })
  body = body.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, js) => {
    scripts.push(js)
    return ''
  })

  return {
    body: body.trim(),
    css: styles.join('\n'),
    js: scripts.join('\n'),
  }
}

function looksLikeFullHtml (code) {
  const s = String(code || '').trim().toLowerCase()
  return s.startsWith('<!doctype') || s.startsWith('<html')
}

function shellDoc ({ head = '', body = '', onerror = true } = {}) {
  const errHook = onerror
    ? `<script>
window.onerror = function (msg, src, line, col, err) {
  var box = document.getElementById('__gp_err') || document.body
  var pre = document.createElement('pre')
  pre.style.cssText = 'color:#b91c1c;padding:12px;white-space:pre-wrap;font:12px/1.5 ui-monospace,monospace'
  pre.textContent = String((err && err.stack) || msg) + (line ? ('\\n@' + line + ':' + col) : '')
  box.appendChild(pre)
}
<\/script>`
    : ''
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
${head}
${errHook}
</head>
<body>
${body}
</body>
</html>`
}

export function buildHtmlPreview (code) {
  const raw = String(code || '')
  if (looksLikeFullHtml(raw)) {
    let html = raw
    // 补 viewport，方便移动端预览
    if (!/viewport/i.test(html)) {
      html = html.replace(
        /<head([^>]*)>/i,
        '<head$1><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />',
      )
    }
    // 整页 HTML 里经典 <script> 也剥 ESM，避免 import/export 报错
    html = html.replace(
      /<script(\b(?![^>]*\btype\s*=\s*['"]module['"])[^>]*)>([\s\S]*?)<\/script>/gi,
      (_, attrs, js) => `<script${attrs}>${stripEsModuleSyntax(js)}</script>`,
    )
    return html
  }
  const { body, css, js } = extractStyleAndScript(raw)
  return shellDoc({
    head: `<style>${css}</style>`,
    body: `${body}<script>${escapeClosingScript(stripEsModuleSyntax(js))}<\/script>`,
  })
}

export function buildJavascriptPreview (code) {
  const userJs = stripEsModuleSyntax(code)
  return shellDoc({
    head: '<style>body{margin:16px;font-family:system-ui,sans-serif}#out{white-space:pre-wrap}</style>',
    body: `<div id="out"></div><script>
try {
${escapeClosingScript(userJs)}
} catch (err) {
  document.getElementById('out').textContent = String(err && err.stack ? err.stack : err)
}
<\/script>`,
  })
}

export function buildCssPreview (code) {
  // 与 HTML 片段相同：允许用户写标签 + <style>
  return buildHtmlPreview(code)
}

export function buildVue2Preview (code) {
  const { body, css, js } = extractStyleAndScript(code)
  const { mountHtml, template } = extractVueSfcTemplate(body)
  let userJs = adaptVueCdnScript(
    js.trim() || "new Vue({ el: '#app', data: { msg: '请在 script 中写 new Vue(...)' } })",
    false,
  )
  userJs = injectVueTemplateOption(userJs, template)
  return shellDoc({
    head: `<style>body{margin:0}${css}</style><script src="${CDN.vue2}"><\/script>`,
    body: `${mountHtml}<script>
try {
${escapeClosingScript(userJs)}
} catch (err) {
  document.body.innerHTML = '<pre style="color:#b91c1c;padding:16px;white-space:pre-wrap">' +
    String(err && err.stack ? err.stack : err) + '</pre>'
}
<\/script>`,
  })
}

export function buildVue3Preview (code) {
  const { body, css, js } = extractStyleAndScript(code)
  const { mountHtml, template } = extractVueSfcTemplate(body)
  let userJs = adaptVueCdnScript(
    js.trim() || "Vue.createApp({ data: () => ({ msg: '请在 script 中写 createApp' }) }).mount('#app')",
    true,
  )
  userJs = injectVueTemplateOption(userJs, template)
  return shellDoc({
    head: `<style>body{margin:0}${css}</style><script src="${CDN.vue3}"><\/script>`,
    body: `${mountHtml}<script>
try {
${escapeClosingScript(userJs)}
} catch (err) {
  document.body.innerHTML = '<pre style="color:#b91c1c;padding:16px;white-space:pre-wrap">' +
    String(err && err.stack ? err.stack : err) + '</pre>'
}
<\/script>`,
  })
}

export function buildReactPreview (code) {
  const userCode = escapeClosingScript(stripEsModuleSyntax(String(code || '').trim()))
  return shellDoc({
    head: `<style>body{margin:0;font-family:system-ui,sans-serif}</style>
<script src="${CDN.react}"><\/script>
<script src="${CDN.reactDom}"><\/script>
<script src="${CDN.babel}"><\/script>`,
    body: `<div id="root"></div>
<script type="text/babel" data-presets="react">
try {
${userCode}
} catch (err) {
  document.getElementById('root').innerHTML =
    '<pre style="color:#b91c1c;padding:16px;white-space:pre-wrap">' +
    String(err && err.stack ? err.stack : err) + '</pre>'
}
<\/script>`,
    onerror: false,
  })
}

export function buildTypescriptPreview (code) {
  const userCode = escapeClosingScript(stripEsModuleSyntax(String(code || '').trim()))
  return shellDoc({
    head: `<style>body{margin:16px;font-family:system-ui,sans-serif}#out{white-space:pre-wrap}</style>
<script src="${CDN.babel}"><\/script>`,
    body: `<div id="out"></div>
<script type="text/babel" data-presets="typescript">
try {
${userCode}
} catch (err) {
  document.getElementById('out').textContent = String(err && err.stack ? err.stack : err)
}
<\/script>`,
    onerror: false,
  })
}

export function buildMarkdownPreview (code) {
  // 源码放进 textarea，避免 </script> 截断；用 marked 渲染
  return shellDoc({
    head: `<style>
body{margin:16px;font-family:system-ui,sans-serif;line-height:1.6;color:#111}
pre{background:#f3f4f6;padding:12px;overflow:auto;border-radius:6px}
code{font-family:ui-monospace,monospace}
</style>
<script src="${CDN.marked}"><\/script>`,
    body: `<div id="md"></div>
<textarea id="src" style="display:none">${escapeHtml(code)}</textarea>
<script>
try {
  var src = document.getElementById('src').value
  document.getElementById('md').innerHTML = marked.parse(src || '')
} catch (err) {
  document.getElementById('md').textContent = String(err)
}
<\/script>`,
  })
}

export function buildJsonPreview (code) {
  let pretty = String(code || '')
  let err = ''
  try {
    pretty = JSON.stringify(JSON.parse(pretty), null, 2)
  } catch (e) {
    err = String(e && e.message ? e.message : e)
  }
  return shellDoc({
    head: '<style>body{margin:16px;font-family:ui-monospace,monospace} .err{color:#b91c1c}</style>',
    body: err
      ? `<p class="err">JSON 解析失败：${escapeHtml(err)}</p><pre>${escapeHtml(code)}</pre>`
      : `<pre>${escapeHtml(pretty)}</pre>`,
    onerror: false,
  })
}

export function buildPreviewDocument (mode, code) {
  switch (mode) {
    case 'javascript':
      return buildJavascriptPreview(code)
    case 'css':
      return buildCssPreview(code)
    case 'vue':
      return buildVue2Preview(code)
    case 'vue3':
      return buildVue3Preview(code)
    case 'react':
      return buildReactPreview(code)
    case 'typescript':
      return buildTypescriptPreview(code)
    case 'markdown':
      return buildMarkdownPreview(code)
    case 'json':
      return buildJsonPreview(code)
    case 'html':
    default:
      return buildHtmlPreview(code)
  }
}
