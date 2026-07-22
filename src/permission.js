/**
 * 全局路由守卫：前台博客动态菜单 + 后台权限路由
 *
 * 【直链空白页根因】
 * 博客栏目路由（如 /timeEssay/personalEssay）来自 navMenu/getMenu，不在 constantRoutes 里。
 * 从首页点菜单时路由已 addRoute，故能进；首次直接打开该 URL 时：
 *   1) 守卫里 await 拉菜单并 addRoute
 *   2) 若只 next() 而不重新进入，Vue Router 仍沿用「加路由之前」的匹配结果 → matched 为空 → 白屏
 * 正确做法：动态路由刚注册完后 next({ ...to, replace: true }) 强制再匹配一次。
 */
import router from "./router";
import store from "./store";
import Message from "element-ui/lib/message";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";

NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  template: `
    <div class="bar" role="bar">
      <div class="peg"></div>
    </div>
    <div class="spinner" role="spinner">
      <div class="spinner-icon"></div>
    </div>
    `,
  ease: "ease",
  speed: 200,
});

/** 将路由挂到指定父级下（按 path 去重，避免 HMR / 重复守卫注册两次） */
function addChildRoute(parent, route) {
  if (!route || route.path == null) return;
  const routeExists = router.getRoutes().some((r) => r && r.path === route.path && r.name === route.name);
  if (!routeExists) {
    router.addRoute(parent, route);
  }
}

const whiteList = [
  "/article/**",
  "/user",
  "/login",
  "/register",
  "/redirect",
  "/home",
  "/search",
  "/leave-word",
  "/about",
  "/resumeGenerate",
  "/404",
  "/403",
  "/chat",
];

function isAdminRoute(path) {
  return path.startsWith("/admin");
}

/**
 * 模块加载即开始预取前台菜单，与首屏脚本解析并行，缩短直链等待时间。
 * （失败忽略，真正导航时 initPublicRoutes 会再拉一次）
 */
const publicMenuPrefetch = store.dispatch("navMenu/getMenu").catch(() => null);

/**
 * 注册博客前台动态菜单路由（非后台 admin 菜单）
 * @returns {{ ok: boolean, needRematch: boolean }}
 *   needRematch=true 表示本轮刚 addRoute，调用方必须 next({...to, replace:true})
 */
async function initPublicRoutes() {
  // 本会话已注册过：store 有数据且标记已写入 router
  if (store.state.navMenu.routesRegistered) {
    return { ok: true, needRematch: false };
  }

  try {
    // 优先用预取结果；若预取失败则再请求
    let routes = store.state.navMenu.addMenuRoutes;
    if (!routes || routes.length === 0) {
      routes = (await publicMenuPrefetch) || (await store.dispatch("navMenu/getMenu"));
    }
    if (!routes || routes.length === 0) {
      // 无菜单数据时仍放行静态路由（首页等），避免整站卡死
      store.commit("navMenu/SET_ROUTES_REGISTERED", true);
      return { ok: true, needRematch: false };
    }

    const accessRoutes = await store.dispatch("navMenu/generateRoutes", { routes });
    accessRoutes.forEach((item) => {
      addChildRoute("webApp", item);
    });

    // 404 必须在全部动态路由之后挂载，否则会抢先吞掉栏目路径
    const has404 = router.getRoutes().some((r) => r.path === "*" || r.name === "404");
    if (!has404) {
      router.addRoute({
        path: "*",
        redirect: "/404",
        type: "error",
        hidden: true,
        name: "404",
      });
    }

    store.commit("navMenu/SET_ROUTES_REGISTERED", true);
    // 关键：刚 addRoute 后必须让调用方 replace 重进，否则直链白屏
    return { ok: true, needRematch: true };
  } catch (error) {
    console.error("加载公共菜单失败:", error);
    return { ok: false, needRematch: false };
  }
}

router.beforeEach(async (to, from, next) => {
  document.title =
    getPageTitle(to.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集" ||
    "极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
  NProgress.start();

  const hasToken = getToken();

  // 1. 确保前台博客动态菜单已挂到 webApp 下
  const { ok, needRematch } = await initPublicRoutes();
  if (!ok) {
    NProgress.done();
    Message.error("加载站点菜单失败，请刷新重试");
    next("/404");
    return;
  }
  // 动态路由刚写入：强制按当前 URL 再匹配一次（修复直链空白）
  // 注意：不要 next({ ...to })，展开 Route 对象可能带上 name:null / matched 等内部字段，
  // vue-router 解析时会触发 Cannot read properties of undefined (reading 'path')
  if (needRematch) {
    next({ path: to.fullPath, replace: true });
    return;
  }

  if (hasToken) {
    if (
      to.path === "/login" ||
      to.path === "/admin/login" ||
      to.fullPath === "/user?method=login" ||
      to.query.method === "login"
    ) {
      next({ path: "/admin" });
      NProgress.done();
    } else if (store.state.user.menus.length === 0) {
      // 2. 已登录：拉取后台管理菜单并动态挂载（与前台 navMenu 无关）
      try {
        const routes = await store.dispatch("user/getMenu");
        const addRoutes = await store.dispatch("generateRoutes", { routes });
        addRoutes.forEach((item) => {
          router.addRoute(item);
        });
        // 后台路由同样需要 replace 重进（只用 fullPath，避免展开 Route 触发 path 读空）
        next({ path: to.fullPath, replace: true });
      } catch (err) {
        await store.dispatch("user/logout");
        Message.error(err || "用户认证失败, 请重新登录");
        if (to.path !== "/login") {
          next();
        } else {
          next(`/login?redirect=${to.path}`);
        }
        NProgress.done();
      }
    } else {
      next();
    }
  } else {
    /* 未登录 */
    if (whiteList.some((path) => to.path.startsWith(path.replace("**", "")))) {
      next();
    } else if (isAdminRoute(to.path)) {
      Message.warning("您尚未登录，请先登录！");
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    } else {
      // 前台栏目等动态路径：路由已在上方注册，直接放行由匹配结果决定
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
