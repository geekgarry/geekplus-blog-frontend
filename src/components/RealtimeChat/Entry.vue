<template>
  <div class="gp-rt-entry">
    <el-dialog
      :visible.sync="dialogVisible"
      width="920px"
      top="6vh"
      append-to-body
      custom-class="gp-rt-dialog"
      :fullscreen="false"
      @opened="onOpened"
    >
      <div slot="title" class="gp-rt-dialog__title">
        <span>{{ title }}</span>
        <button type="button" class="gp-rt-popout" title="在新页面打开" @click.stop="openInPage">
          <i class="el-icon-copy-document"></i>
          <span>新页面</span>
        </button>
      </div>
      <realtime-chat
        v-if="dialogVisible"
        mode="embedded"
        :visible="dialogVisible"
      />
    </el-dialog>
    <button
      v-if="fab && loggedIn"
      type="button"
      class="gp-rt-fab"
      :title="title"
      @click="open"
    >
      <i class="el-icon-chat-dot-round"></i>
    </button>
  </div>
</template>

<script>
import RealtimeChat from '@/components/RealtimeChat/index.vue'
import websocket from '@/utils/wesocket'
import { getToken } from '@/utils/auth'

const MOBILE_MQ = '(max-width: 720px)'

export default {
  name: 'RealtimeChatEntry',
  components: { RealtimeChat },
  props: {
    title: { type: String, default: '在线沟通' },
    fab: { type: Boolean, default: true },
    value: { type: Boolean, default: false }
  },
  data() {
    return { dialogVisible: this.value }
  },
  computed: {
    loggedIn() {
      return !!getToken()
    }
  },
  watch: {
    value(v) {
      if (v) this.open()
      else this.dialogVisible = false
    },
    dialogVisible(v) {
      this.$emit('input', v)
    }
  },
  mounted() {
    // 博客移动端：登录后尽早建连，避免只在打开聊天时才出现在对方列表
    if (this.loggedIn) {
      this.$nextTick(() => this.ensureRealtime())
    }
  },
  methods: {
    ensureRealtime() {
      const uid = this.$store.getters.userId
      if (uid) websocket.Init(uid)
    },
    isMobile() {
      return typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
    },
    open() {
      if (!getToken()) {
        this.$message && this.$message.warning('请先登录')
        this.$router.push('/user').catch(() => {})
        return
      }
      this.ensureRealtime()
      if (this.isMobile()) {
        this.dialogVisible = false
        this.$router.push({ name: 'RealtimeIM' }).catch(() => {})
        return
      }
      this.dialogVisible = true
    },
    openInPage() {
      this.ensureRealtime()
      this.dialogVisible = false
      const { href } = this.$router.resolve({ name: 'RealtimeIM' })
      window.open(href, '_blank', 'noopener,noreferrer')
    },
    onOpened() {
      this.ensureRealtime()
    }
  }
}
</script>

<style scoped>
.gp-rt-fab {
  position: fixed;
  right: 22px;
  bottom: 110px;
  z-index: 1040;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--theme-color, #5f7d80);
  color: #fff;
  box-shadow: 0 6px 18px rgba(52, 68, 73, 0.22);
  cursor: pointer;
  font-size: 20px;
}
.gp-rt-fab:hover { transform: translateY(-2px); }
.gp-rt-dialog__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 28px;
  width: 100%;
  box-sizing: border-box;
}
.gp-rt-popout {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--gp-surface-border, #dce3e5);
  background: transparent;
  color: var(--text-color-2, #566);
  font-size: 12px;
  border-radius: 6px;
  padding: 2px 8px;
  cursor: pointer;
  margin-right: 8px;
}
.gp-rt-popout:hover {
  color: var(--theme-color, #5f7d80);
  border-color: var(--theme-color, #5f7d80);
}
</style>

<style>
.gp-rt-dialog .el-dialog__body {
  padding: 8px 12px 12px;
  max-height: calc(88vh - 56px);
  overflow: hidden;
}
.gp-rt-dialog .el-dialog__header {
  padding: 12px 16px 8px;
}
</style>
