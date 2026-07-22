import { dynamicRoutes, constantRoutes } from '@/router'
import { getMenuTree } from '@/api/system/user'
// 切勿同步 import Layout，否则管理端整壳会打进博客首屏包
const Layout = () => import(/* webpackChunkName: "layout-admin" */ '@/layout/index')
import store from '@/store'

const permission = {
  state: {
    permission_routes: [],
    addRoutes: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.permission_routes = constantRoutes.concat(routes)
    }
  },
  actions: {
    //   // 生成路由
    //   GenerateRoutes({ commit }) {
    //     return new Promise(resolve => {
    //       // 向后端请求路由数据
    //       getMenuTree().then(res => {
    //         console.log(res.data)
    //         const { roles } = res.data;
    //         // const accessedRouters = asyncRouterMap.filter(v => {
    //         //   if (roles.indexOf('admin') >= 0) return true;
    //         //   if (hasPermission(roles, v)) {
    //         //     if (v.children && v.children.length > 0) {
    //         //       v.children = v.children.filter(child => {
    //         //         if (hasPermission(roles, child)) {
    //         //           return child
    //         //         }
    //         //         return false;
    //         //       });
    //         //       return v
    //         //     } else {
    //         //       return v
    //         //     }
    //         //   }
    //         //   return false;
    //         // })
    //         const accessedRoutes = filterAsyncRouter(res.data)
    //         accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
    //         commit('SET_ROUTES', accessedRoutes)
    //         resolve(accessedRoutes)
    //       })
    //     })
    //   }
    generateRoutes({ commit }, {routes}) {
      return new Promise(resolve => {
        let permissionRoutes = generaMenu(routes).concat(filterAsyncRoutes(dynamicRoutes));
        permissionRoutes.push({ path: '*', redirect: '/404', hidden: true, name: '404' })
        commit('SET_ROUTES', permissionRoutes)
        resolve(permissionRoutes)
      })
    }
  }
}
const actions = {
  //写在这里的方法在引用时，需加上文件名
  // generateRoutes({ commit }, roles) {
  //   return new Promise(resolve => {
  //     const loadMenuData = []
  //     // 先查询后台并返回左侧菜单数据并把数据添加到路由
  //     getMenuTree().then(response => {
  //       if (response.code !== 200) {
  //         Message({
  //           message: "菜单数据加载异常",
  //           type: 0,
  //           duration: 2 * 1000
  //         });
  //       } else {
  //         let data = response.data
  //         Object.assign(loadMenuData, data);
  //         let routes=[]
  //         generaMenu(routes,loadMenuData)
  //         let accessedRoutes
  //         // if (roles.includes('admin')) {
  //         //   accessedRoutes = asyncRoutes || []
  //         // } else {
  //           accessedRoutes = routes
  //         // }
  //         commit('SET_ROUTES', accessedRoutes)
  //         resolve(accessedRoutes)
  //       }
  //     }).catch(error => {
  //       console.log(error+" 错误 ？？？？？？")
  //     })
  //   })
  // }
}
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermissionRole(roles, route) {
  if (route.meta && route.meta.roles) {
    if (route.meta.roles.indexOf(roles) > -1) {
      return true
    } else {
      return false
    }
    // return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

function hasPermission(route) {
  const perms = store.getters && store.getters.permissions
  if (route && route.permissions) {
    return route.permissions.every(element => perms.includes(element));
    // if (perms.indexOf(route.permissions) > -1) {
    //   return true
    // } else {
    //   return false
    // }
    // return roles.some(role => route.meta.roles.includes(role))
  } else {
    return false;
  }
}

/**
 * 后台查询的菜单数据拼装成路由格式的数据
 * 注意：必须用 import() + webpackInclude，禁止 require([`@/${x}`]) 扫整个 src
 */
export function generaMenu(data) {
  const routes=[]
  if (!Array.isArray(data)) return routes
  data.forEach(item => {
    if (!item) return
    const hasChildren = item.children && item.children.length > 0
    const menu = {
      path: item.path == '#' ? item.menuId + '_key' : (item.parentId == 0?'/'+item.path : item.path),
      // component: item.component === '#' ? Layout : () => import(`@/views${item.component}`),
      component: item.component ? (resolve) => require([`@/views/admin/${item.component}`], resolve) : Layout,
      // 动态加载路由，使用es6的import()语法无效，因为import()是异步的，会导致路由加载失败
      // component: item.component ? () => import(/* webpackChunkName: "admin-view-[request]" */ /* webpackInclude: /\.vue$/ */ `@/views/admin/${item.component}`) : Layout,
      hidden: (item.visible == 0 ? false : true),
      // 无子菜单时不要读 children[0].path
      redirect: (item.parentId == 0 && hasChildren ? '/'+item.path+'/'+item.children[0].path : ''),
      children: hasChildren ? generaMenu(item.children) : [],
      type: 'admin',
      name: firstUpperCase(String(item.path || '').replace('/', '')),
      meta: { title: item.menuName, icon: item.icon, noCache: (item.isCache==0?false:true), id: item.menuId }
    }
    routes.push(menu)
  })
  return routes
}

// 遍历后台传来的路由字符串，转换为组件对象
// export function filterAsyncRouter(asyncRouterMap) {
//   return asyncRouterMap.filter(route => {
//     if (route.component) {
//       // Layout组件特殊处理
//       if (route.component === 'Layout') {
//         route.component = Layout
//       } else {
//         route.component = loadView(route.component)
//       }
//     }
//     if (route.children != null && route.children && route.children.length) {
//       route.children = filterAsyncRouter(route.children)
//     }
//     return true
//   })
// }

export function filterAsyncRoutes(dynamicRoutes) {
  const res = []
  dynamicRoutes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(tmp)) {
      // if (tmp.children) {
      //   tmp.children = filterAsyncRoutes(tmp.children)
      // }
      res.push(tmp)
    }
  })
  return res
}

//这是另一种将菜单数据拼装成路由信息的方法
export function makeRoutes(routes) {
  const res = []
  routes.forEach(route => {
    const {
      path,
      redirect,
      hidden,
      name,
      meta,
      component,
      children
    } = route
    const oRouter = {
      path,
      redirect,
      hidden,
      name,
      meta,
      component: (!component || component === '')
        ? Layout
        : () => import(
            /* webpackChunkName: "admin-view-[request]" */
            /* webpackInclude: /views\/admin\/.*\.vue$/ */
            `@/views/admin/${String(component).replace(/^views\/admin\/?/, '').replace(/\.vue$/, '')}`
          ),
      children: children && children.length > 0 ? makeRoutes(children) : []
    }
    res.push(oRouter)
  })
  return res
}

/** 后台视图异步加载（限定 admin 目录，与前台 navMenu.loadView 分离） */
export const loadView = (view) => {
  return () => import(
    /* webpackChunkName: "admin-view-[request]" */
    /* webpackInclude: /\.vue$/ */
    `@/views/admin/${view}`
  )
}

// 字符串首字母大写，其余不变
export function firstUpperCase(str) {
	return str.slice(0,1).toUpperCase() +str.slice(1);
}

export default permission
