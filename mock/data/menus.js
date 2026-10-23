/**
 * 菜单 —— 以 geekplus.sql sys_menu 系统段为底，
 * 并按本仓库已有 views/admin 补齐「网站内容 / 常用工具」便于离线演示。
 * menuType: C 目录 / M 菜单 / B 按钮；getMenu 只返回非 B。
 */

function node (partial) {
  return Object.assign({
    menuId: 0,
    menuName: '',
    parentId: 0,
    orderNum: 0,
    path: '',
    component: null,
    isFrame: 1,
    isCache: 0,
    menuType: 'M',
    visible: '0',
    status: '0',
    perms: null,
    icon: '#',
    children: undefined,
  }, partial)
}

/** 扁平菜单（含按钮权限，供菜单管理页 listAll） */
const MENU_FLAT = [
  // —— SQL 系统管理 ——
  node({ menuId: 1, menuName: '系统管理', parentId: 0, orderNum: 1, path: 'system', component: null, menuType: 'C', icon: 'system' }),
  node({ menuId: 101, menuName: '用户管理', parentId: 1, orderNum: 1, path: 'userManage', component: 'system/user/index', menuType: 'M', perms: 'system:user:list', icon: 'user' }),
  node({ menuId: 102, menuName: '角色管理', parentId: 1, orderNum: 2, path: 'roleManage', component: 'system/role/index', menuType: 'M', perms: 'system:role:list', icon: 'peoples' }),
  node({ menuId: 103, menuName: '菜单管理', parentId: 1, orderNum: 3, path: 'menuManage', component: 'system/menu/index', menuType: 'M', perms: 'system:menu:list', icon: 'tree-table' }),
  node({ menuId: 104, menuName: '系统通知', parentId: 1, orderNum: 4, path: 'noticeManage', component: 'system/notice/index', menuType: 'M', perms: 'system:notice:list', icon: 'message' }),
  node({ menuId: 105, menuName: '部门管理', parentId: 1, orderNum: 5, path: 'dept', component: 'system/dept/index', menuType: 'M', perms: 'system:dept:list', icon: 'tree' }),
  node({ menuId: 106, menuName: '参数设置', parentId: 1, orderNum: 6, path: 'config', component: 'system/config/index', menuType: 'M', perms: 'system:config:list', icon: 'edit' }),
  node({ menuId: 107, menuName: '字典管理', parentId: 1, orderNum: 7, path: 'dict', component: 'system/dict/index', menuType: 'M', perms: 'system:dict:list', icon: 'dict' }),
  node({ menuId: 114, menuName: '文件管理', parentId: 1, orderNum: 8, path: 'file', component: 'system/file/index', menuType: 'M', perms: 'system:file:list', icon: 'upload' }),
  node({ menuId: 108, menuName: '日志管理', parentId: 1, orderNum: 9, path: 'log', component: null, menuType: 'C', icon: 'log' }),
  node({ menuId: 500, menuName: '操作日志', parentId: 108, orderNum: 1, path: 'operLog', component: 'system/log/operlog/index', menuType: 'M', perms: 'system:operLog:list', icon: 'form' }),
  node({ menuId: 501, menuName: '登录日志', parentId: 108, orderNum: 2, path: 'loginLog', component: 'system/log/loginlog/index', menuType: 'M', perms: 'system:loginLog:list', icon: 'logininfor' }),

  node({ menuId: 124, menuName: '密码重置', parentId: 101, orderNum: 1, path: '', component: null, menuType: 'B', perms: 'system:user:resetPwd', icon: '#' }),
  node({ menuId: 125, menuName: '用户添加', parentId: 101, orderNum: 2, path: '', component: null, menuType: 'B', perms: 'system:user:add', icon: '#' }),
  node({ menuId: 126, menuName: '用户删除', parentId: 101, orderNum: 3, path: '', component: null, menuType: 'B', perms: 'system:user:delete', icon: '#' }),
  node({ menuId: 127, menuName: '用户更新', parentId: 101, orderNum: 4, path: '', component: null, menuType: 'B', perms: 'system:user:update', icon: '#' }),
  node({ menuId: 128, menuName: '用户信息', parentId: 101, orderNum: 5, path: '', component: null, menuType: 'B', perms: 'system:user:detail', icon: '#' }),
  node({ menuId: 133, menuName: '所有用户列表', parentId: 101, orderNum: 10, path: '', component: null, menuType: 'B', perms: 'system:user:listAll', icon: '#' }),
  node({ menuId: 134, menuName: '用户信息导出', parentId: 101, orderNum: 11, path: '', component: null, menuType: 'B', perms: 'system:user:export', icon: '#' }),

  // —— SQL 监控 ——
  node({ menuId: 2, menuName: '系统监控', parentId: 0, orderNum: 8, path: 'monitor', component: null, menuType: 'C', icon: 'monitor' }),
  node({ menuId: 109, menuName: '在线用户', parentId: 2, orderNum: 1, path: 'online', component: 'monitor/online/index', menuType: 'M', perms: 'monitor:online:list', icon: 'online' }),
  node({ menuId: 111, menuName: '数据监控', parentId: 2, orderNum: 3, path: 'druid', component: 'monitor/druid/index', menuType: 'M', perms: 'monitor:druid:list', icon: 'druid' }),
  node({ menuId: 112, menuName: '服务监控', parentId: 2, orderNum: 4, path: 'server', component: 'monitor/server/index', menuType: 'M', perms: 'monitor:server:list', icon: 'server' }),
  node({ menuId: 113, menuName: 'JVM 监控', parentId: 2, orderNum: 5, path: 'jvm', component: 'monitor/jvm/index', menuType: 'M', perms: 'monitor:jvm:list', icon: 'dashboard' }),

  // —— SQL 工具 + 本仓库视图 ——
  node({ menuId: 3, menuName: '系统工具', parentId: 0, orderNum: 9, path: 'tool', component: null, menuType: 'C', icon: 'tool' }),
  node({ menuId: 121, menuName: '代码生成', parentId: 3, orderNum: 1, path: 'generator', component: 'tool/generator/index', menuType: 'M', perms: 'tool:generator', icon: 'code' }),
  node({ menuId: 122, menuName: '表单构建', parentId: 3, orderNum: 2, path: 'build', component: 'tool/build/index', menuType: 'M', perms: 'tool:build:list', icon: 'build' }),
  node({ menuId: 123, menuName: '系统接口', parentId: 3, orderNum: 3, path: 'swagger', component: 'tool/swagger/index', menuType: 'M', perms: 'tool:swagger:list', icon: 'swagger' }),
  node({ menuId: 130, menuName: '骨架屏工作室', parentId: 3, orderNum: 4, path: 'skeleton', component: 'tool/skeleton/index', menuType: 'M', perms: 'tool:skeleton:list', icon: 'component' }),

  // —— 网站内容（本仓库 views/admin/geekplus，SQL 旧库可能无完整段） ——
  node({ menuId: 2000, menuName: '网站内容', parentId: 0, orderNum: 2, path: 'geekplus', component: null, menuType: 'C', icon: 'documentation' }),
  node({ menuId: 2001, menuName: '文章管理', parentId: 2000, orderNum: 1, path: 'articles', component: 'geekplus/articles/index', menuType: 'M', perms: 'geekplus:article:list', icon: 'documentation' }),
  node({ menuId: 2002, menuName: '写文章', parentId: 2000, orderNum: 2, path: 'writearticle', component: 'geekplus/writearticle/index', menuType: 'M', perms: 'geekplus:article:add', icon: 'edit' }),
  node({ menuId: 2003, menuName: '栏目分类', parentId: 2000, orderNum: 3, path: 'category', component: 'geekplus/category/index', menuType: 'M', perms: 'geekplus:category:list', icon: 'tree' }),
  node({ menuId: 2004, menuName: '文章标签', parentId: 2000, orderNum: 4, path: 'articletags', component: 'geekplus/articletags/index', menuType: 'M', perms: 'geekplus:tag:list', icon: 'tag' }),
  node({ menuId: 2005, menuName: '轮播管理', parentId: 2000, orderNum: 5, path: 'carousel', component: 'geekplus/carousel/index', menuType: 'M', perms: 'geekplus:carousel:list', icon: 'example' }),
  node({ menuId: 2006, menuName: '站点公告', parentId: 2000, orderNum: 6, path: 'notice', component: 'geekplus/notice/index', menuType: 'M', perms: 'geekplus:notice:list', icon: 'message' }),
  node({ menuId: 2007, menuName: '友链管理', parentId: 2000, orderNum: 7, path: 'link', component: 'geekplus/link/index', menuType: 'M', perms: 'geekplus:link:list', icon: 'link' }),
  node({ menuId: 2008, menuName: '评论管理', parentId: 2000, orderNum: 8, path: 'comment', component: 'geekplus/comment/index', menuType: 'M', perms: 'geekplus:comment:list', icon: 'message' }),
  node({ menuId: 2009, menuName: '网站信息', parentId: 2000, orderNum: 9, path: 'webinfo', component: 'geekplus/webinfo/index', menuType: 'M', perms: 'geekplus:webinfo:list', icon: 'international' }),
  node({ menuId: 2010, menuName: '网站用户', parentId: 2000, orderNum: 10, path: 'users', component: 'geekplus/users/index', menuType: 'M', perms: 'geekplus:user:list', icon: 'peoples' }),
  node({ menuId: 2011, menuName: '音乐管理', parentId: 2000, orderNum: 11, path: 'gpMusic', component: 'geekplus/gpMusic/index', menuType: 'M', perms: 'geekplus:music:list', icon: 'music' }),

  // —— 功能（与本仓 views/admin/function 对齐；IM 为前台静态 /im，不入库演示） ——
  node({ menuId: 3000, menuName: '功能中心', parentId: 0, orderNum: 3, path: 'function', component: null, menuType: 'C', icon: 'appstore' }),
  node({ menuId: 3001, menuName: '在线简历', parentId: 3000, orderNum: 1, path: 'onlineresume', component: 'function/onlineresume/index', menuType: 'M', perms: 'function:resume:list', icon: 'documentation' }),
  node({ menuId: 3002, menuName: '简历工具', parentId: 3000, orderNum: 2, path: 'resume', component: 'function/resume/index', menuType: 'M', perms: 'function:resume:edit', icon: 'edit' }),

  // —— OA 办公（Flowable 演示，component 对齐后端 sys_menu） ——
  node({ menuId: 4000, menuName: 'OA办公', parentId: 0, orderNum: 4, path: 'oa', component: null, menuType: 'C', icon: 'form' }),
  node({ menuId: 4001, menuName: 'OA工作台', parentId: 4000, orderNum: 1, path: 'workbench', component: 'oa/workbench/index', menuType: 'M', perms: 'oa:workbench:list', icon: 'dashboard' }),
  node({ menuId: 4002, menuName: '流程设计', parentId: 4000, orderNum: 2, path: 'designer', component: 'oa/designer/index', menuType: 'M', perms: 'oa:designer:list', icon: 'build' }),
  node({ menuId: 4003, menuName: '流程管理', parentId: 4000, orderNum: 3, path: 'process', component: 'oa/process/index', menuType: 'M', perms: 'oa:process:list', icon: 'tree-table' }),
  node({ menuId: 4004, menuName: '我的待办', parentId: 4000, orderNum: 4, path: 'task', component: 'oa/task/index', menuType: 'M', perms: 'oa:task:list', icon: 'message' }),
  node({ menuId: 4005, menuName: '我的申请', parentId: 4000, orderNum: 5, path: 'mine', component: 'oa/process/mine', menuType: 'M', perms: 'oa:process:mine', icon: 'documentation' }),
]

function buildMenuTree (flat, parentId, includeButtons) {
  const pid = parentId == null ? 0 : parentId
  return (flat || [])
    .filter((m) => Number(m.parentId) === Number(pid))
    .filter((m) => includeButtons || m.menuType !== 'B')
    .sort((a, b) => (a.orderNum - b.orderNum) || (a.menuId - b.menuId))
    .map((m) => {
      const children = buildMenuTree(flat, m.menuId, includeButtons)
      const item = {
        menuId: m.menuId,
        menuName: m.menuName,
        parentId: m.parentId,
        orderNum: m.orderNum,
        path: m.path,
        component: m.component,
        isFrame: m.isFrame,
        isCache: m.isCache,
        menuType: m.menuType,
        visible: m.visible,
        status: m.status,
        perms: m.perms,
        icon: m.icon,
      }
      if (children.length) item.children = children
      return item
    })
}

function collectPerms (flat) {
  const set = []
  ;(flat || []).forEach((m) => {
    if (m.perms && set.indexOf(m.perms) < 0) set.push(m.perms)
  })
  return set
}

/** 按角色裁剪菜单：admin 全量；OA 试用角色可见 OA；其余按原规则 */
function menusForRole (roleKey) {
  const key = roleKey || 'common'
  if (key === 'admin') {
    return {
      tree: buildMenuTree(MENU_FLAT, 0, false),
      permsSet: ['*:*:*'].concat(collectPerms(MENU_FLAT)),
      flat: MENU_FLAT,
    }
  }

  if (key === 'oa_dept_leader' || key === 'oa_hr' || key === 'oa_finance' || key === 'oa_staff') {
    const allowedIds = new Set()
    function mark (id) {
      allowedIds.add(id)
      MENU_FLAT.filter((m) => Number(m.parentId) === Number(id)).forEach((c) => mark(c.menuId))
    }
    mark(4000)
    let flat = MENU_FLAT.filter((m) => allowedIds.has(m.menuId))
    if (key === 'oa_staff') {
      const keep = new Set([4000, 4001, 4004, 4005])
      flat = flat.filter((m) => keep.has(m.menuId))
    }
    return {
      tree: buildMenuTree(flat, 0, false),
      permsSet: collectPerms(flat),
      flat,
    }
  }

  let allowRoots
  if (key === 'webManage') {
    allowRoots = new Set([2000, 3, 3000])
  } else if (key === 'development') {
    allowRoots = new Set([2, 3, 3000])
  } else {
    // common：功能中心 + 系统接口 + OA
    allowRoots = new Set([3000, 3, 4000])
  }

  const allowedIds = new Set()
  function mark (id) {
    allowedIds.add(id)
    MENU_FLAT.filter((m) => Number(m.parentId) === Number(id)).forEach((c) => mark(c.menuId))
  }
  allowRoots.forEach((id) => mark(id))

  let flat = MENU_FLAT.filter((m) => allowedIds.has(m.menuId))
  if (key === 'common') {
    const keepTool = new Set([3, 122, 123])
    flat = flat.filter((m) => m.parentId !== 3 && m.menuId !== 3 ? true : keepTool.has(m.menuId))
  }

  return {
    tree: buildMenuTree(flat, 0, false),
    permsSet: collectPerms(flat),
    flat,
  }
}

module.exports = {
  MENU_FLAT,
  buildMenuTree,
  menusForRole,
}
