/**
 * 静态路由表（constantRoutes）
 * 博客栏目（/timeEssay/... 等）不在此表，由 navMenu + permission.js 运行时 addRoute 到 name:'sideApp'。
 * 首页用 VerticalBlog，其余前台页用 HorizontalBlog（侧栏布局）。
 */
import Vue from "vue";
import VueRouter from "vue-router";
import VerticalBlog from '@/layout/blog/vertical/index';
import HorizontalBlog from '@/layout/blog/horizontal/index'
/* 管理端 Layout 异步加载，避免整壳打进博客首屏包 */
const Layout = () => import(/* webpackChunkName: "layout-admin" */ '@/layout')

Vue.use(VueRouter);

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
      // {
      //   path: 'template',
      //   name: 'ResumeTemplateManager',
      //   component: () => import('@/views/admin/tool/resume/ResumeTemplateManager'),
      //   meta: { title: '简历模板管理', noCache: true }
      // },
      {
        path: 'template-builder',
        name: 'ResumeTemplateBuilder',
        hidden: true,
        component: () => import('@/views/admin/tool/resume/ResumeTemplateBuilder'),
        meta: { title: '可视化模板编辑', noCache: true }
      },
      // {
      //   path: 'data',
      //   name: 'ResumeDataManager',
      //   component: () => import('@/views/admin/tool/resume/ResumeDataManager'),
      //   meta: { title: '简历数据管理', noCache: true }
      // }
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
    component: VerticalBlog,
    redirect: '/',
    type: "webApp",
    name: "webApp",
    children: [{
      path: '/',
      name: 'index',
      meta: { title: '首页', icon: '' },
      component: () => import("@/views/IndexView.vue")
    }]
  },
  {
    /* 侧栏布局：除首页外的博客前台页面 */
    path: '/site',
    component: HorizontalBlog,
    type: "webApp",
    name: "sideApp",
    redirect: '/about',
    children: [
    {
      path: '/ai-search',
      name: 'AI 聚合搜索',
      meta: { title: '聚合搜索首页', icon: '' },
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/resumeGenerator',
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
      path: '/file-transfer',
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
  // {
  //   path: "/system/user-auth",
  //   component: Layout,
  //   hidden: true,
  //   permissions: ["system:user:edit"],
  //   children: [
  //     {
  //       path: "role/:userId(\\d+)",
  //       component: () => import("@/views/system/user/authRole"),
  //       name: "AuthRole",
  //       meta: { title: "分配角色", activeMenu: "/system/user" },
  //     },
  //   ],
  // },
  // {
  //   path: "/system/role-auth",
  //   component: Layout,
  //   hidden: true,
  //   permissions: ["system:role:edit"],
  //   children: [
  //     {
  //       path: "user/:roleId(\\d+)",
  //       component: () => import("@/views/system/role/authUser"),
  //       name: "AuthUser",
  //       meta: { title: "分配用户", activeMenu: "/system/role" },
  //     },
  //   ],
  // },
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
  // {
  //   path: "/monitor/job-log",
  //   component: Layout,
  //   hidden: true,
  //   permissions: ["monitor:job:list"],
  //   children: [
  //     {
  //       path: "index",
  //       component: () => import("@/views/monitor/job/log"),
  //       name: "JobLog",
  //       meta: { title: "调度日志", activeMenu: "/monitor/job" },
  //     },
  //   ],
  // },
  // {
  //   path: "/tool/gen-edit",
  //   component: Layout,
  //   hidden: true,
  //   permissions: ["tool:gen:edit"],
  //   children: [
  //     {
  //       path: "index/:tableId(\\d+)",
  //       component: () => import("@/views/tool/gen/editTable"),
  //       name: "GenEdit",
  //       meta: { title: "修改生成配置", activeMenu: "/tool/gen" },
  //     },
  //   ],
  // },
];

const createRouter = () => new VueRouter({
  mode: "history",
  scrollBehavior: () => ({ y: 0 }),
  //代表着是基本的路由请求的路径。参考 ：如：base: ‘/app/’，那么所有的请求都会在url之后加上/app/，应用的基路径。
  //例如，如果整个单页应用服务在 /app/ 下，然后 base 就应该设为 “/app/”
  // base: process.env.BASE_URL,
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
