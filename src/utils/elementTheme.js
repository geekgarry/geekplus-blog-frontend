/**
 * Element UI 主题色统一应用（性能优先）
 *
 * 唯一换肤入口：前台博客 CSS 变量 + 后台 Element 共用同一 color。
 * 不再通过 styles/element-variables 编译全量 chalk（已移除，避免主题打三遍）。
 *
 * 策略：
 * 1) 同步：只写 CSS 变量 + 一份很小的 primary 覆盖（不挡首屏）
 * 2) 空闲：按需拉取/缓存一份 theme-chalk，改色后注入 #chalk-style，并移到 head 末尾压过后加载的按需 CSS
 * 3) 管理端 element-admin / Layout 加载后再 reassert，避免 Table/Menu 等后到的 #409EFF 盖掉主题
 */
const elementVersion = require('element-ui/package.json').version

/** Element 官方 chalk / babel-plugin-component 按需 CSS 的基准色 */
export const ELEMENT_ORIGINAL_THEME = '#409EFF'

/** 站点默认主题色（与 App / color.css 一致） */
export const DEFAULT_THEME = '#5f7d80'

const CHALK_STYLE_ID = 'chalk-style'
const OVERRIDE_STYLE_ID = 'gp-element-theme-override'
const CHALK_CACHE_KEY = `gp-element-chalk-v${elementVersion}`

let chalkSource = ''
let chalkLoadPromise = null
let appliedColor = ''
let idleHandle = null

function normalizeHex(color) {
  if (!color || typeof color !== 'string') return DEFAULT_THEME
  const c = color.trim()
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) return DEFAULT_THEME
  if (c.length === 4) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return c
}

function getThemeCluster(theme) {
  const hex = theme.replace('#', '')
  const tintColor = (color, tint) => {
    let red = parseInt(color.slice(0, 2), 16)
    let green = parseInt(color.slice(2, 4), 16)
    let blue = parseInt(color.slice(4, 6), 16)
    if (tint === 0) {
      return [red, green, blue].join(',')
    }
    red += Math.round(tint * (255 - red))
    green += Math.round(tint * (255 - green))
    blue += Math.round(tint * (255 - blue))
    return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`
  }
  const shadeColor = (color, shade) => {
    let red = parseInt(color.slice(0, 2), 16)
    let green = parseInt(color.slice(2, 4), 16)
    let blue = parseInt(color.slice(4, 6), 16)
    red = Math.round((1 - shade) * red)
    green = Math.round((1 - shade) * green)
    blue = Math.round((1 - shade) * blue)
    return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`
  }
  const clusters = [hex]
  for (let i = 0; i <= 9; i++) {
    clusters.push(tintColor(hex, Number((i / 10).toFixed(2))))
  }
  clusters.push(shadeColor(hex, 0.1))
  return clusters
}

function updateStyle(style, oldCluster, newCluster) {
  let next = style
  oldCluster.forEach((color, index) => {
    next = next.replace(new RegExp(color, 'ig'), newCluster[index])
  })
  return next
}

function softFrom(hex) {
  const cluster = getThemeCluster(hex.replace('#', ''))
  const soft = cluster[4]
  if (!soft) return hex
  return soft.charAt(0) === '#' ? soft : `#${soft}`
}

function mutedFrom(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.7)`
}

function ensureStyleTag(id) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('style')
    el.setAttribute('id', id)
    document.head.appendChild(el)
  }
  return el
}

/** 把主题相关 style 挪到 head 末尾，压过异步按需 CSS */
export function bumpElementThemeStyles() {
  if (typeof document === 'undefined') return
  ;[OVERRIDE_STYLE_ID, CHALK_STYLE_ID].forEach((id) => {
    const el = document.getElementById(id)
    if (el && el.parentNode === document.head) {
      document.head.appendChild(el)
    }
  })
}

function applyCssVars(color) {
  const root = document.documentElement
  root.style.setProperty('--theme-color', color)
  root.style.setProperty('--themeBackground', color)
  root.style.setProperty('--theme-color-soft', softFrom(color))
  root.style.setProperty('--theme-color-muted', mutedFrom(color))
  if (typeof window.__gpRefreshCssVars === 'function') {
    window.__gpRefreshCssVars()
  }
}

/**
 * 轻量覆盖：不拉 chalk 也能让常用 primary 控件立刻变色（体积很小）
 */
function applyLightOverrides(color) {
  const cluster = getThemeCluster(color.replace('#', ''))
  const tone = (i) => {
    const c = cluster[i]
    if (!c) return color
    return c.charAt(0) === '#' ? c : `#${c}`
  }
  const light3 = tone(3)
  const light5 = tone(5)
  const css = `
.el-button--primary{background-color:${color};border-color:${color}}
.el-button--primary:focus,.el-button--primary:hover{background:${light3};border-color:${light3}}
.el-button--primary:active{background:${color};border-color:${color}}
.el-button--primary.is-plain{color:${color};background:${light5};border-color:${light3}}
.el-link--primary{color:${color}}
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner,
.el-radio__input.is-checked .el-radio__inner{background-color:${color};border-color:${color}}
.el-checkbox__input.is-checked+.el-checkbox__label,
.el-radio__input.is-checked+.el-radio__label{color:${color}}
.el-switch.is-checked .el-switch__core{border-color:${color};background-color:${color}}
.el-pagination.is-background .el-pager li:not(.disabled).active{background-color:${color}}
.el-select-dropdown__item.selected{color:${color}}
.el-tabs__item.is-active,.el-tabs__item:hover{color:${color}}
.el-tabs__active-bar,.el-tabs--card>.el-tabs__header .el-tabs__item.is-active{border-color:${color};color:${color}}
.el-slider__bar{background-color:${color}}
.el-slider__button{border-color:${color}}
.el-tag--dark{background-color:${color};border-color:${color}}
.el-menu-item.is-active{color:${color}!important}
.el-submenu__title:hover,.el-menu-item:hover{color:${color}}
.el-date-table td.current:not(.disabled) span,
.el-date-table td.today span{color:${color}}
.el-date-table td.available:hover,.el-picker-panel__icon-btn:hover{color:${color}}
.el-input__inner:focus,.el-textarea__inner:focus{border-color:${color}}
.el-select .el-input.is-focus .el-input__inner{border-color:${color}}
.el-loading-spinner .path{stroke:${color}}
.el-progress-bar__inner{background-color:${color}}
`.replace(/\s+/g, ' ').trim()

  const tag = ensureStyleTag(OVERRIDE_STYLE_ID)
  tag.textContent = css
  bumpElementThemeStyles()
}

function loadChalkSource() {
  if (chalkSource) return Promise.resolve(chalkSource)
  if (chalkLoadPromise) return chalkLoadPromise

  try {
    const cached = sessionStorage.getItem(CHALK_CACHE_KEY)
    if (cached && cached.length > 1000) {
      chalkSource = cached
      return Promise.resolve(chalkSource)
    }
  } catch (e) { /* ignore */ }

  chalkLoadPromise = new Promise((resolve, reject) => {
    const url = `https://unpkg.com/element-ui@${elementVersion}/lib/theme-chalk/index.css`
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return
      if (xhr.status === 200 && xhr.responseText) {
        chalkSource = xhr.responseText.replace(/@font-face\{[^}]+\}/g, '')
        try {
          sessionStorage.setItem(CHALK_CACHE_KEY, chalkSource)
        } catch (e) { /* quota */ }
        resolve(chalkSource)
      } else {
        chalkLoadPromise = null
        reject(new Error('chalk css fetch failed'))
      }
    }
    xhr.open('GET', url)
    xhr.send()
  })
  return chalkLoadPromise
}

async function applyChalkTheme(color) {
  try {
    const source = await loadChalkSource()
    const themeCluster = getThemeCluster(color.replace('#', ''))
    const originalCluster = getThemeCluster(ELEMENT_ORIGINAL_THEME.replace('#', ''))
    const rewritten = updateStyle(source, originalCluster, themeCluster)
    const tag = ensureStyleTag(CHALK_STYLE_ID)
    tag.textContent = rewritten
    bumpElementThemeStyles()
  } catch (e) {
    // CDN 失败时轻量覆盖已足够常用控件
  }
}

function scheduleIdle(fn) {
  if (typeof window === 'undefined') return
  if (idleHandle != null) {
    if (window.cancelIdleCallback) window.cancelIdleCallback(idleHandle)
    else clearTimeout(idleHandle)
  }
  if (window.requestIdleCallback) {
    idleHandle = window.requestIdleCallback(() => {
      idleHandle = null
      fn()
    }, { timeout: 2500 })
  } else {
    idleHandle = window.setTimeout(() => {
      idleHandle = null
      fn()
    }, 200)
  }
}

/**
 * @param {string} color hex
 * @param {{ defer?: boolean }} [options] defer=true（默认）空闲再拉 chalk；管理端建议 defer:false
 * @returns {Promise<void>|void}
 */
export function applyElementTheme(color, options = {}) {
  if (typeof document === 'undefined') return
  const next = normalizeHex(color)
  const defer = options.defer !== false

  applyCssVars(next)
  applyLightOverrides(next)
  appliedColor = next

  if (defer) {
    scheduleIdle(() => {
      applyChalkTheme(next)
    })
    return
  }
  return applyChalkTheme(next)
}

/** 读取当前应使用的主题色 */
export function resolveStoredThemeColor() {
  try {
    return normalizeHex(localStorage.getItem('themeColor') || DEFAULT_THEME)
  } catch (e) {
    return DEFAULT_THEME
  }
}

/**
 * 管理端 / 异步 CSS 到达后：立刻用缓存重申主题（不重复空闲排队）
 */
export function reassertElementTheme() {
  const color = appliedColor || resolveStoredThemeColor()
  bumpElementThemeStyles()
  return applyElementTheme(color, { defer: false })
}
