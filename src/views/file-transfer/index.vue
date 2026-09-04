<template>
  <!-- 临时文件中转：仿瞬匣式免登录上传 / 分享（自定义样式，不依赖 Element） -->
  <div class="gp-transfer">
    <!-- 深色电影感 Hero：结构保持原样；data-hero-tone 切换配色混合方案 -->
    <header class="gp-transfer__hero" :data-hero-tone="heroTone">
      <div class="gp-transfer__hero-content" aria-hidden="true"></div>
      <div class="gp-transfer__tone-picker" role="group" aria-label="Hero 配色方案">
        <button
          v-for="tone in heroToneOptions"
          :key="tone.id"
          type="button"
          class="gp-transfer__tone-chip"
          :class="{ active: heroTone === tone.id }"
          :title="tone.desc"
          @click="heroTone = tone.id"
        >{{ tone.label }}</button>
      </div>
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
      results: [],
      // Hero 深色渐变配色：点选对比；定稿后可删 picker，只留 heroTone 常量
      heroTone: 'original',
      heroToneOptions: [
        { id: 'original', label: '旧石板', desc: '石板蓝 → 深青绿 + 青绿/天蓝光斑' },
        { id: 'mist', label: '雾青', desc: '墨青 → 站点雾霾青绿，贴近主题色' },
        { id: 'ocean', label: '墨海', desc: '夜墨 → 深海蓝 + 青蓝光斑' },
        { id: 'sage', label: '石墨鼠尾', desc: '暖石墨 → 鼠尾草绿 + 柔琥珀光' }
      ]
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
  box-sizing: border-box;
}

/*
 * 深色电影感 Hero（结构保持原样）：底色双点渐变 + 双径向光斑。
 * 通过 data-hero-tone 切换配色混合；默认 A original。
 */
.gp-transfer__hero {
  --hero-from: #0f172b;
  --hero-to: #0b4f4a;
  --hero-glow-a: rgb(45, 212, 191);
  --hero-glow-b: rgb(56, 189, 248);
  --hero-eyebrow: rgba(255, 255, 255, 0.72);
  --hero-lead: rgba(255, 255, 255, 0.78);
  --hero-bullet: rgba(255, 255, 255, 0.88);
  --hero-dot: #5eead4;

  position: relative;
  width: 100%;
  margin-bottom: 24px;
  padding: 48px;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: var(--gp-surface-radius, 14px);
  color: #fff;
  background-image: linear-gradient(to bottom right, var(--hero-from) 0%, var(--hero-to) 100%);
  box-shadow: 0 10px 28px rgba(15, 23, 43, 0.28);
}

/* A 原版：石板蓝 → 深青绿 */
.gp-transfer__hero[data-hero-tone='original'] {
  --hero-from: #0f172b;
  --hero-to: #0b4f4a;
  --hero-glow-a: rgb(45, 212, 191);
  --hero-glow-b: rgb(56, 189, 248);
  --hero-dot: #5eead4;
}

/* B 雾青：贴近站点 --theme-color #5f7d80 */
.gp-transfer__hero[data-hero-tone='mist'] {
  --hero-from: #1a2426;
  --hero-to: #3d5c5f;
  --hero-glow-a: rgba(138, 160, 162, 0.95);
  --hero-glow-b: rgba(196, 184, 174, 0.75);
  --hero-dot: #a8bdbf;
}

/* C 墨海：夜墨 → 深海蓝 */
.gp-transfer__hero[data-hero-tone='ocean'] {
  --hero-from: #0c1222;
  --hero-to: #0e3a5c;
  --hero-glow-a: rgb(56, 189, 248);
  --hero-glow-b: rgb(99, 102, 241);
  --hero-dot: #7dd3fc;
}

/* D 石墨鼠尾：暖石墨 → 鼠尾草 */
.gp-transfer__hero[data-hero-tone='sage'] {
  --hero-from: #1c1b1a;
  --hero-to: #2a3d36;
  --hero-glow-a: rgba(143, 168, 154, 0.9);
  --hero-glow-b: rgba(196, 154, 124, 0.55);
  --hero-dot: #b7c9bc;
}

.gp-transfer__hero-content {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 20% 20%, var(--hero-glow-a) 0%, transparent 40%),
    radial-gradient(circle at 80% 0%, var(--hero-glow-b) 0%, transparent 35%);
  opacity: 0.3;
}

.gp-transfer__tone-picker {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  max-width: 56%;
}

.gp-transfer__tone-chip {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.88);
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.gp-transfer__tone-chip.active {
  border-color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.gp-transfer__eyebrow,
.gp-transfer__title,
.gp-transfer__lead,
.gp-transfer__bullets {
  position: relative;
  z-index: 1;
}

.gp-transfer__eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--hero-eyebrow);
}

.gp-transfer__title {
  margin: 0 0 10px;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.25;
  color: #fff;
}

.gp-transfer__lead {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--hero-lead);
}

.gp-transfer__bullets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--hero-bullet);
}

.gp-transfer__bullets li::before {
  content: '•';
  margin-right: 6px;
  color: var(--hero-dot);
}

.gp-transfer__panel {
  margin-bottom: 16px;
  background: var(--background-origin, var(--gp-surface-bg, #fff));
}

.gp-transfer__hint {
  font-size: 12px;
  color: var(--muted-1-color, #8a8580);
}

.gp-transfer__drop {
  border: 1.5px dashed var(--gp-surface-border, rgba(44, 42, 40, 0.12));
  border-radius: var(--gp-surface-radius-sm, 10px);
  padding: 36px 16px;
  text-align: center;
  cursor: pointer;
  background: var(--interactive-bg-secondary-hover, rgba(44, 42, 40, 0.06));
  transition: border-color 0.15s ease, background 0.15s ease;
}

.gp-transfer__drop.is-drag,
.gp-transfer__drop:hover {
  border-color: var(--theme-color, #5f7d80);
  background: var(--gp-menu-active-bg, var(--theme-color-muted));
}

.gp-transfer__drop-title {
  margin: 0 0 6px;
  font-weight: 600;
  color: var(--text-color-2);
}

.gp-transfer__drop-sub {
  margin: 0;
  font-size: 13px;
  color: var(--muted-1-color, #8a8580);
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
  border-bottom: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
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
  color: var(--muted-1-color, #8a8580);
}

.gp-transfer__settings {
  margin-top: 18px;
}

.gp-transfer__settings h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--text-color-2);
}

.gp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-color);
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
  border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.1));
  background: var(--background-2, transparent);
  color: inherit;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.gp-chip.active {
  border-color: var(--theme-color, #5f7d80);
  background: var(--gp-menu-active-bg, var(--theme-color-muted));
  color: var(--gp-menu-active-color, var(--theme-color));
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

.gp-transfer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
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
  white-space: nowrap;
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
  background: var(--theme-color, #5f7d80);
  border-color: var(--theme-color, #5f7d80);
  color: #fff;
}

.gp-btn--ghost {
  border: none;
  background: transparent;
  color: var(--theme-color, #5f7d80);
  height: auto;
  padding: 4px 6px;
}

.gp-transfer__progress {
  margin-top: 12px;
  height: 6px;
  border-radius: 6px;
  background: var(--theme-color-muted, rgba(95, 125, 128, 0.14));
  overflow: hidden;
}

.gp-transfer__progress .bar {
  height: 100%;
  background: var(--theme-color, #5f7d80);
  transition: width 0.15s ease;
}

.gp-transfer__result + .gp-transfer__result {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
}

.gp-transfer__result .meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 13px;
}

.gp-transfer__result .meta span {
  color: var(--muted-1-color, #8a8580);
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
  border-radius: var(--gp-border-radius-base, 8px);
  background: #fff;
  border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
}

.qr-tip {
  font-size: 13px;
  color: var(--muted-1-color, #8a8580);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;
}

.qr-tip p {
  margin: 0 0 6px;
}

@media (max-width: 640px) {
  .gp-transfer__hero {
    padding: 36px 18px 28px;
  }

  .gp-transfer__tone-picker {
    position: static;
    max-width: none;
    justify-content: flex-start;
    margin-bottom: 12px;
  }
}
</style>
