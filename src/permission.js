import router from "./router";
import store from "./store";
import Message from "element-ui/lib/message";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";
// import { asyncRouterMap, constantRoutes } from "@/router";

NProgress.configure({
  showSpinner: false,
  minimum: 0.1, // 开始动画的百分比
  template: `
    <div class="bar" role="bar">
      <div class="peg"></div>
    </div>
    <div class="spinner" role="spinner">
      <div class="spinner-icon"></div>
    </div>
    `, // 自定义进度条和旋钮的HTML结构
  ease: "ease", // 动画使用的easing方程
  speed: 200, // 动画的速度（以毫秒为单位）
}); // NProgress Configuration

// 动态添加路由的函数
function addRoute(route) {
  const nameExists = router.getRoutes().some(r => r.name === route.name);
  const routeExists = router.getRoutes().some(r => r.path === route.path);
  if (!routeExists) {
    router.addRoute(route);
  }
}

function addChildRoute(parent, route) {
  const nameExists = router.getRoutes().some(r => r.name === route.name);
  const routeExists = router.getRoutes().some(r => r.path === route.path);
  if (!routeExists) {
    router.addRoute(parent, route);
  }
}

const whiteList = ['/article/**', '/user', '/login', '/register', '/redirect', '/home', '/search', '/leave-word', '/about', '/resumeGenerate', '/404', '/403', '/chat']; // no redirect whitelist
//const adminList = ['/admin', '/admin/dashboard', '/admin/**']; // no redirect whitelist

// 辅助函数，判断是否是后台管理路由
function isAdminRoute(path) {
  return path.startsWith('/admin');
}

// 初始化加载公共菜单（未登录状态下可见的博客主页菜单）
async function initPublicRoutes() {
  if (store.state.navMenu.addMenuRoutes.length === 0) {
    try {
      const routes = await store.dispatch("navMenu/getMenu"); // 从API或localStorage获取
      const accessRoutes = await store.dispatch("navMenu/generateRoutes", { routes });
      accessRoutes.forEach((item) => {
        router.addRoute('webApp', item);
      });
      // 确保404在所有动态路由添加后添加，避免捕获到预期路由
      // vue-router v3中不存在router.hasRoute(name)
      const routeExists = router.resolve('/404').route && router.resolve('/404').route.matched.length > 0;
      if (!routeExists) {
        router.addRoute({ path: '*', redirect: '/404', type: 'error', hidden: true, name: '404' });
      }
      // next({...to, replace: true }); // hack方法 确保addRoutes已完成
      // next({ path: to.fullPath, replace: true });  //添加完成后再次进入
      return true; // 标志已加载
    } catch (error) {
      console.error("加载公共菜单失败:", error);
      // Notification({
      //   title: '错误',
      //   message: '加载公共菜单失败，请刷新页面或检查网络！',
      //   type: 'error',
      // });
      // Message.error('加载公共菜单失败，请刷新页面或检查网络！');
      return false;
    }
  } else{
    return true;
  }
  return true; // 标志已加载
}

router.beforeEach(async (to, from, next) => {
  // set page title
  document.title = getPageTitle(to.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集" || "极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
  // start progress bar
  NProgress.start();

  // determine whether the user has logged in
  const hasToken = getToken();

  // 1. 确保公共（博客主页）菜单已加载
  // 这里可以进一步优化：如果to是白名单路由，才去加载公共菜单
  const publicRoutesLoaded = await initPublicRoutes();
  if (!publicRoutesLoaded) {
    // 如果公共菜单加载失败，可能需要跳转到错误页或提示
    NProgress.done();
    return; // 阻止导航
  }

  if (hasToken) {
    if (to.path === '/login' || to.path === '/admin/login' || to.fullPath === '/user?method=login' || to.query.method === 'login') {
      // if is logged in, redirect to the home page
      next({ path: '/admin' });
      NProgress.done();
    } else {
      // 2. 已登录状态，处理管理后台菜单
      // 检查Vuex中是否有管理员菜单数据，或者localStorage中是否有，store.state.user.menus === undefined;
      if (store.state.user.menus.length === 0) {
        try {
          // get user info
          //await store.dispatch('user/getInfo')
          store
            .dispatch("user/getMenu")
            .then((res) => {
              // 拉取 菜单信息
              //从localStorage中获取用户信息,是登陆状态则能够进行webSocket重连
              const routes = res;
              //const permission = {}写在这里可以直接方法名引用，const action={}里必须加getter的注册名称在方法前
              //如果在对象外围加上{},表示去这个对象里面的某个具体的对象的的值适用于JSON对象，JSON数字则不可以
              store.dispatch("generateRoutes", { routes }).then((addRoutes) => {
                // 根据 system 权限生成可访问的路由表
                // router.addRoutes(addRoutes); // 动态添加可访问路由表
                addRoutes.forEach((item) => {
                  router.addRoute(item); // 动态添加可访问路由表
                });
                next({ ...to, replace: true }); // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
              });
            })
            .catch((err) => {
              store.dispatch("user/logout").then(() => {
                Message.error(err || "用户认证失败, 请重新登录");
                if (to.path !== "/login") {
                  next();//{ path: "/login" }
                  // store.dispatch('settings/showLogin', true)
                }
              });
            });
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch("user/resetToken");
          Message.error(error || "系统错误");
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      } else {
        next();
      }
    }
  } else {
    /* has no token */
    // if (store.state.navMenu.addMenuRoutes.length === 0) {
    //   //拿到浏览器缓存中动态路由的数据 重新添加
    //   await store.dispatch("navMenu/getMenu").then((res) => {// 从API或localStorage获取
    //     // 拉取 菜单信息
    //     const routes = res;
    //     store.dispatch("navMenu/generateRoutes", { routes })
    //       .then((accessRoutes) => {
    //         // 根据roles权限生成可访问的路由表
    //         accessRoutes.forEach((item) => {
    //           router.addRoute('webApp', item); // 动态添加可访问路由表
    //         });
    //         router.addRoute({ path: '*', redirect: '/404', type: 'error', hidden: true });
    //         // next({...to, replace: true }); // hack方法 确保addRoutes已完成
    //         //next({ path: to.fullPath, replace: true });  //添加完成后再次进入
    //       });
    //   });
    // }
    // other pages that do not have permission to access are redirected to the login page.
    // not in the login blacklist, go directly
    if (whiteList.some(path => to.path.startsWith(path.replace('**', '')))) { // 检查白名单
      // 不在需要登录的黑名单中，放行
      next(); //匹配白名单路由，放行
    } else if (isAdminRoute(to.path)) { // 未登录尝试访问管理后台
      Message.warning("您尚未登录，请先登录！");
      next(`/login?redirect=${to.path}`);//如果登录页或首页 或 vuex中有动态路由数据
      NProgress.done();
    } else {
      // 如果是其他未知路由，且不在白名单，可能是需要登录的博客页面，或者404
      next(); // 暂时放行，由路由匹配处理404
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
