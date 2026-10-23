/**
 * 管理端本地静态路由（不入库）：generateRoutes 时拼进对应父级 children。
 * 与 Plus Admin local-routes 同思路。
 */

/** 系统工具 → 代码演练场（可 keep-alive：切标签保留编辑，关标签销毁） */
export const codePlaygroundRoute = {
  path: 'codePlayground',
  // 须与页面组件 name / tagsView.cachedViews 一致，才能被 keep-alive 缓存
  name: 'AdminCodePlayground',
  component: () => import('@/views/admin/tool/codePlayground/index'),
  type: 'admin',
  meta: {
    title: '代码演练场',
    icon: 'code',
    noCache: false,
  },
}

/** OA → 编辑已有流程（隐藏，菜单仅「流程设计」入口） */
export const oaDesignerEditRoute = {
  path: 'designer/:id',
  name: 'OaDesignerEdit',
  component: () => import('@/views/admin/oa/designer/index'),
  props: true,
  type: 'admin',
  hidden: true,
  meta: {
    title: '编辑流程',
    activeMenu: '/oa/designer',
    noCache: true,
  },
}

/** OA → 审批实例详情（从待办/我的申请跳转） */
export const oaProcessDetailRoute = {
  path: 'process/detail/:instanceId',
  name: 'OaProcessDetail',
  component: () => import('@/views/admin/oa/process/detail'),
  props: true,
  type: 'admin',
  hidden: true,
  meta: {
    title: '审批详情',
    activeMenu: '/oa/mine',
    noCache: true,
  },
}

/** 注入到后端菜单父级 path（generaMenu 顶层为 /tool、/oa） */
export const localRoutesByParent = {
  '/tool': [codePlaygroundRoute],
  '/oa': [oaDesignerEditRoute, oaProcessDetailRoute],
}
