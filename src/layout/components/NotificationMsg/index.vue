<template>
  <!--
    顶栏通知入口：只消费 normalize 后的 PushPayload（见 @/utils/pushNotify.js）
    父组件 Navbar / FloatGroup 在 getSocketData 里 applyRealtimePushDetail，勿直接塞 WS 原始字符串
  -->
  <el-dropdown
    trigger="click"
    v-if="checkHasPermi(['system:notice:list'])||checkHasPermi(['system:operLog:list'])||checkHasPermi(['monitor:online:list'])"
  >
    <div>
      <el-badge
        :value="100"
        :max="10"
        class="redPoint"
        ref="msgPoint"
        type="danger"
        is-dot
        v-if="hasAnyUnread"
      ></el-badge>
      <span class="el-icon-chat-dot-square"></span>
    </div>
    <el-dropdown-menu slot="dropdown" class="push-notify-menu">
      <router-link to="/admin/system/noticeManage" v-if="checkHasPermi(['system:notice:list'])">
        <el-dropdown-item @click.native="clearChannel('systemNotice')">
          <el-badge
            class="redPoint"
            type="danger"
            is-dot
            v-if="hasPushUnread(systemNotice)"
          ></el-badge>
          <span class="push-menu-item">
            <span class="push-menu-item__label">{{ $t('message.systemNotice') || '系统通知' }}</span>
            <!-- v2 正文：后端推对象时自动显示 summary，v1 "add" 显示默认「有新系统通知」 -->
            <span v-if="pushPreview(systemNotice)" class="push-menu-item__preview">{{ pushPreview(systemNotice) }}</span>
          </span>
        </el-dropdown-item>
      </router-link>
      <router-link to="/admin/system/log/operLog" v-if="checkHasPermi(['system:operLog:list'])">
        <el-dropdown-item @click.native="clearChannel('operationLog')">
          <el-badge
            class="redPoint"
            type="danger"
            is-dot
            v-if="hasPushUnread(operationLog)"
          ></el-badge>
          <span class="push-menu-item">
            <span class="push-menu-item__label">{{ $t('message.operationRecord') || '操作日志' }}</span>
            <span v-if="pushPreview(operationLog)" class="push-menu-item__preview">{{ pushPreview(operationLog) }}</span>
          </span>
        </el-dropdown-item>
      </router-link>
      <router-link to="/admin/monitor/online" v-if="checkHasPermi(['monitor:online:list'])">
        <el-dropdown-item @click.native="clearChannel('onlineUser')">
          <el-badge
            class="redPoint"
            type="danger"
            is-dot
            v-if="hasPushUnread(onlineUser)"
          ></el-badge>
          <span class="push-menu-item">
            <span class="push-menu-item__label">{{ $t('message.onlineUser') || '在线用户' }}</span>
            <span v-if="pushPreview(onlineUser)" class="push-menu-item__preview">{{ pushPreview(onlineUser) }}</span>
          </span>
        </el-dropdown-item>
      </router-link>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { checkPermi, checkRole } from '@/utils/permission'
import { hasPushUnread, getPushPreview } from '@/utils/pushNotify'

export default {
  name: 'NotificationMsg',
  props: {
    /**
     * 各通道均为 applyRealtimePushDetail 产出的 PushPayload | undefined
     * 勿再传 WS 原始 "add" 字符串（由 pushNotify.normalize 统一处理）
     */
    /**
     * applyRealtimePushDetail 产出：
     * - systemNotice / operationLog：公告、操作日志
     * - onlineUser：仅 WS type=online 且他人上线（勿与后端广播字段 notifyMsg 混淆）
     */
    systemNotice: { type: Object, default: undefined },
    operationLog: { type: Object, default: undefined },
    onlineUser: { type: Object, default: undefined }
  },
  computed: {
    hasAnyUnread() {
      return (
        hasPushUnread(this.systemNotice) ||
        hasPushUnread(this.operationLog) ||
        hasPushUnread(this.onlineUser)
      )
    }
  },
  methods: {
    hasPushUnread,
    /** 下拉副标题；v1 为默认文案，v2 为后端 title/content */
    pushPreview(payload) {
      return getPushPreview(payload)
    },
    /** 点击菜单项后通知父组件清空，避免直接改 prop */
    clearChannel(channel) {
      this.$emit('clear', channel)
    },
    checkHasPermi(value) {
      return checkPermi(value)
    },
    checkIsRole(value) {
      return checkRole(value)
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

.push-menu-item {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 220px;
  vertical-align: middle;
  margin-left: 4px;
}

.push-menu-item__label {
  line-height: 1.4;
}

.push-menu-item__preview {
  font-size: 12px;
  color: var(--greyFont, #909399);
  line-height: 1.3;
  margin-top: 2px;
  word-break: break-all;
}
</style>
