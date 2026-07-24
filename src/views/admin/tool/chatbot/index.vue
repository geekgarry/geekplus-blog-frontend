<template>
  <div class="ai-chat-popup-root">
    <!-- 可选悬浮入口，任意页挂载后可一键打开 -->
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
            placeholder="选择模型"
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
          <p>开始对话吧，可在顶部切换 AI 模型。</p>
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
            src="@/assets/mai.png"
            alt="Me"
          >
        </div>
        <div v-if="loading" class="ai-msg is-assistant">
          <img class="ai-avatar" src="@/assets/logo.png" alt="AI">
          <div class="ai-bubble ai-bubble--loading">
            <i class="el-icon-loading"></i> 思考中…
          </div>
        </div>
      </div>

      <div slot="footer" class="ai-chat-footer">
        <el-input
          ref="chatInput"
          v-model="inputChat"
          type="textarea"
          :rows="2"
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="输入消息，Ctrl+Enter 发送"
          resize="none"
          @keydown.native="onInputKeydown"
        />
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!inputChat.trim()"
          class="ai-send-btn"
          @click="handleSend"
        >发送</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const marked = require('marked')
import { genericAiChat, geminiAIChat } from '@/api/chatbot/chatbot'
import { listAiSource } from '@/api/system/ai'

/**
 * 可复用 AI 弹出对话窗口
 * 用法：
 *   <ai-chat-popup v-model="visible" />
 *   <ai-chat-popup ref="aiChat" :show-trigger="true" />
 *   this.$refs.aiChat.open()
 */
export default {
  name: 'AiChatPopup',
  props: {
    /** v-model 控制显隐 */
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'AI 助手'
    },
    /** 是否显示右下角悬浮按钮 */
    showTrigger: {
      type: Boolean,
      default: false
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '520px'
    },
    /** 初始欢迎语 */
    welcome: {
      type: String,
      default: '你好，我是 AI 助手，有什么可以帮你的？'
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
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200
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
      return this.isMobile ? 'calc(100vh - 220px)' : '420px'
    },
    sourceOptions() {
      return (this.sourceList || []).filter((s) => s && s.id != null)
    },
    currentSource() {
      return this.sourceOptions.find((s) => s.id === this.selectedSourceId) || null
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
    },
    onInputKeydown(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.handleSend()
      }
    },
    async handleSend() {
      const text = (this.inputChat || '').trim()
      if (!text || this.loading) return
      this.inputChat = ''
      this.msgList.push({ role: 'user', content: text })
      this.loading = true
      await this.$nextTick()
      this.scrollToBottom()
      try {
        const reply = await this.requestChat(text)
        this.msgList.push({ role: 'assistant', content: reply || '（无回复内容）' })
      } catch (err) {
        const msg = (err && (err.message || err.msg)) || '请求失败，请稍后重试'
        this.msgList.push({ role: 'assistant', content: msg })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    buildHistory() {
      return this.msgList
        .filter((m) => m && m.content && m.role !== 'system')
        .slice(-12)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
    },
    async requestChat(text) {
      const payload = {
        prompt: text,
        chatMsg: text,
        username: this.username,
        sourceId: this.selectedSourceId || undefined,
        provider: this.selectedProvider || undefined,
        model: this.selectedModel || undefined,
        history: this.buildHistory(),
        historyChatData: this.buildHistory()
      }
      try {
        const res = await genericAiChat(payload)
        return this.extractReply(res)
      } catch (e) {
        // 兼容旧接口兜底
        const res = await geminiAIChat({
          username: this.username,
          chatMsg: text,
          historyChatData: this.buildHistory()
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
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid #eef0f3;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 10px 12px 14px;
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
  background: #2f6fed;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(47, 111, 237, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(47, 111, 237, 0.42);
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
  width: 180px;
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
  background: linear-gradient(180deg, #f7f8fa 0%, #fff 48%);
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.ai-bubble {
  max-width: min(78%, 420px);
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
  background: #2f6fed;
  color: #fff;
  border-top-right-radius: 4px;
}

.ai-bubble--loading {
  color: #646a73;
  background: #fff;
  border: 1px solid #e8eaed;
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
  align-items: flex-end;
  gap: 8px;
}

.ai-send-btn {
  flex-shrink: 0;
  height: 40px;
}

@media screen and (max-width: 767px) {
  .ai-model-select {
    width: 140px;
  }

  .ai-chat-header {
    padding-right: 20px;
  }

  .ai-bubble {
    max-width: 82%;
  }
}
</style>
