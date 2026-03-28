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
    sysOrg:'',
    dicts:{},
    notifyStatus:''
  }
}

const state = getDefaultState()

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
        setTokenExpires(data.token)
        commit('SET_TOKEN', data.token)
        // console.log(data);
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
    return new Promise((resolve, reject) => {
      getMenuTree().then(response => {
        const { data } = response;
        const menus = data.menuList;
        if (!menus) {
          return reject('Verification failed, please Login again.')
        }
        const avatar = data.avatar == "" ? require("@/assets/mai.png") : data.avatar;
        commit('SET_MENUS', menus)
        commit('SET_PERMISSIONS', data.permsSet)
        commit('SET_USERNAME', data.username)
        commit('SET_NICKNAME', data.nickname)
        commit('SET_USERID', data.userId)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', data.roles)
        //let onlineUser = localStorage.getItem("onlineUser");
        //console.log(onlineUser)
        // if (onlineUser) {
          //let tokenId = localStorage.getItem("tokenId");
          // let tokenId=store.state.user.token+":"+store.state.user.username
          //console.log(tokenId);
          // if (null != tokenId) {
          //   this.websocket.Init(tokenId);
          // }
        // }
        //const { name, avatar } = data.avatar
        resolve(menus)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        commit('SET_TOKEN', '')
        removeToken() // must remove  token  first
        //resetRouter()，state.token
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
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

