/**
 * 管理端本地静态路由（不入库）：generateRoutes 时拼进「系统工具」children。
 * 与 Plus Admin local-routes 同思路。
 */

/** 系统工具 → 代码演练场（可 keep-alive：切标签保留编辑，关标签销毁） */
export const codePlaygroundRoute = {
  path: 'codePlayground',
  // 须与页面组件 name 一致，AppMain keep-alive :include="cachedViews" 才能命中
  name: 'AdminCodePlayground',
  component: () => import('@/views/admin/tool/codePlayground/index'),
  type: 'admin',
  meta: {
    title: '代码演练场',
    icon: 'code',
    // false：切 TagsView 其它页再回来仍保留 code/mode；关标签会从 cachedViews 移除并销毁
    noCache: false,
  },
}

/** 注入到后端菜单父级 path（generaMenu 顶层为 /tool） */
export const localRoutesByParent = {
  '/tool': [codePlaygroundRoute],
}
