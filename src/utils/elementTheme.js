/**
 * 主题色 CSS 变量 + Element UI 覆盖（引擎实现层）
 *
 * ━━━ 对外 API ━━━
 * 业务与布局请 import @/theme，勿直接 import 本文件（见 @/theme/README.md）。
 *
 * ━━━ 本模块职责 ━━━
 * 1. normalizeHex / resolveStoredThemeColor — 读 storage 与校验
 * 2. applyElementTheme — 写 html/body 的 --theme-color* 与菜单 token
 * 3. applyLightOverrides + applyChalkTheme — 覆盖 Element 默认 #409EFF
 * 4. reassertElementTheme — 同色重算（深/浅色、后加载 CSS），由 @/theme/maintain 封装
 *
 * ━━━ 性能策略 ━━━
 * 同步：CSS 变量 + 轻量 primary 覆盖（不挡首屏）
 * 空闲：CDN 拉 theme-chalk 整包替换色值，sessionStorage 缓存
 */
const elementVersion = require('element-ui/package.json').version

/** Element 官方 chalk / babel-plugin-component 按需 CSS 的基准色（替换源） */
export const ELEMENT_ORIGINAL_THEME = '#409EFF'

/** 站点默认主题色；与 color.css、public/index.html FOUC 占位一致 */
export const DEFAULT_THEME = '#5f7d80'

/** 注入 head 的 style#id，用于全量 chalk 换色 */
const CHALK_STYLE_ID = 'chalk-style'
/** 注入 head 的 style#id，常用 primary 控件轻量覆盖 */
const OVERRIDE_STYLE_ID = 'gp-element-theme-override'
/** sessionStorage 缓存 chalk 文本，避免重复 CDN */
const CHALK_CACHE_KEY = `gp-element-chalk-v${elementVersion}`

let chalkSource = ''
let chalkLoadPromise = null
/** 内存中最近一次 apply 的色，reassert 优先用它 */
let appliedColor = ''
let idleHandle = null

/**
 * 规范化 hex；非法或空则回退 DEFAULT_THEME
 * 支持 #rgb 展成 #rrggbb
 */
export function normalizeHex(color) {
  if (!color || typeof color !== 'string') return DEFAULT_THEME
  const c = color.trim()
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) return DEFAULT_THEME
  if (c.length === 4) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return c
}

/** 是否 dark：muted/soft/menu 字色 alpha 与 cluster 索引依赖此状态 */
function isDarkThemeMode() {
  if (typeof document === 'undefined') return false
  return document.body && document.body.getAttribute('theme-mode') === 'dark'
}

/**
 * Element 官方换肤算法：主色 + 10 档 tint + 1 档 shade
 * 用于 softFrom / strongFrom / chalk 字符串替换
 */
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

/** 在 chalk CSS 文本中把官方色集群批量替换为目标主题集群 */
function updateStyle(style, oldCluster, newCluster) {
  let next = style
  oldCluster.forEach((color, index) => {
    next = next.replace(new RegExp(color, 'ig'), newCluster[index])
  })
  return next
}

/** 辅助色：同色相更浅/更深；暗色用 cluster[3]、亮色用 [6]，避免与主色糊一片 */
function softFrom(hex) {
  const cluster = getThemeCluster(hex.replace('#', ''))
  const idx = isDarkThemeMode() ? 3 : 6
  const soft = cluster[idx]
  if (!soft) return hex
  return soft.charAt(0) === '#' ? soft : `#${soft}`
}

/** 菜单/标签底：低透明 tint；勿用高 alpha（旧版 0.7 会导致字与底同色难辨） */
function mutedFrom(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const alpha = isDarkThemeMode() ? 0.16 : 0.12
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 强调字色：浅色模式略加深，保证在纸感背景上可读 */
function strongFrom(hex) {
  const cluster = getThemeCluster(hex.replace('#', ''))
  const shade = cluster[cluster.length - 1]
  if (!shade) return normalizeHex(hex)
  return shade.charAt(0) === '#' ? shade : `#${shade}`
}

/** 导航激活字色：浅色加深、暗色略提亮，与 muted 底拉开对比 */
function menuActiveColorFrom(hex) {
  const normalized = normalizeHex(hex)
  if (isDarkThemeMode()) {
    const cluster = getThemeCluster(normalized.replace('#', ''))
    const light = cluster[2] || cluster[3]
    if (!light) return normalized
    return light.charAt(0) === '#' ? light : `#${light}`
  }
  return strongFrom(normalized)
}

function ensureStyleTag(id) {
  // 复用已有 style#id，避免重复插入
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

/**
 * inline 写 CSS 变量到指定节点；优先级高于 color.css 的 body 选择器
 * darkMode 时同步 html + body，避免 body 子树截断继承链
 */
function setThemeCssVars(target, color) {
  if (!target || !target.style) return
  const normalized = normalizeHex(color)
  target.style.setProperty('--theme-color', normalized)
  target.style.setProperty('--themeBackground', normalized)
  target.style.setProperty('--theme-color-soft', softFrom(normalized))
  target.style.setProperty('--theme-color-muted', mutedFrom(normalized))
  target.style.setProperty('--theme-color-strong', strongFrom(normalized))
  target.style.setProperty('--gp-menu-active-bg', mutedFrom(normalized))
  target.style.setProperty('--gp-menu-active-color', menuActiveColorFrom(normalized))
  target.style.setProperty('--gp-menu-active-border', normalized)
}

/** 写 --theme-color 系列到 documentElement 与 body，并通知 IE11 css-vars ponyfill */
function applyCssVars(color) {
  setThemeCssVars(document.documentElement, color)
  // darkMode 时 token 挂在 body[theme-mode] 子树；同步 body 避免 stylesheet 覆盖继承链
  if (document.body) {
    setThemeCssVars(document.body, color)
  }
  if (typeof window.__gpRefreshCssVars === 'function') {
    window.__gpRefreshCssVars()
  }
}

/**
 * 轻量 primary 覆盖：不拉 chalk 也能让 Button/Menu/Tabs 等立刻变色
 * 体积小，首屏同步注入；完整 chalk 仍空闲加载
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

/** 从 unpkg 拉 Element chalk，sessionStorage 缓存；失败时轻量覆盖仍可用 */
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

/** 把 chalk 内 #409EFF 集群替换为用户主题集群，写入 #chalk-style */
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

/** 空闲回调：requestIdleCallback 或 setTimeout 降级 */
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
 * 应用主题色到 DOM（引擎核心，由 @/theme applyThemeColor 别名导出）
 * @param {string} color hex
 * @param {{ defer?: boolean }} [options] defer=true 空闲再拉 chalk；用户改色应 defer:false
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

/** 从 localStorage themeColor 读取；无则用 DEFAULT_THEME */
export function resolveStoredThemeColor() {
  try {
    return normalizeHex(localStorage.getItem('themeColor') || DEFAULT_THEME)
  } catch (e) {
    return DEFAULT_THEME
  }
}

/**
 * 同色重算：不读新 hex，按 appliedColor 或 storage 再 apply 一遍
 * 供 @/theme refreshAfterModeChange / refreshAfterElementCss 调用
 */
export function reassertElementTheme() {
  const color = appliedColor || resolveStoredThemeColor()
  bumpElementThemeStyles()
  return applyElementTheme(color, { defer: false })
}
