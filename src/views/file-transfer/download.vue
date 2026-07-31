<template>
  <!-- 临时文件下载页：Web Worker / Service Worker 加速 -->
  <div class="gp-transfer-dl">
    <div class="gp-surface-card gp-transfer-dl__card" v-if="!errorMsg">
      <div class="gp-surface-card__header">
        <div class="category-section">
          <span class="category-title">文件下载</span>
        </div>
      </div>
      <div class="gp-surface-card__body" v-if="info">
        <h1 class="name">{{ info.originalName }}</h1>
        <p class="meta">{{ formatSize(info.fileSize) }}
          <template v-if="info.expireAt"> · 失效于 {{ formatTime(info.expireAt) }}</template>
          <template v-if="info.maxDownloads > 0"> · 剩余 {{ info.remainingDownloads }} 次</template>
        </p>
        <label v-if="info.hasPassword" class="gp-field">
          <span>访问密码</span>
          <input class="gp-input" type="password" v-model="password" placeholder="请输入分享密码" @keyup.enter="doDownload">
        </label>
        <div class="progress" v-if="loading && progressPercent >= 0">
          <div class="progress__bar" :style="{ width: progressPercent + '%' }"></div>
          <span class="progress__text">{{ progressLabel }}</span>
        </div>
        <button type="button" class="gp-btn gp-btn--primary" :disabled="loading" @click="doDownload">
          {{ loading ? (progressPercent >= 0 ? '下载中…' : '准备中…') : '下载文件' }}
        </button>
        <p v-if="info.burnAfterRead" class="warn">阅后即焚：下载后链接将立即失效</p>
        <p class="hint">使用后台 Worker 下载，不阻塞页面操作</p>
      </div>
      <div class="gp-surface-card__body" v-else-if="loadingInfo">加载中…</div>
    </div>
    <div class="gp-surface-card gp-transfer-dl__card" v-else>
      <div class="gp-surface-card__body">
        <p class="error">{{ errorMsg }}</p>
        <router-link class="gp-btn" to="/file-transfer">去上传页</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getTransferInfo } from '@/api/fileTransfer'
import { transferIdentityHeaders } from '@/utils/deviceIdentity'
import { getToken } from '@/utils/auth'
import { smartDownload } from '@/utils/downloadViaWorker'

export default {
  name: 'FileTransferDownload',
  data() {
    return {
      info: null,
      password: '',
      loading: false,
      loadingInfo: true,
      errorMsg: '',
      progressPercent: -1,
      progressLabel: ''
    }
  },
  computed: {
    shareCode() {
      return this.$route.params.code
    },
    downloadUrl() {
      const base = process.env.VUE_APP_BASE_API || ''
      return base + '/geekplusapp/transfer/download/' + encodeURIComponent(this.shareCode)
    }
  },
  created() {
    this.loadInfo()
  },
  methods: {
    formatSize(n) {
      if (!n && n !== 0) return ''
      if (n < 1024) return n + ' B'
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
      return (n / 1024 / 1024).toFixed(2) + ' MB'
    },
    formatTime(ts) {
      try {
        return new Date(ts).toLocaleString()
      } catch (e) {
        return ''
      }
    },
    async loadInfo() {
      this.loadingInfo = true
      this.errorMsg = ''
      try {
        const res = await getTransferInfo(this.shareCode)
        this.info = res && res.data !== undefined ? res.data : res
      } catch (e) {
        this.errorMsg = (e && e.message) || '链接无效或已过期'
      } finally {
        this.loadingInfo = false
      }
    },
    buildHeaders() {
      const headers = { ...transferIdentityHeaders() }
      if (this.password) {
        headers['X-Transfer-Password'] = this.password
      }
      const token = getToken()
      if (token) headers['Plus-Token'] = token
      return headers
    },
    async doDownload() {
      if (!this.info) return
      if (this.info.hasPassword && !this.password) {
        this.$message.warning('请输入访问密码')
        return
      }
      this.loading = true
      this.progressPercent = 0
      this.progressLabel = '0%'
      try {
        const filename = this.info.originalName || 'download.bin'
        const fileSize = Number(this.info.fileSize) || 0
        await smartDownload({
          url: this.downloadUrl,
          filename,
          fileSize,
          method: 'POST',
          headers: this.buildHeaders(),
          body: this.password ? { password: this.password } : {},
          password: this.password || undefined,
          onProgress: (msg) => {
            if (msg.percent >= 0) {
              this.progressPercent = msg.percent
              this.progressLabel = msg.percent + '%'
            } else if (msg.loaded) {
              this.progressPercent = Math.min(99, this.progressPercent < 0 ? 5 : this.progressPercent + 1)
              this.progressLabel = this.formatSize(msg.loaded)
            }
          }
        })
        this.$message.success('开始下载')
        if (this.info.burnAfterRead) {
          this.errorMsg = '阅后即焚：文件已下载，链接已失效'
          this.info = null
        } else {
          this.loadInfo()
        }
      } catch (e) {
        this.$message.error((e && e.message) || '下载失败')
      } finally {
        this.loading = false
        this.progressPercent = -1
        this.progressLabel = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-transfer-dl {
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 16px 60px;
}

.gp-transfer-dl__card .name {
  margin: 0 0 8px;
  font-size: 1.25rem;
  word-break: break-all;
  color: var(--text-color-2);
}

.meta {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--muted-1-color, #8a8580);
}

.gp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
}

.progress {
  position: relative;
  height: 28px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: var(--theme-color-muted, rgba(110, 139, 142, 0.14));
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: var(--theme-color, #6e8b8e);
  transition: width 0.2s ease;
}

.progress__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-color-2);
}

.gp-btn--primary {
  width: 100%;
}

.warn {
  margin-top: 12px;
  font-size: 12px;
  color: var(--red, #b56a6a);
}

.hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted-1-color, #8a8580);
}

.error {
  margin: 0 0 16px;
  color: var(--red, #b56a6a);
}
</style>
