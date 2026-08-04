import store from '@/store'
import { checkPermi, checkRole } from '@/utils/permission'

/** 常见「博客/站点管理员」权限字符 */
const BLOG_ADMIN_ROLE_KEYS = [
  'admin',
  'blog_admin',
  'site_admin',
  'website_admin',
  'blogAdmin',
  'siteAdmin',
  'webManage',
  'development'
]

/** 角色名关键词（中文库常见） */
const BLOG_ADMIN_NAME_RE = /博客管理|网站管理|系统管理|超级管理|站点管理/

/**
 * 规范化角色列表：支持 string[] 或 { roleKey, roleName }[]
 */
export function normalizeRoleList(roles) {
  if (!roles) return []
  if (!Array.isArray(roles)) return []
  return roles.map((r) => {
    if (typeof r === 'string') {
      return { roleKey: r, roleName: r }
    }
    return {
      roleKey: r.roleKey || r.role_key || '',
      roleName: r.roleName || r.role_name || ''
    }
  })
}

/**
 * 是否具备博客运营看板权限：
 * - 角色：admin / blog_admin / site_admin 等，或名称含「博客/网站/系统管理」
 * - 用户类型：1 系统管理员、2 网站管理员
 * - 或具备文章管理权限（能管文章即可看运营看板）
 */
export function canViewBlogDashboard() {
  // 运营看板：管理员 或 具备文章管理权限
  if (isBlogSiteAdmin()) return true
  if (checkPermi(['geekplus:articles:list', 'geekplus:articles:query', 'geekplus:article:list', '*:*:*'])) {
    return true
  }
  return false
}

/**
 * 是否网站/博客/系统管理员（不含「仅有文章菜单权限」的普通作者）
 * 非管理员业务数据应限制为仅本人。
 */
export function isBlogSiteAdmin() {
  const userState = (store.state && store.state.user) || {}
  const sysUser = userState.sysUser || {}
  const userType = Number(sysUser.userType)
  if (userType === 1 || userType === 2) return true

  if (checkRole(BLOG_ADMIN_ROLE_KEYS)) return true

  const roles = normalizeRoleList(userState.roles || userState.sysRoles || store.getters.roles)
  const hitRole = roles.some((r) => {
    const key = String(r.roleKey || '').toLowerCase()
    const name = String(r.roleName || '')
    return BLOG_ADMIN_ROLE_KEYS.map((k) => k.toLowerCase()).includes(key) || BLOG_ADMIN_NAME_RE.test(name)
  })
  if (hitRole) return true

  const roleNames = userState.roleNames || []
  if (Array.isArray(roleNames) && roleNames.some((n) => BLOG_ADMIN_NAME_RE.test(String(n || '')))) {
    return true
  }

  return false
}

/** 当前登录用户 ID（字符串），用于本人数据过滤 */
export function currentUserIdStr() {
  const id = store.getters && store.getters.userId
  return id == null || id === '' ? '' : String(id)
}

/** 评论表里可能存纯数字或 sysUser:数字 */
export function ownCommentUserIdCandidates() {
  const id = currentUserIdStr()
  if (!id) return []
  return [id, `sysUser:${id}`]
}

/** 前台/管理端：是否可删除该留言（管理员或本人） */
export function canDeleteComment(commentUserId) {
  if (isBlogSiteAdmin()) return true
  if (commentUserId == null || commentUserId === '') return false
  return ownCommentUserIdCandidates().includes(String(commentUserId))
}

export { BLOG_ADMIN_ROLE_KEYS }
