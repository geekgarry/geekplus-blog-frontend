/**
 * 全局路由守卫：前台博客动态菜单 + 后台权限路由（双重动态路由的总闸门）
 *
 * 进站顺序（不要颠倒）：
 *   1) initPublicRoutes —— 人人需要的前台栏目，挂到 webApp / BlogShell
 *   2) 若目标是「待加载的后台直链」，本轮不要挂 *、也不要立刻 rematch
 *      （否则 * 会先把 /admin/... 解析成 /404，后台菜单永远加不上）
 *   3) 有 Token 再拉后台菜单；全部动态路由加完后，再把 * 挂到最后
 *   4) needRematch 时 replace 重进 —— 修复「直链时 addRoute 后 matched 仍为空」白屏
 *
 * 【直链空白页根因】
 * 博客栏目路由（如 /timeEssay/personalEssay）来自 navMenu/getMenu，不在 constantRoutes 里。
 * 正确做法：动态路由刚注册完后 next({ path: to.fullPath, replace: true }) 强制再匹配一次。
 * （不要 next({ ...to }) 展开 Route 对象，可能带内部字段导致 path 读空。）
 *
 * 【后台直链被 404 吞掉】
 * 前台 init 后若立刻 ensureCatchAll404 + rematch，此时后台路由尚未 addRoute，
 * Vue Router 会把 /admin/xxx 匹配到 * → redirect /404。因此：
 *   - 后台待加载时：推迟挂 *、推迟 rematch，先加后台路由，最后再挂 * 并 rematch 一次
 *
 * 详见 docs/v2/00-双重动态路由与守卫.md 、docs/v2/07-前后台一体架构与脚手架拆分.md
 */
import router from "./router";
import store from "./store";
import Message from "element-ui";
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
 * 模块加载即开始预取前台菜单，与首屏脚本解析并行，缩短直链等待时间。
 * （失败忽略，真正导航时 initPublicRoutes 会再拉一次）
 */
const publicMenuPrefetch = store.dispatch("navMenu/getMenu").catch(() => null);

/**
 * 注册博客前台动态菜单路由（挂到 webApp / BlogShell）
 * @param {import('vue-router').Route} [to] 当前导航目标，用于判断是否推迟 404 通配
 * @returns {{ ok: boolean, needRematch: boolean }}
 */
async function initPublicRoutes(to) {
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
      store.commit("navMenu/SET_ROUTES_REGISTERED", true);
      // 无栏目时：非「后台相关 defer」才挂 *，避免后台直链 / 未登录进后台被吞
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

    // 后台直链尚未注入管理端路由、或未登录将跳登录时：不要挂 *
    if (!shouldDeferCatchAll(to)) {
      ensureCatchAll404();
    }

    return { ok: true, needRematch: true };
  } catch (error) {
    console.error("加载公共菜单失败:", error);
    return { ok: false, needRematch: false };
  }
}

/** 卸掉通配，便于在其之前插入后台动态路由后再挂回末尾 */
function removeCatchAll404() {
  if (typeof router.hasRoute === "function" && router.hasRoute(CATCH_ALL_NAME)) {
    router.removeRoute(CATCH_ALL_NAME);
    return;
  }
  // 极旧环境无 removeRoute 时：仅依赖「先不加 *」的 defer 策略
}

/**
 * 注册 * → /404；必须排在全部动态路由之后。
 * 与静态页 name:'404'（Error404.vue）区分，避免挂不上 / 重复名冲突。
 */
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

/** 注入后台动态路由（跳过自带的 *，统一由 ensureCatchAll404 挂末尾） */
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

  // 1. 确保前台博客动态菜单已挂到 webApp 下
  const { ok, needRematch } = await initPublicRoutes(to);
  if (!ok) {
    NProgress.done();
    Message.error("加载站点菜单失败，请刷新重试");
    next("/404");
    return;
  }

  const pendingAdmin = isPendingAdminBootstrap(to);
  // 未登录访问后台：同样不要用前台 rematch（无 * 时 matched 空；有 * 会被吞成 404）
  const deferRematchForAdmin = pendingAdmin || (!hasToken && isAdminRoute(to.path));

  // 前台刚 addRoute：后台相关导航延后到本守卫后续分支再 rematch / 跳登录
  if (needRematch && !deferRematchForAdmin) {
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
        addAdminRoutes(addRoutes);
        // 前台 + 后台都就绪后再 rematch（含此前 defer 的后台直链）
        next({ path: to.fullPath, replace: true });
      } catch (err) {
        await store.dispatch("user/logout");
        Message.error(err || "用户认证失败, 请重新登录");
        // 登出后仍要有 *，避免未知路径白屏
        ensureCatchAll404();
        if (to.path !== "/login") {
          next();
        } else {
          next(`/login?redirect=${to.path}`);
        }
        NProgress.done();
      }
    } else {
      // 后台菜单已在内存：确保 * 仍在（HMR / 异常卸路由后的兜底）
      if (!router.getRoutes().some((r) => r.path === "*")) {
        ensureCatchAll404();
      }
      next();
    }
  } else {
    /* 未登录 */
    if (!router.getRoutes().some((r) => r.path === "*")) {
      ensureCatchAll404();
    }
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
