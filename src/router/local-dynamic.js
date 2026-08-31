/**
 * 将 local-routes 拼进后端动态菜单（不入库）。
 */
import { localRoutesByParent } from './local-routes'

function normalizeModulePath (path) {
  const raw = String(path || '').trim().replace(/\/+$/, '')
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

function findToolParentIndex (routes) {
  return routes.findIndex((r) => {
    if (!r) return false
    const p = normalizeModulePath(r.path)
    if (p === '/tool') return true
    const title = r.meta && r.meta.title
    return title === '系统工具'
  })
}

/**
 * @param {Array} menuRoutes generaMenu 结果
 * @returns {Array}
 */
export function mergeLocalStaticRoutes (menuRoutes) {
  const isCodePlaygroundMenu = (r) => {
    if (!r) return false
    const p = normalizeModulePath(r.path)
    const title = r.meta && r.meta.title
    // 子路由 path 多为相对 codePlayground
    if (p === '/tool/codePlayground' || p === '/codePlayground' || r.path === 'codePlayground') return true
    if (title === '代码演练场') return true
    return false
  }

  const routes = (Array.isArray(menuRoutes) ? menuRoutes : [])
    .filter((r) => !isCodePlaygroundMenu(r) || normalizeModulePath(r.path) === '/tool')
    .map((r) => {
      const children = Array.isArray(r.children)
        ? r.children.filter((c) => !isCodePlaygroundMenu(c))
        : r.children
      return { ...r, children }
    })

  Object.entries(localRoutesByParent).forEach(([parentPath, localList]) => {
    const normParent = normalizeModulePath(parentPath)
    let idx = routes.findIndex((r) => normalizeModulePath(r.path) === normParent)
    if (idx === -1) idx = findToolParentIndex(routes)
    if (idx === -1 || !localList || !localList.length) return

    const parent = routes[idx]
    const children = [...(parent.children || [])]
    const existingPaths = new Set(children.map((c) => c && c.path))

    localList.forEach((item) => {
      if (!item || !item.path || existingPaths.has(item.path)) return
      children.push({ ...item })
      existingPaths.add(item.path)
    })

    routes[idx] = { ...parent, children }
  })

  return routes
}
