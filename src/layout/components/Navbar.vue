<template>
  <div class="navbar" :class="{showTopMenuBar: device!=='mobile'&&!leftMenuBar}">
    <!--注释 侧边栏展开关闭按钮-->
    <hamburger
      v-if="device==='mobile'||leftMenuBar"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb v-if="leftMenuBar" class="breadcrumb-container hidden-xs-only" />

    <!--当 leftMenuBar===false，左菜单栏隐藏，顶部显示-->
    <topbar v-if="device!=='mobile' && !leftMenuBar" class="left-menu" />

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
      <notification-msg :operationLog="operationLog" :systemNotice="systemNotice" class="right-menu-item hover-effect" />
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip :content="$t('navbarTip.elementSize') || 布局大小" effect="dark" placement="bottom">
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
        <el-tooltip class="item" effect="dark" :content="username" placement="bottom-end">
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
          <!-- <el-dropdown-item @click.native="onAiChatBot=true">
            <span><i class="el-icon-chat-dot-round"></i>AI</span>
          </el-dropdown-item> -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;"><i class="el-icon-switch-button"></i>{{ $t('navbar.logOut') || '退出' }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- <el-dialog :visible.sync="onAiChatBot" title="AI聊天助手" width="85%" append-to-body>
      <chat-bot></chat-bot>
    </el-dialog> -->
  </div>
</template>

<script>

import websocket from '@/utils/wesocket'
import { mapGetters, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import Langs from "./Lang"
import Topbar from "./Topbar"
import NotificationMsg from "./NotificationMsg"
import headPic from "@/assets/mai.png";
import { getOnlineUserCount } from "@/api/monitor/online"
import { refreshUserAuth } from '@/api/system/user'
//权限检查js方法
import {checkPermi, checkRole} from "@/utils/permission"

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    Langs,
    Topbar,
    NotificationMsg
  },
  data() {
    return {
      mePic: headPic,
      //username:'',
      notifyMsg: undefined,
      operationLog: undefined,
      systemNotice: undefined,
      onlineUserCount:0,
      baseHost: window.location.host,
      baseApi: process.env.VUE_APP_BASE_API,
      prefixUrl: process.env.VUE_APP_BASE_API,
      onAiChatBot: false,//AI助手显示
    };
  },
  created: function () {
    //从localStorage中获取用户信息,是登陆状态则能够进行webSocket重连
    // let onlineUser = localStorage.getItem("onlineUser");
    let hasSomePerms=this.checkHasPermi(['system:notice:list'])||this.checkHasPermi(['system:operLog:list'])||this.checkHasPermi(['monitor:online:list']);
    // console.log(onlineUser)
    if (hasSomePerms) {
      let userId=this.$store.getters.userId;
      if (null != userId) {
        this.initWebsocket(userId);
      }
    }
    //this.onlineUserCount=this.getOnlineUser();//this.getCookie("onlineUserCount");
    //this.getOnlineUser();
  },
  mounted(){
    // 添加socket通知监听
    window.addEventListener('onmessageWS', this.getSocketData)
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
    //获取menuInLeft值
    leftMenuBar() {
      return this.$store.state.settings.leftMenuBar == '1' ? true : false
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
      console.log(this.notifyMsg);
      this.msgSuccess(this.notifyMsg);
    },
    refreshUserPerms(){
      refreshUserAuth().then((res) => {
        this.msgSuccess(res.msg);
      })
    },
    //调用方法
    initWebsocket(tokenId){
      websocket.Init(tokenId)
    },
    websocketClose(){
      websocket.CloseWebscoket()
    },
    getOnlineUser(){
      // return this.websocket.getOnlineUserCount();
      getOnlineUserCount().then( (res) => {
        this.onlineUserCount=res.data;
      })
    },
    // 收到消息处理
    getSocketData(res) {
      // this.notifyMsg=res.detail.notifyMsg
      this.operationLog=res.detail.operationLog
      this.systemNotice=res.detail.systemNotice
    },
    //检测用户是否拥有某个权限
    checkHasPermi(value){
      return checkPermi(value);
    }
  },
  beforeDestroy: function() {
    this.websocketClose();
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--background-origin,#fff);
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
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

  // 左侧菜单样式
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
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: var(--font-color,#5a5e66);
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }
    .avatar-wrapper-span {
      font-size: 12px;
      position: inherit;
      right: 0px;
      top: 0px;
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 3px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
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
  background: var(--background,#f7f6f5);
}
</style>
