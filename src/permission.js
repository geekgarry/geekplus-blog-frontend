/**
 * 全局路由守卫：前台博客动态菜单 + 后台权限路由（双重动态路由的总闸门）
 *
 * 进站顺序：
 *   1) 静态已可匹配的前台页（首页 / 文章 / 搜索…）→ 立刻放行，栏目菜单后台挂载
 *   2) 栏目直链（constant 未匹配）→ 等 initPublicRoutes 后再 rematch
 *   3) 有 Token 且进 /admin* → 再拉后台菜单；逛博客时不阻塞拉管理端菜单
 *   4) * → /404 仍挂在全部动态路由之后
 *
 * 详见 docs/v2/00-双重动态路由与守卫.md
 */
import router, { blogChildrenRoutes } from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";
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

const CATCH_ALL_NAME = "CatchAll404";

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
  "/post/**",
  "/user",
  "/login",
  "/register",
  "/redirect",
  "/home",
  "/search",
  "/leave-word",
  "/about",
  "/file-transfer",
  "/categories",
  "/tags",
  "/user/center",
  "/user/comments",
  "/resumeGenerate",
  "/404",
  "/403",
  "/chat",
];

function isAdminRoute(path) {
  return path === "/admin" || path.startsWith("/admin/");
}

/** 已登录、目标是后台、且后台菜单尚未注入 → 本轮须推迟 * 与 rematch */
function isPendingAdminBootstrap(to) {
  if (!to || !isAdminRoute(to.path)) return false;
  if (!getToken()) return false;
  const menus = store.state.user && store.state.user.menus;
  return !menus || menus.length === 0;
}

/**
 * 后台相关 URL 在「管理端路由未就绪 / 未登录待跳转」时不要挂 *：
 * 否则 rematch 会把 /admin/... 解析成 /404，登录重定向也来不及。
 */
function shouldDeferCatchAll(to) {
  if (!to || !isAdminRoute(to.path)) return false;
  if (!getToken()) return true;
  return isPendingAdminBootstrap(to);
}

/**
 * 当前导航是否已能被 constantRoutes（含 blogChildren）匹配到叶子页。
 * 只有「栏目直链」这类尚未 addRoute 的路径才需要阻塞等待菜单。
 */
function isAlreadyMatchedLeaf(to) {
  if (!to || !to.matched || to.matched.length === 0) return false;
  const leaf = to.matched[to.matched.length - 1];
  if (!leaf) return false;
  // 仅命中 BlogShell 父级、尚无子页 → 不能当「已就绪」
  if (leaf.name === "webApp") return false;
  return true;
}

/** 路径是否落在静态 blogChildren（含 :id 参数），用于保守判断 */
function isStaticBlogChildPath(path) {
  if (!path) return false;
  return (blogChildrenRoutes || []).some((r) => {
    if (!r || !r.path) return false;
    if (r.path === "/" || r.path === "") return path === "/" || path === "";
    const pattern = "^" + String(r.path)
      .replace(/\?/g, "")
      .replace(/:[^/]+/g, "[^/]+") + "\\/?$";
    try {
      return new RegExp(pattern).test(path);
    } catch (e) {
      return path === r.path || path.startsWith(r.path + "/");
    }
  });
}

/**
 * 模块加载即开始预取前台菜单，与首屏脚本解析并行，缩短直链等待时间。
 */
const publicMenuPrefetch = store.dispatch("navMenu/getMenu").catch(() => null);

/** 后台菜单空闲预取（逛博客时不阻塞；进 /admin 前尽量已就绪） */
let adminMenuPrefetch = null;
function prefetchAdminMenus() {
  if (!getToken()) return;
  if (store.state.user.menus && store.state.user.menus.length > 0) return;
  if (adminMenuPrefetch) return;
  adminMenuPrefetch = store
    .dispatch("user/getMenu")
    .then(async (routes) => {
      const addRoutes = await store.dispatch("generateRoutes", { routes });
      addAdminRoutes(addRoutes);
      return addRoutes;
    })
    .catch(() => null)
    .finally(() => {
      adminMenuPrefetch = null;
    });
}

/**
 * 注册博客前台动态菜单路由（挂到 webApp / BlogShell）
 * @returns {{ ok: boolean, needRematch: boolean }}
 */
async function initPublicRoutes(to) {
  if (store.state.navMenu.routesRegistered) {
    return { ok: true, needRematch: false };
  }

  try {
    let routes = store.state.navMenu.addMenuRoutes;
    if (!routes || routes.length === 0) {
      routes = (await publicMenuPrefetch) || (await store.dispatch("navMenu/getMenu"));
    }
    if (!routes || routes.length === 0) {
      store.commit("navMenu/SET_ROUTES_REGISTERED", true);
      if (!shouldDeferCatchAll(to)) {
        ensureCatchAll404();
      }
      return { ok: true, needRematch: false };
    }

    const accessRoutes = await store.dispatch("navMenu/generateRoutes", { routes });
    accessRoutes.forEach((item) => {
      addChildRoute("webApp", item);
    });

    store.commit("navMenu/SET_ROUTES_REGISTERED", true);

    if (!shouldDeferCatchAll(to)) {
      ensureCatchAll404();
    }

    return { ok: true, needRematch: true };
  } catch (error) {
    console.error("加载公共菜单失败:", error);
    return { ok: false, needRematch: false };
  }
}

/** 不阻塞导航：后台完成栏目注册（首页等静态页用） */
function registerPublicRoutesInBackground(to) {
  if (store.state.navMenu.routesRegistered) return;
  initPublicRoutes(to).catch(() => {});
}

function removeCatchAll404() {
  if (typeof router.hasRoute === "function" && router.hasRoute(CATCH_ALL_NAME)) {
    router.removeRoute(CATCH_ALL_NAME);
    return;
  }
}

function ensureCatchAll404() {
  removeCatchAll404();
  if (router.getRoutes().some((r) => r.path === "*")) return;
  router.addRoute({
    path: "*",
    redirect: "/404",
    type: "error",
    hidden: true,
    name: CATCH_ALL_NAME,
  });
}

function addAdminRoutes(routeList) {
  removeCatchAll404();
  (routeList || []).forEach((item) => {
    if (!item || item.path === "*" || item.name === CATCH_ALL_NAME) return;
    router.addRoute(item);
  });
  ensureCatchAll404();
}

router.beforeEach(async (to, from, next) => {
  document.title =
    getPageTitle(to.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集" ||
    "极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
  NProgress.start();

  const hasToken = getToken();
  const matchedLeaf = isAlreadyMatchedLeaf(to);
  const staticBlog = isStaticBlogChildPath(to.path);

  // 1. 前台栏目：静态页不阻塞；栏目直链才 await
  if (store.state.navMenu.routesRegistered) {
    // already done
  } else if (matchedLeaf || (staticBlog && !isAdminRoute(to.path))) {
    registerPublicRoutesInBackground(to);
  } else {
    const { ok, needRematch } = await initPublicRoutes(to);
    if (!ok) {
      NProgress.done();
      Message.error("加载站点菜单失败，请刷新重试");
      next("/404");
      return;
    }
    const pendingAdmin = isPendingAdminBootstrap(to);
    const deferRematchForAdmin = pendingAdmin || (!hasToken && isAdminRoute(to.path));
    if (needRematch && !deferRematchForAdmin) {
      next({ path: to.fullPath, replace: true });
      return;
    }
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
      // 逛博客：不阻塞拉管理端菜单；进后台才同步等待
      if (!isAdminRoute(to.path)) {
        prefetchAdminMenus();
        if (!router.getRoutes().some((r) => r.path === "*")) {
          ensureCatchAll404();
        }
        next();
        return;
      }
      try {
        if (adminMenuPrefetch) {
          await adminMenuPrefetch;
        }
        if (!store.state.user.menus || store.state.user.menus.length === 0) {
          const routes = await store.dispatch("user/getMenu");
          const addRoutes = await store.dispatch("generateRoutes", { routes });
          addAdminRoutes(addRoutes);
        }
        next({ path: to.fullPath, replace: true });
      } catch (err) {
        await store.dispatch("user/logout");
        Message.error(err || "用户认证失败, 请重新登录");
        ensureCatchAll404();
        if (to.path !== "/login") {
          next();
        } else {
          next(`/login?redirect=${to.path}`);
        }
        NProgress.done();
      }
    } else {
      if (!router.getRoutes().some((r) => r.path === "*")) {
        ensureCatchAll404();
      }
      next();
    }
  } else {
    if (!router.getRoutes().some((r) => r.path === "*")) {
      // 栏目仍在后台注册时：非后台路径也可先挂 *；后台相关仍 defer
      if (!shouldDeferCatchAll(to)) {
        ensureCatchAll404();
      }
    }
    if (whiteList.some((path) => to.path.startsWith(path.replace("**", "")))) {
      next();
    } else if (isAdminRoute(to.path)) {
      Message.warning("您尚未登录，请先登录！");
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
