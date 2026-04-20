import { dynamicRoutes, constantRoutes } from '@/router'
import { getMenuTree } from '@/api/system/user'
import Layout from '@/layout/index'
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
 * @param routes (resolve: any) => require([`@/views/${view}.vue`], resolve)
 */
export function generaMenu(data) {
  const routes=[]
  data.forEach(item => {
    //alert(JSON.stringify(item))
    var hasChildren=item.children.length>0
    var redirectPath=item.path+'/'
    //const component = item.route? asnycRouteMeun[`${item.route}`] : Layout;
    const menu = {
      path: item.path == '#' ? item.menuId + '_key' : (item.parentId == 0?'/'+item.path : item.path),
      // component: item.component === '#' ? Layout : () => import(`@/views${item.component}`),
      component: item.component ? (resolve) => require([`@/views/admin/${item.component}`], resolve) : Layout,
      //component: item.component ? () => import(`@/views${item.component}`) : Layout,
      hidden: (item.visible == 0 ? false : true),
      redirect: (item.parentId == 0?'/'+item.path+'/'+item.children[0].path:''),
      children: item.children && item.children.length > 0 ? generaMenu(item.children) : [],
      type: 'admin',
      name: firstUpperCase(item.path.replace('/', '')),//item.menuName,由于要和vue页面的name匹配，所以要首字母转换大写
      //meta: item.meta
      meta: { title: item.menuName, icon: item.icon, noCache: (item.isCache==0?false:true), id: item.menuId }
    }
    // if (item.children&&item.children.length > 0) {
    //   generaMenu(menu.children, item.children)
    // }
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
      component(resolve) {
        let componentPath = ''
        if (!component || component === '') {
          require(['@/layout/index.vue'], resolve)
          return
        } else {
          componentPath = component
        }
        require([`@/${componentPath}.vue`], resolve)
      },
      children: children && children.length > 0 ? makeRoutes(children) : []
    }
    res.push(oRouter)
  })
  return res
}

// 动态路由遍历，验证是否具备权限
// export function filterDynamicRoutes(routes) {
//   const res = []
//   routes.forEach(route => {
//     if (route.permissions) {
//       if (auth.hasPermiOr(route.permissions)) {
//         res.push(route)
//       }
//     } else if (route.roles) {
//       if (auth.hasRoleOr(route.roles)) {
//         res.push(route)
//       }
//     }
//   })
//   return res
// }

export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/admin/${view}`], resolve)
}

// 字符串首字母大写，其余不变
export function firstUpperCase(str) {
	return str.slice(0,1).toUpperCase() +str.slice(1);
}

export default permission
