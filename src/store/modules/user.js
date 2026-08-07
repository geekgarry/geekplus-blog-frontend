import { login, logout, getInfo, getMenuTree } from '@/api/system/user'
import { getToken, setTokenExpires, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import store from '..'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    username:'',
    nickname:'',
    userId:'',
    sysUser:{},
    sysRole:{},
    sysRoles:[],
    menus:[],
    roles:[],
    roleNames:[],
    permissions:[],
    sysOrg:'',
    dicts:{},
    notifyStatus:''
  }
}

const state = getDefaultState()

/** 模块级 Promise，避免 rematch 并发重复打 /sys/user/getMenu */
let menuTreeLoadingPromise = null

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_USERNAME: (state, username) => {
    state.username = username
  },
  SET_NICKNAME: (state, nickname) => {
    state.nickname = nickname
  },
  SET_USERID: (state, userId) => {
    state.userId = userId
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USER: (state, user) => {
    state.sysUser = user
  },
  SET_ROLE: (state, role) => {
    state.sysRole = role
  },
  SET_ROLES: (state, roles) => {
    state.sysRoles = roles
    // 同步扁平 roleKey，供 checkRole / getters.roles 使用
    if (Array.isArray(roles)) {
      state.roles = roles.map((r) => (typeof r === 'string' ? r : (r && r.roleKey) || '')).filter(Boolean)
    } else if (roles && typeof roles === 'object') {
      // 后端偶发返回 Set 序列化后的类数组 / 纯对象
      state.roles = Object.values(roles).map((r) => (typeof r === 'string' ? r : (r && r.roleKey) || '')).filter(Boolean)
    } else {
      state.roles = []
    }
  },
  SET_ROLE_NAMES: (state, names) => {
    state.roleNames = Array.isArray(names) ? names : (names ? Object.values(names) : [])
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus
  },
  SET_NOTIFY: (state,notifyStatus) =>{
    state.notifyStatus=notifyStatus
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, validateCode, validateKey, rememberMe } = userInfo
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const { data } = response
        setTokenExpires(data.token, userInfo.rememberMe !== false)
        commit('SET_TOKEN', data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 此处没有使用，而是直接用getMenu获取所有路由信息和权限
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response.data

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar, roleList } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_USER', data)
        commit('SET_ROLES', roleList)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  getMenu({ commit, state }) {
    // 路由 rematch / 并发守卫可能短时间多次 dispatch，合并为一次请求
    if (menuTreeLoadingPromise) {
      return menuTreeLoadingPromise
    }
    menuTreeLoadingPromise = new Promise((resolve, reject) => {
      getMenuTree().then(response => {
        const { data } = response;
        const menus = data.menuList;
        if (!menus) {
          return reject('Verification failed, please Login again.')
        }
        const avatar = data.avatar == "" ? require("@/assets/mai.jpg") : data.avatar;
        commit('SET_MENUS', menus)
        commit('SET_PERMISSIONS', data.permsSet)
        commit('SET_USERNAME', data.username)
        commit('SET_NICKNAME', data.nickname)
        commit('SET_USERID', data.userId)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', data.roles)
        if (data.roleNames) {
          commit('SET_ROLE_NAMES', data.roleNames)
        }
        if (data.userType != null || data.sysUser) {
          commit('SET_USER', data.sysUser || {
            userId: data.userId,
            username: data.username,
            nickname: data.nickname,
            userType: data.userType
          })
        }
        resolve(menus)
      }).catch(error => {
        reject(error)
      }).finally(() => {
        menuTreeLoadingPromise = null
      })
    })
    return menuTreeLoadingPromise
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve) => {
      const done = () => {
        commit('SET_TOKEN', '')
        removeToken()
        commit('RESET_STATE')
        resolve()
      }
      logout()
        .then(() => done())
        .catch(() => done()) // 服务端已失效时仍清本地，避免卡在半登录态
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

