/**
 * 圆角双轨：
 * 1) 控件圆角 borderRadius → --gp-border-radius-base（管理端 Element / TagsView / 侧栏菜单等）
 * 2) 博客表面圆角 blogSurfaceRadius → --gp-surface-radius + --gp-surface-radius-sm（前台卡片、轮播等）
 *
 * 二者独立；冷启动用 applySiteRadii() 一并写入。
 * 注意：sm 必须写到独立变量名，勿二次写入 --gp-surface-radius（会覆盖主表面值）。
 */

/** 控件圆角 localStorage / settings 键 */
export const BORDER_RADIUS_SETTING_KEY = 'borderRadius'

/** 博客表面圆角 localStorage / settings 键（前台 --gp-surface-radius*） */
export const BLOG_SURFACE_RADIUS_SETTING_KEY = 'blogSurfaceRadius'

/** 控件圆角档位（px） */
export const BORDER_RADIUS_OPTIONS = [0, 2, 4, 6, 7, 8, 10, 12]

/** 博客表面圆角档位（偏卡片，档位更大） */
export const BLOG_SURFACE_RADIUS_OPTIONS = [0, 4, 6, 7, 8, 10, 12, 14, 16, 20]

export const DEFAULT_BORDER_RADIUS = 4
/** 与 color.css 历史静态值一致 */
export const DEFAULT_BLOG_SURFACE_RADIUS = 14

/**
 * @param {unknown} raw
 * @param {number} fallback
 * @returns {number}
 */
export function normalizeRadiusPx (raw, fallback) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.min(32, Math.round(n))
}

export function normalizeBorderRadius (raw) {
  return normalizeRadiusPx(raw, DEFAULT_BORDER_RADIUS)
}

export function normalizeBlogSurfaceRadius (raw) {
  return normalizeRadiusPx(raw, DEFAULT_BLOG_SURFACE_RADIUS)
}

export function resolveStoredBorderRadius () {
  if (typeof localStorage === 'undefined') return DEFAULT_BORDER_RADIUS
  try {
    const raw = localStorage.getItem(BORDER_RADIUS_SETTING_KEY)
    if (raw == null || raw === '') return DEFAULT_BORDER_RADIUS
    return normalizeBorderRadius(raw)
  } catch (e) {
    return DEFAULT_BORDER_RADIUS
  }
}

export function resolveStoredBlogSurfaceRadius () {
  if (typeof localStorage === 'undefined') return DEFAULT_BLOG_SURFACE_RADIUS
  try {
    const raw = localStorage.getItem(BLOG_SURFACE_RADIUS_SETTING_KEY)
    if (raw == null || raw === '') return DEFAULT_BLOG_SURFACE_RADIUS
    return normalizeBlogSurfaceRadius(raw)
  } catch (e) {
    return DEFAULT_BLOG_SURFACE_RADIUS
  }
}

function setOnRoots (pairs) {
  if (typeof document === 'undefined') return
  const roots = [document.documentElement, document.body].filter(Boolean)
  roots.forEach((el) => {
    pairs.forEach(([name, value]) => {
      el.style.setProperty(name, value)
    })
  })
}

/**
 * 仅写控件圆角（不改博客表面）
 * @param {number|string} px
 */
export function applyBorderRadius (px) {
  const base = normalizeBorderRadius(px)
  const basePx = `${base}px`
  setOnRoots([
    ['--gp-border-radius-base', basePx],
    // 兼容少数旧用法
    ['--border-radius', basePx],
  ])
}

/**
 * 仅写博客表面圆角：
 * - --gp-surface-radius = 用户所选（默认 14）
 * - --gp-surface-radius-sm = max(0, surface - 4)（默认 10）
 * @param {number|string} px
 */
export function applyBlogSurfaceRadius (px) {
  const surface = normalizeBlogSurfaceRadius(px)
  const sm = Math.max(0, surface - 4)
  setOnRoots([
    ['--gp-surface-radius', `${surface}px`],
    ['--gp-surface-radius-sm', `${sm}px`],
  ])
}

/**
 * 冷启动 / 全量重放：控件 + 博客表面
 * @param {{ borderRadius?: number|string, blogSurfaceRadius?: number|string }} [opts]
 */
export function applySiteRadii (opts = {}) {
  const control = opts.borderRadius != null
    ? opts.borderRadius
    : resolveStoredBorderRadius()
  const blog = opts.blogSurfaceRadius != null
    ? opts.blogSurfaceRadius
    : resolveStoredBlogSurfaceRadius()
  applyBorderRadius(control)
  applyBlogSurfaceRadius(blog)
}
