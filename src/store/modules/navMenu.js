import { constantRoutes } from "@/router";
import { listSubParentCategory } from "@/api/geekplus/geekplus";
/* Layout */
import Layout from "@/layout/blog/vertical";

// 全局变量state，routes和addRoutes数组
const state = {
    menuRouters: [],
    addMenuRoutes: [] //JSON.parse(localStorage.getItem("navMenuRoutes") || '[]')
};

// Mutation 用户变更Store数据
const mutations = {
    SET_ADD_MENU: (state, routes) => {
        state.addMenuRoutes = routes;
        // localStorage.setItem("navMenuRoutes", JSON.stringify(routes));
    },
    SET_ROUTES: (state, routes) => {
        state.menuRouters = constantRoutes.concat(routes);
    },
};

const actions = {
    getMenu({ commit }) {
        return new Promise((resolve) => {
            listSubParentCategory().then((response) => {
                //调用后端接口获取路由列表
                const menus = getMenuList(response.data);
                commit("SET_ADD_MENU", menus);
                resolve(menus);
            });
        });
    },
    generateRoutes({ commit }, { routes }) {
        return new Promise((resolve) => {
            const routerList = new Array();
            routes.forEach((item) => {
                setChild(item, routerList, "", "");
            });
            // const layoutRouter = {
            //     path: "",
            //     name: "WebApp",
            //     component: Layout,
            //     //component: () => import('../layout/index'),
            //     type: "webApp",
            //     children: routerList,
            // };
            // const addVueRoutes = new Array();
            // addVueRoutes.push(layoutRouter);
            // addVueRoutes.push({
            //     path: "*",
            //     redirect: "/404",
            //     type: "error",
            //     hidden: true,
            // });
            commit("SET_ROUTES", routerList);
            resolve(routerList);
        });
    },
};

function deep(obj) {
    const objName1 = JSON.stringify(obj);
    const objName2 = JSON.parse(objName1);
    return objName2;
}

function getMenuList(list) {
    const result = new Array();
    list.forEach((item) => {
        if (item.children || item.children.length > 0) {
            result.push({ categoryName: item.categoryName, path: item.path, icon: item.icon, id: item.id, component: item.component, children: getMenuList(item.children) });
        }
    });
    return result;
}

function setChild(item, routerList, rootName, rootPath) {
    // rootName = rootName+'/'+item.categoryName
    // rootPath = rootPath+'/'+item.path
    rootName = item.categoryName;
    let routerName = item.path;
    rootPath = item.path;
    if (
        item.children != null &&
        item.children != [] &&
        item.children.length > 0
    ) {
        //有下层则继续递归路由
        const router = {
            name: routerName.replace("/", ""),
            path: rootPath,
            //component: () => import('@/views/categorypage/GeneralListPage'),
            component: loadView(item.component),
            // componentStr: item.component,
            meta: { title: rootName, icon: item.icon, id: item.id },
            type: "navMenu",
            children: [],
        };
        //console.log(router)
        routerList.push(router);
        //如果有下层
        item.children.forEach((node) => {
            setChild(node, router.children, rootName, rootPath);
        });
    } else {
        //没有下层则说明这是一个路由
        const router = {
            name: routerName.replace("/", ""),
            path: rootPath,
            //component: () => import('@/views/categorypage/ArticleListPage'),
            component: loadView(item.component),
            // componentStr: item.component,
            meta: { title: rootName, icon: item.icon, id: item.id },
            type: "navMenu",
            children: [],
        };
        //console.log(router)
        routerList.push(router);
    }
}
export const loadView = (view) => {
    // 路由懒加载
    return (resolve) => require([`@/views/${view}`], resolve);
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
