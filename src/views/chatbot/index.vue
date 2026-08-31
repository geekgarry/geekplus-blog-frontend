<template>
  <!--
    /chat：桌面端左侧会话导航 + 右侧对话区平铺；
    窄屏（<900px）侧栏改为抽屉，遮罩关闭。
  -->
  <div
    class="chat-app-container"
    :class="{
      'is-desktop': !mobileChatdisplay,
      'is-mobile': mobileChatdisplay,
      'sidebar-open': sidebarOpen
    }"
  >
    <!-- 窄屏抽屉遮罩 -->
    <div
      class="chat-sidebar-mask"
      v-show="mobileChatdisplay && sidebarOpen"
      @click="closeSidebar"
    />

    <!-- 会话导航：桌面常驻 / 窄屏抽屉 -->
    <div
      id="my-plus-drawer"
      class="chat-sidebar"
      :class="{ 'is-open': sidebarOpen }"
      aria-label="会话导航"
    >
      <div class="chat-sidebar__brand">
        <div class="chat-sidebar__brand-main">
          <span class="chat-sidebar__logo" aria-hidden="true">AI</span>
          <div class="chat-sidebar__brand-text">
            <strong>极客普拉斯</strong>
            <span>智能助手</span>
          </div>
        </div>
        <div class="chat-sidebar__brand-actions">
          <router-link to="/" class="chat-sidebar__icon-btn" title="回首页" target="_blank">
            <!-- <i class="el-icon-s-home" /> -->
            <svg-icon icon-class="home" />
          </router-link>
          <button
            v-if="mobileChatdisplay"
            type="button"
            class="chat-sidebar__icon-btn"
            title="关闭"
            @click="closeSidebar"
          >
            <!-- <i class="el-icon-close" /> -->
            <svg-icon icon-class="close" />
          </button>
        </div>
      </div>

      <button type="button" class="chat-sidebar__new" @click="onNewChat">
        <!-- <i class="el-icon-plus" /> -->
        <svg-icon icon-class="plus" />
        <span>新对话</span>
      </button>

      <div class="chat-sidebar__section">
        <div class="chat-sidebar__section-hd">
          <span>历史会话</span>
          <button
            type="button"
            class="chat-sidebar__icon-btn is-sm"
            title="刷新"
            @click="getAllHistoryChatMsg(chatDataPrompt.username)"
          >
            <!-- <i class="el-icon-refresh" /> -->
            <svg-icon icon-class="refresh" />
          </button>
        </div>
        <div class="chat-sidebar__list">
          <button
            v-for="(item, index) in historyChatMsgList"
            :key="item.historyMsgKey || index"
            type="button"
            class="chat-sidebar__item"
            :class="{ 'is-active': selectedHistory(item.historyMsgKey) }"
            @click="onSelectHistory(item.historyMsgKey)"
          >
            <span class="chat-sidebar__item-text">{{ historyPreviewText(item) }}</span>
            <span
              v-if="username && username != 'guest'"
              class="chat-sidebar__item-del"
              title="删除"
              @click.stop="deleteOneHistoryChatMsg(item.historyMsgKey)"
            >
              <!-- <i class="el-icon-close" /> -->
              <svg-icon icon-class="close" />
            </span>
          </button>
          <p v-if="!historyChatMsgList || !historyChatMsgList.length" class="chat-sidebar__empty">
            暂无历史，开始提问吧
          </p>
        </div>
      </div>

      <div class="chat-sidebar__tools">
        <label class="chat-sidebar__tool">
          <span>多轮记忆</span>
          <span class="switch">
            <input type="checkbox" :checked="isHistory" @change="setHistoryChat" />
            <span class="slider" />
          </span>
        </label>
        <label class="chat-sidebar__tool">
          <span>语音播报</span>
          <span class="switch">
            <input type="checkbox" :checked="isTextVoice" @change="setTextVoice" />
            <span class="slider" />
          </span>
        </label>
        <label class="chat-sidebar__tool">
          <span>深色主题</span>
          <span class="switch">
            <input type="checkbox" :checked="darkTheme" @change="setTheme" />
            <span class="slider" />
          </span>
        </label>
      </div>

      <div class="chat-sidebar__user">
        <div class="chat-sidebar__user-meta">
          <router-link v-if="!$common.isEmpty(username)" to="/admin" class="chat-sidebar__avatar">
            <img :src="avatar" alt="" />
          </router-link>
          <span v-else class="chat-sidebar__avatar is-guest">
            <!-- <i class="el-icon-user" /> -->
            <svg-icon icon-class="user" />
          </span>
          <div class="chat-sidebar__user-text">
            <div class="truncate">{{ nickname || '访客' }}</div>
            <small>{{ username || '未登录' }}</small>
          </div>
        </div>
        <button
          v-if="!$common.isEmpty(username)"
          type="button"
          class="chat-sidebar__text-btn"
          @click="userLogout"
        >退出</button>
        <button
          v-else
          type="button"
          class="chat-sidebar__text-btn is-primary"
          @click="userLogin"
        >登录</button>
      </div>
    </div>

    <div class="chat-workspace">
      <header class="chat-box-header" :style="{ top: chatBoxHeaderTop + 'px' }">
        <button
          type="button"
          class="chat-header-btn"
          :title="mobileChatdisplay ? '打开菜单' : '会话列表'"
          @click="toggleSidebar"
        >
          <!-- <i class="el-icon-s-fold" v-if="!mobileChatdisplay && sidebarOpen" />
          <i class="el-icon-s-unfold" v-else-if="!mobileChatdisplay" />
          <i class="el-icon-menu" v-else /> -->
          <svg-icon icon-class="left" v-if="!mobileChatdisplay && sidebarOpen" />
          <svg-icon icon-class="right" v-else-if="!mobileChatdisplay" />
          <svg-icon icon-class="menu" v-else />
        </button>
        <span class="chat-box-header__title">AI 智能助手</span>
        <button type="button" class="chat-header-btn" title="关于" @click="openMsg">
          <!-- <i class="el-icon-info" /> -->
          <svg-icon icon-class="info" />
        </button>
      </header>

      <div class="chat-shell">
        <div class="chat-main-content">
          <div
            ref="chatBox"
            class="big-chat-box"
            id="big-chat-box"
            :style="chatBoxInlineStyle"
          >
            <div v-if="!msgList.length" class="chat-empty-hint">
              <div class="chat-empty-hint__badge">GeekPlus AI</div>
              <h2>有什么可以帮你的？</h2>
              <p>在下方输入问题开始对话，也可从左侧打开历史会话。</p>
            </div>
            <div v-for="(item, index) in msgList" :key="index" class="list-chat-msg">
              <div class="chat-data-meta">
                <span v-show="item.time" class="chat-date-time">{{ getChatDateTime(item.time) }}</span>
                <span v-show="item.align === 'left' && item.elapsedMs" class="chat-reply-elapsedMs">已思考：{{ item.elapsedMs }}s</span>
              </div>
              <div :class="item && item.align === 'right' ? 'list-chat-item-right' : 'list-chat-item-left'">
                <span>
                  <img
                    class="chat-user-icon"
                    :src="item.align == 'right' ? userAvatar : aiAvatar"
                    :alt="item.align == 'right' ? '麦壳' : '极客普拉斯'"
                  >
                </span>
                <span class="list-chat-item-content">
                  <div v-if="item.type === 'text'">
                    <span v-html="item.align === 'right' ? item.text : renderMdHtml(item.text)"></span>
                  </div>
                  <div v-else-if="item.type === 'image'">
                    <span>{{ item.text }}</span>
                    <div class="chat-msg-media-data">
                      <img :src="item.mediaData" :alt="item.mediaFileName">
                    </div>
                    <div>{{ item.mediaFileName }}</div>
                  </div>
                  <div v-else>
                    <span>{{ item.text }}</span>
                    <div class="chat-msg-media-data">
                      <object :data="item.mediaData" style="width: 95%;" height="100%">
                        <embed :src="item.mediaData" style="width: 100%;">
                        <audio controls height="50" width="100%" :data="item.mediaData"></audio>
                        <video controls height="50" width="100%" :data="item.mediaData">
                          <source :src="item.mediaData" type="audio/mpeg">
                          <source :src="item.mediaData" type="audio/ogg">
                          <source :src="item.mediaData" type="video/mp4">
                          <source :src="item.mediaData" type="video/ogg">
                        </video>
                        <a :href="item.mediaData" target="_blank">查看</a>
                      </object>
                    </div>
                    <div>{{ item.mediaFileName }}</div>
                  </div>
                  <div v-show="item.link"><a :href="item.link" target="_blank">链接</a></div>
                </span>
              </div>
            </div>
          </div>

          <div class="chat-box-footer">
            <div class="input-container chat-composer">
              <div v-if="mobileChatdisplay" class="button-container">
                <button type="button" class="send-button" @click="startAndStopRecording">
                  {{ recordingTxt }}
                </button>
              </div>
              <div class="textarea-container">
                <textarea
                  ref="chatInput"
                  placeholder="输入消息"
                  class="plus-text-input onlyoneline"
                  id="plus-input-content-text"
                  name="inputChatMsg"
                  autocomplete="off"
                  rows="1"
                  v-model="inputChatMsg"
                  :autofocus="false"
                  @keydown="keyDownEvent"
                  @input="textInputEvent"
                  @paste.capture.passive="pastingData"
                ></textarea>
                <label for="file-upload" class="upload-button" title="上传文件">
                  <!-- <i class="el-icon-paperclip" /> -->
                  <svg-icon icon-class="paperclip" />
                  <input
                    type="file"
                    id="file-upload"
                    ref="file-upload-ref"
                    accept="*"
                    @change="uploadDataFileEvent($event)"
                    style="display: none;"
                  >
                </label>
              </div>
              <div class="button-container">
                <button
                  type="button"
                  class="send-button is-primary"
                  @click="handleMsg"
                  :disabled="statusDisabled"
                >发送</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="fileDialogVisible" @open="fileDialogOpen" @close="fileDialogClose">
      <div class="file-preview-send-main">
        <div class="file-preview-send-container">
          <div class="chat-extra-data" id="fileData" v-html="filePreview">
          </div>
        </div>
        <textarea name="inputChatMsgDialog" v-model="chatDataPrompt.chatMsg" v-focus="dialogInputIsFocus"
          class="plus-form-textarea" placeholder="请输入消息..." rows="1"></textarea>
        <div class="file-preview-send-footer">
          <div class="pdf-left-btn">
            <span class="cancel-btn" @click="fileDialogVisible = false" data-cancel="plus-dialog" aria-label="Close">
              取消
            </span>
          </div>
          <span class="split-line"></span>
          <div class="pdf-right-btn">
            <span class="confirm-btn" v-on:click="sendWithFile">发送</span>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 另一种抽屉滑动菜单，使用toggleMenu方法滑出显示menu-drawer，outSideCloseMenu方法点击菜单以外任意地方隐藏menu-drawer -->
    <!-- <div class="menu-drawer" :class="{ open: menuOpen }"></div> -->
    <!-- <div class="plus-dialog-overlay">
      <div class="plus-dialog-main-body">
      </div>
    </div> -->
    <el-dialog append-to-body :visible.sync="showLoginSignup" :center="true">
      <login-signup></login-signup>
    </el-dialog>
  </div>
</template>

<script>
// import axios from 'axios'
import { mapGetters, mapState } from 'vuex'
import Recorder from 'js-audio-recorder'
import PlusCropper from "plus-cropper"
//import { marked } from 'marked';//9.1.6
const marked = require('marked'); //9.1.6
import { geminiAI, geminiAIChat, getHistoryMessage, getAllHistoryMessage, getOneHistoryMessage, deleteOneHistoryMessage, getGeminiTTS, uploadVoiceBlob, geminiStreamChat } from "@/api/chatbot/chatbot"
import LoginSignup from '@/components/LoginSignup/index'
import { base64ToBlob, fileToBase64 } from '@/utils/gputil.js'
export default {
  name: "ChatBot",
  components: {
    LoginSignup
  },
  data() {
    return {
      redirect: undefined,
      userAvatar: require('@/assets/mai.jpg'),
      aiAvatar: require('@/assets/logo.png'),
      fileDialogVisible: false,//聊天对话框是否显示
      dialogInputIsFocus: false,
      inputChatMsg: "",//消息发送框中的消息内容，发送时赋值给chatDataPrompt.chatMsg
      preChatData: "", //历史聊天数据，拼接json字符串，和下面数组形式，属于不同的数据形式发送
      msgList: [], //聊天消息的list
      historyChatData: [], //历史聊天记录，临时存储所有消息聊天历史记录，当需要使用，赋值给chatDataPrompt.historyChatData
      //loading: false,//是否加载中，目前未被使用
      //chatBtnPcDisplay: true,//聊天对话框显示按钮，目前没有被使用
      /** 窄屏布局（抽屉侧栏）；宽屏为平铺侧栏。仅按视口宽度判断 */
      mobileChatdisplay: true,
      /** 侧栏开合：窄屏抽屉；宽屏可折叠腾出主区 */
      sidebarOpen: true,
      //reduceH: 40,//页面固定减去的一个高度，为顶部的header部分的高
      chatBoxHeight: 440,//中间聊天内容盒子区域的高度，窗体高度减去底部输入部分
      chatBoxHeaderTop: 0, //适用于移动端iOS键盘抬起，页面内容被往上推，为了定位顶部header，保持top为0
      windowWidth: 0,//实时窗体宽度
      windowHeight: 0,//实时窗体高度
      audioData: [], // 存储录音数据块，recorderData//音频的二进制数据
      recorder: new Recorder({
        sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
        sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
        numChannels: 1, // 声道，支持 1 或 2， 默认是1
        // compiling: false,(0.x版本中生效,1.x增加中)  // 是否边录边转换，默认是false
      }),
      recording: 0,//表示录音状态，0为开始，1为结束
      recordingTxt: "语音",//文字表示录音的状态
      textAudio: null,//录音音频数据
      isTextVoice: false, //是否语音朗读
      isHistory: true, //是否采用有历史记忆的聊天
      tempFileUrl: "", //临时二进制数据Blob文件地址
      // openAiKey: '',//未使用，用户自己使用自己的apikey
      //封装一个聊天消息，里面自己添加具体的内容，可以携带媒体数据mediaData
      chatDataPrompt: {
        userId: null,//用户ID
        username: this.$store.state.user.username || "guest",//用户名
        chatMsg: "",//聊天消息内容
        historyChatData: null,//历史聊天记录
        mediaData: null,
        mediaMimeType: null,//文件数据类型
        mediaFileName: null,//文件名称
        tts: 0 //是否开启tts语音
      },
      historyChatMsgList: [],//历史消息记录，从redis中查询，包含redisKey和每一个聊天记录的最后一条消息
      webProtocol: window.location.protocol,
      baseHost: window.location.host,//当前的网址url
      baseApi: process.env.VUE_APP_BASE_API,//获取系统的api初始头URL
      textAreaInput: null,//获取底部输入框input，textarea
      textInputHeight: 0,//获取输入框的初始的高度
      textInputHeightAdd: 0,//输入框换行时增加的高度，也就是实际的line-height，我这里的是24px
      statusDisabled: false,//发送按钮的不可用状态
      tempFileData: null,//上传大型文件
      menuOpen: false,//左边滑动抽屉菜单
      filePreview: null,//文件预览内容
      showLoginSignup: false, //显示登录界面
      typingQueue: [],   // 等待打印的队列
      isTyping: false,   // 是否正在打字
      chunkCount: 0,   // 统计到达的片段数量
      typingBuffer: "",   // 缓冲区
      baseSpeed: 35,      // 基础速度 (ms)
      minSpeed: 10,       // 最快速度 (ms)
      maxSpeed: 60,       // 最慢速度 (ms)
      maxChunkSize: 5,   // 每次最多输出几个字
      minChunkSize: 1,   // 每次最少输出几个字
      adaptive: true,     // 是否开启自适应打字速度
    };
  },
  created() {
    this.beforeLoadedDocument();
    // const localUsername = localStorage.getItem("username")
    // if (localUsername) {
    //   this.chatDataPrompt.username = localUsername;
    // }
    this.getHistoryMag(this.chatDataPrompt.username);
    this.getAllHistoryChatMsg(this.chatDataPrompt.username);
    localStorage.setItem("username", this.chatDataPrompt.username);
  },
  mounted() {
    const that = this;
    this.mobileChatdisplay = this.isMobile();
    // 窄屏默认收起侧栏；宽屏默认展开
    this.sidebarOpen = !this.mobileChatdisplay;
    this.$nextTick(() => {
      that.textAreaInput = that.$refs.chatInput || document.querySelector("#plus-input-content-text");
      if (that.textAreaInput) {
        that.textInputHeight = that.textAreaInput.offsetHeight || 36;
        that.syncTextareaHeight(true);
      }
      that.adjustLayout();
      const box = that.$refs.chatBox || document.getElementsByClassName('big-chat-box')[0];
      if (box) {
        box.addEventListener('scroll', that.handleAIMessageScroll, { passive: true });
      }
    });
    // <!--把window.onresize事件挂在到mounted函数上-->
    window.addEventListener('resize', (e) => {
      window.fullHeight = document.documentElement.clientHeight || document.body.clientHeight;
      window.fullWidth = document.documentElement.clientWidth || document.body.clientWidth;
      that.windowHeight = window.fullHeight;
      that.windowWidth = window.fullWidth;
      const nextMobile = that.isMobile();
      // 跨过断点时重置侧栏开合，避免宽屏仍关着 / 窄屏误常开
      if (nextMobile !== that.mobileChatdisplay) {
        that.sidebarOpen = !nextMobile;
      }
      that.mobileChatdisplay = nextMobile;
      that.$nextTick(() => that.adjustLayout());
    });
    window.onscroll = () => {
      //在IOS下document.body.scrollTop 一直为0，要用document.documentElement.scrollTop
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        var scrollTopDis = document.documentElement.scrollTop || document.body.scrollTop;
        this.chatBoxHeaderTop = scrollTopDis;
        window.setTimeout(function () {
          if ('scrollIntoView' in document.activeElement) {
            document.activeElement.scrollIntoView(true);
          } else {
            document.activeElement.scrollIntoViewIfNeeded();
          }
        }, 300);
      } else {
        setTimeout(async () => {
          that.chatBoxHeaderTop = 0;
        }, 0);
      }
    }
    // 设置显示回调函数
    PlusCropper.onShow(() => {
      // console.log("Plus裁剪框已显示");
    });
    // 设置隐藏回调函数
    PlusCropper.onHide(() => {
      var tempImg = '<img style="width: 100%; height: auto;" src="' + this.tempFileUrl + '" />';
      this.filePreview = tempImg;
      this.fileDialogVisible = true;
    });
  },
  computed: {
    //主题模式，默认为明亮主题
    darkTheme() {
      return this.$store.state.darkMode;
    },
    /** 桌面用 flex 撑满，移动端保留 JS 高度以适配键盘 */
    chatBoxInlineStyle() {
      if (!this.mobileChatdisplay) return {}
      return { height: this.chatBoxHeight + 'px' }
    },
    ...mapGetters([
      'avatar',
      "device",
      "nickname",
      "username"
    ]),
  },
  watch: {
    windowHeight(val) {
      // console.log("实时屏幕高度：", val, this.windowHeight);
    },
    windowWidth(val) {
      // console.log("实时屏幕宽度：", val, this.windowWidth);
    },
    msgList(mList) {
      if (mList.length - this.msgList.length === 2) {
        // console.log("消息更新");
      }
    },
    inputChatMsg(val) {
      this.chatDataPrompt.chatMsg = val;
    },
    $route: {
      handler(route) {
        this.redirect = (route.query && route.query.redirect) || '/'
      },
      immediate: true,
    }
  },
  methods: {
    newChatAI() {
      this.msgList = [];
      this.chatDataPrompt.historyChatData = null;//历史聊天记录
      this.chatDataPrompt.historyId = null;//历史聊天记录
    },
    beforeLoadedDocument() {
      this.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      this.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      this.mobileChatdisplay = this.isMobile();
      this.sidebarOpen = !this.mobileChatdisplay;
    },
    userLogin() {
      this.showLoginSignup = true;
    },
    userLogout() {
      this.$confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //this.websocketClose();
        this.$store.dispatch('user/logout').then(() => {
          //location.href = '/';
          // location.reload();
          this.$router.push({ path: this.redirect || '/' })
        })
      })
    },
    /**
     * 收到新片段时，加入队列
     */
    enqueueText(text) {
      this.chunkCount++;

      // 规则1：前两个chunk逐字打印
      // 规则2：短文本（小于50字）逐字打印
      // 规则3：其他情况直接整块显示
      if (this.chunkCount <= 2 || text.length < 50) {
        this.typingQueue.push({ text, mode: "typewriter" });
      } else {
        this.typingQueue.push({ text, mode: "instant" });
      }

      if (!this.isTyping) {
        this.processQueue();
      }
    },
    /**
     * 按队列逐个打印
     */
    processQueue() {
      if (this.typingQueue.length === 0) {
        this.isTyping = false;
        return;
      }
      this.isTyping = true;

      const { text, mode } = this.typingQueue.shift();

      if(this.msgList.length === 0){
        return;
      }

      if (mode === "instant") {
        // 🚀 整块直接显示
        this.msgList[this.msgList.length - 1].text += text;
        this.processQueue();
      } else {
        // ⌨️ 打字机效果
        let i = 0;
        const interval = setInterval(() => {
          if (i < text.length) {
            this.msgList[this.msgList.length - 1].text += text.charAt(i);
            i++;
          } else {
            clearInterval(interval);
            this.processQueue();
          }
          this.scrollEleSmoothTop(true);
        }, 40); // 打字速度
      }
    },
    // 自适应加速模式的打字机逻辑
    async startTypingLoop() {
      if (this.isTyping) return;
      this.isTyping = true;

      const loop = async () => {
        let counter = 0;

        // let printed = 0;
        while (this.typingBuffer.length > 0) {
          // --- 随机打印一小段文字 ---
          const len = this.typingBuffer.length;
          let chunkSize = Math.floor(Math.random() * (this.maxChunkSize - this.minChunkSize + 1)) + this.minChunkSize;

          // 如果缓存太多，加速打印更多字
          if (len > 300) chunkSize = 8;
          else if (len > 100) chunkSize = 5;
          else if (len < 30) chunkSize = 2;

          const char = this.typingBuffer.slice(0, chunkSize);//this.typingBuffer.charAt(0);
          this.typingBuffer = this.typingBuffer.slice(chunkSize);
          //输出到最后一条消息
          this.msgList[this.msgList.length - 1].text += char;

          // 计算动态打字速度，自适应打印速度
          let delay = this.baseSpeed;

          if (this.adaptive) {
            const len = this.typingBuffer.length;

            // ⏱ 根据缓冲区长度加速：越多越快
            if (len > 300) delay = this.minSpeed;          // 大量积压 → 极速输出
            else if (len > 100) delay = this.baseSpeed * 0.6; // 稍快
            else if (len < 30) delay = this.baseSpeed * 1.2;
            //else delay = this.baseSpeed;

            // 💬 随机微扰，让感觉更自然
            delay += (Math.random() - 0.5) * 10;
            delay = Math.max(this.minSpeed, Math.min(this.maxSpeed, delay));
          }

          counter++;
          if (counter % 5 === 0) this.scrollEleSmoothTop(true); // 每5个字符滚一次

          //模拟思考，随机停顿
          // printed += chunkSize;
          // if (printed > 20 + Math.random() * 20) {
          //   await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
          //   printed = 0;
          // }
          await new Promise(r => setTimeout(r, delay));
        }
        // 缓冲区空了，结束打字状态
        this.isTyping = false;
      };

      loop();
    },
    //流式sse fetch请求
    async streamChat(prompt) {
      const res = await geminiStreamChat(prompt);
      //发送后，按钮不可用
      this.statusDisabled = true;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; // ✅ 缓冲区，避免 JSON 解析不完整
      let done = false;

      // this.chatDataPrompt.historyId = response.data.recordId;
      let listMsg = {
        align: "left",
        text: "",
        link: "",
        type: "text",
        time: new Date().getTime()
      };

      this.refreshChatReply(this.msgList, listMsg);

      while (!done) {
        // streamDone为后端数据结束标识
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          buffer += chunkText; // ✅ 拼接到缓冲区
          // 按换行符拆分
          const lines = buffer.split("\n");
          buffer = lines.pop(); // ✅ 最后一行可能是不完整的，留着下次继续拼
          // chunkText 可能包含多段，按换行或你定义的协议解析
          // 自行处理需要的数据
          // 假设后端每个 chunk 是 JSON：{ role, text }
          for (let line of lines) {
            if (line.startsWith("data:")) {
              let dataStr = line.replace("data:", "").trim();
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);

                if (data.text) {
                  // 👇 每次chunk追加到缓冲池
                  this.typingBuffer += data.text;
                  this.startTypingLoop(); // 如果未在运行则启动循环
                  // ✅ 把新片段放进队列，而不是直接打印
                  // this.enqueueText(data.text);
                  // 把 text 拼接到最后一条 AI 消息
                  //this.msgList[this.msgList.length - 1].text += data.text;
                }

                if (data.finished) {
                  this.statusDisabled = false;
                  this.msgList[this.msgList.length - 1].time = data.time;
                  //生成信息耗时
                  this.msgList[this.msgList.length - 1].elapsedMs = (data.elapsedMs / 1000).toFixed(3);
                  this.chatDataPrompt.historyId = data.recordId || null;
                  // this.playBase64PCMAudio(data.tts.data);
                  if (this.isTextVoice === true) {
                    this.startTTS(this.msgList[this.msgList.length - 1].text);
                  }
                }

              } catch (e) {
                this.statusDisabled = false;
                console.warn("解析 JSON 出错:", e, dataStr);
              }
            }
          }
        }
        await this.scrollEleSmoothTop(true);
      }
    },
    chatToJson(text) {
      var orgData = text.replace("event:message", "").trim().replace("data:", "");
      orgData = orgData.replace(/[^\x20-\x7E\u4E00-\u9FFF]+/g, "");
      let tempContent = JSON.parse(orgData);
      return tempContent;
    },
    //处理发送消息
    async handleMsg() {
      // if (this.inputChatMsg === "关闭语音") {
      //     this.isTextVoice = false;
      //     this.msgInfo("关闭语音回复功能");
      //     /*
      //      * 模拟信息返回
      //      */
      //     // setTimeout(async () => {
      //     //     let listMsg = {
      //     //         align: "left",
      //     //         text: "已关闭语音功能",
      //     //         link: "",
      //     //         type: '0'
      //     //     };
      //     //     await this.msgList.push(listMsg);
      //     //     await this.scrollEleSmoothTop();
      //     //     //this.loading = false;
      //     // }, 1000);
      // } else if (this.inputChatMsg === "开启语音") {
      //     this.isTextVoice = true;
      //     this.msgSuccess("开启语音回复功能");
      // } else
      if (this.inputChatMsg === "停止语音" || this.inputChatMsg === "停止播放" || this.inputChatMsg === "暂停播放" || this.inputChatMsg === "暂停回复语音" || this.inputChatMsg === "pause") {
        this.pauseTextAudio();
        //this.loading = false;
        this.msgInfo("停止回复语音");
      } else if (this.inputChatMsg === "继续语音" || this.inputChatMsg === "继续播放" || this.inputChatMsg === "继续回复语音" || this.inputChatMsg === "play") {
        this.playTextAudio();
        //this.loading = false;
        this.msgInfo("播放回复语音");
      } else if ((this.inputChatMsg && this.inputChatMsg.trim().length > 0)) { //!this.isOnlyNewlines(this.inputChatMsg)
        //this.loading = true;
        //在发送普通文本消息前把文件相关数据清空
        this.resetPromptFileData();
        //msgListToChatPromptList方法是在调用发送消息到后端前把之前所有的消息构造一个json作为历史消息记录
        this.msgListToChatPromptList(this.msgList);
        await this.showChatMsgList(this.msgList, { align: "right", text: this.inputChatMsg, type: "text", time: Date.now() });
        await this.scrollEleSmoothTop(true);
        this.getReplyMsg();
      }
      this.inputChatMsg = "";
      this.syncTextareaHeight(true);
    },
    //发送消息后获取消息回复
    getReplyMsg() {
      // axios处理自己的接口请求 返回需要的数据
      // axios.post("/getchatgpt",{ username:"You", data: this.inputChatMsg })
      //   .then(async (response) => { if (response.status == 200) {}
      //   }).catch(function (error) {
      // });
      //发送消息后显示消息加载中...
      this.beforeGetReplyRes();
      this.chatDataPrompt.tts = this.isTextVoice ? 1 : 0;
      if (this.isHistory === false) {
        // const formData = new FormData();
        // for(const key in dataParams) {
        //     formData.append(`${[key]}`, dataParams[key]);
        // }
        this.chatDataPrompt.historyChatData = null;
        // this.sendMessage(this.chatDataPrompt)
        this.streamChat(this.chatDataPrompt)
      } else {
        this.chatDataPrompt.historyChatData = this.historyChatData;
        // this.sendMessageChat(this.chatDataPrompt)
        this.streamChat(this.chatDataPrompt)
      }
    },
    //获取用户的历史聊天记录，默认是单username为guest时，查询并显示在聊天框中
    async getHistoryMag(username) {
      const that = this;
      getHistoryMessage({ username: username })
        .then(async (response) => {
          let msglist = response.data;
          //显示所有历史消息到消息列表
          await this.historyListToMsgList(msglist);
        }).catch(function (error) {
          // console.log(error);
          that.msgError(error);
        });
    },
    //获取所有聊天记录列表
    getAllHistoryChatMsg(name) {
      const that = this;
      getAllHistoryMessage({ username: name })
        .then(res => {
          this.historyChatMsgList = res.data;
        }).catch(error => {
          that.msgError(error);
        });
    },
    //根据 keyValue 获取一条会话；后端 Redis miss 时登录用户会从 DB 回填（见 API 仓 docs/18）
    getOneHistoryChatMsg(keyValue) {
      const _this = this;
      getOneHistoryMessage({ historyMsgKey: keyValue })
        .then(res => {
          this.msgList = [];
          this.historyListToMsgList(res.data);
        }).catch(error => {
          this.msgError(error);
        })
      this.chatDataPrompt.historyId = keyValue.split(':')[1];
    },
    //判断选择了哪一个消息记录
    selectedHistory(historyKey) {
      if (!historyKey || !this.chatDataPrompt.historyId) return false
      return String(historyKey).includes(this.chatDataPrompt.historyId);
    },
    /**
     * 侧边栏历史标题：historyMsg 有时是合法 JSON，有时被存成 HTML（如 &lt;p&gt;{&amp;quot;...}），
     * 模板里直接 JSON.parse 会炸渲染，统一走安全解析。
     */
    historyPreviewText(item) {
      const obj = this.safeParseHistoryMsg(item && item.historyMsg)
      let text = ''
      if (obj) {
        text = obj.text != null ? obj.text : (obj.content || obj.chatMsg || '')
      }
      // 去掉 HTML 标签，避免侧边栏出现标签碎片
      text = String(text || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim()
      return text ? text.substring(0, 45) : '（空消息）'
    },
    /** 安全解析单条历史消息（对象 / JSON 字符串 / HTML 包裹的 JSON） */
    safeParseHistoryMsg(raw) {
      if (raw == null || raw === '') return null
      if (typeof raw === 'object') return raw
      let s = String(raw).trim()
      // HTML 包裹：先剥标签，再还原常见实体
      if (s.charAt(0) === '<') {
        s = s.replace(/<[^>]+>/g, '')
      }
      if (s.indexOf('&quot;') !== -1 || s.indexOf('&amp;') !== -1) {
        s = s
          .replace(/&quot;/gi, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&amp;/gi, '&')
      }
      try {
        return JSON.parse(s)
      } catch (e) {
        const m = s.match(/\{[\s\S]*\}/)
        if (m) {
          try {
            return JSON.parse(m[0])
          } catch (e2) { /* ignore */ }
        }
        // 解析失败时把原文当标题，保证侧边栏仍可渲染
        return { text: s }
      }
    },
    // 根据keyValue删除一条聊天记录
    deleteOneHistoryChatMsg(keyValue) {
      const that = this;
      const h = this.$createElement;
      this.$msgbox({
        title: '删除聊天',
        message: h('p', null, [
          h('span', null, '这会删除这条聊天历史记忆。'),
          //h('i', { style: 'color: teal' }, 'VNode')
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            // 用户点击确认后的操作
            deleteOneHistoryMessage({ historyMsgKey: keyValue })
              .then(res => {
                done();
                instance.confirmButtonLoading = false;
                this.historyChatMsgList = this.removeArrayOneByKey(this.historyChatMsgList, "historyMsgKey", keyValue);
                //Array.isArray(this.historyChatMsgList)
                if (keyValue.includes(this.chatDataPrompt.historyId) || this.historyChatMsgList.length === 0) {
                  //清除现在的聊天数据
                  this.newChatAI();
                }
              }).catch(error => {
                done();
                instance.confirmButtonLoading = false;
                this.$message({
                  type: 'error',
                  message: error
                });
              });
            // setTimeout(() => {
            //   done();
            //   setTimeout(() => {
            //     instance.confirmButtonLoading = false;
            //   }, 300);
            // }, 3000);
          } else {
            done();
          }
        }
      });
      // .then(action => {
      //   this.$message({ type: 'success',
      //     message: '删除成功！' //+ action
      //   });
      // });
    },
    //发送消息和文件
    async sendWithFile() {
      var chatMsgObj = null;
      var mediaEle = "";
      if (this.chatDataPrompt.mediaMimeType.indexOf("image") !== -1) {
        //mediaEle = "<img src='" + this.tempFileUrl + "' >";
        chatMsgObj = { align: "right", text: this.chatDataPrompt.chatMsg, type: "image", mediaData: this.tempFileUrl, mediaFileName: this.chatDataPrompt.mediaFileName, mediaMimeType: this.chatDataPrompt.mediaMimeType, time: Date.now() };
      } else if (this.chatDataPrompt.mediaMimeType.indexOf("video") !== -1) {
        // mediaEle = `<video controls height="50" width="100%" :data="${this.tempFileUrl}">
        //     <source :src="${this.tempFileUrl}" type="audio/mpeg">
        //     <source :src="${this.tempFileUrl}" type="audio/ogg">
        //     <source :src="${this.tempFileUrl}" type="video/mp4">
        //     <source :src="${this.tempFileUrl}" type="video/ogg">
        // </video>`;
        chatMsgObj = { align: "right", text: this.chatDataPrompt.chatMsg, type: "video", mediaData: this.tempFileUrl, mediaFileName: this.chatDataPrompt.mediaFileName, mediaMimeType: this.chatDataPrompt.mediaMimeType, time: Date.now() };
      } else if (this.chatDataPrompt.mediaMimeType.indexOf("audio") !== -1) {
        chatMsgObj = { align: "right", text: this.chatDataPrompt.chatMsg, type: "audio", mediaData: this.tempFileUrl, mediaFileName: this.chatDataPrompt.mediaFileName, mediaMimeType: this.chatDataPrompt.mediaMimeType, time: Date.now() };
      } else {
        //mediaEle = "<a target='_blank' href='" + this.tempFileUrl + "'>" + this.chatDataPrompt.mediaFileName + "</a>"
        chatMsgObj = { align: "right", text: this.chatDataPrompt.chatMsg, type: "file", mediaData: this.tempFileUrl, mediaFileName: this.chatDataPrompt.mediaFileName, mediaMimeType: this.chatDataPrompt.mediaMimeType, time: Date.now() };
      }
      //let imgDiv=document.createElement("div").appendChild(this.convertBase64ToImage("base64Str")); this.chatDataPrompt.mediaData
      //msgListToChatPromptList方法是在调用发送消息到后端前把之前所有的消息构造一个json作为历史消息记录
      this.msgListToChatPromptList(this.msgList);
      await this.showChatMsgList(this.msgList, chatMsgObj);
      await this.scrollEleSmoothTop(true);
      this.getReplyMsg();
      // const formData =new FormData();
      // if(this.tempFileData!==null){
      //     formData.append('file', this.tempFileData);
      // }
      // // 对象（遍历添加）
      // for(const key in this.chatDataPrompt) {
      //     formData.append(`${[key]}`, this.chatDataPrompt[key]);
      // }
      // PlusDialog.hide();
      this.fileDialogVisible = false;
      //重置临时文件数据
      //this.tempFileData = null;
      this.chatDataPrompt.chatMsg = "";
    },
    sendMessage(dataParams) {
      const that = this;
      that.statusDisabled = true;
      //链式编程
      // new Promise((resolve, reject) => {
      //     //第一次网络请求
      //     setTimeout(() => {
      //     //resolve将拿到的参数传递给then处理
      //     resolve('hello');
      //     //reject('err err err');
      //     },1000);
      // }).then((data) => {
      //     //第一次网络请求后的处理
      //     console.log(data);
      // }).catch(err => {
      //     console.log(err);
      // });
      geminiAI(dataParams)
        .then(async (response) => {
          //console.log(response);
          //if (response.code == 200) {
          await that.handleResultTask(response);
          //}
        })
        .catch(function (error) {
          //reject(error);
          //console.log(error);
          that.msgError(error);
        });
    },
    sendMessageChat(dataParams) {
      const that = this;
      that.statusDisabled = true;
      geminiAIChat(dataParams)
        .then(async (response) => {
          //console.log(response);
          //if (response.code == 200) {
          await that.handleResultTask(response);
          //}
        })
        .catch(function (error) {
          //reject(error);
          that.msgError(error);
        });
      // return new Promise((resolve, reject) => {
      //     // 执行耗时操作
      //     // setTimeout(() => {
      //     // resolve('Task completed');
      //     // }, 5000); // 模拟耗时操作，延迟5秒
      // });
      // Choose a model that's appropriate for your use case.
      // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      // const prompt = "Write a story about a magic backpack.";

      // const result = await model.generateContentStream([prompt]);
      // // print text as it comes in
      // for await (const chunk of result.stream) {
      // const chunkText = chunk.text();
      // console.log(chunkText);
      // }
    },
    //在获取消息回复之前的临时等待或加载中，类似于进度条或加载转动圈
    beforeGetReplyRes() {
      //在获取请求响应前，设置一个临时加载显示的消息
      let listMsgTemp = { align: "left", text: "正在思考...", link: "", type: 'text', time: Date.now() };
      //推送到消息列表中
      this.showChatMsgList(this.msgList, listMsgTemp);
      //延迟一秒等内容已经包含在div消息列表框中，然后在进行滑动到底部
      this.delayFunction(() => {
        this.scrollEleSmoothTop();
      }, 300);
    },
    //处理回复响应的异步任务函数
    async handleResultTask(response) {
      let msg = "消息";
      let msgType = "0"
      // if (response.status && response.status == 500) {
      //     msg = "返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
      //     msgtype = "0";
      // }
      if (response.code == 500) {
        msg = "返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
        msgType = "0";
      } else if (response.code == 200) {
        // 自行处理需要的数据
        msg = response.data.text.trim();
        msgType = response.data.type;
        this.statusDisabled = false;
      }
      this.chatDataPrompt.historyId = response.data.recordId;
      let listMsg = {
        align: "left",
        text: msg,
        link: "",
        type: msgType,
        time: response.data.time
      };
      //if (msg.flag == 1) {
      // const splitMsg = msg.answer.split("：");
      // listMsg.text = splitMsg[0];
      // listMsg.link = splitMsg[1];
      // }
      if (this.isTextVoice === true) {
        this.startTTS(msg);
      }
      await this.refreshChatReply(this.msgList, listMsg);
      await this.scrollEleSmoothTop(true);
    },
    textInputEvent() {
      // 微信式：换行/删字都按 scrollHeight 伸缩，不只数 \\n
      this.syncTextareaHeight(false)
    },
    /**
     * 输入框高度随内容变化（微信式）；reset 用于发送后清空。
     * mobile 下 adjustLayout 读真实 footer 高度，避免重复减 textInputHeightAdd。
     */
    syncTextareaHeight(reset = false) {
      const el = this.textAreaInput || this.$refs.chatInput
      if (!el) return
      const minH = 40
      const maxH = 160
      if (reset || !String(this.inputChatMsg || '').length) {
        el.style.height = `${minH}px`
        el.style.overflowY = 'hidden'
      } else {
        el.style.height = 'auto'
        const next = Math.min(maxH, Math.max(minH, el.scrollHeight))
        el.style.height = `${next}px`
        el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden'
      }
      this.textInputHeightAdd = Math.max(0, el.offsetHeight - minH)
      this.$nextTick(() => this.adjustLayout())
    },
    //键盘输入enter键事件
    keyDownEvent(e) {
      let keyC = window.event.keyCode || e.keyCode; //这里是键盘的ASCLL码值，13为回车值
      //let key = window.event.key || event.key;//新的key时表示为键盘的具体值
      //只有在移动和平板设备上(<992px)才无法使用enter直接发送
      //而在桌面(this.windowWidth >= 992)，使用非shift键和enter键在能发送，否则就是换行
      if (!this.isMobile()) {
        if (keyC == 13 && !e.shiftKey) {
          //只有enter没有shift，或进行你的其他逻辑
          e.preventDefault(); // 阻止默认行为，即不换行
          // 13是enter键的键盘码 如果等于13 就调用click的登录方法
          this.handleMsg();
        }
      }
      // else if(keyC == 13 && e.shiftKey){
      //     // 这里实现换行
      //     console.log(this.inputChatMsg.length);
      //     if(this.inputChatMsg!='' && this.inputChatMsg.length > 0){
      //         this.inputChatMsg+="\n";
      //     }
      // }
    },
    //重置文件数据为空，防止发送普通文本消息时携带
    resetPromptFileData() {
      this.chatDataPrompt.mediaData = null;
      this.chatDataPrompt.mediaMimeType = null;
      this.chatDataPrompt.mediaFileName = null;
    },
    //上传文件事件
    async uploadDataFileEvent(e) {
      const URL = window.URL || window.webkitURL;
      var file = null;
      //this.formData.append("file", file.file);
      const items = e.target.files;
      if (items && items.length) {
        // for (let i = 0; i < items.length; i++) {}
        file = items[0];
        // 计算文件大小
        // let fileSize = file.size / 1024 / 1024; // 将文件大小从字节转换为MB
        // fileSize = Math.round(fileSize * 100) / 100; // 保留两位小数
        // if(fileSize > 100){
        //     this.msgError("文件超过100MB！");
        //     return;
        // }
        this.chatDataPrompt.mediaMimeType = file.type;
        this.chatDataPrompt.mediaFileName = file.name;
        // // 通过 file 生成目标 url。URL.createObjectURL(file);
        const tempURL = URL.createObjectURL(file);
        this.tempFileUrl = tempURL;
        // 在这里处理base64数据
        // 创建FileReader读取文件
        // const reader = new FileReader();
        // reader.onload = (e) => {
        //     const base64 = e.target.result;
        //     this.chatDataPrompt.mediaData = base64;
        //     console.log(base64)
        //     // 在这里处理base64数据
        //     //let baseArr=base64.split(",");
        //     // 拿到文件对象后，先上传或先展示都行，这里以图片进行举例
        //     // 如果是直接上传服务器，那可以拿到图片地址直接使用
        //     // 如果不进行上传，先展示，等点击确定在上传，那就自己创建一个链接进行使用
        //     // const windowURL = window.URL || window.webkitURL
        //     tempURL = URL.createObjectURL(file);
        // };
        // reader.readAsDataURL(file);
        // if ((file.type.indexOf('application/vnd') !== -1 || file.type.indexOf('application/ms') !== -1)) {
        //     this.tempFileUrl = tempURL;
        //     let domObject = '<embed src="' + tempURL + '" type="application/*" width="100%" height="100%">该浏览器不支持office.请点击查看:<a href="' + tempURL + '">Download Office File</a>.</p></embed>';
        //     //let domObject='<embed src="'+base64+'" width="100%" height="100%" type="application/pdf"></embed>'
        //     document.getElementById("fileData").innerHTML = domObject;
        //     $('#chatDataModal').modal();
        // }
        if (file.type.indexOf('image') !== -1 && file.type.indexOf('adobe') === -1) {
          this.chatDataPrompt.mediaData = await fileToBase64(file);
          // this.tempFileUrl = tempURL;
          // 显示裁剪框，传入配置选项
          PlusCropper.show({
            imageSrc: tempURL
            // ... 其他选项
          });
          // 设置裁剪回调函数
          PlusCropper.onCrop((croppedImageDataURL) => {
            //console.log("Plus裁剪后的图片数据：", croppedImageDataURL);
            // 可以在这里将裁剪后的图片数据上传到服务器或者进行其他操作
            this.chatDataPrompt.mediaData = croppedImageDataURL;
            URL.revokeObjectURL(this.tempFileUrl);
            this.tempFileUrl = URL.createObjectURL(base64ToBlob(croppedImageDataURL));
          });
        } else if ((file.type.indexOf('json') !== -1 || file.type.indexOf('xml') !== -1 || file.type.indexOf('text') !== -1)) {
          this.chatDataPrompt.mediaData = await fileToBase64(file);
          // this.tempFileUrl = tempURL;
          const domObject = '<object controls height="100%" width="100%" data="' + tempURL + '">' +
            '<source src="' + tempURL + '" type="audio/mpeg">' +
            '<source src="' + tempURL + '" type="audio/ogg">' +
            '<embed height="50" width="100" src="' + tempURL + '">' +
            //'<object height="50" width="100" data="'+tempURL+'"></object>'+
            '</object>';
          //let domObject = '<object data="' + tempURL + '" type="application/pdf" width="100%" height="100%">该浏览器不支持PDF.请点击查看:<a href="' + tempURL + '">Download PDF</a>.</p></object>';
          //let domObject='<embed src="'+base64+'" width="100%" height="100%" type="application/pdf"></embed>'
          // document.getElementById("fileData").innerHTML = domObject;
          this.filePreview = domObject;
          // PlusDialog.show({ onlyCloseBtn: true });
          this.fileDialogVisible = true;
        } else if ((file.type.indexOf('audio') !== -1 || file.type.indexOf('video') !== -1)) {
          this.chatDataPrompt.mediaData = await fileToBase64(file);
          // this.tempFileUrl = tempURL;
          const tempFile = '<video controls height="50" width="100%" data="' + tempURL + '">' +
            '<source src="' + tempURL + '" type="audio/mpeg">' +
            '<source src="' + tempURL + '" type="audio/ogg">' +
            '<source src="' + tempURL + '" type="video/mpeg">' +
            '<source src="' + tempURL + '" type="video/ogg">' +
            '<embed height="50" width="100" src="' + tempURL + '">' +
            '</video>';
          // document.getElementById("fileData").innerHTML = tempFile;
          this.filePreview = tempFile;
          // PlusDialog.show({ onlyCloseBtn: true });
          this.fileDialogVisible = true;
        } else {
          this.msgInfo("不支持的文件类型！仅支持支持图片，视频，音频，文本等");
        }
      }
      //const imageUrl = 上传七牛云后返回来的一串在线链接
      // if (e.target.files.length == 1) {
      //     let file = e.target.files[0];
      //     //var file=document.querySelector("#uploadFile")[0].value;
      //     let formData = new FormData();
      //     formData.append("file", file);
      // } else {
      //     let fileList = e.target.files;
      //     for (var i = 0; i < fileList.length; i++) {
      //         let formData = new FormData();
      //         var elFile = fileList[i];
      //         formData.append("file", elFile);
      //         //formData.append("file", new Blob(file)); //this.fileList[0].raw);//拿到存在fileList的文件存放到formData中
      //         //下面数据是我自己设置的数据,可自行添加数据到formData(使用键值对方式存储)
      //         // 解析上传的文件
      //         //let file = this.fileList[0]
      //     }
      // }
      e.target.value = '';
    },
    //输入框粘贴事件处理函数
    pastingData(event) {
      const URL = window.URL || window.webkitURL
      // 输入框粘贴
      //let excelArr = ['text/plain', "text/html", "text/rtf", "image/png"];//excel格式
      var file = null;
      // 获取剪切板图片、视频、文件、文件夹
      const items = (event.clipboardData || window.clipboardData).files;
      if (items && items.length) {
        // const item = items[0];
        // if (item.kind === 'file' && item.type.startsWith('image/'))
        for (let i = 0; i < items.length; i++) {
          // console.log(items[i]);
          file = items[i] || items[i].getAsFile();
          // let fileSize = file.size / 1024 / 1024; // 将文件大小从字节转换为MB
          // fileSize = Math.round(fileSize * 100) / 100; // 保留两位小数
          // if(fileSize > 100){ this.msgError("文件超过100MB！"); return; }
          // 拿到文件对象后，先上传或先展示都行，这里以图片进行举例
          // 如果是直接上传服务器，那可以拿到图片地址直接使用
          // 如果不进行上传，先展示，等点击确定在上传，那就自己创建一个链接进行使用
          const tempUrl = URL.createObjectURL(file);
          this.tempFileUrl = tempUrl;
          this.chatDataPrompt.mediaMimeType = items[i].type;
          this.chatDataPrompt.mediaFileName = items[i].name;
          //items[i].kind === 'file' &&
          if ((items[i].type.indexOf('image') !== -1 && items[i].type.indexOf('adobe') === -1)) {
            // 创建FileReader读取图片
            const reader = new FileReader();
            reader.onload = (e) => {
              // 在这里处理base64数据
              const base64 = e.target.result;
              this.chatDataPrompt.mediaData = base64;
              // const fileData = base64ToBlob(base64);
              // let clip = new CropImg({width: 300, height:220}) // 设置裁剪的比例
              // clip.init(fileData, res => { // 需要将裁剪的图片文件传入，既可以触发裁剪
              //     // 裁剪按钮 点击后会触发此函数，传入的res是裁剪后的文件,可以上传，也可以自己手动转成url显示
              //     var tempUrl = URL.createObjectURL(res)
              // })
              // 重新绘制图片，自定义长宽
              // this.resizeImage(tempUrl, 300, 200, function(resizedImgSrc) {
              //     // 在这里处理新尺寸的图片数据
              //     const img = document.createElement('img');
              //     img.src = resizedImgSrc;
              //     document.getElementById("fileData").appendChild(img);
              // });
              // 显示裁剪框，传入配置选项
              PlusCropper.show({
                imageSrc: this.tempFileUrl
                // ... 其他选项
              });
              // 设置裁剪回调函数
              PlusCropper.onCrop((croppedImageDataURL) => {
                //console.log("Plus裁剪后的图片数据：", croppedImageDataURL);
                // 可以在这里将裁剪后的图片数据上传到服务器或者进行其他操作
                this.chatDataPrompt.mediaData = croppedImageDataURL;
                URL.revokeObjectURL(this.tempFileUrl);
                this.tempFileUrl = URL.createObjectURL(base64ToBlob(croppedImageDataURL));
              });
            };
            reader.readAsDataURL(file);
            break;
          } else if ((items[i].type.indexOf('json') !== -1 || items[i].type.indexOf('xml') !== -1 || items[i].type.indexOf('text') !== -1)) {
            // 创建FileReader读取图片
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
              // 在这里处理base64数据
              const base64 = e.target.result;
              this.chatDataPrompt.mediaData = base64;
              const domObject = '<object controls height="100%" width="100%" data="' + tempUrl + '">' +
                '<source src="' + tempUrl + '" type="audio/mpeg">' +
                '<source src="' + tempUrl + '" type="audio/ogg">' +
                '<embed height="50" width="100" src="' + tempUrl + '">' +
                '</object>';
              //let domObject = '<object data="' + tempUrl + '" type="application/pdf" width="100%" height="100%">该浏览器不支持PDF.请点击查看:<a href="' + tempUrl + '">Download PDF</a>.</p></object>';
              //let domObject='<embed src="'+base64+'" width="100%" height="100%" type="application/pdf"></embed>'
              // document.getElementById("fileData").innerHTML = domObject;
              this.filePreview = domObject;
              // PlusDialog.show({ onlyCloseBtn: true });
              this.fileDialogVisible = true;
            };
            break;
          } else if ((items[i].type.indexOf('audio') !== -1 || items[i].type.indexOf('video') !== -1)) {
            // 创建FileReader读取图片
            const reader = new FileReader();
            reader.onload = (e) => {
              // 在这里处理base64数据
              const base64 = e.target.result;
              this.chatDataPrompt.mediaData = base64;
              const tempFile = '<video controls height="50" width="100%" data="' + tempUrl + '">' +
                '<source src="' + tempUrl + '" type="audio/mpeg">' +
                '<source src="' + tempUrl + '" type="audio/ogg">' +
                '<source src="' + tempUrl + '" type="video/mpeg">' +
                '<source src="' + tempUrl + '" type="video/ogg">' +
                '<embed height="50" width="100" src="' + tempUrl + '">' +
                //'<object height="50" width="100" data="'+tempUrl+'"></object>'+
                '</video>';
              // document.getElementById("fileData").innerHTML = tempFile;
              this.filePreview = tempFile;
              // PlusDialog.show({ onlyCloseBtn: true });
              this.fileDialogVisible = true;
            };
            reader.readAsDataURL(file);
            break;
          } else {
            const txt = event.clipboardData.getData('Text');
            if (typeof (txt) === 'string') {
              if (txt.length > 9048570) {
                return false;
              }
            }
            break;
          }
        }
      }
    },
    handleAIMessageScroll(e) {
      // console.log(e)
    },
    getRoundedCanvas(sourceCanvas) {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var width = sourceCanvas.width;
      var height = sourceCanvas.height;

      canvas.width = width;
      canvas.height = height;

      context.imageSmoothingEnabled = true;
      context.drawImage(sourceCanvas, 0, 0, width, height);
      context.globalCompositeOperation = 'destination-in';
      context.beginPath();
      context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
      context.fill();

      return canvas;
    },
    /**
     * @param blob      BLOB对象
     * @param base64    base64字符串
     */
    cutChange({ blob, base64 }) {
      //console.log(blob);
      this.tempFileUrl = window.URL.createObjectURL(blob);
      this.chatDataPrompt.mediaData = base64;
    },
    toggleMenu() {
      // const menuDrawer = document.getElementById("menuDrawer");
      // menuDrawer.classList.toggle("open");
      this.menuOpen = !this.menuOpen;
    },
    outSideCloseMenu(e) {
      // 判断点击区域是否在 menu-drawer 之外
      if (this.menuOpen && (!this.$el.querySelector('.menu-drawer').contains(e.target) && !this.$el.querySelector('.chat-box-header').contains(e.target))) {
        this.menuOpen = false;
      }
    },
    setHistoryChat() {
      if (this.isHistory) {
        this.isHistory = false;
      } else {
        this.isHistory = true;
      }
    },
    setTextVoice() {
      if (this.isTextVoice) {
        this.isTextVoice = false;
      } else {
        this.isTextVoice = true;
      }
    },
    setTheme() {
      if (this.darkTheme && this.darkTheme == true) {
        document.body.setAttribute("theme-mode", "light");
        this.$store.commit('changeDarkMode', false);
        // this.setCookieStorage("theme-mode","dark",{ expires: 17 });
      } else {
        document.body.setAttribute("theme-mode", "dark");
        this.$store.commit('changeDarkMode', true);
        // this.setCookieStorage("theme-mode","light",{ expires: 17 });
      }
    },
    startAndStopRecording() {
      let that = this;
      //recording为0表示开始录音
      if (that.recording == 0) {
        that.startRecordAudio();
        that.recording = 1;
        that.recordingTxt = "结束"
      }
      //recording为1表示结束录音
      else if (that.recording == 1) {
        that.stopRecordAudio();
        that.recording = 0;
        that.recordingTxt = "语音"
      }
    },
    /**
     * 获取麦克风权限
     * */
    getPermission() {
      Recorder.getPermission().then(() => {
        this.msgSuccess('获取权限成功')
      }, (error) => {
        console.log(`${error.name} : ${error.message}`);
      });
    },
    //开始录音 startRecordAudio
    startRecordAudio() {
      Recorder.getPermission().then(
        () => {
          //console.log("开始录音");
          this.recorder.start(); // 开始录音
        },
        (error) => {
          console.log(`${error.name} : ${error.message}`);
          this.msgInfo("请先允许该网页使用麦克风");
        }
      );
    },
    //停止录音
    stopRecordAudio() {
      // console.log("停止录音");
      this.recorder.stop();
      /**setTimeout(async () => {
        await this.playRecordAudio();
      }, 2000);*/
      //this.getPCMRecordAudioData();
      this.getRecorderToText()
    },
    // 继续录音
    resumeRecordAudio() {
      this.recorder.resume()
    },
    // 暂停录音
    pauseRecordAudio() {
      this.recorder.pause();
    },
    //播放录音
    playRecordAudio() {
      // console.log("播放录音");
      this.recorder.play();
    },
    // 暂停录音播放
    pausePlayRecordAudio() {
      this.recorder.pausePlay()
    },
    // 恢复录音播放
    resumePlayRecordAudio() {
      this.recorder.resumePlay()
    },
    // 停止录音播放
    stopPlayRecordAudio() {
      this.recorder.stopPlay();
    },
    // 销毁录音Recorder
    destroyRecordAudio() {
      this.recorder.destroy().then(function () {
        this.recorder = null;
      });
    },
    //获取PCM录音数据
    getPCMRecordAudioData() {
      let that = this;
      let toltime = this.recorder.duration; //录音总时长
      let fileSize = this.recorder.fileSize; //录音总大小
      var pcmBlob = this.recorder.getPCMBlob();
      let channel = this.recorder.getChannelData(); //获取左声道和右声道音频数据
      //console.log(pcmBlob);
    },
    //获取WAV录音数据
    getWAVRecordAudioData() {
      var wavBlob = this.recorder.getWAVBlob();
      //console.log(wavBlob);
    },
    //下载PCM录音文件
    downloadPCBRecordAudioData() {
      this.recorder.downloadPCM("maike");
    },
    //下载WAV录音文件
    downloadWAVRecordAudioData() {
      this.recorder.downloadWAV("maike");
    },
    //发送消息立刻推送一个临时消息加载中提示到消息显示列表，作为缓冲过渡
    async showChatMsgList(chatMsgList, chatMsgObj) {
      chatMsgList.push(chatMsgObj);
    },
    //接受回复消息显示在消息列表
    async refreshChatReply(chatMsgList, chatMsgObj) {
      if (chatMsgObj) {
        chatMsgList.pop();
        chatMsgList.push(chatMsgObj);
      }
    },
    // 延时函数
    delayFunction(fn, delay) {
      setTimeout(fn, delay);
    },
    //重新调整布局，在页面变化时
    adjustLayout() {
      const headerH = 52;
      const footer = this.$el && this.$el.querySelector
        ? this.$el.querySelector('.chat-box-footer')
        : document.querySelector('.chat-box-footer');
      // footer 已含输入框实际高度，勿再减 textInputHeightAdd（会双扣）
      const footerH = (footer && footer.offsetHeight) || 72;
      this.chatBoxHeight = Math.max(180, this.windowHeight - headerH - footerH);
    },
    // 处理滚动条一直保持最上方,也就让内容处于最底部contentAtBottom
    async scrollEleSmoothTop(isSmooth = false) {
      await this.$nextTick(); // 等 DOM 更新
      var div = this.$refs.chatBox || document.getElementById("big-chat-box");
      if (!div) return;
      if (isSmooth) {
        this.smoothScrollToBottom(div, 1000);
      } else {
        div.scrollTop = div.scrollHeight;
      }
    },
    // 布局断点：≥900 桌面平铺侧栏；<900 抽屉。不用 UA，避免平板横屏误判。
    isMobile() {
      const w = this.windowWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
      return w < 900;
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    onNewChat() {
      this.newChatAI();
      if (this.mobileChatdisplay) this.closeSidebar();
    },
    onSelectHistory(key) {
      this.getOneHistoryChatMsg(key);
      if (this.mobileChatdisplay) this.closeSidebar();
    },
    domObserverEvent(targetNode) {
      // 选择目标节点
      //const targetNode = document.getElementById('id_target');

      // 创建一个观察者对象
      const observer = new MutationObserver(function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              // console.log('新创建的节点: ', node);
            });
            mutation.removedNodes.forEach(node => {
              // console.log('被删除的节点: ', node);
            });
          }
        }
      });

      // 观察者的配置（观察目标节点的子节点的变化）
      const config = { attributes: false, childList: true, subtree: false };

      // 传入目标节点和观察选项并开始观察
      observer.observe(targetNode, config);
    },
    //内容顺滑滚动到顶部
    smoothScrollToTop(element, duration, topPosition = null) {
      // 获取当前的top值
      const startPosition = element.scrollTop;
      if (!topPosition) {
        //不存在具体滚动的位置，默认滚动到元素顶部
        topPosition = -startPosition;
      }
      const startTime = performance.now();

      const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };

      const animateScroll = () => {
        const currentTime = performance.now();
        const time = Math.min(currentTime - startTime, duration);
        const newTop = easeInOutQuad(time, startPosition, topPosition, duration);

        element.scrollTop = newTop;

        if (time < duration) {
          window.requestAnimationFrame(animateScroll);
        }
      };

      window.requestAnimationFrame(animateScroll);
    },
    //内容顺滑滚动到底部,或接近底部任意一处
    smoothScrollToBottom(element, duration, endPosition = null) {
      // 获取当前的top值
      const startPosition = element.scrollTop;
      if (!endPosition) {
        //不存在滚动到什么位置，默认就往下滚动到元素最底部，也就元素的scrollHeight
        endPosition = element.scrollHeight;
      }
      const startTime = performance.now();

      const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };

      const animateScroll = () => {
        const currentTime = performance.now();
        const time = Math.min(currentTime - startTime, duration);
        const newScrollHeight = easeInOutQuad(time, startPosition, endPosition, duration);

        element.scrollTop = newScrollHeight;

        if (time < duration) {
          window.requestAnimationFrame(animateScroll);
        }
      };

      window.requestAnimationFrame(animateScroll);
    },
    easeInOutQuad(t, b, c, d) {
      // 判断当前时间是否总在总时间的一半以内，是的话执行缓入函数，否则的话执行缓出函数
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b
      } else {
        // 将总长度设置为一半，并且时间从当前开始递减，对图像进行垂直向上平移
        return -c / 2 * (--t * (t - 2) - 1) + b
      }
    },
    clearBlank(value) {
      if (value) {
        value = value.replace(/\s/g, "")
      }
      return value
    },
    timeout(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('error')
        }, ms); //reject模拟出错，返回error
      });
    },
    //消除字符串中的空格换行等特殊字符
    tansf(e) {
      let a = (e + '').replace(/[]/g, "") // 去空格
      a = (a + '').replace(/[\r\n]/g, "") //去回车
      return a
    },
    //去除换行符
    keepTextStyle(val) {
      //console.log(val)
      //console.log(typeof val)
      //console.log((typeof val) != 'undefined')
      return (val + '').replace(/\n/g, "<br/>")
    },
    //开始文字转语音
    startTTS(text) {
      var that = this;
      //const baseUrl = process.env.VUE_APP_BASE_API
      // 调用语音合成接口
      // 参数含义请参考 https://ai.baidu.com/docs#/TTS-API
      /*axios
      .post("https://tsn.baidu.com/text2audio?tex="+text+"&lan=zh&cuid=maike&ctp=1&tok=35435436")
      .then(async (response) => {
        console.log(response)
        let audioBuffer=null;
        var audioContext=new (window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext)();
        var source = audioContext.createBufferSource();
        await audioContext.decodeAudioData(
            new ArrayBuffer(response.data),
            buffer => {
              audioBuffer = buffer;
            },
            error => console.log("===ERROR===", error)
        )
        source.buffer = audioBuffer;
        source.loop = true; //循环播放
        source.connect(audioContext.destination);
        source.start(0); //立即播放
        //this.textAudio = new Audio(response.data);
        //mp3.play(); //播放 mp3这个音频对象
        //this.playTextAudio()
      }).catch(function (error) {
        console.log(error);
      });*/
      that.textAudio = new Audio();
      that.textAudio.onloadeddata = function () {
        that.textAudio.play();
      };
      // that.textAudio.src = res; // put your url here
      // that.textAudio.play();
      //var url = "https://tsn.baidu.com/text2audio?tex=" + text + "&lan=zh&cuid=c211ccc3407c45038492e623bb358524&ctp=1&tok=24.e3cd3b426636b471a2f288cebadca276.2592000.1719346650.282335-30837213";
      //var url = baseUrl + "/translate/ttsZH_CN?ttsText="+text;
      //var url = baseUrl + "/translate/ttsZH_CN";
      // axios({ method: 'post', url: url, data: { ttsText: text },
      //   // params:queryParams,
      //   responseType: 'blob',
      //   //headers: { 'Plus-Token': getToken() }//'Bearer ' +
      // })
      getGeminiTTS({ text: text, voiceName: "Kore" }).then(async (res) => {
        // console.log(res)
        // 从响应中获取文件数据
        const fileData = res.data.data;
        // 创建一个Blob对象
        //const blob = new Blob([fileData], { type: "audio/mpeg" });
        // 生成文件URL
        //const downloadUrl = URL.createObjectURL(fileData);
        //console.log(downloadUrl)
        // var audioContext = new AudioContext();
        // audioContext.decodeAudioData(res.data, function(buffer) {
        // var source = audioContext.createBufferSource();
        // source.buffer = buffer;
        // source.connect(audioContext.destination);
        // source.start(0);
        // });
        //that.textAudio.src = downloadUrl; // put your url here
        that.playBase64PCMAudio(fileData);
      })
      //that.textAudio.play();
    },
    playBase64PCMAudio(base64) {
      const arrayBuffer = this.base64ToArrayBuffer(base64);
      const audioBuffer = this.decodePCM(arrayBuffer);
      this.playDecodedAudio(audioBuffer);
    },
    base64ToArrayBuffer(base64) {
      const binaryString = window.atob(base64);//window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    },
    decodePCM(buffer, sampleRate = 24000) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = audioContext.createBuffer(1, buffer.byteLength / 2, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      const view = new DataView(buffer);

      for (let i = 0; i < buffer.byteLength; i += 2) {
        channelData[i / 2] = view.getInt16(i, true) / 32768.0;  // 16位有符号转浮点
      }
      return audioBuffer;
    },
    playPCM(arrayBuffer) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(arrayBuffer, function (buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }, function (e) {
        console.error('解码音频数据失败', e);
      });
    },
    playDecodedAudio(audioBuffer) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    },
    getRecorderToText() {
      let that = this;
      // 创建一个formData对象
      var formData = new FormData()
      let voiceData;
      var pcmBlob = this.recorder.getPCMBlob();
      //console.log(pcmBlob);
      /** var reader = new FileReader() //生成FileReader实例
      reader.readAsArrayBuffer(pcmBlob) //取出blob或者File文件的二进制原始数据
      reader.onload = function (da) { //有一个异步回调
        let yy = new Uint8Array(da.target.result) //后端需要的二进制格式
        let endd = [...yy] //后端需要的格式，我们改造成数组
        console.log(endd);
        voiceData = yy; //保存到变量中，保存的就是我们需要的二进制数据
      } */
      // 此处获取到blob对象后需要设置fileName满足当前项目上传需求，其它项目可直接传把blob作为file塞入formData
      const newbolb = new Blob([pcmBlob], { type: 'audio/pcm' })
      //获取当时时间戳作为文件名
      const fileOfBlob = new File([newbolb], new Date().getTime() + '.pcm')
      formData.append('file', fileOfBlob)
      //console.log(formData);
      //上传wav录音数据

      uploadVoiceBlob(formData)
        .then(async (response) => {
          //console.log(response.data.data)
          //let text=response.data.data.result[0]
          that.inputChatMsg = response.data.data.result[0];
          that.handleMsg()
        }).catch(function (error) {
          // console.log(error);
          this.msgError(error);
        });
    },
    // 播放文字转语音的按钮
    playTextAudio() {
      var that = this;
      if (that.textAudio === null) {
        alert('请先点击合成')
      } else {
        that.textAudio.play();
      }
    },
    // 暂停播放文字转语音按钮
    pauseTextAudio() {
      var that = this;
      if (that.textAudio === null) {
        //console.log('请先合成音频')
      } else {
        that.textAudio.pause();
      }
    },
    // 暂停播放文字转语音按钮
    stopTextAudio() {
      var that = this;
      if (that.textAudio === null) {
        //console.log('没有语音，请先合成')
      } else {
        that.textAudio.stop();
      }
    },
    startAudio(txt) {
      var msg = new SpeechSynthesisUtterance();
      var voicePack = speechSynthesis.getVoices();
      speechSynthesis.cancel();
      msg.text = txt
      msg.volume = 1 //音量
      msg.rate = 1 //语速
      //msg.voice =
      msg.lang = 'zh-cn'
      speechSynthesis.speak(msg);
    },
    openMsg() {
      const h = this.$createElement;
      var msgContent = h('div', { style: 'color: #eaebec' }, [
        h('div', { style: 'text-align: center' }, 'AI助手小提示:'),
        h('div', null, '临时用户聊天记录保存24小时，登录之后可以享受聊天记录保存'),
        h('div', null, '图片，视频，音频，文本等文件支持粘贴发送：复制粘贴到发送消息框中，即可对文件进行分析！')
      ]);
      //三种主题:toasted-primary,bubble,outline
      // let msgContent = "<div>增加语音回复与语音输入：(默认关闭语音回复)启用请发送”开启语音“，关闭发送“关闭语音”，发送“暂停播放”、“暂停”、“stop”实现停止播放语音，发送“继续播放”、“继续”、“play”可继续播放语音。左下角语音输入功能已更新！点击语音，然后结束！就可以发送语音文字！</div></div>";
      this.msgInfo(msgContent, {
        icon: null
      });
      // 显示确认取消消息框使用方法
      // this.$PlusToast.confirm("确定要删除吗？", {
      //     icon: "success",//主要有success，error，warning，info四个
      //     type: "success",//消息显示样式类型，success，error，warning，info，dark，light
      //     onConfirm: () => {
      //         // 用户点击确认后的操作
      //         console.log("用户点击了确认");
      //     },
      //     onCancel: () => {
      //         // 用户点击取消后的操作
      //         console.log("用户点击了取消");
      //     },
      //     cancelText: "不", // 自定义取消按钮文本
      //     confirmText: "是的", // 自定义确认按钮文本
      // });
    },
    // setOpenAiKey() {
    //     this.$prompt('请输入openAiKey', '提示', {
    //         confirmButtonText: '确定',
    //         cancelButtonText: '取消',
    //         inputPattern: /^sk-[\w]+$/,
    //         inputErrorMessage: 'openAiKey格式不正确'
    //     }).then(({ value }) => {
    //         this.msgSuccess('你的openAiKey是: ' + value, {
    //             duration: 3000,
    //             type: "dark",
    //         });
    //         this.openAiKey = value;
    //     }).catch(() => {
    //         this.msgInfo("取消输入", {
    //             duration: 3000,
    //             type: "dark",
    //         });
    //     });
    // },
    convertBase64ToImage: (data) => {
      // 创建一个新的图片元素
      //var img = document.createElement('img');
      const img = new Image();
      img.src = data;
      var imgWidth = img.width;
      var imgHeight = img.height;
      var windowWidth = window.innerWidth;
      var windowHeight = window.innerHeight;
      var scale = Math.min(windowWidth / imgWidth, windowHeight / imgHeight);
      // 设置图片的宽度和高度
      img.style.width = '95%'; // 或者使用CSS像素值
      img.id = "tempElement";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = imgWidth * scale + "px";
        canvas.height = imgHeight * scale + "px";
        context.drawImage(img, 0, 0);
        const imageURL = canvas.toDataURL('image/png');
      };
      return img;
    },
    //重新调整图片尺寸
    resizeImage(src, newWidth, newHeight, callback) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        // 重绘图片
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        const resizedImgSrc = canvas.toDataURL('image/png'); // 或者其他格式
        callback(resizedImgSrc);
      };
      img.src = src;
    },
    resizeImg(img) {
      // 获取窗口宽度和高度
      var windowWidth = window.innerWidth;
      var windowHeight = window.innerHeight;

      // 获取图片原始宽度和高度
      var imgWidth = img.naturalWidth;
      var imgHeight = img.naturalHeight;
      // 计算缩放比例
      var scale = Math.min(windowWidth / imgWidth, windowHeight / imgHeight);

      // 设置图片宽度和高度
      img.style.width = imgWidth * scale + "px";
      img.style.height = imgHeight * scale + "px";
    },
    convertImageToBase64(imgUrl) {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      let dataUrl = ''
      return new Promise((resolve, reject) => {
        image.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.height = image.naturalHeight
          canvas.width = image.naturalWidth
          ctx.drawImage(image, 0, 0)
          dataUrl = canvas.toDataURL()
          //通过resolve将返回值返回
          resolve(dataUrl)
        }
        image.src = imgUrl
      })
    },
    // 假设这个函数会在某个事件监听器中调用，比如点击按钮时
    checkStringAndAllowEvent(str, callbackY, callbackN) {
      // 使用trim去除字符串首尾空白，然后检查长度
      if (str && str.trim().length > 0) {
        // 字符串不为空，允许执行事件
        //console.log('字符串不为空，允许执行事件');
        // 调用第一个回调函数
        // if (typeof callbackY === 'function') {
        //     callbackY();
        // }
        callbackY();
        // 这里执行允许的事件代码
      } else {
        // 字符串为空，阻止执行事件
        //console.log('字符串为空，阻止执行事件');
        // if (typeof callbackN === 'function') {
        //     callbackN();
        // }
        callbackN();
        // 阻止事件的代码，比如event.preventDefault()或return false
      }
    },
    //根据key值判断是否有重复的值然后移除
    removeDuplicatesByKey(array, key) {
      const seen = new Set();
      return array.filter((item) => {
        const keyValue = item[key];
        return seen.has(keyValue) ? false : seen.add(keyValue);
      });
    },
    //根据key和值移除一个数组项
    removeArrayOneByKey(array, key, keyValue) {
      return array.filter(item => item[key] !== keyValue);
    },
    //遍历数组，把里面的每一条消息记录添加显示在消息页面中的msgList
    historyListToMsgList(msgArr) {
      const len = (msgArr && msgArr.length) || 0;
      for (var i = 0; i < len; i++) {
        // 与侧边栏一致：兼容脏 HTML / 已是对象的历史条目
        var oneMsg = this.safeParseHistoryMsg(msgArr[i]);
        if (!oneMsg) continue;
        if (!oneMsg.type) oneMsg.type = 'text';
        if (!oneMsg.align) oneMsg.align = 'left';
        if (oneMsg.text == null) oneMsg.text = '';
        this.msgList.push(oneMsg);
      }
      if (this.msgList.length) {
        this.delayFunction(() => {
          this.scrollEleSmoothTop();
        }, 300);
      }
    },
    //遍历聊天记录数组，把里面的每一条json字符串构造为ChatPrompt中聊天历史记录List
    //在发送消息前把之前所有的消息构造一个json作为历史消息记录
    msgListToChatPromptList(msgArr) {
      var historyMessage = [];
      const len = msgArr.length;
      if (len > 0) {
        // msgArr.forEach(element => {});
        for (var i = 0; i < len; i++) {
          if (msgArr[i].align == "right") {
            historyMessage.push({ role: "user", parts: [{ text: msgArr[i].text }] });
            //historyMessage += "{\"role\": \"user\",\"parts\": [{\"text\": \"" + msgArr[i].text + "\"}]},";
            // historyMessage += JSON.stringify({ role: "user", parts: [{ text: msgArr[i].text }] }) + ",";
          } else if (msgArr[i].align == "left") {
            historyMessage.push({ role: "model", parts: [{ text: msgArr[i].text }] });
            //historyMessage += "{\"role\": \"model\",\"parts\": [{\"text\": \"" + msgArr[i].text + "\"}]},";
            // historyMessage += JSON.stringify({ role: "model", parts: [{ text: msgArr[i].text }] }) + ",";
          }
        }
      }
      this.historyChatData = historyMessage;
      // this.historyMessage = JSON.stringify(tempMessage);
    },
    getImageWH(imgSrc) {
      getImageNaturalDimensions(imgSrc, (oImg, imgWH) => {
        return imgWH;
      });
    },
    codeDataToString(code) {
      // const codeAsString = code.replace(/\\/g, '\\\\').replace(/\\\\/g, '\\&');//新的
      const codeAsString = code.replace(/\\n/g, "\\\\n").replace(/"/g, '\\"');
      return codeAsString;
    },
    // 定义一个函数，将Markdown转换为HTML，并去除多余的空行
    renderMdHtml(markdown) {
      //let html = converter.makeHtml(markdown); // 将Markdown转换为HTML
      //breaks会把单个换行符变为<br>
      let html = marked.parse(markdown, { breaks: true }); // 将Markdown转换为HTML
      // 使用正则表达式替换掉一个或多个换行符，后面跟着一个或多个空行，只保留单个换行符
      //html = html.replace(/(?:\n[\s\uFEFF\xA0]*){3,}/g, '\n'); //{3,}表示超过3替换
      // if (/[a-zA-Z]/.test(html) && /[\u4e00-\u9fa5]/.test(html)) {
      //     html = html.replace(/[ | ]*\n/g, ''); //去除行尾空白
      // } else if (/[\u4e00-\u9fa5]/.test(html)) {
      //     html = html.replace(/[ | ]*\n/g, ''); //去除行尾空白
      // }
      //html = html.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
      //html = html.replace(/[ | ]*\n/g, ''); //去除行尾空白
      //html = html.replace(/\n[\s| | ]*\r/g,''); //去除多余空行
      //html = html.replace(/&nbsp;/ig, ''); //去掉&nbsp;
      //html = html.replace(/&nbsp/ig, '');
      this.$nextTick(() => {
        this.copyCode();
      });
      return html;
    },
    getChatDateTime(timeNum) {
      let dateTimeNow = new Date(timeNum);
      if (timeNum == 0 || timeNum == null) {
        dateTimeNow = new Date();
      }
      let now = dateTimeNow,
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
      let dateTimeStr = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substring(0, 8);
      return this.dateTimeAgo(dateTimeStr);
    },
    isSymbol(str) { //是否仅包含各类符号
      return /^[\u2000-\u27ff]+$/.test(str); // 检查Unicode范围内的符号
    },
    isOnlyNewlines(str) { //是否仅包含换行符
      return /^\n*$/.test(str);
    },
    fileDialogOpen() {
      this.dialogInputIsFocus = true;
    },
    fileDialogClose() {
      this.dialogInputIsFocus = false;
      this.stopAllMedia();
    },
    // 停止所有音频和视频
    stopAllMedia() {
      var allMedia = document.querySelectorAll('video, audio');
      allMedia.forEach(function (media) {
        media.pause(); // 暂停播放
        media.load();  // 重新加载媒体元素
      });
    }
  },
  // 在Vue组件中
  directives: {
    Focus: {
      // 当绑定元素插入到DOM中时
      // inserted: function (el) {
      //     el.focus(); // 聚焦元素
      // }
      // 当绑定更新时
      update: function (el, binding) {
        if (binding.value) {
          el.focus();
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/** @media screen and (max-width:600px){
      .con{
        background:red;
      }
    }
    @media screen and (min-width:600px) and (max-width:800px){
      .con{
        background:blue;
      }
    }
    @media screen and (min-width:800px){
      .con{
        background:green;
      }
    } */


/* ========== 全页 AI 聊天壳：桌面侧栏平铺 / 窄屏抽屉 ========== */
.chat-app-container {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background:
    radial-gradient(1200px 480px at 12% -8%, rgba(31, 111, 235, 0.07), transparent 55%),
    radial-gradient(900px 420px at 100% 0%, rgba(95, 125, 128, 0.1), transparent 50%),
    var(--background-color, #f3f5f7);
  color: var(--text-color-2, #1f2329);
}

.chat-sidebar-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(15, 23, 32, 0.42);
  backdrop-filter: blur(2px);
}

.chat-sidebar {
  --chat-sidebar-w: 280px;
  width: var(--chat-sidebar-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--background-origin, #f7f8fa);
  border-right: 1px solid rgba(20, 24, 32, 0.08);
  z-index: 50;
  transition: transform 0.28s ease, width 0.28s ease, opacity 0.2s ease;
  box-sizing: border-box;
}

.chat-app-container.is-desktop:not(.sidebar-open) .chat-sidebar {
  width: 0;
  border-right: none;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.chat-app-container.is-mobile .chat-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: min(86vw, 300px);
  transform: translateX(-105%);
  box-shadow: 8px 0 32px rgba(15, 23, 32, 0.18);
  border-right: none;
}

.chat-app-container.is-mobile .chat-sidebar.is-open {
  transform: translateX(0);
}

.chat-sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 12px 10px;
  flex-shrink: 0;
}

.chat-sidebar__brand-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.chat-sidebar__logo {
  width: 36px;
  height: 36px;
  border-radius: var(--gp-border-radius-base, 10px);
  background: linear-gradient(145deg, #2f6fed, #5f7d80);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-sidebar__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  min-width: 0;
}

.chat-sidebar__brand-text strong {
  font-size: 14px;
  color: var(--text-color-2, #1f2329);
}

.chat-sidebar__brand-text span {
  font-size: 12px;
  color: var(--muted-1-color, #8a919f);
}

.chat-sidebar__brand-actions {
  display: inline-flex;
  gap: 4px;
}

.chat-sidebar__icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--gp-border-radius-base, 8px);
  background: transparent;
  color: var(--text-color-2, #566);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 0;
}

.chat-sidebar__icon-btn:hover {
  background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, 0.06));
  color: var(--theme-color, #5f7d80);
}

.chat-sidebar__icon-btn.is-sm {
  width: 28px;
  height: 28px;
}

.chat-sidebar__new {
  margin: 4px 12px 12px;
  height: 40px;
  border: 1px dashed rgba(20, 24, 32, 0.14);
  border-radius: var(--gp-border-radius-base, 10px);
  background: var(--background-2, #fff);
  color: var(--text-color-2, #1f2329);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}

.chat-sidebar__new:hover {
  border-color: var(--theme-color, #5f7d80);
  color: var(--theme-color, #5f7d80);
  background: var(--theme-color-muted, rgba(95, 125, 128, 0.12));
}

.chat-sidebar__section {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}

.chat-sidebar__section-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted-1-color, #8a919f);
  letter-spacing: 0.04em;
  text-transform: none;
}

.chat-sidebar__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.chat-sidebar__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  border: none;
  background: transparent;
  color: var(--text-color-2, #1f2329);
  border-radius: var(--gp-border-radius-base, 8px);
  padding: 10px 10px;
  margin-bottom: 2px;
  cursor: pointer;
  position: relative;
  font-size: 13px;
  line-height: 1.35;
}

.chat-sidebar__item-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-sidebar__item:hover {
  background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, 0.05));
}

.chat-sidebar__item.is-active {
  background: var(--theme-color-muted, rgba(95, 125, 128, 0.16));
  color: var(--theme-color-strong, var(--theme-color, #5f7d80));
  font-weight: 600;
}

.chat-sidebar__item-del {
  display: none;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  color: #888;
  flex-shrink: 0;
}

.chat-sidebar__item:hover .chat-sidebar__item-del,
.chat-sidebar__item.is-active .chat-sidebar__item-del {
  display: inline-flex;
}

.chat-sidebar__item-del:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #c0392b;
}

.chat-sidebar__empty {
  margin: 24px 8px;
  text-align: center;
  font-size: 13px;
  color: var(--muted-1-color, #9aa3ad);
}

.chat-sidebar__tools {
  flex-shrink: 0;
  padding: 8px 12px;
  border-top: 1px solid rgba(20, 24, 32, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-sidebar__tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--text-color-2, #566);
  cursor: pointer;
}

.chat-sidebar__user {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 12px calc(12px + env(safe-area-inset-bottom, 0px));
  margin-top: auto;
  border-top: 1px solid var(--gp-surface-border, rgba(20, 24, 32, 0.08));
  /* 与侧栏主体分层：略深底 + 模糊，避免半透明发灰 */
  background: var(--gp-surface-bg, var(--background-origin, #f0f2f5));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

body[theme-mode='dark'] .chat-sidebar__user,
[data-theme='dark'] .chat-sidebar__user {
  background: var(--background-2, rgba(28, 32, 38, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border-top-color: rgba(255, 255, 255, 0.08);
}

.chat-sidebar__text-btn {
  border: 1px solid var(--gp-surface-border, rgba(20, 24, 32, 0.12));
  background: var(--background-origin, #fff);
  border-radius: var(--gp-border-radius-base, 8px);
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-color-2, #566);
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
}

.chat-sidebar__text-btn:hover {
  border-color: var(--theme-color, #5f7d80);
  color: var(--theme-color, #5f7d80);
}

.chat-sidebar__text-btn.is-primary {
  background: var(--theme-color, #5f7d80);
  border-color: transparent;
  color: #fff;
}

.chat-sidebar__text-btn.is-primary:hover {
  filter: brightness(1.05);
  color: #fff;
}

.chat-sidebar__user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.chat-sidebar__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--background-2, #e8ecef);
  color: var(--muted-1-color, #889);
  text-decoration: none;
}

.chat-sidebar__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-sidebar__user-text {
  min-width: 0;
  line-height: 1.25;
}

.chat-sidebar__user-text .truncate {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-sidebar__user-text small {
  font-size: 11px;
  color: var(--muted-1-color, #9aa3ad);
}

.chat-workspace {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.chat-main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.chat-app-container.is-desktop .chat-main-content {
  margin: 0 0 12px;
}

.chat-box-header {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  width: 100%;
  height: 52px;
  text-align: center;
  background-color: var(--navbarBackground, rgba(255, 255, 255, 0.88));
  color: var(--navbarFont, #1f2329);
  font-weight: 650;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
  border-bottom: 1px solid rgba(20, 24, 32, 0.06);
  backdrop-filter: blur(10px);
  padding: 0 8px;
  box-sizing: border-box;
}

.chat-header-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--gp-border-radius-base, 8px);
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chat-header-btn:hover {
  background: var(--interactive-bg-secondary-hover, rgba(0, 0, 0, 0.06));
}

.chat-box-header__title {
  letter-spacing: 0.02em;
  font-size: 15px;
}

.chat-empty-hint {
  text-align: center;
  color: #8a919f;
  font-size: 14px;
  padding: 72px 20px 28px;
}

.chat-empty-hint__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--theme-color, #5f7d80);
  background: var(--theme-color-muted, rgba(95, 125, 128, 0.14));
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.chat-empty-hint h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color-2, #1f2329);
}

.chat-empty-hint p {
  margin: 0 auto;
  max-width: 360px;
  line-height: 1.55;
}

.big-chat-box {
  overflow-y: auto;
  padding: 16px 8px 12px;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.list-chat-item-left .list-chat-item-content,
.list-chat-item-right .list-chat-item-content {
  max-width: min(78%, 640px);
  border-radius: var(--gp-surface-radius-sm, 12px);
  padding: 10px 14px;
  line-height: 1.6;
  box-shadow: 0 1px 2px rgba(20, 24, 32, 0.04);
}

.list-chat-item-left .list-chat-item-content {
  margin-right: 40px;
  background-color: var(--background-origin, #fff);
  color: var(--text-color-2, #1f2329);
  border: 1px solid rgba(20, 24, 32, 0.06);
  border-top-left-radius: 4px;
  overflow-x: auto;
  font-size: 15px;
  word-wrap: break-word;
}

.list-chat-item-right .list-chat-item-content {
  margin-left: 40px;
  background: linear-gradient(135deg, #66ceaa, #4db896);
  color: #131212;
  border-top-right-radius: 4px;
  white-space: pre-wrap;
  overflow-x: auto;
  font-size: 15px;
}

.chat-box-footer {
  width: 100%;
  margin: 0 auto;
  flex-shrink: 0;
  padding: 10px 4px 16px;
  box-sizing: border-box;
  border-top: none;
}

.chat-composer {
  border-radius: var(--gp-surface-radius, 12px) !important;
  background: var(--background-origin, #fff) !important;
  border: 1px solid rgba(20, 24, 32, 0.1) !important;
  box-shadow: 0 8px 28px rgba(20, 24, 32, 0.06) !important;
  padding: 6px 8px !important;
  align-items: flex-end !important;
}

.chat-composer .upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-1-color, #8a919f);
  cursor: pointer;
  padding: 4px;
}

.chat-composer .upload-button:hover {
  color: var(--theme-color, #5f7d80);
}

.chat-composer .plus-text-input {
  min-height: 40px;
  max-height: 160px;
  height: 40px;
  font-size: 15px;
  line-height: 1.45;
  resize: none !important;
  overflow-y: hidden;
  box-sizing: border-box;
  padding: 8px 36px 8px 10px;
  border-radius: var(--gp-border-radius-base, 10px);
  border: 1px solid transparent;
  background: transparent;
}

.send-button.is-primary {
  background: #1f6feb !important;
  color: #fff !important;
  border-color: #1f6feb !important;
  border-radius: var(--gp-border-radius-base, 10px) !important;
  min-width: 64px;
  height: 36px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.28s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all .3s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-90vw);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(90vw);
}

.gplus-icon {
  display: grid;
  line-height: 1;
  align-items: center;
  justify-content: center;
  align-content: center;
}

.gplus-icon img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 5px;
}

.list-chat-msg {
  font-size: 1.05em;
  margin: 14px auto;
}

.list-chat-msg .chat-data-meta {
  width: auto;
  text-align: center;
  color: var(--text-color, #000);
}

.list-chat-msg .chat-date-time,
.list-chat-msg .chat-reply-elapsedMs {
  display: inline-block;
  text-align: center;
  font-size: 0.7em;
  margin: 2px auto;
  color: var(--text-color, #889);
}

.list-chat-msg .chat-reply-elapsedMs {
  padding-left: 5px;
}

.chat-msg-media-data {
  width: 100%;
  overflow: hidden;
}

.chat-msg-media-data > * {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.list-chat-item-left {
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  margin-top: 2px;
  margin-bottom: 2px;
}

.list-chat-item-right {
  display: flex;
  justify-content: flex-start;
  flex-direction: row-reverse;
  margin-top: 2px;
  margin-bottom: 2px;
}

.list-chat-item-left .list-chat-item-content::-webkit-scrollbar,
.list-chat-item-right .list-chat-item-content::-webkit-scrollbar {
  display: none;
}

.chat-user-icon {
  width: 36px;
  height: 36px;
  border-radius: 100%;
  margin-right: 8px;
  margin-left: 8px;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(20, 24, 32, 0.08);
}

@media screen and (max-width: 899px) {
  .chat-shell {
    max-width: 100%;
    padding: 0 10px;
  }

  .chat-app-container.is-mobile .chat-main-content {
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .chat-box-footer {
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }
}

/********************switch自定义切换按钮样式**********************/
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin: 3px auto;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #139F95;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 99px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 99px;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:checked+.slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
/**********************************************/

/* 文件预览样式 */
.file-preview-send-main {
  background: var(--background-origin, #353434);
  border-radius: inherit;
  height: auto;
  width: 100%;
}

.file-preview-send-main .chat_extra_data {
  width: auto;
  margin: 0 auto;
  text-align: center;
}

.file-preview-send-main img,
.file-preview-send-main .chat_extra_data img {
  width: 100%;
  height: auto;
  /* transform: translate(-50%, -50%);
  position: absolute;
  top: 50%;
  left: 50%; */
}

.file-preview-send-container {
  padding: 7px;
}

.plus-form-textarea {
  display: block;
  width: 100%;
  height: 35px;
  border-radius: 0;
  border: none;
  //border-top: var(--color-border-2, #9f9e9e) 1px solid;
  //border-bottom: var(--color-border-2, #9f9e9e) 1px solid;
  padding: 2px 8px 2px 8px;
  line-height: 29px;
  resize: none;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  background: var(--background-color);
  color: var(--text-color-2);
}

.plus-form-control {
  display: block;
  width: 100%;
  height: 35px;
  border-radius: 0;
  line-height: 29px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.file-preview-send-footer {
  /* border-top: var(--color-border-2,#9f9e9e) 1px solid; */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.file-preview-send-footer .pdf-left-btn {
  flex: 1;
  color: var(--text-color, #fefdfd);
  text-align: center;
}

.file-preview-send-footer .pdf-right-btn {
  flex: 1;
  color: var(--text-color, #fefdfd);
  text-align: center;
}

.cancel-btn,
.confirm-btn {
  padding: 3px 13px;
  cursor: pointer;
}

.split-line {
  width: 1px;
  height: 35px;
  background: var(--background-color, #999);
}

/******************（没有用到的样式）********************/
.chat-box-footer-btn {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  justify-content: space-between;
  /* background-color: #83a097; */
  background: var(--background-color, #ffffff00);
  font-family: auto;
}

.chat-box-footer-btn .chat_btn_left a {
  border: 1px solid var(--color-border-2, #c0c9cbb3);
  border-right: 0 !important;
  border-radius: 0;
  background: transparent;
  color: var(--color-main-container-text, #2f3030) !important;
  box-shadow: none !important;
}

.chat-box-footer-btn .chat_btn_right a {
  border: 1px solid var(--color-border-2, #c0c9cbb3);
  border-left: 0 !important;
  border-radius: 0;
  /* border-radius: 0 5px 5px 0; */
  background: transparent;
  color: var(--color-main-container-text, #2f3030) !important;
  box-shadow: none !important;
}

.chat-box-footer-btn span {
  flex-grow: 0;
  flex-shrink: 0;
  /**margin:auto;
        align-items:center;*/
  align-self: flex-end;
}

.chat-box-footer-btn>input,
.chat-box-footer-btn>textarea {
  -webkit-transition: width 0.2s ease-in-out;
  -moz-transition: width 0.2s ease-in-out;
  -o-transition: width 0.2s ease-in-out;
  transition: width 0.2s ease-in-out;
  border-radius: 0 !important;
  border: 1px solid var(--color-border-2, #c0c9cbb3) !important;
  /* -moz-border-radius: 4px;
    -o-border-radius: 4px;
    -ms-border-radius: 4px;
    -webkit-border-radius: 4px; */
}

.chat-box-footer-btn>input:focus,
.chat-box-footer-btn>textarea:focus,
textarea:focus,
input:focus {
  outline: 0;
  box-shadow: none !important;
}

.input-with-chatgpt {
  vertical-align: middle;
  line-height: inherit;
  margin: auto;
  align-self: center;
}
</style>
