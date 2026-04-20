<template>
  <!-- 弹出选项卡模式 -->
  <!-- <el-popover placement="bottom" trigger="click"
    v-if="checkHasPermi(['system:notice:list']) || checkHasPermi(['system:operLog:list']) || checkHasPermi(['monitor:online:list'])">
    <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
      <el-tab-pane label="系统通知" name="first">
        <div class="click-more"><router-link to="/admin/system/noticeManage" v-if="checkHasPermi(['system:notice:list'])">
            <el-badge :value="100" :max="10" class="redPoint" ref="msgPoint" type="danger" is-dot
              v-if="systemNotice != undefined"></el-badge>查看更多<i class="el-icon-arrow-right"></i>
          </router-link></div>
      </el-tab-pane>
      <el-tab-pane label="操作日志" name="second">
        <div class="click-more"><router-link to="/admin/system/log/operLog" v-if="checkHasPermi(['system:operLog:list'])">
            <el-badge :value="100" :max="10" class="redPoint" ref="msgPoint" type="danger" is-dot
              v-if="operationLog != undefined"></el-badge>查看更多<i class="el-icon-arrow-right"></i>
          </router-link></div>
      </el-tab-pane>
      <el-tab-pane label="在线用户" name="third">
        <div class="click-more"><router-link to="/admin/monitor/online" v-if="checkHasPermi(['monitor:online:list'])">
            <el-badge :value="100" :max="10" class="redPoint" ref="msgPoint" type="danger" is-dot
              v-if="notifyMsg != undefined"></el-badge>
              查看更多<i class="el-icon-arrow-right"></i>
          </router-link></div>
      </el-tab-pane>
    </el-tabs>
    <div slot="reference">
      <el-badge :value="100" :max="10" class="redPoint" ref="msgPoint" type="danger" is-dot
        v-if="systemNotice != undefined || operationLog != undefined"></el-badge>
      <span class="el-icon-chat-dot-square"></span>
    </div>
  </el-popover> -->
  <!-- 下拉菜单项模式，和选项卡模式任选一种，上面的选项卡模式可以做更深度的定制和开发 -->
  <el-dropdown trigger="click" v-if="checkHasPermi(['system:notice:list'])||checkHasPermi(['system:operLog:list'])||checkHasPermi(['monitor:online:list'])" >
    <div>
      <el-badge
        :value="100"
        :max="10"
        class="redPoint"
        ref="msgPoint"
        type="danger"
        is-dot
        v-if="systemNotice != undefined || operationLog !=undefined"
      ></el-badge>
      <span class="el-icon-chat-dot-square"></span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <router-link to="/admin/system/noticeManage" v-if="checkHasPermi(['system:notice:list'])">
        <el-dropdown-item @click.native="systemNotice = undefined">
          <el-badge
            :value="100"
            :max="10"
            class="redPoint"
            ref="msgPoint"
            type="danger"
            is-dot
            v-if="systemNotice != undefined"
          ></el-badge>
          {{$t('message.systemNotice') || 系统通知}}</el-dropdown-item
        >
      </router-link>
      <router-link to="/admin/system/log/operLog" v-if="checkHasPermi(['system:operLog:list'])">
        <el-dropdown-item @click.native="operationLog = undefined">
          <el-badge
            :value="100"
            :max="10"
            class="redPoint"
            ref="msgPoint"
            type="danger"
            is-dot
            v-if="operationLog !=undefined"
          ></el-badge>
          {{$t('message.operationRecord') || 操作日志}}</el-dropdown-item
        >
      </router-link>
      <router-link to="/admin/monitor/online" v-if="checkHasPermi(['monitor:online:list'])">
        <el-dropdown-item @click.native="checkNotifyMsg">
          <el-badge
            :value="100"
            :max="10"
            class="redPoint"
            ref="msgPoint"
            type="danger"
            is-dot
            v-if="notifyMsg != undefined"
          ></el-badge>
          {{$t('message.onlineUser') || 在线用户}}</el-dropdown-item
        >
      </router-link>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
//权限检查js方法
import { checkPermi, checkRole } from "@/utils/permission"

export default {
  name: "NotificationMsg",
  props: {
    notifyMsg: { type: Object, default: undefined },
    systemNotice: { type: Object, default: undefined },
    operationLog: { type: Object, default: undefined },
    onlineUser: { type: Object, default: undefined },
  },
  data() {
    return {
      activeTabName: "first"
    }
  },
  methods: {
    checkNotifyMsg() {
      this.notifyMsg = undefined;
    },
    handleTabClick(tab, event) {
      // console.log(tab, event);
    },
    checkHasPermi(value) {
      return checkPermi(value);
    },
    checkIsRole(value) {
      return checkRole(value);
    }
  }
}
</script>

<style lang="scss" scoped>
.redPoint {
  position: absolute;
  margin-top: -7px;
  margin-left: -6px;
}

.click-more {
  widows: 100%;
  text-align: center
}
</style>
