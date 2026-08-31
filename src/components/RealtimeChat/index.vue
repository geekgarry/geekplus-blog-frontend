<template>
  <div
    class="rt-chat"
    :class="{
      'is-embedded': mode === 'embedded',
      'is-page': mode === 'page',
      'is-mobile': isMobile,
      'show-thread': isMobile && mobileView === 'thread'
    }"
  >
    <div class="rt-chat__side" v-show="!isMobile || mobileView === 'list'">
      <div class="rt-chat__side-hd">
        <span>消息</span>
        <div class="rt-chat__side-ops">
          <span class="rt-conn" :title="connStatus">{{ connShort }}</span>
          <el-button type="text" icon="el-icon-refresh" :loading="loadingUsers" @click="loadUsers" />
          <el-button type="text" icon="el-icon-close" @click="closeChat" />
        </div>
      </div>
      <ul class="rt-chat__users">
        <li
          v-for="u in displayUsers"
          :key="u.clientId"
          :class="{ active: peerId === uidOf(u) }"
          @click="selectPeer(u)"
        >
          <img class="avatar" :src="avatarOf(u)" alt="" @error="onAvatarErr" />
          <div class="info">
            <div class="row">
              <span class="name">{{ displayName(u) }}</span>
              <span v-if="unread[uidOf(u)]" class="badge">{{ unread[uidOf(u)] > 99 ? '99+' : unread[uidOf(u)] }}</span>
            </div>
            <span class="preview">{{ lastPreview[uidOf(u)] || '在线' }}</span>
          </div>
        </li>
        <li v-if="!displayUsers.length" class="empty">暂无其他在线用户</li>
      </ul>
    </div>

    <section class="rt-chat__main" v-show="!isMobile || mobileView === 'thread'">
      <header class="rt-chat__hd">
        <button v-if="isMobile" type="button" class="back" @click="backToList" aria-label="返回">
          <i class="el-icon-arrow-left"></i>
        </button>
        <div class="hd-peer" v-if="peer">
          <img class="avatar sm" :src="avatarOf(peer)" alt="" @error="onAvatarErr" />
          <strong>{{ displayName(peer) }}</strong>
        </div>
        <strong v-else class="hd-placeholder">选择联系人开始聊天</strong>
        <div class="rt-chat__actions" v-if="peer">
          <el-button size="mini" plain :disabled="callBusy" @click="inviteCall('audio')">语音</el-button>
          <el-button size="mini" type="primary" plain :disabled="callBusy" @click="inviteCall('video')">视频</el-button>
          <el-button size="mini" type="danger" plain v-if="callBusy" @click="hangupClick">挂断</el-button>
        </div>
      </header>

      <div class="rt-chat__msgs" ref="msgBox">
        <div v-for="m in messages" :key="msgKey(m)" class="msg" :class="{ mine: isMine(m), pending: m.pending }">
          <img v-if="!isMine(m)" class="avatar sm" :src="msgAvatar(m)" alt="" @error="onAvatarErr" />
          <div class="col" v-viewer>
            <div v-if="!isMine(m)" class="nick">{{ m.fromName || displayName(peer) }}</div>
            <div class="bubble" :class="{ media: isMedia(m) }">
              <template v-if="msgKind(m) === 'image'">
                <img class="media-img" :src="mediaSrc(m)" alt="图片" @click="previewImg(mediaSrc(m))" />
              </template>
              <template v-else-if="msgKind(m) === 'video'">
                <video class="media-video" :src="mediaSrc(m)" controls playsinline preload="metadata" />
              </template>
              <template v-else>{{ m.content }}</template>
            </div>
            <div class="meta">{{ formatTs(m.ts) }}<span v-if="m.pending"> · 发送中</span></div>
          </div>
          <img v-if="isMine(m)" class="avatar sm" :src="myAvatar" alt="" @error="onAvatarErr" />
        </div>
        <div v-if="peer && !messages.length" class="msgs-empty">暂无消息，打个招呼吧</div>
      </div>

      <footer class="rt-chat__composer" v-if="peer">
        <div class="rt-chat__tools">
          <button type="button" class="tool" title="图片（≤5MB）" :disabled="sending" @click="pickFile('image')">
            <i class="el-icon-picture-outline"></i>
          </button>
          <button type="button" class="tool" title="视频（≤20MB）" :disabled="sending" @click="pickFile('video')">
            <i class="el-icon-video-camera"></i>
          </button>
          <input ref="imgInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden @change="onFilePicked($event, 'image')" />
          <input ref="vidInput" type="file" accept="video/mp4,video/webm,video/quicktime" hidden @change="onFilePicked($event, 'video')" />
        </div>
        <el-input
          v-model="draft"
          type="textarea"
          :rows="isMobile ? 1 : 2"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="输入消息"
          @keydown.enter.native.exact.prevent="sendText"
        />
        <el-button type="primary" size="small" :disabled="!draft.trim() || sending" @click="sendText">发送</el-button>
      </footer>

      <div class="rt-chat__video" :class="{ 'is-audio': isAudioCall }" v-if="showCallUi">
        <template v-if="isAudioCall">
          <div class="audio-stage">
            <img class="audio-avatar" :src="callPeerAvatar" alt="" @error="onAvatarErr" />
            <p class="audio-name">{{ callPeerName }}</p>
            <p class="audio-hint">{{ callStatusText }}</p>
          </div>
          <audio ref="remoteAudio" autoplay playsinline></audio>
        </template>
        <template v-else>
          <video ref="remoteVideo" class="remote" autoplay playsinline :muted="speakerMuted"></video>
          <video
            ref="localVideo"
            class="local"
            :class="{ off: !camEnabled }"
            autoplay
            muted
            playsinline
          ></video>
          <div v-if="!camEnabled" class="cam-off-tip">已关闭摄像头</div>
        </template>

        <div class="call-controls" v-if="!incoming">
          <button
            type="button"
            class="ctrl"
            :class="{ off: !micEnabled }"
            :title="micEnabled ? '关闭话筒' : '打开话筒'"
            @click="toggleMic"
          >
            <i class="el-icon-microphone"></i>
            <span>{{ micEnabled ? '话筒' : '已静音' }}</span>
          </button>
          <button
            v-if="isVideoCall"
            type="button"
            class="ctrl"
            :class="{ off: !camEnabled }"
            :title="camEnabled ? '关闭画面' : '打开画面'"
            @click="toggleCam"
          >
            <i :class="camEnabled ? 'el-icon-video-camera' : 'el-icon-video-camera-solid'"></i>
            <span>{{ camEnabled ? '画面' : '已关镜' }}</span>
          </button>
          <button
            v-if="isVideoCall && canFlipCamera"
            type="button"
            class="ctrl"
            title="翻转摄像头"
            :disabled="flippingCam"
            @click="flipCamera"
          >
            <i class="el-icon-refresh-right"></i>
            <span>翻转</span>
          </button>
          <button
            type="button"
            class="ctrl"
            :class="{ off: speakerMuted }"
            :title="speakerMuted ? '取消静音' : '静音扬声器'"
            @click="toggleSpeaker"
          >
            <i :class="speakerMuted ? 'el-icon-close-notification' : 'el-icon-bell'"></i>
            <span>{{ speakerMuted ? '已静音' : '扬声器' }}</span>
          </button>
          <button type="button" class="ctrl hang" title="挂断" @click="hangupClick">
            <i class="el-icon-phone"></i>
            <span>挂断</span>
          </button>
        </div>

        <div class="call-bar" v-if="incoming">
          <span>{{ incomingInviteText }}</span>
          <div class="call-actions">
            <el-button type="success" size="mini" @click="acceptCall">接听</el-button>
            <el-button type="danger" size="mini" @click="rejectCall">拒绝</el-button>
          </div>
        </div>
        <div class="call-status" v-else-if="calling">{{ callStatusText }}</div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchOnlineUsers, sendChatMessage, fetchChatHistory, sendWebRtcSignal } from '@/api/realtime/chat'
import { uploadFile } from '@/api/common'
import {
  resolveAvatarUrl,
  resolveMediaUrl,
  normalizeClientId,
  DEFAULT_AVATAR
} from './avatar'
import websocket from '@/utils/wesocket'

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
const MQ = '(max-width: 720px)'
const MAX_IMAGE = 5 * 1024 * 1024
const MAX_VIDEO = 20 * 1024 * 1024

function plainRtc(obj) {
  if (!obj) return null
  try {
    if (typeof obj.toJSON === 'function') return obj.toJSON()
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    return null
  }
}

export default {
  name: 'RealtimeChat',
  props: {
    mode: { type: String, default: 'embedded' },
    visible: { type: Boolean, default: true },
    initialPeerId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      loadingUsers: false,
      sending: false,
      users: [],
      peer: null,
      messages: [],
      draft: '',
      unread: {},
      lastPreview: {},
      inCall: false,
      calling: false,
      incoming: null,
      /** audio | video */
      callMode: 'video',
      micEnabled: true,
      camEnabled: true,
      speakerMuted: false,
      canFlipCamera: false,
      flippingCam: false,
      videoInputs: [],
      currentVideoDeviceId: '',
      pc: null,
      localStream: null,
      remoteStream: null,
      endingCall: false,
      isMobile: false,
      mobileView: 'list',
      mq: null,
      pendingIce: [],
      connStatus: '未连接',
      usersTimer: null
    }
  },
  computed: {
    ...mapGetters(['userId', 'avatar', 'name', 'nickname']),
    myId() {
      return normalizeClientId(this.userId)
    },
    myAvatar() {
      return resolveAvatarUrl(this.avatar)
    },
    peerId() {
      return this.peer ? this.uidOf(this.peer) : ''
    },
    displayUsers() {
      return (this.users || []).filter((u) => this.uidOf(u) && this.uidOf(u) !== this.myId)
    },
    connShort() {
      const s = this.connStatus || ''
      if (s.indexOf('已连接') >= 0) return '在线'
      if (s.indexOf('SSE') >= 0) return '兼容'
      if (s.indexOf('连接中') >= 0) return '连接中'
      return '离线'
    },
    callBusy() {
      return !!(this.inCall || this.calling || this.incoming)
    },
    showCallUi() {
      return this.callBusy
    },
    isAudioCall() {
      return this.callMode === 'audio'
    },
    isVideoCall() {
      return this.callMode !== 'audio'
    },
    callPeerName() {
      if (this.incoming) return this.incoming.fromName || '对方'
      return this.displayName(this.peer) || '对方'
    },
    callPeerAvatar() {
      if (this.peer) return this.avatarOf(this.peer)
      return DEFAULT_AVATAR
    },
    callStatusText() {
      if (this.incoming) return this.incomingInviteText
      if (this.calling) return this.isAudioCall ? '正在语音呼叫…' : '正在视频呼叫…'
      return this.isAudioCall ? '语音通话中' : '视频通话中'
    },
    incomingInviteText() {
      const name = (this.incoming && this.incoming.fromName) || '对方'
      const mode = (this.incoming && this.incoming.callMode) || this.callMode
      return mode === 'audio' ? `${name} 邀请语音通话` : `${name} 邀请视频通话`
    }
  },
  watch: {
    visible(v) {
      if (v) this.boot()
    },
    initialPeerId(v) {
      if (v) this.trySelectById(v)
    }
  },
  mounted() {
    this.mq = window.matchMedia(MQ)
    this.isMobile = this.mq.matches
    this.onMq = () => {
      this.isMobile = this.mq.matches
      if (!this.isMobile) this.mobileView = 'list'
    }
    if (this.mq.addEventListener) this.mq.addEventListener('change', this.onMq)
    else this.mq.addListener(this.onMq)

    window.addEventListener('onmessageSSE', this.onPush)
    window.addEventListener('onmessageWS', this.onPush)
    window.addEventListener('gp-realtime-presence', this.onPresence)
    document.addEventListener('visibilitychange', this.onVisibility)
    if (this.visible) this.boot()
  },
  beforeDestroy() {
    window.removeEventListener('onmessageSSE', this.onPush)
    window.removeEventListener('onmessageWS', this.onPush)
    window.removeEventListener('gp-realtime-presence', this.onPresence)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.stopUsersPoll()
    if (this.mq) {
      if (this.mq.removeEventListener) this.mq.removeEventListener('change', this.onMq)
      else this.mq.removeListener(this.onMq)
    }
    this.endCallLocal()
  },
  methods: {
    uidOf(u) {
      if (!u) return ''
      return normalizeClientId(u.clientId != null ? u.clientId : u.userId)
    },
    displayName(u) {
      if (!u) return ''
      return u.nickName || u.userName || this.uidOf(u)
    },
    avatarOf(u) {
      return resolveAvatarUrl(u && u.avatar)
    },
    msgAvatar(m) {
      if (m && m.fromAvatar) return resolveAvatarUrl(m.fromAvatar)
      if (this.peer && this.uidOf(this.peer) === normalizeClientId(m.fromClientId)) {
        return this.avatarOf(this.peer)
      }
      const u = this.users.find((x) => this.uidOf(x) === normalizeClientId(m.fromClientId))
      return this.avatarOf(u)
    },
    onAvatarErr(e) {
      if (e && e.target) e.target.src = DEFAULT_AVATAR
    },
    msgKind(m) {
      return (m && m.msgType) || (m && m.mediaUrl ? 'image' : 'text')
    },
    isMedia(m) {
      const k = this.msgKind(m)
      return k === 'image' || k === 'video'
    },
    mediaSrc(m) {
      return resolveMediaUrl(m && m.mediaUrl)
    },
    previewImg(url) {
      if (!url) return
      window.open(url, '_blank')
    },
    msgKey(m) {
      return m.localId || `${m.fromClientId}-${m.toClientId}-${m.ts}-${(m.mediaUrl || m.content || '').slice(0, 24)}`
    },
    previewText(m) {
      if (!m) return ''
      const k = this.msgKind(m)
      if (k === 'image') return '[图片]'
      if (k === 'video') return '[视频]'
      return m.content || ''
    },
    boot() {
      if (this.myId) websocket.Init(this.myId)
      this.refreshConnStatus()
      this.loadUsers().then(() => {
        if (this.initialPeerId) this.trySelectById(this.initialPeerId)
      })
      this.startUsersPoll()
    },
    refreshConnStatus() {
      this.connStatus = websocket.getStatus()
    },
    startUsersPoll() {
      this.stopUsersPoll()
      // 安卓切后台/弱网时列表易过期，定时拉一次
      this.usersTimer = setInterval(() => {
        if (this.visible === false) return
        if (typeof document !== 'undefined' && document.hidden) return
        this.refreshConnStatus()
        this.loadUsers()
      }, 12000)
    },
    stopUsersPoll() {
      if (this.usersTimer) {
        clearInterval(this.usersTimer)
        this.usersTimer = null
      }
    },
    onPresence(e) {
      const t = e && e.detail && e.detail.type
      this.refreshConnStatus()
      if (t === 'online' || t === 'offline') {
        this.loadUsers()
      }
    },
    onVisibility() {
      if (typeof document !== 'undefined' && !document.hidden) {
        if (this.myId) websocket.Init(this.myId)
        this.loadUsers()
        this.refreshConnStatus()
      }
    },
    async loadUsers() {
      this.loadingUsers = true
      try {
        const res = await fetchOnlineUsers()
        this.users = ((res && res.data) || []).map((u) => ({
          ...u,
          clientId: normalizeClientId(u.clientId != null ? u.clientId : u.userId)
        }))
      } catch (e) {
        // 保留旧列表，避免安卓瞬时失败变成「谁都看不到」
        console.warn('[im] loadUsers fail', e && e.message)
      } finally {
        this.loadingUsers = false
        this.refreshConnStatus()
      }
    },
    closeChat() {
      this.messages = [];
      this.peer = null;
    },
    trySelectById(id) {
      const nid = normalizeClientId(id)
      if (!nid) return
      const u = this.displayUsers.find((x) => this.uidOf(x) === nid)
      if (u) this.selectPeer(u)
      else this.selectPeer({ clientId: nid, nickName: nid, userName: nid })
    },
    async selectPeer(u) {
      const id = this.uidOf(u)
      this.peer = { ...u, clientId: id }
      this.messages = []
      this.$set(this.unread, id, 0)
      if (this.isMobile) this.mobileView = 'thread'
      this.$emit('peer-change', this.peer)
      try {
        const res = await fetchChatHistory(id)
        this.messages = (res && res.data) || []
        const last = this.messages[this.messages.length - 1]
        if (last) this.$set(this.lastPreview, id, this.previewText(last))
        this.$nextTick(this.scrollBottom)
      } catch (e) { /* ignore */ }
    },
    backToList() {
      this.mobileView = 'list'
    },
    isMine(m) {
      return normalizeClientId(m.fromClientId) === this.myId
    },
    formatTs(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    scrollBottom() {
      const el = this.$refs.msgBox
      if (el) el.scrollTop = el.scrollHeight
    },
    async sendText() {
      const content = (this.draft || '').trim()
      if (!content || !this.peer || this.sending) return
      await this.dispatchChat({ msgType: 'text', content })
    },
    pickFile(kind) {
      const ref = kind === 'video' ? this.$refs.vidInput : this.$refs.imgInput
      if (ref) {
        ref.value = ''
        ref.click()
      }
    },
    async onFilePicked(e, kind) {
      const file = e && e.target && e.target.files && e.target.files[0]
      if (!file || !this.peer) return
      const max = kind === 'video' ? MAX_VIDEO : MAX_IMAGE
      if (file.size > max) {
        this.$message && this.$message.warning(
          kind === 'video'
            ? '视频不能超过 20MB，请压缩或使用「文件中转」'
            : '图片不能超过 5MB，请压缩后发送'
        )
        return
      }
      this.sending = true
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('pathName', kind === 'video' ? 'im/video' : 'im/image')
        const res = await uploadFile(fd)
        const url = (res && (res.url || (res.data && res.data.url))) || ''
        if (!url) throw new Error('upload empty')
        await this.dispatchChat({
          msgType: kind,
          content: kind === 'video' ? '[视频]' : '[图片]',
          mediaUrl: url,
          mediaName: file.name,
          mediaSize: file.size
        })
      } catch (err) {
        this.$message && this.$message.error('上传失败，请稍后重试')
      } finally {
        this.sending = false
      }
    },
    async dispatchChat(payload) {
      if (!this.peer || this.sending && payload.msgType === 'text') {
        /* allow media after upload set sending */
      }
      const toId = this.peerId
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const optimistic = {
        type: 'chat',
        localId,
        msgType: payload.msgType || 'text',
        fromClientId: this.myId,
        toClientId: toId,
        fromName: this.nickname || this.name || this.myId,
        content: payload.content,
        mediaUrl: payload.mediaUrl,
        mediaName: payload.mediaName,
        mediaSize: payload.mediaSize,
        ts: Date.now(),
        pending: true
      }
      if (payload.msgType === 'text') this.draft = ''
      this.messages.push(optimistic)
      this.$set(this.lastPreview, toId, this.previewText(optimistic))
      this.$nextTick(this.scrollBottom)
      this.sending = true
      try {
        const res = await sendChatMessage({
          toClientId: toId,
          msgType: payload.msgType || 'text',
          content: payload.content,
          mediaUrl: payload.mediaUrl,
          mediaName: payload.mediaName,
          mediaSize: payload.mediaSize
        })
        const serverMsg = res && res.data
        if (serverMsg) {
          const idx = this.messages.findIndex((m) => m.localId === localId)
          if (idx >= 0) this.$set(this.messages, idx, { ...serverMsg, pending: false })
          else this.mergeMessage(serverMsg)
        } else {
          optimistic.pending = false
        }
      } catch (e) {
        const idx = this.messages.findIndex((m) => m.localId === localId)
        if (idx >= 0) this.messages.splice(idx, 1)
        this.$message && this.$message.error('发送失败')
      } finally {
        this.sending = false
      }
    },
    mergeMessage(obj) {
      if (!obj || obj.type !== 'chat') return false
      const from = normalizeClientId(obj.fromClientId)
      const to = normalizeClientId(obj.toClientId)
      const dup = this.messages.some((m) => {
        if (m.localId && m.pending && this.isMine(m)) {
          if (obj.mediaUrl && m.mediaUrl === obj.mediaUrl) return true
          if (!obj.mediaUrl && m.content === obj.content) return true
        }
        return (
          normalizeClientId(m.fromClientId) === from &&
          normalizeClientId(m.toClientId) === to &&
          m.ts === obj.ts &&
          (m.mediaUrl || m.content) === (obj.mediaUrl || obj.content)
        )
      })
      if (dup) {
        const idx = this.messages.findIndex((m) => m.pending && this.isMine(m) && (
          (obj.mediaUrl && m.mediaUrl === obj.mediaUrl) || (!obj.mediaUrl && m.content === obj.content)
        ))
        if (idx >= 0) this.$set(this.messages, idx, { ...obj, pending: false })
        return true
      }
      this.messages.push(obj)
      return true
    },
    onPush(e) {
      const raw = e && e.detail
      if (!raw) return
      let obj = raw
      if (typeof raw === 'string') {
        try { obj = JSON.parse(raw) } catch (err) { return }
      }
      if (obj.type === 'chat') {
        const from = normalizeClientId(obj.fromClientId)
        const to = normalizeClientId(obj.toClientId)
        const other = from === this.myId ? to : from
        this.$set(this.lastPreview, other, this.previewText(obj))
        const inThisThread =
          this.peerId &&
          ((from === this.peerId && to === this.myId) ||
            (to === this.peerId && from === this.myId) ||
            (from === this.myId && to === this.peerId))
        if (inThisThread) {
          this.mergeMessage(obj)
          this.$nextTick(this.scrollBottom)
        } else if (from !== this.myId) {
          this.$set(this.unread, from, (this.unread[from] || 0) + 1)
          if (!this.users.some((u) => this.uidOf(u) === from)) {
            this.users.push({
              clientId: from,
              nickName: obj.fromName || from,
              userName: obj.fromName || from,
              avatar: obj.fromAvatar
            })
          }
        }
        return
      }
      if (obj.type === 'webrtc') this.handleSignal(obj)
    },

    /* ---------- WebRTC ---------- */
    async signalSafe(body) {
      try {
        await sendWebRtcSignal({
          callMode: this.callMode,
          ...body
        })
        return true
      } catch (e) {
        console.warn('[webrtc signal]', e && e.message)
        return false
      }
    },
    async inviteCall(mode) {
      if (!this.peer || this.callBusy) return
      this.callMode = mode === 'audio' ? 'audio' : 'video'
      this.resetMediaToggles()
      this.calling = true
      const ok = await this.signalSafe({
        toClientId: this.peerId,
        signalType: 'invite',
        callMode: this.callMode
      })
      if (!ok) {
        this.$message && this.$message.error('发起通话失败，请检查网络后重试')
        this.endCallLocal()
        return
      }
      this.$message && this.$message.info(
        this.isAudioCall ? '已发起语音通话，等待对方接听…' : '已发起视频通话，等待对方接听…'
      )
      try {
        await this.startCall(true)
      } catch (e) {
        await this.failCallBoth(this.isAudioCall ? '无法打开麦克风' : '无法打开摄像头/麦克风')
      }
    },
    async acceptCall() {
      const inv = this.incoming
      const from = inv && normalizeClientId(inv.fromClientId)
      const fromName = inv && inv.fromName
      this.callMode = (inv && inv.callMode) === 'audio' ? 'audio' : 'video'
      this.resetMediaToggles()
      this.incoming = null
      if (from && this.peerId !== from) {
        this.peer = { clientId: from, nickName: fromName || from }
        if (this.isMobile) this.mobileView = 'thread'
      }
      try {
        await this.startCall(false)
      } catch (e) {
        await this.failCallBoth(this.isAudioCall ? '无法打开麦克风' : '无法打开摄像头/麦克风')
      }
    },
    resetMediaToggles() {
      this.micEnabled = true
      this.camEnabled = true
      this.speakerMuted = false
      this.canFlipCamera = false
      this.flippingCam = false
      this.videoInputs = []
      this.currentVideoDeviceId = ''
    },
    async rejectCall() {
      const to = this.incoming && normalizeClientId(this.incoming.fromClientId)
      this.incoming = null
      if (to) {
        await this.signalSafe({ toClientId: to, signalType: 'reject' })
      }
      this.endCallLocal()
    },
    hangupClick() {
      this.hangup(false)
    },
    async hangup(silent) {
      const to = this.peerId || (this.incoming && normalizeClientId(this.incoming.fromClientId))
      if (!silent && to) {
        await this.signalSafe({ toClientId: to, signalType: 'hangup' })
      }
      this.endCallLocal()
    },
    async failCallBoth(reason) {
      const to = this.peerId || (this.incoming && normalizeClientId(this.incoming.fromClientId))
      if (to) {
        await this.signalSafe({ toClientId: to, signalType: 'error', reason: reason || 'call_error' })
      }
      this.$message && this.$message.error(reason || '通话失败')
      this.endCallLocal()
    },
    clearVideoEl(el) {
      if (!el) return
      try {
        el.pause && el.pause()
        el.srcObject = null
        el.removeAttribute('src')
        el.load && el.load()
      } catch (e) { /* ignore */ }
    },
    endCallLocal() {
      if (this.endingCall) return
      this.endingCall = true
      try {
        if (this.pc) {
          try {
            this.pc.onicecandidate = null
            this.pc.ontrack = null
            this.pc.onconnectionstatechange = null
            this.pc.close()
          } catch (e) { /* ignore */ }
          this.pc = null
        }
        if (this.localStream) {
          this.localStream.getTracks().forEach((t) => {
            try { t.stop() } catch (e) { /* ignore */ }
          })
          this.localStream = null
        }
        this.remoteStream = null
        this.clearVideoEl(this.$refs.localVideo)
        this.clearVideoEl(this.$refs.remoteVideo)
        this.clearVideoEl(this.$refs.remoteAudio)
        this.inCall = false
        this.calling = false
        this.incoming = null
        this.pendingIce = []
        this.resetMediaToggles()
      } finally {
        this.$nextTick(() => {
          this.clearVideoEl(this.$refs.localVideo)
          this.clearVideoEl(this.$refs.remoteVideo)
          this.clearVideoEl(this.$refs.remoteAudio)
          this.endingCall = false
        })
      }
    },
    async refreshCameraList() {
      this.canFlipCamera = false
      this.videoInputs = []
      if (this.callMode !== 'video' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return
      }
      try {
        const list = await navigator.mediaDevices.enumerateDevices()
        this.videoInputs = list.filter((d) => d.kind === 'videoinput')
        this.canFlipCamera = this.videoInputs.length > 1
        const track = this.localStream && this.localStream.getVideoTracks()[0]
        if (track && track.getSettings) {
          this.currentVideoDeviceId = track.getSettings().deviceId || ''
        }
      } catch (e) {
        this.canFlipCamera = false
      }
    },
    toggleMic() {
      this.micEnabled = !this.micEnabled
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => {
          t.enabled = this.micEnabled
        })
      }
    },
    toggleCam() {
      if (!this.isVideoCall) return
      this.camEnabled = !this.camEnabled
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((t) => {
          t.enabled = this.camEnabled
        })
      }
    },
    toggleSpeaker() {
      this.speakerMuted = !this.speakerMuted
      if (this.$refs.remoteVideo) this.$refs.remoteVideo.muted = this.speakerMuted
      if (this.$refs.remoteAudio) this.$refs.remoteAudio.muted = this.speakerMuted
    },
    async flipCamera() {
      if (!this.canFlipCamera || this.flippingCam || !this.pc || !this.localStream) return
      this.flippingCam = true
      try {
        await this.refreshCameraList()
        if (this.videoInputs.length < 2) {
          this.canFlipCamera = false
          return
        }
        const cur = this.currentVideoDeviceId
        const next = this.videoInputs.find((d) => d.deviceId !== cur) || this.videoInputs[0]
        const fresh = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { deviceId: { exact: next.deviceId }, facingMode: next.label && /front|前|user/i.test(next.label) ? undefined : undefined }
        })
        const newTrack = fresh.getVideoTracks()[0]
        const oldTrack = this.localStream.getVideoTracks()[0]
        const sender = this.pc.getSenders().find((s) => s.track && s.track.kind === 'video')
        if (sender) await sender.replaceTrack(newTrack)
        if (oldTrack) {
          try { oldTrack.stop() } catch (e) { /* ignore */ }
          this.localStream.removeTrack(oldTrack)
        }
        this.localStream.addTrack(newTrack)
        newTrack.enabled = this.camEnabled
        this.currentVideoDeviceId = next.deviceId
        if (this.$refs.localVideo) this.$refs.localVideo.srcObject = this.localStream
      } catch (e) {
        this.$message && this.$message.warning('无法切换摄像头')
      } finally {
        this.flippingCam = false
      }
    },
    bindRemoteMedia(stream) {
      this.remoteStream = stream
      this.$nextTick(() => {
        if (this.isAudioCall) {
          if (this.$refs.remoteAudio) {
            this.$refs.remoteAudio.srcObject = stream
            this.$refs.remoteAudio.muted = this.speakerMuted
          }
        } else if (this.$refs.remoteVideo) {
          this.$refs.remoteVideo.srcObject = stream
          this.$refs.remoteVideo.muted = this.speakerMuted
        }
      })
    },
    async startCall(isOfferer) {
      const constraints = this.isAudioCall
        ? { audio: true, video: false }
        : { audio: true, video: { facingMode: 'user' } }
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      await this.$nextTick()
      if (this.isVideoCall && this.$refs.localVideo) {
        this.$refs.localVideo.srcObject = this.localStream
      }
      await this.refreshCameraList()

      this.pc = new RTCPeerConnection(ICE)
      this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream))
      this.pc.ontrack = (ev) => {
        this.bindRemoteMedia(ev.streams[0])
      }
      this.pc.onicecandidate = (ev) => {
        if (!ev.candidate || !this.peerId) return
        this.signalSafe({
          toClientId: this.peerId,
          signalType: 'ice',
          candidate: plainRtc(ev.candidate)
        })
      }
      this.pc.onconnectionstatechange = () => {
        const st = this.pc && this.pc.connectionState
        if ((st === 'failed' || st === 'disconnected' || st === 'closed') && this.callBusy && !this.endingCall) {
          this.$message && this.$message.info(st === 'failed' ? '通话连接失败' : '通话已断开')
          this.hangup(false)
        }
      }
      this.inCall = true
      this.calling = !!isOfferer
      if (isOfferer && this.peerId) {
        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)
        const ok = await this.signalSafe({
          toClientId: this.peerId,
          signalType: 'offer',
          sdp: plainRtc(offer),
          callMode: this.callMode
        })
        if (!ok) await this.failCallBoth('信令发送失败')
      }
    },
    async flushIce() {
      if (!this.pc || !this.pc.remoteDescription) return
      const list = this.pendingIce.splice(0)
      for (const c of list) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(c))
        } catch (e) { /* ignore */ }
      }
    },
    async handleSignal(obj) {
      const st = obj.signalType
      const from = normalizeClientId(obj.fromClientId)
      const toMe = normalizeClientId(obj.toClientId) === this.myId
      const fromMe = from === this.myId

      if (st === 'invite' && toMe && !fromMe) {
        this.callMode = obj.callMode === 'audio' ? 'audio' : 'video'
        this.incoming = obj
        return
      }
      if ((st === 'reject' || st === 'hangup' || st === 'error') && (toMe || fromMe)) {
        if (st === 'reject' && toMe && !fromMe) {
          this.$message && this.$message.info('对方已拒绝')
        } else if (st === 'hangup' && toMe && !fromMe) {
          this.$message && this.$message.info('对方已挂断')
        } else if (st === 'error' && toMe && !fromMe) {
          this.$message && this.$message.warning(obj.reason || '对方通话异常结束')
        }
        this.endCallLocal()
        return
      }

      if (!this.pc && (st === 'offer' || st === 'answer' || st === 'ice')) {
        if (st === 'offer' && toMe) {
          if (obj.callMode) this.callMode = obj.callMode === 'audio' ? 'audio' : 'video'
          if (!this.peer) {
            this.peer = { clientId: from, nickName: obj.fromName || from }
            if (this.isMobile) this.mobileView = 'thread'
          }
          try {
            await this.startCall(false)
          } catch (e) {
            await this.failCallBoth(this.isAudioCall ? '无法打开麦克风' : '无法打开摄像头/麦克风')
            return
          }
        } else {
          return
        }
      }
      if (!this.pc) return

      try {
        if (st === 'offer' && obj.sdp) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(obj.sdp))
          await this.flushIce()
          const answer = await this.pc.createAnswer()
          await this.pc.setLocalDescription(answer)
          await this.signalSafe({
            toClientId: from,
            signalType: 'answer',
            sdp: plainRtc(answer),
            callMode: this.callMode
          })
          this.calling = false
        } else if (st === 'answer' && obj.sdp) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(obj.sdp))
          await this.flushIce()
          this.calling = false
        } else if (st === 'ice' && obj.candidate) {
          if (!this.pc.remoteDescription) {
            this.pendingIce.push(obj.candidate)
          } else {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(obj.candidate))
            } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        console.warn('[webrtc handle]', e)
        await this.failCallBoth('通话信令处理失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.rt-chat {
  --rt-border: var(--gp-surface-border, #e7ecee);
  --rt-bg: var(--gp-surface-bg, #fff);
  --rt-side: var(--background-1, #f3f5f6);
  --rt-text: var(--text-color-2, #344449);
  --rt-muted: var(--muted-1-color, #8a9699);
  --rt-bubble: var(--background-2, #edf1f2);
  --rt-mine: var(--theme-color-muted, rgba(95, 125, 128, 0.22));
  --rt-theme: var(--theme-color, #5f7d80);

  display: flex;
  height: 520px;
  max-height: 70vh;
  border: 1px solid var(--rt-border);
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  overflow: hidden;
  background: var(--rt-bg);
  color: var(--rt-text);
  min-height: 0;
}
.rt-chat.is-embedded { height: 560px; }
.rt-chat.is-page { height: 100%; max-height: none; border: none; border-radius: 0; }

.rt-chat__side {
  flex-shrink: 0;
  border-right: 1px solid var(--rt-border);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--rt-side);
}
.rt-chat__side-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}
.rt-chat__side-ops {
  display: flex;
  align-items: center;
  gap: 4px;
}
.rt-conn {
  font-size: 11px;
  font-weight: 500;
  color: var(--rt-muted);
  padding: 0 4px;
}
.rt-chat__users {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
  flex: 1;
  min-height: 0;
}
.rt-chat__users li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.rt-chat__users li.active,
.rt-chat__users li:hover { background: var(--rt-mine); }
.rt-chat__users .avatar,
.rt-chat__hd .avatar,
.msg .avatar {
  width: 42px;
  height: 42px;
  /* 头像保持圆形，不跟随管理端控件圆角 */
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #ddd;
}
.rt-chat__hd .avatar.sm,
.msg .avatar.sm { width: 36px; height: 36px; border-radius: 50%; }
.rt-chat__users .info { flex: 1; min-width: 0; }
.rt-chat__users .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.rt-chat__users .name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rt-chat__users .preview {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--rt-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rt-chat__users .badge {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  background: #e54d42;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}
.rt-chat__users .empty {
  color: var(--rt-muted);
  cursor: default;
  font-size: 13px;
  justify-content: center;
}

.rt-chat__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  position: relative;
  background: var(--rt-bg);
}
.rt-chat__hd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--rt-border);
  flex-shrink: 0;
  min-height: 52px;
}
.rt-chat__hd .back {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: var(--rt-text);
  padding: 4px;
}
.hd-peer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.hd-peer strong,
.hd-placeholder {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hd-placeholder { flex: 1; font-weight: 500; color: var(--rt-muted); }
.rt-chat__actions { margin-left: auto; flex-shrink: 0; }

.rt-chat__msgs {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 14px 12px;
  -webkit-overflow-scrolling: touch;
}
.msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
  max-width: 88%;
}
.msg.mine { margin-left: auto; justify-content: flex-end; }
.msg .col { min-width: 0; }
.msg.mine .col { text-align: right; }
.msg .nick { font-size: 11px; color: var(--rt-muted); margin-bottom: 4px; }
.bubble {
  display: inline-block;
  padding: 8px 12px;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  background: var(--rt-bubble);
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  word-break: break-word;
}
.bubble.media { padding: 4px; background: transparent; }
.msg.mine .bubble:not(.media) {
  background: var(--rt-mine);
  color: var(--rt-theme);
}
.msg.pending .bubble { opacity: 0.7; }
.media-img {
  max-width: 220px;
  max-height: 220px;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  display: block;
  cursor: zoom-in;
}
.media-video {
  max-width: 260px;
  max-height: 200px;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  background: #000;
  display: block;
}
.meta { font-size: 11px; color: var(--rt-muted); margin-top: 4px; }
.msgs-empty {
  text-align: center;
  color: var(--rt-muted);
  font-size: 13px;
  padding: 40px 12px;
}

.rt-chat__composer {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--rt-border);
  align-items: flex-end;
  flex-shrink: 0;
  background: var(--rt-bg);
}
.rt-chat__tools {
  display: flex;
  gap: 4px;
  padding-bottom: 4px;
}
.rt-chat__tools .tool {
  border: none;
  background: transparent;
  color: var(--rt-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 2px 4px;
}
.rt-chat__tools .tool:hover { color: var(--rt-theme); }
.rt-chat__composer .el-textarea { flex: 1; }

.rt-chat__video {
  position: absolute;
  inset: 0;
  background: #111;
  z-index: 5;
  color: #fff;
}
.rt-chat__video.is-audio {
  background: linear-gradient(160deg, #1a2426 0%, #0d1213 55%, #1c2a2c 100%);
}
.rt-chat__video .remote { width: 100%; height: 100%; object-fit: cover; background: #000; }
.rt-chat__video .local {
  position: absolute;
  right: 12px;
  bottom: 96px;
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  border: 2px solid #fff;
  background: #333;
  z-index: 2;
}
.rt-chat__video .local.off { opacity: 0.35; filter: grayscale(1); }
.cam-off-tip {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.55);
  padding: 8px 14px;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  font-size: 13px;
  z-index: 2;
}
.audio-stage {
  position: absolute;
  inset: 0 0 88px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.audio-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.35);
  background: #444;
}
.audio-name { margin: 0; font-size: 18px; font-weight: 600; }
.audio-hint { margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.7); }
.call-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
  z-index: 3;
}
.call-controls .ctrl {
  width: 64px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: var(--gp-border-radius-base, #{$base-border-radius});
  padding: 10px 6px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  line-height: 1.2;
}
.call-controls .ctrl i { font-size: 20px; }
.call-controls .ctrl.off {
  background: rgba(229, 77, 66, 0.28);
  color: #ffb4ae;
}
.call-controls .ctrl.hang {
  background: #e54d42;
  color: #fff;
}
.call-controls .ctrl:disabled { opacity: 0.45; cursor: not-allowed; }
.call-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 4;
}
.call-actions { display: flex; gap: 8px; }
.call-status {
  position: absolute;
  left: 0;
  right: 0;
  top: 14px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  z-index: 2;
}

@media (max-width: 720px) {
  .rt-chat.is-embedded,
  .rt-chat.is-mobile { flex-direction: row; height: 70vh; }
  .rt-chat.is-page.is-mobile { height: 100%; }
  .rt-chat.is-mobile .rt-chat__side,
  .rt-chat.is-mobile .rt-chat__main { width: 100%; }
  .rt-chat.is-mobile .rt-chat__side { border-right: none; }
  .rt-chat__video .local { width: 96px; height: 72px; bottom: 108px; }
}
</style>
