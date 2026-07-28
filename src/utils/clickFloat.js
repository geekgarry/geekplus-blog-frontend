/**
 * 站点点击飘字（替代依赖 anime.js 的粒子特效）
 * 文案优先来自 /geekplusapp/getClickTextWords，失败时用本地兜底
 */
const DEFAULT_WORDS = ['极客', '梦集', '拾光', '你好', '加油', 'Geek+', '✨', '舒服']

let installed = false
let words = DEFAULT_WORDS.slice()
let handler = null

function pickWord() {
  if (!words.length) return '✨'
  return words[Math.floor(Math.random() * words.length)]
}

function spawn(x, y) {
  const el = document.createElement('span')
  el.className = 'gp-click-float'
  el.textContent = pickWord()
  const dx = (Math.random() - 0.5) * 40
  el.style.left = `${x + dx}px`
  el.style.top = `${y - 8}px`
  el.style.setProperty('--gp-float-rot', `${(Math.random() - 0.5) * 24}deg`)
  document.body.appendChild(el)
  window.setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el)
  }, 1100)
}

function onPointer(e) {
  const t = e.target
  if (!t || !t.closest) return
  if (t.closest('a, button, input, textarea, select, .el-dialog, .gp-side-layout__aside, .navbar')) return
  const x = e.clientX
  const y = e.clientY
  if (x == null || y == null) return
  spawn(x, y)
}

export function setClickFloatWords(list) {
  if (Array.isArray(list) && list.length) {
    words = list.map((s) => String(s).trim()).filter(Boolean)
  }
}

export function enableClickFloat() {
  if (installed || typeof document === 'undefined') return
  if (!document.getElementById('gp-click-float-style')) {
    const style = document.createElement('style')
    style.id = 'gp-click-float-style'
    style.textContent = `
.gp-click-float{
  position:fixed;z-index:1200;pointer-events:none;
  font-size:13px;font-weight:600;letter-spacing:.04em;
  color:var(--theme-color,#6e8b8e);
  text-shadow:0 1px 0 rgba(255,255,255,.35);
  animation:gpClickFloatUp 1s ease-out forwards;
  transform:translate(-50%,0) rotate(var(--gp-float-rot,0deg));
  user-select:none;white-space:nowrap;
}
@keyframes gpClickFloatUp{
  0%{opacity:0;transform:translate(-50%,8px) scale(.92) rotate(var(--gp-float-rot,0deg));}
  18%{opacity:1;}
  100%{opacity:0;transform:translate(-50%,-56px) scale(1.05) rotate(var(--gp-float-rot,0deg));}
}`
    document.head.appendChild(style)
  }
  handler = onPointer
  document.addEventListener('click', handler, false)
  installed = true
}

export function disableClickFloat() {
  if (!installed) return
  if (handler) document.removeEventListener('click', handler, false)
  handler = null
  installed = false
}

export function isClickFloatEnabled() {
  return installed
}
