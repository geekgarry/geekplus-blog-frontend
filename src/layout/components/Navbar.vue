<template>
  <div class="navbar" :class="{ showTopMenuBar: device !== 'mobile' && adminMenuLayout === 'topbar' }">
    <!--注释 侧边栏展开关闭按钮-->
    <hamburger
      v-if="device==='mobile'|| adminMenuLayout === 'sidebar'"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb v-if="adminMenuLayout === 'sidebar'" class="breadcrumb-container hidden-xs-only" />

    <!-- topbar：顶栏横向菜单 -->
    <topbar v-if="device!=='mobile' && adminMenuLayout === 'topbar'" class="left-menu" />

    <div class="right-menu">
      <!-- <div class="right-menu-item hover-effect hidden-xs-only" @click="showNotice">
        <el-badge
          :value="100"
          :max="10"
          class="redPoint"
          ref="msgPoint"
          type="danger"
          is-dot
          v-if="notifyMsg!=undefined"
        ></el-badge>
        <span class="el-icon-chat-dot-square"></span>
      </div> -->
      <notification-msg
        :operation-log="operationLog"
        :system-notice="systemNotice"
        :online-user="onlineUser"
        class="right-menu-item hover-effect"
        @clear="onPushClear"
      />
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip :content="$t('navbarTip.elementSize') || 布局大小" :effect="tooltipEffect" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
        <!-- <div class="right-menu-item">
          <span class="avatar-wrapper-span">在线人数:{{ onlineUserCount }}</span>
        </div> -->
      </template>
      <langs class="right-menu-item hover-effect" />
      <div class="right-menu-item hidden-xs-only">
        <span class="avatar-wrapper-span">{{ nickname }}</span>
      </div>
      <el-dropdown class="avatar-container" trigger="click">
        <el-tooltip class="item" :effect="tooltipEffect" :content="username" placement="bottom-end">
          <div class="avatar-wrapper">
            <img :src="avatar" class="user-avatar">
            <!-- <el-avatar shape="square" :src="avatar ? prefixUrl+avatar : mePic"></el-avatar> -->
            <!-- <i class="el-icon-caret-bottom" /> -->
          </div>
        </el-tooltip>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/admin">
            <el-dropdown-item>
              <i class="el-icon-data-board"></i>{{ $t('navbar.dashboard') || '前端首页'}}
            </el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>
              <i class="el-icon-house"></i>网站首页
            </el-dropdown-item>
          </router-link>
          <router-link to="/admin/user/profile">
            <el-dropdown-item>
              <i class="el-icon-user"></i>{{ $t('navbar.profile') || '个人中心'}}
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item>
            <span @click="refreshUserPerms"><i class="el-icon-refresh"></i>{{ $t('navbar.refreshPerms') || '刷新权限'}}</span>
          </el-dropdown-item>
          <a target="_blank" href="https://github.com/geekgarry">
            <el-dropdown-item>
              <!-- <i class="el-icon-fork-spoon"></i> -->
              <i><svg-icon icon-class="github"/></i>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://github.com/geekgarry">
            <el-dropdown-item><i class="el-icon-document"></i>{{ $t('navbar.document') || 'Docs'}}</el-dropdown-item>
          </a>
          <el-dropdown-item @click.native="setting = true">
            <span><i class="el-icon-magic-stick"></i>{{ $t('navbar.layoutSettings') || '布局设置'}}</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="onRealtimeChat=true">
            <span><i class="el-icon-phone-outline"></i>在线沟通</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="onAiChatBot=true">
            <span><i class="el-icon-chat-dot-round"></i>AI</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;"><i class="el-icon-switch-button"></i>{{ $t('navbar.logOut') || '退出' }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <ai-chat-popup v-model="onAiChatBot" title="AI 助手" />
    <realtime-chat-entry v-model="onRealtimeChat" :fab="false" />
  </div>
</template>

<script>

import websocket from '@/utils/wesocket'
// SSE 仍可用于轻量通知；聊天实时通道改回 WebSocket
import ssePush from '@/utils/ssePush'
import { mapGetters, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import Langs from "./Lang"
import Topbar from "./Topbar"
import NotificationMsg from "./NotificationMsg"
import RealtimeChatEntry from '@/components/RealtimeChat/Entry.vue'
import headPic from "@/assets/mai.jpg";
import { getOnlineUserCount } from "@/api/monitor/online"
import { resetRouter } from '@/router'
//权限检查js方法
import {checkPermi, checkRole} from "@/utils/permission"
import { applyRealtimePushDetail } from '@/utils/pushNotify'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    Langs,
    Topbar,
    NotificationMsg,
    RealtimeChatEntry
  },
  data() {
    return {
      mePic: headPic,
      //username:'',
      notifyMsg: undefined,
      operationLog: undefined,
      systemNotice: undefined,
      /** 顶栏「在线用户」未读，仅 applyRealtimePushDetail 在他人 type=online 时写入 */
      onlineUser: undefined,
      onlineUserCount: 0,
      baseHost: window.location.host,
      baseApi: process.env.VUE_APP_BASE_API,
      prefixUrl: process.env.VUE_APP_BASE_API,
      onAiChatBot: false,//AI助手显示
      onRealtimeChat: false,
      refreshingPerms: false,
    };
  },
  created: function () {
    let hasSomePerms=this.checkHasPermi(['system:notice:list'])||this.checkHasPermi(['system:operLog:list'])||this.checkHasPermi(['monitor:online:list']);
    if (hasSomePerms) {
      let userId=this.$store.getters.userId;
      if (null != userId) {
        this.initSsePush(userId);
      }
    }
  },
  mounted(){
    window.addEventListener('onmessageWS', this.getSocketData)
    window.addEventListener('onmessageSSE', this.getSocketData)
  },
  beforeDestroy: function() {
    this.sseClose();
    window.removeEventListener('onmessageWS', this.getSocketData)
    window.removeEventListener('onmessageSSE', this.getSocketData)
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      "device",
      "userId",
      "nickname",
      "username"
    ]),
    // ...mapState({
    //   leftMenuBar: state => state.settings.leftMenuBar == '1' ? true : false
    // }),
    /** 管理端菜单形式：仅 sidebar | topbar */
    adminMenuLayout() {
      const val = this.$store.state.settings.adminMenuLayout
      return val === 'topbar' ? 'topbar' : 'sidebar'
    },
    /** Tip 跟随深浅色：浅色用 light，避免写死 dark 在白主题下炭黑块 */
    tooltipEffect() {
      return this.$store.state.darkMode ? 'dark' : 'light'
    },
    leftMenuBar() {
      return this.adminMenuLayout === 'sidebar'
    },
    userAvatar:{
      get() {
        return this.$store.state.user.avatar;
      },
    },
    nkName: {
      get() {
        return this.$store.getters.nickname;
      },
    },
    setting: {
      get() {
        return this.$store.state.settings.showSettings;
      },
      set(val) {
        this.$store.dispatch("settings/changeSetting", {
          key: "showSettings",
          value: val,
        });
      },
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //this.websocketClose();
        this.$store.dispatch('user/logout').then(() => {
          location.href = '/';
        })
      })
      // await this.$store.dispatch('user/logout')
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async showNotice() {
      // console.log(this.notifyMsg);
      this.msgSuccess(this.notifyMsg);
    },
    async refreshUserPerms(){
      if (this.refreshingPerms) {
        return
      }
      this.refreshingPerms = true
      try {
        await this.$store.dispatch('user/refreshAuth')
        resetRouter()
        this.$store.commit('navMenu/SET_ROUTES_REGISTERED', false)
        const addRoutes = await this.$store.dispatch('generateRoutes', {
          routes: this.$store.state.user.menus
        })
        ;(addRoutes || []).forEach((item) => {
          if (!item || !item.path || item.path === '*') {
            return
          }
          this.$router.addRoute(item)
        })
        // * 必须最后挂，与 permission.js 一致，避免吞掉后台直链
        if (typeof this.$router.hasRoute === 'function' && this.$router.hasRoute('CatchAll404')) {
          this.$router.removeRoute('CatchAll404')
        }
        this.$router.addRoute({
          path: '*',
          redirect: '/404',
          type: 'error',
          hidden: true,
          name: 'CatchAll404'
        })
        this.msgSuccess('权限已刷新')
        const fullPath = this.$route.fullPath
        await this.$router.replace('/redirect' + fullPath).catch(() =>
          this.$router.replace(fullPath).catch(() => {})
        )
      } catch (e) {
        this.msgError((e && (e.message || e.msg)) || '刷新权限失败')
      } finally {
        this.refreshingPerms = false
      }
    },
    // 聊天/预警：优先 WebSocket（双向、低延迟）；SSE 作可选补充
    initSsePush(tokenId){
      websocket.Init(tokenId)
      // 若仍需 SSE 并存可取消下一行注释
      // ssePush.Init(tokenId)
    },
    sseClose(){
      websocket.CloseWebscoket()
      ssePush.Close()
    },
    getOnlineUser(){
      // return this.websocket.getOnlineUserCount();
      getOnlineUserCount().then( (res) => {
        this.onlineUserCount=res.data;
      })
    },
    // 收到 WS/SSE 推送：统一走 pushNotify 规范化（v1 "add" / v2 对象正文），见 @/utils/pushNotify.js
    getSocketData(res) {
      console.log(res);
      const detail = res.detail || {}
      applyRealtimePushDetail(detail, this, { currentUserId: this.userId })
      // 同步在线人数（后端 online 广播带 onlineCount 时）
      if (detail.type === 'online' && detail.onlineCount != null) {
        this.onlineUserCount = detail.onlineCount
      }
      // 后期 v2 气泡：import { notifyPushToast } from '@/utils/pushNotify' 后取消注释
      // if (detail.operationLog && typeof detail.operationLog === 'object') {
      //   notifyPushToast(this.operationLog, { title: '操作提醒' })
      // }
    },
    /** NotificationMsg 点击菜单后清空对应通道未读 */
    onPushClear(channel) {
      if (channel && Object.prototype.hasOwnProperty.call(this, channel)) {
        this[channel] = undefined
      }
    },
    //检测用户是否拥有某个权限
    checkHasPermi(value){
      return checkPermi(value);
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  /* 顶栏与侧栏、博客卡片同一表面体系 */
  background: var(--gp-surface-bg, var(--background-origin, #fff));
  box-shadow: var(--gp-nav-shadow, 0 1px 4px rgba(15, 23, 42, 0.06));
  border-bottom: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, .025));
    }
  }
  .point {
    position: absolute;
    top: 0;
    right: -5px;
    width: 6px;
    height: 6px;
    background: red;
    border-radius: 50%;
  }
  .redPoint {
    position: absolute;
    margin-top: -7px;
    margin-left: -6px;
  }

  .breadcrumb-container {
    float: left;
  }

  // 左侧菜单样式：可收缩，配合 Topbar 溢出折叠到「更多」
  .left-menu{
    float: left;
    height: 100%;
    line-height: normal;
    flex: 1 0 auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .right-menu {
    float: right;
    height: 100%;
    /* 用 flex 统一垂直居中：昵称与头像对齐，摆脱 line-height 基线错位 */
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    line-height: normal;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: var(--text-color, #5a5e66);
      vertical-align: middle;
      line-height: 1;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, .025));
        }
      }
    }

    .avatar-wrapper-span {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      line-height: 1;
      color: var(--text-color-2, #303133);
      max-width: 96px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .avatar-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      margin-right: 10px;
      padding: 0 4px;
      line-height: normal;

      .avatar-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin: 0;
        line-height: 0;
        position: relative;

        .user-avatar {
          cursor: pointer;
          display: block;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-color-2, #d4cfc8);
          box-shadow: none;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: var(--muted-1-color, #8a8580);
        }
      }
    }
  }
}
.navbar.showTopMenuBar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  background: var(--gp-surface-bg, var(--background, #f7f6f5));

  .right-menu {
    float: none;
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>
