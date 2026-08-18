<template>
  <div class="im-page">
    <div class="im-page__bar">
      <button type="button" class="im-page__back" @click="goBack" aria-label="返回">
        <i class="el-icon-arrow-left"></i>
      </button>
      <h1>在线沟通</h1>
      <im-me-badge
        class="im-page__me"
        :compact="isMobile"
        profile-to="/user/center"
        login-to="/user"
      />
    </div>
    <div class="im-page__body">
      <realtime-chat
        mode="page"
        :visible="true"
        :initial-peer-id="peerId"
      />
    </div>
  </div>
</template>

<script>
import RealtimeChat from '@/components/RealtimeChat/index.vue'
import { MeBadge } from '@/components/im-profile'
import websocket from '@/utils/wesocket'
import { getToken } from '@/utils/auth'

const MQ = '(max-width: 720px)'

export default {
  name: 'RealtimeIMPage',
  components: { RealtimeChat, ImMeBadge: MeBadge },
  data() {
    return {
      isMobile: false,
      mq: null
    }
  },
  computed: {
    peerId() {
      return (this.$route.query && this.$route.query.peer) || ''
    }
  },
  created() {
    if (!getToken()) {
      this.$message && this.$message.warning('请先登录')
      this.$router.replace({ path: '/user', query: { redirect: '/im' } }).catch(() => {})
      return
    }
    const uid = this.$store.getters.userId
    if (uid) websocket.Init(uid)
  },
  mounted() {
    this.mq = window.matchMedia(MQ)
    this.isMobile = this.mq.matches
    this.onMq = () => { this.isMobile = this.mq.matches }
    if (this.mq.addEventListener) this.mq.addEventListener('change', this.onMq)
    else this.mq.addListener(this.onMq)
  },
  beforeDestroy() {
    if (!this.mq) return
    if (this.mq.removeEventListener) this.mq.removeEventListener('change', this.onMq)
    else this.mq.removeListener(this.onMq)
  },
  methods: {
    goBack() {
      if (window.history.length > 1) this.$router.back()
      else this.$router.push('/').catch(() => {})
    }
  }
}
</script>

<style scoped>
.im-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: var(--background-1, #f3f5f6);
  color: var(--text-color-2, #344449);
}
.im-page__bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--gp-surface-border, #e7ecee);
  background: var(--gp-surface-bg, #fff);
}
.im-page__bar h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.im-page__back {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  padding: 4px;
  flex-shrink: 0;
}
.im-page__me {
  flex-shrink: 0;
  margin-left: 4px;
}
.im-page__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (min-width: 721px) {
  .im-page__bar {
    padding: 12px 16px;
  }
  .im-page__bar h1 {
    font-size: 17px;
  }
}
</style>
