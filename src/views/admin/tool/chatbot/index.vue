<template>
  <!--
    AiChatPopup：轻量可复用 AI 对话弹窗
    - 顶部切换 AI 源；底部输入 + 上传；思考开关先隐藏预留
    - Gemini 历史必须用 parts[{text}]，不能用 OpenAI 的 content 字段
  -->
  <div class="ai-chat-popup-root">
    <button
      v-if="showTrigger"
      type="button"
      class="ai-chat-fab"
      :title="title"
      @click="open"
    >
      <i class="el-icon-chat-dot-round"></i>
    </button>

    <el-dialog
      :visible.sync="dialogVisible"
      :title="null"
      :width="dialogWidth"
      :fullscreen="isMobile"
      :append-to-body="appendToBody"
      :close-on-click-modal="false"
      :destroy-on-close="false"
      custom-class="ai-chat-dialog"
      @closed="onClosed"
    >
      <div slot="title" class="ai-chat-header">
        <div class="ai-chat-header__left">
          <i class="el-icon-cpu"></i>
          <span class="ai-chat-title">{{ title }}</span>
        </div>
        <div class="ai-chat-header__right" @click.stop>
          <el-select
            v-model="selectedSourceId"
            size="mini"
            filterable
            placeholder="模型"
            class="ai-model-select"
            :loading="sourcesLoading"
            @change="onSourceChange"
          >
            <el-option
              v-for="item in sourceOptions"
              :key="item.id"
              :label="formatSourceLabel(item)"
              :value="item.id"
            >
              <span>{{ formatSourceLabel(item) }}</span>
              <span v-if="item.isDefault" class="ai-opt-default">默认</span>
            </el-option>
          </el-select>
          <el-tooltip content="清空对话" placement="bottom">
            <el-button type="text" icon="el-icon-delete" class="ai-icon-btn" @click="clearChat" />
          </el-tooltip>
        </div>
      </div>

      <div ref="msgBox" class="ai-chat-body" :style="{ height: bodyHeight }">
        <div v-if="!msgList.length" class="ai-chat-empty">
          <p>开始对话吧，可在顶部切换模型。</p>
        </div>
        <div
          v-for="(item, index) in msgList"
          :key="index"
          class="ai-msg"
          :class="item.role === 'user' ? 'is-user' : 'is-assistant'"
        >
          <img
            v-if="item.role !== 'user'"
            class="ai-avatar"
            src="@/assets/logo.png"
            alt="AI"
          >
          <div class="ai-bubble">
            <!-- 用户侧附件预览 -->
            <div v-if="item.fileName" class="ai-file-chip">
              <i class="el-icon-paperclip"></i>
              <span>{{ item.fileName }}</span>
            </div>
            <div
              v-if="item.role !== 'user'"
              class="ai-bubble-html"
              v-html="markdownToHtml(item.content)"
            ></div>
            <div v-else class="ai-bubble-text">{{ item.content }}</div>
          </div>
          <img
            v-if="item.role === 'user'"
            class="ai-avatar"
            :src="require('@/assets/mai.jpg')"
            alt="Me"
          >
        </div>
        <div v-if="loading" class="ai-msg is-assistant">
          <img class="ai-avatar" src="@/assets/logo.png" alt="AI">
          <div class="ai-bubble ai-bubble--loading">
            <i class="el-icon-loading"></i>
            {{ thinkingEnabled ? '深度思考中…' : '思考中…' }}
          </div>
        </div>
      </div>

      <div slot="footer" class="ai-chat-footer">
        <!-- 附件预览条 -->
        <div v-if="pendingFile" class="ai-attach-bar">
          <i class="el-icon-document"></i>
          <span class="ai-attach-name">{{ pendingFile.name }}</span>
          <el-button type="text" icon="el-icon-close" class="ai-icon-btn" @click="clearPendingFile" />
        </div>

        <div class="ai-composer">
          <div class="ai-composer__tools">
            <!-- 上传：预留多模态，当前随文本一并提交（有后端支持时生效） -->
            <el-tooltip content="上传文件" placement="top">
              <label class="ai-tool-btn" :class="{ disabled: loading }">
                <i class="el-icon-upload2"></i>
                <input
                  ref="fileInput"
                  type="file"
                  class="ai-file-input"
                  :disabled="loading"
                  @change="onFilePicked"
                >
              </label>
            </el-tooltip>
            <!-- 思考模式：默认隐藏，showThinkingToggle=true 时开启；逻辑先预留 -->
            <el-tooltip v-if="showThinkingToggle" content="开启思考" placement="top">
              <button
                type="button"
                class="ai-tool-btn"
                :class="{ active: thinkingEnabled }"
                :disabled="loading"
                @click="toggleThinking"
              >
                <i class="el-icon-orange"></i>
              </button>
            </el-tooltip>
          </div>
          <el-input
            ref="chatInput"
            v-model="inputChat"
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="输入消息，Ctrl+Enter 发送"
            resize="none"
            class="ai-composer__input"
            @keydown.native="onInputKeydown"
          />
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!canSend"
            class="ai-send-btn"
            @click="handleSend"
          >发送</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const marked = require('marked')
import { genericAiChat, geminiAIChat, geminiAIWithFile } from '@/api/chatbot/chatbot'
import { listAiSource } from '@/api/system/ai'

/**
 * 可复用 AI 弹出对话窗口（简洁版）
 * 用法：
 *   <ai-chat-popup v-model="visible" />
 *   <ai-chat-popup ref="aiChat" :show-trigger="true" />
 *   <ai-chat-popup :show-thinking-toggle="true" />  // 日后打开思考开关 UI
 */
export default {
  name: 'AiChatPopup',
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: 'AI 助手' },
    showTrigger: { type: Boolean, default: false },
    appendToBody: { type: Boolean, default: true },
    width: { type: String, default: '480px' },
    welcome: {
      type: String,
      default: '你好，我是 AI 助手，有什么可以帮你的？'
    },
    /**
     * 是否显示「思考」按钮。默认 false 隐藏；
     * 打开后仅切换 thinkingEnabled，真正请求逻辑见 requestChat 预留字段。
     */
    showThinkingToggle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: this.value,
      inputChat: '',
      msgList: [],
      loading: false,
      sourcesLoading: false,
      sourceList: [],
      selectedSourceId: null,
      selectedProvider: '',
      selectedModel: '',
      username: 'guest',
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      pendingFile: null,
      // 思考模式开关状态（UI 隐藏时仍可被外部改）
      thinkingEnabled: false
    }
  },
  computed: {
    isMobile() {
      return this.windowWidth < 768
    },
    dialogWidth() {
      return this.isMobile ? '100%' : this.width
    },
    bodyHeight() {
      return this.isMobile ? 'calc(100vh - 240px)' : '380px'
    },
    sourceOptions() {
      return (this.sourceList || []).filter((s) => s && s.id != null)
    },
    currentSource() {
      return this.sourceOptions.find((s) => s.id === this.selectedSourceId) || null
    },
    /** 是否 Gemini 系（决定历史消息格式） */
    isGeminiProvider() {
      const p = String(this.selectedProvider || '').toLowerCase()
      const m = String(this.selectedModel || '').toLowerCase()
      return !p || p.includes('gemini') || m.includes('gemini')
    },
    canSend() {
      return !!(this.inputChat.trim() || this.pendingFile) && !this.loading
    }
  },
  watch: {
    value(val) {
      this.dialogVisible = val
      if (val) {
        this.ensureSources()
        this.$nextTick(() => this.focusInput())
      }
    },
    dialogVisible(val) {
      this.$emit('input', val)
      this.$emit('visible-change', val)
      if (val) {
        this.ensureSources()
        this.$nextTick(() => {
          this.scrollToBottom()
          this.focusInput()
        })
      }
    }
  },
  created() {
    if (this.$store && this.$store.state && this.$store.state.user && this.$store.state.user.username) {
      this.username = this.$store.state.user.username
    }
    if (this.welcome) {
      this.msgList.push({ role: 'assistant', content: this.welcome })
    }
  },
  mounted() {
    this._onResize = () => {
      this.windowWidth = window.innerWidth
    }
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy() {
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize)
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
    },
    onClosed() {
      this.$emit('closed')
    },
    focusInput() {
      const input = this.$refs.chatInput
      if (input && input.focus) input.focus()
    },
    formatSourceLabel(item) {
      const name = item.name || item.provider || 'AI'
      const model = item.model ? ` · ${item.model}` : ''
      return `${name}${model}`
    },
    ensureSources() {
      if (this.sourceList.length || this.sourcesLoading) return
      this.loadSources()
    },
    loadSources() {
      this.sourcesLoading = true
      listAiSource()
        .then((res) => {
          const list = (res && res.data) || res || []
          this.sourceList = Array.isArray(list) ? list : []
          const def = this.sourceList.find((s) => s.isDefault) || this.sourceList[0]
          if (def) {
            this.selectedSourceId = def.id
            this.selectedProvider = def.provider || ''
            this.selectedModel = def.model || ''
          }
        })
        .catch(() => {
          this.sourceList = []
        })
        .finally(() => {
          this.sourcesLoading = false
        })
    },
    onSourceChange(id) {
      const src = this.sourceOptions.find((s) => s.id === id)
      if (src) {
        this.selectedProvider = src.provider || ''
        this.selectedModel = src.model || ''
      }
      this.$emit('source-change', src || null)
    },
    clearChat() {
      this.msgList = this.welcome
        ? [{ role: 'assistant', content: this.welcome }]
        : []
      this.clearPendingFile()
    },
    toggleThinking() {
      // 预留：打开 showThinkingToggle 后可切换；请求侧见 thinkingEnabled
      this.thinkingEnabled = !this.thinkingEnabled
    },
    onFilePicked(e) {
      const file = e && e.target && e.target.files && e.target.files[0]
      if (!file) return
      // 简单体积限制，避免误传超大文件
      if (file.size > 20 * 1024 * 1024) {
        this.$message && this.$message.warning('文件请小于 20MB')
        e.target.value = ''
        return
      }
      this.pendingFile = file
      e.target.value = ''
    },
    clearPendingFile() {
      this.pendingFile = null
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
    },
    onInputKeydown(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.handleSend()
      }
    },
    async handleSend() {
      const text = (this.inputChat || '').trim()
      if ((!text && !this.pendingFile) || this.loading) return
      const file = this.pendingFile
      this.inputChat = ''
      this.clearPendingFile()
      this.msgList.push({
        role: 'user',
        content: text || (file ? `[附件] ${file.name}` : ''),
        fileName: file ? file.name : ''
      })
      this.loading = true
      await this.$nextTick()
      this.scrollToBottom()
      try {
        const reply = await this.requestChat(text, file)
        this.msgList.push({ role: 'assistant', content: reply || '（无回复内容）' })
      } catch (err) {
        const msg = this.normalizeError(err)
        this.msgList.push({ role: 'assistant', content: msg })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    normalizeError(err) {
      if (!err) return '请求失败，请稍后重试'
      const raw = err.message || err.msg || (typeof err === 'string' ? err : '')
      // Gemini 常见：把 OpenAI 的 content 误塞进 contents[]
      if (/Unknown name\s*\\"content\\"/.test(raw) || /Unknown name "content"/.test(raw)) {
        return '对话格式错误已修复，请重试发送。若仍失败请清空对话后再试。'
      }
      return raw || '请求失败，请稍后重试'
    },
    /**
     * 构造 Gemini generateContent 历史：
     * 必须是 { role: 'user'|'model', parts: [{ text }] }
     * 绝不能用 OpenAI 的 { role, content } —— 否则报 Unknown name "content"
     */
    buildGeminiHistory() {
      const list = []
      const raw = (this.msgList || []).filter((m) => m && m.content)
      // 跳过开头欢迎语（尚无用户消息时的 assistant）
      let started = false
      for (let i = 0; i < raw.length; i++) {
        const m = raw[i]
        if (m.role === 'user') started = true
        if (!started) continue
        // 当前刚 push 的最后一条 user 由本次请求的 chatMsg 承载，历史里去掉避免重复
        if (i === raw.length - 1 && m.role === 'user') continue
        list.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.content) }]
        })
      }
      return list.slice(-12)
    },
    /** OpenAI / 通用协议历史 */
    buildOpenAIHistory() {
      const list = []
      const raw = (this.msgList || []).filter((m) => m && m.content)
      let started = false
      for (let i = 0; i < raw.length; i++) {
        const m = raw[i]
        if (m.role === 'user') started = true
        if (!started) continue
        if (i === raw.length - 1 && m.role === 'user') continue
        list.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content)
        })
      }
      return list.slice(-12)
    },
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    async requestChat(text, file) {
      const prompt = text || (file ? `请结合附件「${file.name}」进行分析说明` : '')
      // 有文件时优先走带文件接口
      if (file) {
        try {
          const form = new FormData()
          form.append('file', file)
          form.append('chatMsg', prompt)
          form.append('username', this.username)
          if (this.selectedSourceId) form.append('sourceId', this.selectedSourceId)
          // thinkingEnabled 预留：后端就绪后传 enableThinking
          if (this.thinkingEnabled) form.append('enableThinking', '1')
          const res = await geminiAIWithFile(form)
          return this.extractReply(res)
        } catch (e) {
          // 文件接口不可用时回退文本（附文件名提示）
          console.warn('[AiChatPopup] file chat fallback', e)
        }
      }

      if (this.isGeminiProvider) {
        // Gemini：historyChatData 必须用 parts，不能用 content
        const res = await geminiAIChat({
          username: this.username,
          chatMsg: prompt,
          historyChatData: this.buildGeminiHistory(),
          // 预留思考模式字段，后端未接时忽略
          enableThinking: this.thinkingEnabled || undefined,
          model: this.selectedModel || undefined,
          sourceId: this.selectedSourceId || undefined
        })
        return this.extractReply(res)
      }

      // 非 Gemini：走通用聊天，历史用 content
      try {
        const res = await genericAiChat({
          prompt,
          chatMsg: prompt,
          username: this.username,
          sourceId: this.selectedSourceId || undefined,
          provider: this.selectedProvider || undefined,
          model: this.selectedModel || undefined,
          history: this.buildOpenAIHistory(),
          historyChatData: this.buildOpenAIHistory(),
          enableThinking: this.thinkingEnabled || undefined
        })
        return this.extractReply(res)
      } catch (e) {
        // 兜底仍用 Gemini 格式，避免再次把 content 塞进 contents[]
        const res = await geminiAIChat({
          username: this.username,
          chatMsg: prompt,
          historyChatData: this.buildGeminiHistory()
        })
        return this.extractReply(res)
      }
    },
    extractReply(res) {
      if (!res) return ''
      if (typeof res === 'string') return res
      const data = res.data != null ? res.data : res
      if (typeof data === 'string') return data
      if (data.msg_data != null) return String(data.msg_data).trim()
      if (data.content != null) return String(data.content).trim()
      if (data.reply != null) return String(data.reply).trim()
      if (data.text != null) return String(data.text).trim()
      if (res.msg && res.code === 200) return String(res.msg)
      if (res.code === 500 || res.code === 401) {
        throw new Error(res.msg || 'AI 服务异常')
      }
      try {
        return JSON.stringify(data)
      } catch (e) {
        return ''
      }
    },
    scrollToBottom() {
      const box = this.$refs.msgBox
      if (box) box.scrollTop = box.scrollHeight
    },
    markdownToHtml(text) {
      if (!text) return ''
      try {
        return marked.parse ? marked.parse(String(text)) : marked(String(text))
      } catch (e) {
        return String(text).replace(/\n/g, '<br/>')
      }
    }
  }
}
</script>

<style lang="scss">
.ai-chat-dialog {
  border-radius: 14px;
  overflow: hidden;

  .el-dialog__header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid #eef0f3;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 10px 12px 12px;
    border-top: 1px solid #eef0f3;
  }
}

.ai-chat-fab {
  position: fixed;
  right: 20px;
  bottom: 28px;
  z-index: 2900;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: #1f6feb;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(31, 111, 235, 0.32);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(31, 111, 235, 0.4);
  }
}
</style>

<style lang="scss" scoped>
.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 24px;
}

.ai-chat-header__left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: #1f2329;
  font-weight: 600;
}

.ai-chat-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-chat-header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ai-model-select {
  width: 168px;
}

.ai-opt-default {
  float: right;
  color: #909399;
  font-size: 12px;
}

.ai-icon-btn {
  padding: 4px 6px;
  color: #606266;
}

.ai-chat-body {
  overflow-y: auto;
  padding: 14px 16px;
  background: linear-gradient(180deg, #f6f7f9 0%, #fff 55%);
}

.ai-chat-empty {
  text-align: center;
  color: #8a919f;
  padding: 48px 12px;
  font-size: 13px;
}

.ai-msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;

  &.is-user {
    justify-content: flex-end;
  }

  &.is-assistant {
    justify-content: flex-start;
  }
}

.ai-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.ai-bubble {
  max-width: min(78%, 400px);
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}

.is-assistant .ai-bubble {
  background: #fff;
  color: #1f2329;
  border: 1px solid #e8eaed;
  border-top-left-radius: 4px;
}

.is-user .ai-bubble {
  background: #1f6feb;
  color: #fff;
  border-top-right-radius: 4px;
}

.ai-bubble--loading {
  color: #646a73;
  background: #fff;
  border: 1px solid #e8eaed;
}

.ai-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  font-size: 12px;
  opacity: 0.9;
}

.ai-bubble-html {
  ::v-deep p {
    margin: 0 0 0.5em;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ::v-deep pre {
    overflow-x: auto;
    padding: 8px;
    border-radius: 6px;
    background: #f3f4f6;
  }

  ::v-deep code {
    font-size: 12px;
  }
}

.ai-bubble-text {
  white-space: pre-wrap;
}

.ai-chat-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-attach-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  background: #f3f5f8;
  font-size: 12px;
  color: #4a5568;
}

.ai-attach-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.ai-composer__tools {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.ai-tool-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  color: #606266;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(.disabled) {
    border-color: #1f6feb;
    color: #1f6feb;
  }

  &.active {
    background: #eaf2ff;
    border-color: #1f6feb;
    color: #1f6feb;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ai-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.ai-composer__input {
  flex: 1;
  min-width: 0;
}

.ai-send-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 16px;
}

@media screen and (max-width: 767px) {
  .ai-model-select {
    width: 132px;
  }

  .ai-chat-header {
    padding-right: 20px;
  }

  .ai-bubble {
    max-width: 82%;
  }
}
</style>
