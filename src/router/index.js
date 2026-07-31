/**
 * 静态路由表（constantRoutes）
 * 博客栏目（/timeEssay/... 等）不在此表，由 navMenu + permission.js 运行时 addRoute 到 name:'webApp'。
 * 前台统一走 BlogShell：按 settings.blogLayout 切换顶部导航 / 侧栏，子路由共享。
 */
import Vue from "vue";
import VueRouter from "vue-router";
import BlogShell from '@/layout/blog/BlogShell'
/* 管理端 Layout 异步加载，避免整壳打进博客首屏包 */
const Layout = () => import(/* webpackChunkName: "layout-admin" */ '@/layout')

Vue.use(VueRouter);

/** 博客前台子路由（挂在 BlogShell / webApp 下，两套布局共用） */
export const blogChildrenRoutes = [
  {
    path: '/',
    name: 'index',
    meta: { title: '首页', icon: '' },
    component: () => import("@/views/IndexView.vue")
  },
  {
    path: '/ai-search',
    name: 'AI 聚合搜索',
    meta: { title: '聚合搜索首页', icon: '' },
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/tool/resumeGenerator',
    name: 'ResumeEditor',
    meta: { title: '简历生成器', icon: '' },
    component: () => import('@/views/tool/ResumeEditor.vue'),
  },
  {
    path: '/search',
    name: 'search',
    meta: { title: '搜索文章', icon: '' },
    component: () => import("../views/article-list/search.vue")
  },
  {
    path: '/categories',
    name: 'categories',
    meta: { title: '分类浏览', icon: '' },
    component: () => import(/* webpackChunkName: "blog-categories" */ '@/views/blog/CategoriesView.vue')
  },
  {
    path: '/tags',
    name: 'tags',
    meta: { title: '热门标签', icon: '' },
    component: () => import(/* webpackChunkName: "blog-tags" */ '@/views/blog/TagsView.vue')
  },
  {
    path: '/user/center',
    name: 'userCenter',
    meta: { title: '个人中心', icon: '' },
    component: () => import(/* webpackChunkName: "blog-user-center" */ '@/views/blog/UserCenter.vue')
  },
  {
    path: '/article/:id',
    name: 'indexArticle',
    meta: { title: '文章', icon: '' },
    component: () => import("../views/article/mobile.vue")
  },
  {
    path: '/article1',
    name: 'article',
    meta: { title: '文章', icon: '' },
    component: () => import('@/views/article/index.vue'),
  },
  {
    path: '/article2',
    name: 'primaryArticle',
    meta: { title: '文章', icon: '' },
    component: () => import('@/views/article/primary.vue'),
  },
  {
    path: '/e-sign',
    name: 'eSign',
    meta: { title: '电子签名', icon: '' },
    component: () => import(/* webpackChunkName: "e-sign" */ '@/components/vue-esign'),
  },
  {
    path: '/leave-word',
    name: 'leaveWord',
    meta: { title: '网站留言', icon: '' },
    component: () => import("../views/leave-word/index.vue")
  },
  {
    path: '/tool/file-transfer',
    name: 'fileTransfer',
    meta: { title: '文件中转', icon: '' },
    component: () => import(/* webpackChunkName: "file-transfer" */ '@/views/file-transfer/index.vue')
  },
  {
    path: '/file-transfer/d/:code',
    name: 'fileTransferDownload',
    meta: { title: '文件下载', icon: '' },
    component: () => import(/* webpackChunkName: "file-transfer-dl" */ '@/views/file-transfer/download.vue')
  },
  {
    path: '/about',
    name: 'about',
    meta: { title: '关于', icon: 'fa-home' },
    component: () => import("../views/AboutView.vue")
  },
  {
    path: '/write',
    name: 'WriteArticleUnlogin',
    meta: { title: '投稿文章', icon: '' },
    component: () => import('@/views/write/index.vue'),
  },
  {
    path: '/403',
    name: '403',
    meta: { title: '403', icon: '' },
    type: 'error',
    component: () =>
      import( /* webpackChunkName: "error-403" */ "../views/error/Error403.vue")
  },
  {
    path: '/404',
    name: '404',
    meta: { title: '404', icon: '' },
    type: 'error',
    component: () =>
      import( /* webpackChunkName: "error-404" */ "../views/error/Error404.vue")
  }
]

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    type: 'admin',
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/admin/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import("../views/admin/login/index.vue"),
    hidden: true
  },
  {
    path: '/register',
    component: () => import("../views/admin/register/index.vue"),
    hidden: true
  },
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/dashboard',
    type: 'admin',
    name: 'admin',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/dashboard/index'),
        meta: { title: "首页", icon: 'dashboard', noCache: true, affix: true }
      }
    ]
  },
  {
    path: '/admin/tool/resume',
    component: Layout,
    hidden: true,
    type: 'admin',
    meta: { title: '简历工具' },
    children: [
      {
        path: 'template-builder',
        name: 'ResumeTemplateBuilder',
        hidden: true,
        component: () => import('@/views/admin/tool/resume/ResumeTemplateBuilder'),
        meta: { title: '可视化模板编辑', noCache: true }
      },
    ]
  },
  {
    path: '/admin/system/fileTransfer',
    component: Layout,
    hidden: true,
    type: 'admin',
    children: [
      {
        path: 'index',
        name: 'AdminFileTransfer',
        component: () => import('@/views/admin/system/fileTransfer/index'),
        meta: { title: '文件中转管理', icon: 'upload', noCache: true }
      }
    ]
  },
  {
    path: '/admin/user',
    component: Layout,
    hidden: true,
    type: 'admin',
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/admin/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user',noCache: true }
      }
    ]
  },
  {
    path: '/',
    component: BlogShell,
    redirect: '/',
    type: "webApp",
    name: "webApp",
    children: blogChildrenRoutes
  },
  {
    path: '/user',
    name: 'login',
    meta: { title: '登录', icon: '' },
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/chat',
    name: 'AIChat',
    meta: { title: 'AI聊天助手', icon: '' },
    component: () => import('@/views/chatbot/index.vue'),
  },
  //这个*匹配必须放在最后，将改路由配置放到所有路由的配置信息的最后，否则会其他路由path匹配造成影响。
  // { path: '*', redirect: '/404', type: 'error', hidden: true }
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: "/admin/system/dict-data",
    component: Layout,
    hidden: true,
    permissions: ["system:dictData:list"],
    children: [
      {
        path: "index/:dictId(\\d+)",
        component: () => import("@/views/admin/system/dict/data"),
        name: "Data",
        meta: { title: "字典数据", activeMenu: "/admin/system/dict" },
      },
    ],
  },
  {
    path: "/admin/fileManager",
    component: Layout,
    hidden: true,
    permissions: ["sys:file-manager:list"],
    children: [
      {
        path: "index",
        component: () => import("@/views/admin/system/file/index.vue"),
        name: "FileManager",
        meta: { title: "文件管理", activeMenu: "/admin/system/file-manager" },
      },
    ],
  }
];

const createRouter = () => new VueRouter({
  mode: "history",
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes,
});

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

// 解决重复点击导航时，控制台出现报错
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to) {
  return VueRouterPush.call(this, to).catch(err => err)
}

export default router;
