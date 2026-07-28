/**
 * 前台博客导航菜单（栏目）→ 动态路由
 * 与后台 permission/user 菜单分离：数据来自 listSubParentCategory，挂到 router 的 sideApp 下。
 */
import { constantRoutes } from "@/router";
import { listSubParentCategory } from "@/api/geekplus/geekplus";

/** session 缓存：同标签页内直链/刷新可跳过等待接口，加快首屏可匹配路由（v2：叶子不再带空 children[]） */
const NAV_MENU_CACHE_KEY = "gp_public_nav_menu_v2";

const state = {
  menuRouters: [],
  addMenuRoutes: [],
  /** 是否已把栏目路由 addRoute 到 vue-router（permission.js 用来避免重复注册 / 漏 rematch） */
  routesRegistered: false,
};

const mutations = {
  SET_ADD_MENU: (state, routes) => {
    state.addMenuRoutes = routes;
  },
  SET_ROUTES: (state, routes) => {
    state.menuRouters = constantRoutes.concat(routes);
  },
  SET_ROUTES_REGISTERED: (state, flag) => {
    state.routesRegistered = !!flag;
  },
};

/** 进行中的拉菜单 Promise，避免 permission 预取与守卫重复打接口 */
let menuLoadingPromise = null;

const actions = {
  /**
   * 拉取栏目树。优先读 sessionStorage，命中则立刻 resolve，并后台静默刷新缓存。
   */
  getMenu({ commit }) {
    if (menuLoadingPromise) {
      return menuLoadingPromise;
    }
    menuLoadingPromise = new Promise((resolve, reject) => {
      let usedCache = false;
      try {
        const raw = sessionStorage.getItem(NAV_MENU_CACHE_KEY);
        if (raw) {
          const menus = JSON.parse(raw);
          if (Array.isArray(menus) && menus.length > 0) {
            commit("SET_ADD_MENU", menus);
            resolve(menus);
            usedCache = true;
          }
        }
      } catch (e) {
        /* 缓存损坏则走接口 */
      }

      listSubParentCategory()
        .then((response) => {
          const menus = getMenuList(response.data || []);
          try {
            sessionStorage.setItem(NAV_MENU_CACHE_KEY, JSON.stringify(menus));
          } catch (e) {
            /* quota / 隐私模式忽略 */
          }
          commit("SET_ADD_MENU", menus);
          // 未用缓存时才 resolve；已用缓存则仅更新 store，避免打断正在进行的 generateRoutes
          if (!usedCache) {
            resolve(menus);
          }
        })
        .catch((err) => {
          if (!usedCache) {
            reject(err);
          }
        })
        .finally(() => {
          menuLoadingPromise = null;
        });
    });
    return menuLoadingPromise;
  },

  /** 将栏目树转成 vue-router 可挂载的路由表 */
  generateRoutes({ commit }, { routes }) {
    return new Promise((resolve) => {
      const routerList = [];
      routes.forEach((item) => {
        setChild(item, routerList, "", "");
      });
      commit("SET_ROUTES", routerList);
      resolve(routerList);
    });
  },
};

function getMenuList(list) {
  const result = [];
  if (!Array.isArray(list)) return result;
  list.forEach((item) => {
    if (!item) return;
    const children = Array.isArray(item.children) ? item.children : [];
    if (children.length > 0) {
      result.push({
        categoryName: item.categoryName,
        path: item.path,
        icon: item.icon,
        id: item.id,
        component: item.component,
        children: getMenuList(children),
      });
    } else {
      // 叶子节点不要写 children:[] —— 空数组在 JS 里是 truthy，
      // 布局里 v-if="item.children" 会误判为有子菜单，进而读 children[0].path 报错
      result.push({
        categoryName: item.categoryName,
        path: item.path,
        icon: item.icon,
        id: item.id,
        component: item.component,
      });
    }
  });
  return result;
}

function setChild(item, routerList) {
  if (!item) return;
  const rootName = item.categoryName;
  const routerName = item.path || "";
  const rootPath = item.path;
  if (!rootPath) return;
  const hasChildren =
    item.children != null && Array.isArray(item.children) && item.children.length > 0;

  if (hasChildren) {
    const router = {
      name: String(routerName).replace("/", ""),
      path: rootPath,
      component: loadView(item.component),
      meta: { title: rootName, icon: item.icon, id: item.id },
      type: "navMenu",
      children: [],
    };
    routerList.push(router);
    item.children.forEach((node) => {
      setChild(node, router.children);
    });
  } else {
    routerList.push({
      name: String(routerName).replace("/", ""),
      path: rootPath,
      component: loadView(item.component),
      meta: { title: rootName, icon: item.icon, id: item.id },
      type: "navMenu",
      children: [],
    });
  }
}

/**
 * 异步加载前台页面组件。
 * webpackExclude 排除 admin，避免 require.context 式扫描把管理端重依赖打进博客包。
 */
export const loadView = (view) => {
  return () =>
    import(
      /* webpackChunkName: "web-view-[request]" */
      /* webpackExclude: /[\\/]admin[\\/]/ */
      `@/views/${view}`
    );
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
