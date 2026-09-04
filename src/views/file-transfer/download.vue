<template>
  <!-- 临时文件下载页：Web Worker / Service Worker 加速；背景与上传页同一套 Token -->
  <div class="gp-transfer-dl">
    <!-- 与上传页同结构的深色 Hero；定稿 tone 后与上传页对齐 -->
    <header class="gp-transfer-dl__hero" data-hero-tone="original">
      <div class="gp-transfer-dl__hero-glow" aria-hidden="true"></div>
      <p class="gp-transfer-dl__eyebrow">临时文件 · 安全下载</p>
      <h1 class="gp-transfer-dl__title">文件已就绪</h1>
      <p class="gp-transfer-dl__lead">通过私密链接获取文件；到期、次数用尽或阅后即焚后链接将失效。</p>
    </header>

    <div class="gp-surface-card gp-transfer-dl__card" v-if="!errorMsg">
      <div class="gp-surface-card__header">
        <div class="category-section">
          <span class="category-title">文件下载</span>
        </div>
      </div>
      <div class="gp-surface-card__body" v-if="info">
        <h2 class="name">{{ info.originalName }}</h2>
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
        <router-link class="gp-btn" to="/tool/file-transfer">去上传页</router-link>
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
/* 下载页：深色 Hero 结构与上传页一致，配色通过 data-hero-tone 对齐 */
.gp-transfer-dl {
  max-width: 560px;
  margin: 0 auto;
  padding: 28px 16px 60px;
  color: var(--text-color-2);
  box-sizing: border-box;
}

.gp-transfer-dl__hero {
  --hero-from: #0f172b;
  --hero-to: #0b4f4a;
  --hero-glow-a: rgb(45, 212, 191);
  --hero-glow-b: rgb(56, 189, 248);
  --hero-eyebrow: rgba(255, 255, 255, 0.72);
  --hero-lead: rgba(255, 255, 255, 0.78);

  position: relative;
  margin-bottom: 16px;
  padding: 28px 22px;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: var(--gp-surface-radius, 14px);
  color: #fff;
  background-image: linear-gradient(to bottom right, var(--hero-from) 0%, var(--hero-to) 100%);
  box-shadow: 0 10px 28px rgba(15, 23, 43, 0.28);
}

.gp-transfer-dl__hero[data-hero-tone='original'] {
  --hero-from: #0f172b;
  --hero-to: #0b4f4a;
  --hero-glow-a: rgb(45, 212, 191);
  --hero-glow-b: rgb(56, 189, 248);
}

.gp-transfer-dl__hero[data-hero-tone='mist'] {
  --hero-from: #1a2426;
  --hero-to: #3d5c5f;
  --hero-glow-a: rgba(138, 160, 162, 0.95);
  --hero-glow-b: rgba(196, 184, 174, 0.75);
}

.gp-transfer-dl__hero[data-hero-tone='ocean'] {
  --hero-from: #0c1222;
  --hero-to: #0e3a5c;
  --hero-glow-a: rgb(56, 189, 248);
  --hero-glow-b: rgb(99, 102, 241);
}

.gp-transfer-dl__hero[data-hero-tone='sage'] {
  --hero-from: #1c1b1a;
  --hero-to: #2a3d36;
  --hero-glow-a: rgba(143, 168, 154, 0.9);
  --hero-glow-b: rgba(196, 154, 124, 0.55);
}

.gp-transfer-dl__hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, var(--hero-glow-a) 0%, transparent 40%),
    radial-gradient(circle at 80% 0%, var(--hero-glow-b) 0%, transparent 35%);
  opacity: 0.3;
}

.gp-transfer-dl__eyebrow,
.gp-transfer-dl__title,
.gp-transfer-dl__lead {
  position: relative;
  z-index: 1;
}

.gp-transfer-dl__eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--hero-eyebrow);
}

.gp-transfer-dl__title {
  margin: 0 0 8px;
  font-size: clamp(1.35rem, 2.8vw, 1.7rem);
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
}

.gp-transfer-dl__lead {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--hero-lead);
}

.gp-transfer-dl__card {
  background: var(--background-origin, var(--gp-surface-bg, #fff));
}

.gp-transfer-dl__card .name {
  margin: 0 0 8px;
  font-size: 1.2rem;
  font-weight: 600;
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
  color: var(--text-color);
}

.gp-input {
  width: 100%;
  box-sizing: border-box;
  height: 38px;
  padding: 0 12px;
  border-radius: var(--gp-border-radius-base, 8px);
  border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.12));
  background: var(--background, var(--background-origin, #f7f5f2));
  color: var(--text-color-2);
  font-size: 14px;
}

.gp-input:focus {
  outline: none;
  border-color: var(--theme-color, #5f7d80);
}

.progress {
  position: relative;
  height: 28px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: var(--theme-color-muted, rgba(95, 125, 128, 0.14));
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: var(--theme-color, #5f7d80);
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

.gp-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: var(--gp-border-radius-base, 8px);
  border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.12));
  background: var(--default-button-bg, var(--background-1, #efece7));
  color: var(--text-color-2);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.gp-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.gp-btn--primary {
  width: 100%;
  background: var(--theme-color, #5f7d80);
  border-color: var(--theme-color, #5f7d80);
  color: #fff;
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

@media (max-width: 640px) {
  .gp-transfer-dl__hero {
    padding: 22px 16px;
  }
}
</style>
