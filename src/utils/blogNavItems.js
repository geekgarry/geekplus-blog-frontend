/**
 * 前台 BlogNavMenu / WorkbenchHome 共用菜单项构建。
 * 固定项（首页、在线工具、留言等）与 Vuex addMenuRoutes 动态栏目在此统一，避免两处漂移。
 * 后台 WorkbenchHome（scope=admin）使用 buildAdminWorkbenchMenuGroups。
 */
import path from 'path'
import { isExternal } from '@/utils/validate'

/** 在线工具固定子项（与 BlogNavMenu 一致） */
export const FIXED_WEB_TOOL_CHILDREN = [
  { key: 'transfer', label: '文件中转', path: '/file-transfer', icon: 'upload' },
  { key: 'resumeGenerator', label: '即刻简历', path: '/resumeGenerator', icon: 'document' },
  { key: 'pptStudio', label: 'PPT 工作室', path: '/pptStudio', icon: 'picture' },
  { key: 'skeletonStudio', label: '骨架屏工作室', path: '/skeletonStudio', icon: 'component' }
]

/**
 * 拼接父栏目 path 与子 path（与 BlogNavMenu.childPath 同逻辑）
 * @param {string} parentPath
 * @param {string} childPathSeg
 */
export function joinNavChildPath(parentPath, childPathSeg) {
  const pRaw = parentPath != null ? String(parentPath) : '/'
  if (!childPathSeg) return pRaw
  const p = pRaw.replace(/\/$/, '')
  const c = String(childPathSeg).replace(/^\//, '')
  return p + '/' + c
}

/**
 * BlogNavMenu 使用的扁平 allItems（含 children 树）
 * @param {Array} menus store navMenu.addMenuRoutes
 */
export function buildBlogNavAllItems(menus) {
  const dynamic = (menus || []).map((item, index) => ({
    key: 'dyn-' + (item.id != null ? item.id : index),
    label: item.categoryName || item.name || '',
    path: item.path,
    icon: item.icon,
    children: item.children && item.children.length ? item.children : null,
    raw: item
  }))
  return [
    { key: 'home', label: '首页', path: '/', icon: 'home', children: null },
    ...dynamic,
    {
      key: 'webTool',
      label: '在线工具',
      path: '/tool',
      icon: 'tool',
      children: FIXED_WEB_TOOL_CHILDREN
    },
    { key: 'chat', label: 'AI 助手', path: '/chat', icon: 'ai', children: null },
    { key: 'leave', label: '留言板', path: '/leave-word', icon: 'leave-word', children: null },
    { key: 'about', label: '关于本站', path: '/about', icon: 'cheers', children: null }
  ]
}

/**
 * OA 工作台分组：按栏目分类排布图标网格
 * @param {Array} menus store navMenu.addMenuRoutes
 */
export function buildWorkbenchMenuGroups(menus) {
  const groups = []

  groups.push({
    key: 'site',
    title: '站点入口',
    icon: 'home',
    items: [
      { key: 'home', label: '首页', path: '/', icon: 'home' },
      { key: 'search', label: '文章搜索', path: '/search', icon: 'search' },
      { key: 'categories', label: '分类浏览', path: '/categories', icon: 'list' },
      { key: 'tags', label: '热门标签', path: '/tags', icon: 'tag' }
    ]
  })

  groups.push({
    key: 'webTool',
    title: '在线工具',
    icon: 'tool',
    items: FIXED_WEB_TOOL_CHILDREN.map((c) => ({
      key: c.key,
      label: c.label,
      path: '/tool' + c.path,//在线工具的 path 需要拼接 /tool，怎么实现不加/tool也能访问？
      icon: c.icon
    }))
  })

  groups.push({
    key: 'service',
    title: '互动与服务',
    icon: 'message',
    items: [
      { key: 'chat', label: 'AI 助手', path: '/chat', icon: 'ai' },
      { key: 'leave', label: '留言板', path: '/leave-word', icon: 'leave-word' },
      { key: 'about', label: '关于本站', path: '/about', icon: 'cheers' }
    ]
  })

  ;(menus || []).forEach((item, index) => {
    if (!item) return
    const title = item.categoryName || item.name || '栏目'
    const groupKey = 'dyn-' + (item.id != null ? item.id : index)
    const children = item.children && item.children.length ? item.children : null

    if (children) {
      groups.push({
        key: groupKey,
        title,
        icon: item.icon || 'category',
        items: children.map((child, cIdx) => ({
          key: groupKey + '-' + cIdx,
          label: child.categoryName || child.label || child.name || title,
          path: joinNavChildPath(item.path, child.path),
          icon: child.icon || item.icon || 'category'
        }))
      })
    } else if (item.path) {
      groups.push({
        key: groupKey,
        title,
        icon: item.icon || 'category',
        items: [
          {
            key: groupKey + '-leaf',
            label: title,
            path: item.path,
            icon: item.icon || 'category'
          }
        ]
      })
    }
  })

  return groups.filter((g) => g.items && g.items.length)
}

/** 后台路由 path 拼接（与 SidebarItem.resolvePath 一致） */
export function resolveAdminRoutePath(basePath, routePath) {
  if (isExternal(routePath)) return routePath
  if (isExternal(basePath)) return basePath
  return path.resolve(basePath || '/', routePath || '/')
}

/**
 * 后台 permission_routes → 工作台分组（一级菜单为分组，子菜单为图标入口）
 * @param {Array} routes store permission_routes
 */
export function buildAdminWorkbenchMenuGroups(routes) {
  const adminRoots = (routes || []).filter((r) => r && r.type === 'admin' && !r.hidden)
  const groups = []

  adminRoots.forEach((route, index) => {
    const basePath = route.path || '/'
    const visibleChildren = (route.children || []).filter((c) => c && !c.hidden)
    const groupKey = 'admin-' + ((route.meta && route.meta.id) || index)
    const groupTitle = (route.meta && route.meta.title) || route.name || '功能'
    const groupIcon = (route.meta && route.meta.icon) || 'menu'

    if (visibleChildren.length > 1 || (visibleChildren.length === 1 && route.alwaysShow)) {
      groups.push({
        key: groupKey,
        title: groupTitle,
        icon: groupIcon,
        items: visibleChildren.map((child, cIdx) => ({
          key: groupKey + '-' + cIdx,
          label: (child.meta && child.meta.title) || child.name || groupTitle,
          path: resolveAdminRoutePath(basePath, child.path),
          icon: (child.meta && child.meta.icon) || groupIcon
        }))
      })
      return
    }

    if (visibleChildren.length === 1) {
      const child = visibleChildren[0]
      groups.push({
        key: groupKey,
        title: groupTitle,
        icon: groupIcon,
        items: [
          {
            key: groupKey + '-0',
            label: (child.meta && child.meta.title) || groupTitle,
            path: resolveAdminRoutePath(basePath, child.path),
            icon: (child.meta && child.meta.icon) || groupIcon
          }
        ]
      })
      return
    }

    groups.push({
      key: groupKey,
      title: groupTitle,
      icon: groupIcon,
      items: [
        {
          key: groupKey + '-leaf',
          label: groupTitle,
          path: resolveAdminRoutePath('/', route.path),
          icon: groupIcon
        }
      ]
    })
  })

  return groups.filter((g) => g.items && g.items.length)
}
