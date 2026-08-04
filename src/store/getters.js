const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  language: state => state.app.language,
  device: state => state.app.device,
  //notice: state => state.app.notice,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  username: state => state.user.username,
  nickname: state => state.user.nickname,
  userId: state => state.user.userId,
  introduction: state => state.user.introduction,
  roles: state => {
    // SET_ROLES 写入 sysRoles；兼容旧字段 roles（字符串权限字符数组）
    const raw = state.user.roles || state.user.sysRoles || []
    if (!Array.isArray(raw)) return []
    return raw.map((r) => (typeof r === 'string' ? r : (r && (r.roleKey || r.roleName)) || '')).filter(Boolean)
  },
  permissions: state => state.user.permissions || [],
  menus: state => state.user.menus,
  permission_routes: state => state.permission.permission_routes,
  // routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  errorLogs: state => state.errorLog.logs,
  menuRouters: state => state.navMenu.menuRouters,
  addMenuRoutes: state => state.navMenu.addMenuRoutes,
  swRegistered: state => state.app.swRegistered
}
export default getters
