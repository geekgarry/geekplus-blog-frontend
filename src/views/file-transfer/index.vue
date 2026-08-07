<template>
  <!-- 临时文件中转：仿瞬匣式免登录上传 / 分享（自定义样式，不依赖 Element） -->
  <div class="gp-transfer">
    <header class="gp-transfer__hero">
      <div class="gp-transfer__hero-content"></div>
      <p class="gp-transfer__eyebrow">免费文件传输 · 无需登录</p>
      <h1 class="gp-transfer__title">文件安全抵达，按时悄然隐去。</h1>
      <p class="gp-transfer__lead">
        免注册上传并分享最多 5 个文件，单文件 200MB；支持密码、下载次数与阅后即焚，最长 24 小时自动删除。
      </p>
      <ul class="gp-transfer__bullets">
        <li>随机私密链接</li>
        <li>自动到期清理</li>
        <li>指纹 / IP 限流防滥用</li>
      </ul>
    </header>

    <section class="gp-surface-card gp-transfer__panel">
      <div class="gp-surface-card__header">
        <div class="category-section">
          <span class="category-title">免费创建临时分享链接</span>
          <span class="gp-transfer__hint">单文件 200MB · 一次最多 5 个</span>
        </div>
      </div>
      <div class="gp-surface-card__body">
        <div class="gp-transfer__drop" :class="{ 'is-drag': dragging }" @dragenter.prevent="dragging = true"
          @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="onDrop"
          @click="$refs.fileInput.click()">
          <input ref="fileInput" type="file" multiple hidden @change="onFileChange">
          <p class="gp-transfer__drop-title">选择或拖拽文件</p>
          <p class="gp-transfer__drop-sub">支持任意格式</p>
        </div>

        <ul v-if="fileList.length" class="gp-transfer__files">
          <li v-for="(f, i) in fileList" :key="i">
            <span class="name">{{ f.name }}</span>
            <span class="size">{{ formatSize(f.size) }}</span>
            <button type="button" class="gp-btn gp-btn--ghost" @click.stop="removeFile(i)">移除</button>
          </li>
        </ul>

        <div class="gp-transfer__settings">
          <h3>分享设置</h3>
          <label class="gp-field">
            <span>有效期</span>
            <div class="gp-chip-group">
              <button v-for="opt in expireOptions" :key="opt.v" type="button" class="gp-chip"
                :class="{ active: expireMinutes === opt.v }" @click="expireMinutes = opt.v">{{ opt.label }}</button>
            </div>
          </label>
          <label class="gp-field">
            <span>下载次数上限（0 为不限）</span>
            <input class="gp-input" type="number" min="0" max="999" v-model.number="maxDownloads">
          </label>
          <label class="gp-field">
            <span>访问密码（可选）</span>
            <input class="gp-input" type="password" v-model="password" autocomplete="new-password"
              placeholder="留空则直接访问">
          </label>
          <label class="gp-field gp-field--check">
            <input type="checkbox" v-model="burnAfterRead">
            <span>阅后即焚（首次下载后立即失效）</span>
          </label>
        </div>

        <div class="gp-transfer__actions">
          <button type="button" class="gp-btn gp-btn--primary" :disabled="uploading || !fileList.length"
            @click="startUpload">
            {{ uploading ? ('上传中 ' + progress + '%') : '开始安全上传' }}
          </button>
          <button type="button" class="gp-btn" :disabled="uploading" @click="resetAll">清空</button>
        </div>
        <div v-if="uploading" class="gp-transfer__progress">
          <div class="bar" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </section>

    <section v-if="results.length" class="gp-surface-card gp-transfer__panel">
      <div class="gp-surface-card__header">
        <div class="category-section">
          <span class="category-title">分享链接</span>
        </div>
      </div>
      <div class="gp-surface-card__body">
        <div v-for="(item, idx) in results" :key="item.shareCode" class="gp-transfer__result">
          <div class="meta">
            <strong>{{ item.originalName }}</strong>
            <span>{{ formatSize(item.fileSize) }} · 约 {{ item.expireMinutes }} 分钟后失效</span>
          </div>
          <div class="link-row">
            <input class="gp-input" readonly :value="fullLink(item)">
            <button type="button" class="gp-btn gp-btn--primary" @click="copyLink(item)">复制</button>
          </div>
          <div class="qr-row">
            <canvas :ref="'qr' + idx" class="qr-canvas" width="140" height="140"></canvas>
            <div class="qr-tip">
              <p>扫码下载</p>
              <p v-if="item.hasPassword">已设置访问密码</p>
              <button type="button" class="gp-btn gp-btn--ghost" @click="doRevoke(item)">撤销链接</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import { uploadTransferFiles, revokeTransfer } from '@/api/fileTransfer'

export default {
  name: 'FileTransfer',
  data() {
    return {
      dragging: false,
      fileList: [],
      expireMinutes: 60,
      expireOptions: [
        { v: 15, label: '15分钟' },
        { v: 60, label: '1小时' },
        { v: 360, label: '6小时' },
        { v: 1440, label: '24小时' }
      ],
      maxDownloads: 0,
      password: '',
      burnAfterRead: false,
      uploading: false,
      progress: 0,
      results: []
    }
  },
  methods: {
    formatSize(n) {
      if (!n && n !== 0) return ''
      if (n < 1024) return n + ' B'
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
      return (n / 1024 / 1024).toFixed(2) + ' MB'
    },
    onDrop(e) {
      this.dragging = false
      this.addFiles(e.dataTransfer && e.dataTransfer.files)
    },
    onFileChange(e) {
      this.addFiles(e.target.files)
      e.target.value = ''
    },
    addFiles(fileList) {
      if (!fileList || !fileList.length) return
      const next = this.fileList.slice()
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i]
        if (f.size > 200000000) {
          this.$message.error(f.name + ' 超过 200MB')
          continue
        }
        if (next.length >= 5) {
          this.$message.warning('一次最多 5 个文件')
          break
        }
        next.push(f)
      }
      this.fileList = next
    },
    removeFile(i) {
      this.fileList.splice(i, 1)
    },
    resetAll() {
      this.fileList = []
      this.password = ''
      this.maxDownloads = 0
      this.burnAfterRead = false
      this.progress = 0
      this.results = []
    },
    fullLink(item) {
      const origin = window.location.origin
      return origin + '/file-transfer/d/' + item.shareCode
    },
    async startUpload() {
      if (!this.fileList.length || this.uploading) return
      const fd = new FormData()
      this.fileList.forEach((f) => fd.append('files', f))
      fd.append('expireMinutes', String(this.expireMinutes))
      fd.append('maxDownloads', String(this.maxDownloads || 0))
      fd.append('burnAfterRead', this.burnAfterRead ? 'true' : 'false')
      if (this.password) fd.append('password', this.password)

      this.uploading = true
      this.progress = 0
      try {
        const res = await uploadTransferFiles(fd, (e) => {
          if (e.total) this.progress = Math.min(99, Math.round((e.loaded / e.total) * 100))
        })
        const data = res && res.data !== undefined ? res.data : res
        const items = (data && data.items) || []
        this.results = items
        this.progress = 100
        this.fileList = []
        this.$message.success('上传成功')
        this.$nextTick(() => this.renderQrs())
      } catch (e) {
        // request 已提示
      } finally {
        this.uploading = false
      }
    },
    async renderQrs() {
      for (let i = 0; i < this.results.length; i++) {
        const canvas = this.$refs['qr' + i]
        const el = Array.isArray(canvas) ? canvas[0] : canvas
        if (!el) continue
        try {
          await QRCode.toCanvas(el, this.fullLink(this.results[i]), {
            width: 140,
            margin: 1,
            color: { dark: '#1a1f2b', light: '#ffffff' }
          })
        } catch (err) {
          // ignore
        }
      }
    },
    async copyLink(item) {
      const text = this.fullLink(item)
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        this.$message.success('链接已复制')
      } catch (e) {
        this.$message.error('复制失败，请手动选择')
      }
    },
    async doRevoke(item) {
      try {
        await revokeTransfer(item.shareCode)
        this.results = this.results.filter((x) => x.shareCode !== item.shareCode)
        this.$message.success('已撤销')
      } catch (e) {
        // tip handled
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-transfer {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  color: var(--text-color-2);
}

.gp-transfer__hero {
  width: 100%;
  margin-bottom: 24px;
  --tw-gradient-position: to bottom right in oklab;
  --tw-gradient-from: #0f172b;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to: #0b4f4a;
  --tw-gradient-to-position: 100%;
  background-image: linear-gradient(var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 48px;
  position: relative;
  color: #fff;
}

.gp-transfer__hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  background-image: radial-gradient(circle at 20% 20%, rgb(45, 212, 191) 0%, transparent 40%), radial-gradient(circle at 80% 0%, rgb(56, 189, 248) 0%, transparent 35%);
  opacity: .3;
}

.gp-transfer__eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--muted-1-color, #999);
}

.gp-transfer__title {
  margin: 0 0 10px;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.25;
}

.gp-transfer__lead {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--muted-1-color, #666);
}

.gp-transfer__bullets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
}

.gp-transfer__bullets li::before {
  content: '•';
  margin-right: 6px;
  color: var(--theme-color, #6e8b8e);
}

.gp-transfer__panel {
  margin-bottom: 16px;
}

.gp-transfer__hint {
  font-size: 12px;
  color: var(--muted-1-color, #999);
}

.gp-transfer__drop {
  border: 1.5px dashed var(--gp-surface-border, rgba(15, 23, 42, 0.12));
  border-radius: var(--gp-surface-radius-sm, 10px);
  padding: 36px 16px;
  text-align: center;
  cursor: pointer;
  background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, 0.03));
  transition: border-color 0.15s ease, background 0.15s ease;
}

.gp-transfer__drop.is-drag,
.gp-transfer__drop:hover {
  border-color: var(--theme-color, #6e8b8e);
  background: var(--gp-menu-active-bg, rgba(11, 173, 182, 0.08));
}

.gp-transfer__drop-title {
  margin: 0 0 6px;
  font-weight: 600;
}

.gp-transfer__drop-sub {
  margin: 0;
  font-size: 13px;
  color: var(--muted-1-color, #999);
}

.gp-transfer__files {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}

.gp-transfer__files li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.06));
  font-size: 13px;
}

.gp-transfer__files .name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gp-transfer__files .size {
  color: var(--muted-1-color, #999);
}

.gp-transfer__settings {
  margin-top: 18px;
}

.gp-transfer__settings h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.gp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.gp-field--check {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.gp-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gp-chip {
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.1));
  background: transparent;
  color: inherit;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
}

.gp-chip.active {
  border-color: var(--theme-color, #6e8b8e);
  background: var(--gp-menu-active-bg, rgba(11, 173, 182, 0.12));
  color: var(--theme-color, #6e8b8e);
}

.gp-input {
  width: 100%;
  box-sizing: border-box;
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.12));
  background: var(--gp-surface-bg, var(--background-origin, #fff));
  color: var(--text-color-2);
  font-size: 14px;
}

.gp-input:focus {
  outline: none;
  border-color: var(--theme-color, #6e8b8e);
}

.gp-transfer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.gp-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.12));
  background: var(--gp-surface-bg, #fff);
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  white-space: pre;
}

.gp-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.gp-btn--primary {
  background: var(--theme-color, #6e8b8e);
  border-color: var(--theme-color, #6e8b8e);
  color: #fff;
}

.gp-btn--ghost {
  border: none;
  background: transparent;
  color: var(--theme-color, #6e8b8e);
  height: auto;
  padding: 4px 6px;
}

.gp-transfer__progress {
  margin-top: 12px;
  height: 6px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.15);
  overflow: hidden;
}

.gp-transfer__progress .bar {
  height: 100%;
  background: var(--theme-color, #6e8b8e);
  transition: width 0.15s ease;
}

.gp-transfer__result+.gp-transfer__result {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.06));
}

.gp-transfer__result .meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 13px;
}

.gp-transfer__result .meta span {
  color: var(--muted-1-color, #999);
}

.link-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.qr-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.qr-canvas {
  border-radius: 8px;
  background: #fff;
}

.qr-tip {
  font-size: 13px;
  color: var(--muted-1-color, #666);
  display: flex;
  /* line-height: 40px; */
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;
}

.qr-tip p {
  margin: 0 0 6px;
}
</style>
