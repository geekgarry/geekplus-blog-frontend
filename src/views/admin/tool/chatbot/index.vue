<template>
    <div id="app">
        <div>
            <el-row type="flex" :gutter="4" justify="center">
                <el-col :xs="0" :sm="1" :md="6" :lg="6" :xl="6">
                    <!-- <div class="grid-content bg-purple"></div> -->
                </el-col>
                <el-col :xs="24" :sm="22" :md="12" :lg="12" :xl="12">
                    <div class="grid-content" v-if="chatdisplay">
                        <div class="chatBoxHeader">
                            <!-- <div><el-tooltip class="item" effect="dark" content="输入你的openAiKey" placement="bottom-start"><i class="el-icon-key" @click="setOpenAiKey"></i></el-tooltip></div> -->
                            <div><i class="el-icon-key"></i></div>
                            AI智能助手
                            <div><i class="el-icon-info" @click="openMsg"></i></div>
                        </div>
                        <div class="bigChatBox" id="bigChatBox" :style="{height: chatBoxHeight+ 'px'}">
                            <!-- :style="{textAlign: item.align}" -->
                            <div v-for="(item, index) in msgList" v-bind:key="index" class="listChatMsg">
                                <span class="listChatItemL" v-if="item && item.align == 'left'">
                                          <span><img
                                            class="chatUserIcon"
                                            src="@/assets/images/logo/geekplus.png"
                                            alt="极客普拉斯" />
                                          </span>
                                <span class="listChatItemContent" v-if="item && item.link == ''">
                                            <span v-html="markdownToHtmlWithoutExtraLines(item.text)"></span>
                                <!-- v-if="item.type=='1'" <span v-if="item.type=='0'" v-text="item.text">{{item.text}}</span> -->
                                </span>
                                <span class="listChatItemContent" v-if="item && item.link">: <a :href="item.link" target="_blank" >{{item.text}}</a></span
                                          >
                                        </span>
                                <span class="listChatItemR" v-if="item && item.align == 'right'">
                                          <span class="listChatItemContent">{{item.text}}</span>
                                <span><img
                                            class="chatUserIcon"
                                            src="@/assets/images/logo/maike.jpg"
                                            alt="麦壳" />
                                          </span>
                                </span>
                            </div>
                        </div>
                        <div class="chatBoxFooter">
                            <el-row type="flex" :gutter="5" justify="center">
                                <el-col :span="24">
                                    <div class="chatBoxFooterBtn">
                                        <span><el-button
                                              type="primary"
                                              @click="startAndStopRecording" >{{recordingTxt}}
                                            </el-button>
                                            </span>
                                        <el-input placeholder="请输入聊天内容" v-model="inputChat" class="input-with-chatgpt" clearable :autofocus="true" type="text" resize="none" :autosize="{ minRows: 1.3, maxRows: 8 ,maxCols:18, }">
                                        </el-input>
                                        <span><el-button
                                              :loading="loading"
                                              @keydown.enter.native="handleMsg"
                                              slot="append"
                                              type="primary"
                                              @click="handleMsg"
                                              >发送</el-button
                                            ></span>

                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="0" :sm="1" :md="6" :lg="6" :xl="6">
                    <!-- <div class="grid-content bg-purple"></div> -->
                </el-col>
            </el-row>
            <!-- <el-button @click="visible11" v-show="chatbtndisplay" type="primary">打开ChatGpt聊天框</el-button> -->
        </div>
        <!-- <el-dialog :visible.sync="visible" title="对话框"> -->
        <el-row v-show="chatbtndisplay" type="flex" :gutter="10" justify="center">
            <el-col :sm="2" :md="4" :lg="4" :xl="6"></el-col>
            <el-col :xs="24" :sm="20" :md="16" :lg="16" :xl="12">
                <div style="
                    margin: 0 auto;
                    text-align: center;
                    line-height: normal;
                    padding: 5px 0;
                    font-size: initial;
                    color: var(--color-article-container-text-1, #696969);
                    border-bottom: var(--color-border-4, #c5c5c5) 1px solid;
                    " @click="refreshChat">AI聊天助手</div>
                <div class="bigChatBox" id="bigChatBox">
                    <!-- :style="{textAlign: item.align}" -->
                    <div v-for="(item, index) in msgList" :key="index" class="listChatMsg">
                        <span class="listChatItemL" v-if="item && item.align == 'left'">
                                    <img
                                      class="chatUserIcon"
                                      src="@/assets/images/logo/geekplus.png"
                                      alt="极客普拉斯"
                                    />
                                    <span class="pcChatTextSpan" v-if="item && item.link == ''" >
                                      <span v-html="markdownToHtmlWithoutExtraLines(item.text)"></span>
                        <!--v-if="item.type=='1'"  <span v-if="item.type=='0'" v-text="item.text">{{item.text}}</span> -->
                        </span>
                        <span class="pcChatTextSpan" v-if="item && item.link">: <a :href="item.link" target="_blank" >{{item.text}}</a></span
                                    >
                                  </span>
                        <span class="listChatItemR" v-if="item && item.align == 'right'">
                                    <span class="pcChatTextSpan">{{item.text}}</span>
                        <img class="chatUserIcon" src="@/assets/images/logo/maike.jpg" alt="麦壳" />
                        </span>
                    </div>
                </div>
                <div style="margin-top: 15px">
                    <el-input placeholder="请输入聊天内容" v-model="inputChat" class="input-with-select" clearable :autofocus="true" type="text">
                        <el-button :loading="loading" @keydown.enter.native="handleMsg" slot="append" type="primary" @click="handleMsg">发送</el-button>
                    </el-input>
                </div>
            </el-col>
            <el-col :sm="2" :md="4" :lg="4" :xl="6"></el-col>
        </el-row>
        <!-- </el-dialog> -->
    </div>
</template>

<script>
//import axios from 'axios'
import Recorder from 'js-audio-recorder'
// import { marked } from 'marked';//5.1.2(可用)和6.0.0
const marked = require('marked');//5.1.2(可用)和6.0.0
import { getchatgpt, chatgpttest, geminiAI, geminiAIChat, getHistoryMessage } from "@/api/chatbot/chatbot"

export default {
    name: "ChatBot",
    data() {
        return {
            visible: false,
            inputChat: "",
            preChatData: "",//历史聊天数据，json字符串拼接
            msgList: [], //聊天消息的list
            historyMsgData: [], //历史聊天记录,数组形式
            loading: false,
            chatbtndisplay: true,
            chatdisplay: false,
            chatBoxHeight: 440,
            fullWidth: 0,
            fullHeight: 0,
            audioData: [], // 存储录音数据块
            recorder: new Recorder({
                sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
                sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
                numChannels: 1, // 声道，支持 1 或 2， 默认是1
                // compiling: false,(0.x版本中生效,1.x增加中)  // 是否边录边转换，默认是false
            }),
            recorderData: [], //音频的二进制数据
            recording: 0,
            recordingTxt: "语音",
            textAudio: null,
            isTextVoice: false, //是否语音朗读
            isHistory: true, //是否采用有历史记忆的聊天
            openAiKey: '',
            username: "guest"
        };
    },
    //data:{},
    created: function() {
        if (this.$store.state.user.username) {
            this.username = this.$store.state.user.username;
        }
        this.getHistoryMag();
        //this.startTTS("你好！请问现在是什么时间！");
        document.addEventListener("keydown", (e) => {
            let key = window.event.keyCode;
            if (key == 13 && !this.loading) {
                // 13是enter键的键盘码 如果等于13 就调用click的登录方法
                this.handleMsg();
            }
        });
        this.fullWidth = document.documentElement.clientWidth;
        this.fullHeight = document.documentElement.clientHeight;
        // 页面宽度小于750px时，不显示地图
        if (this.fullWidth < 750) {
            this.chatbtndisplay = false;
            this.chatdisplay = true;
        } else {
            this.chatbtndisplay = true;
            this.chatdisplay = false;
        }
        //document.getElementById("bigChatBox").offsetHeight = (this.fullHeight - 100) + "px";
        this.chatBoxHeight = this.fullHeight - 100;
    },
    mounted() {
        const that = this
        //that.setOpenAiKey();
        // <!--把window.onresize事件挂在到mounted函数上-->
        window.onresize = () => {
            return (() => {
                window.fullHeight = document.documentElement.clientHeight;
                window.fullWidth = document.documentElement.clientWidth;
                that.windowHeight = window.fullHeight; // 高
                that.windowWidth = window.fullWidth; // 宽
                // 页面宽度小于750px时，不显示地图
                if (that.windowWidth < 750) {
                    that.chatbtndisplay = false;
                    that.chatdisplay = true;
                } else {
                    that.chatbtndisplay = true;
                    that.chatdisplay = false;
                }
                console.log("页面高度：" + that.windowHeight)
                //document.getElementById("bigChatBox").offsetHeight = (that.windowHeight - 100) + "px";
                that.chatBoxHeight = that.windowHeight - 100;
            })()
        };
    },
    watch: {
        windowHeight(val) {
            let that = this;
            // console.log("实时屏幕高度：", val, that.windowHeight);
            //chatBoxHeight=that.windowHeight
        },
        windowWidth(val) {
            let that = this;
            if (val < 768) {
                //that.dialogWidth='100%'
                that.chatbtndisplay = false;
            } else {
                //that.dialogWidth='75%'
            }
            // console.log("实时屏幕宽度：", val, that.windowHeight);
        }
    },
    methods: {
        refreshChat(){
            this.getHistoryMag();
        },
        visible11() {
            this.visible = true;
            this.$nextTick(() => {
                this.$refs.serachBox.focus();
            });
        },
        async handleMsg() {
            console.log(this.inputChat, "发送信息");
            if (this.inputChat === "关闭语音") {
                this.isTextVoice = false;
                this.loading = false;
                this.inputChat = "";
                this.msgSuccess("关闭语音回复");
                /*
                 * 模拟信息返回
                 */
                // setTimeout(async () => {
                //     let listMsg = {
                //         align: "left",
                //         text: "已关闭语音功能",
                //         link: "",
                //         type: '0'
                //     };
                //     await this.msgList.push(listMsg);
                //     await this.scrollTop11();
                //     this.loading = false;
                // }, 1000);
            } else if (this.inputChat === "开启语音") {
                this.isTextVoice = true;
                this.loading = false;
                this.inputChat = "";
                this.msgSuccess("开启语音回复");
                /*
                 * 模拟信息返回
                 */
                // setTimeout(async () => {
                //     let listMsg = {
                //         align: "left",
                //         text: "已开启语音功能",
                //         link: "",
                //         type: '0'
                //     };
                //     await this.msgList.push(listMsg);
                //     await this.scrollTop11();
                //     this.loading = false;
                // }, 1000);
            } else if (this.inputChat === "停止语音" || this.inputChat === "停止播放" || this.inputChat === "暂停播放" || this.inputChat === "暂停语音回复" || this.inputChat === "pause") {
                this.pauseTextAudio();
                this.loading = false;
                this.inputChat = "";
                this.msgSuccess("停止播放语音");
            } else if (this.inputChat === "继续语音" || this.inputChat === "继续播放" || this.inputChat === "回复语音播放" || this.inputChat === "play") {
                this.playTextAudio();
                this.loading = false;
                this.inputChat = "";
                this.msgSuccess("再次播放语音");
            } else if (this.inputChat === "聊天模式" || this.inputChat === "开启聊天模式" || this.inputChat === "开启对话模式" || this.inputChat === "开启记忆对话" || this.inputChat === "对话模式") {
                this.isHistory = true;
                this.loading = false;
                this.inputChat = "";
                this.msgSuccess("打开聊天对话模式");
            } else if (this.inputChat === "取消历史记忆" || this.inputChat === "关闭对话模式" || this.inputChat === "关闭聊天模式" || this.inputChat === "关闭记忆对话") {
                this.isHistory = false;
                this.loading = false;
                this.inputChat = "";
                this.msgSuccess("关闭聊天对话模式");
            } else if (this.inputChat !== "") {
                this.loading = true;
                this.chatHistoryToJson(this.msgList);
                await this.msgList.push({ align: "right", text: this.inputChat });
                await this.scrollTop11();
                this.getMsg();
                this.inputChat = "";
            }
        },
        getMsg() {
            /** if(this.openAiKey==''||this.openAiKey==null){
                  this.$message({message:'请先输入你的openAiKey',type:'error',duration:2500})
                }else{
                  // 处理自己的接口请求 返回需要的数据
                axios.post("/AIBot/getchatgpt",//openai的api
                  { username:"You", data: this.inputChat,openAiKey:this.openAiKey })
                  .then(async (response) => {
                  console.log(response);
                  if (response.status == 200) {
                    console.log("返回响应信息")
                    console.log(response.data)
                    let msg="消息";
                    let msgtype="0"
                    if(response.data.code==500){
                      msg="返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
                      msgtype="0";
                    }else if(response.data.code==200){
                      // 自行处理需要的数据
                      msg = response.data.data.msg_data;
                      msgtype = response.data.data.msg_type;
                    }
                    let listMsg = {
                    align: "left",
                    text: msg,
                    link: "",
                    type: msgtype
                    };
                    if(this.isTextVoice===true){
                      this.startTTS(msg);
                    }
                    await this.msgList.push(listMsg);
                    await this.scrollTop11();
                  }
                  this.loading = false;
                  })
                  .catch(function (error) {
                  console.log(error);
                  this.loading = false;
                  });
                } */
            // axios.post("/AIBot/getGeminiContent", //google gemini
            let chatPrompt = { username: this.username, chatMsg: this.inputChat };
            if (this.isHistory === false) {
                geminiAI({ username: this.username, chatMsg: this.inputChat })
                    .then(async (response) => {
                        //console.log(response);
                        //if (response.code == 200) {
                        //console.log("返回响应信息")
                        //console.log(response.data)
                        let msg = "消息";
                        let msgtype = "0"
                        if (response.status && response.status == 500) {
                            msg = "返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
                            msgtype = "0";
                        }
                        if (response.code == 500) {
                            msg = "返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
                            msgtype = "0";
                        } else if (response.code == 200) {
                            // 自行处理需要的数据
                            msg = response.data.msg_data.trim();
                            msgtype = response.data.msg_type;
                        }
                        let listMsg = {
                            align: "left",
                            text: msg,
                            link: "",
                            type: msgtype
                        };
                        /**if (msg.flag == 1) {
                        const splitMsg = msg.answer.split("：");
                        listMsg.text = splitMsg[0];
                        listMsg.link = splitMsg[1];
                        }*/
                        if (this.isTextVoice === true) {
                            this.startTTS(msg);
                        }
                        await this.msgList.push(listMsg);
                        await this.scrollTop11();
                        //}
                        this.loading = false;
                    })
                    .catch(function(error) {
                        console.log(error);
                        this.loading = false;
                    });
            } else {
                geminiAIChat({ username: this.username, chatMsg: this.inputChat, historyChatData: this.historyMsgData })
                    .then(async (response) => {
                        //console.log(response);
                        //if (response.code == 200) {
                        //console.log("返回响应信息")
                        //console.log(response.data)
                        let msg = "消息";
                        let msgtype = "0"
                        if (response.status && response.status == 500) {
                            msg = "返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
                            msgtype = "0";
                        }
                        if (response.code == 500) {
                            msg = "返回信息错误可能由于以下原因:\n1.你发送的信息中包含不安全和不合法的内容！（如色情，暴力，恐怖，或是违反互联网一般行为规范和道德法律等）。\n2.你的服务因为一些原因无法完成请求过程，也许是网络问题，也许是服务器出现服务过载或超时延迟。\n3.由于服务器出现未知原因导致数据无法安全传递";
                            msgtype = "0";
                        } else if (response.code == 200) {
                            // 自行处理需要的数据
                            msg = response.data.msg_data.trim();
                            msgtype = response.data.msg_type;
                        }
                        let listMsg = {
                            align: "left",
                            text: msg,
                            link: "",
                            type: msgtype
                            //time: response.data.msg_date_time
                        };
                        if (this.isTextVoice === true) {
                            this.startTTS(msg);
                        }
                        await this.msgList.push(listMsg);
                        await this.scrollTop11();
                        //}
                        this.loading = false;
                    })
                    .catch(function(error) {
                        console.log(error);
                        // this.$message({
                        //     message: error.msg,
                        //     type: "error",
                        // });
                        this.loading = false;
                    });
            }
        },
        //请求AI模型
        geminiChatAI() {

        },
        //获取用户的历史聊天记录
        getHistoryMag() {
            //axios.get("/AIBot/getHistoryMessage?username=You")
            getHistoryMessage({ username: this.username })
                .then(async (response) => {
                    //console.log(response.data)
                    let msglist = response.data;
                    await this.jsonStrToObj(msglist);
                    await this.scrollTop11();
                }).catch(function(error) {
                    console.log(error);
                });
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
                this.$Message.success('获取权限成功')
            }, (error) => {
                console.log(`${error.name} : ${error.message}`);
            });
        },
        //开始录音 startRecordAudio
        startRecordAudio() {
            Recorder.getPermission().then(
                () => {
                    console.log("开始录音");
                    this.recorder.start(); // 开始录音
                },
                (error) => {
                    this.$message({
                        message: "请先允许该网页使用麦克风",
                        type: "info",
                    });
                    console.log(`${error.name} : ${error.message}`);
                }
            );
        },
        //停止录音
        stopRecordAudio() {
            console.log("停止录音");
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
            console.log("播放录音");
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
            this.recorder.destroy().then(function() {
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
            console.log(pcmBlob);
        },
        //获取WAV录音数据
        getWAVRecordAudioData() {
            var wavBlob = this.recorder.getWAVBlob();
            console.log(wavBlob);
        },
        //下载PCM录音文件
        downloadPCBRecordAudioData() {
            this.recorder.downloadPCM("maike");
        },
        //下载WAV录音文件
        downloadWAVRecordAudioData() {
            this.recorder.downloadWAV("maike");
        },
        // 处理滚动条一直保持最上方
        scrollTop11() {
            let div = document.getElementById("bigChatBox");
            div.scrollTop = div.scrollHeight;
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
            console.log(val)
            console.log(typeof val)
            console.log((typeof val) != 'undefined')
            return (val + '').replace(/\n/g, "<br/>")
        },
        //开始文字转语音
        startTTS(text) {
            const baseUrl = process.env.VUE_APP_BASE_API
            // 调用语音合成接口
            // 参数含义请参考 https://ai.baidu.com/docs#/TTS-API/41ac79a6
            /*axios
            .post("https://tsn.baidu.com/text2audio?tex="+text+"&lan=zh&cuid=maike&ctp=1&tok=24.270948c59fcd0c70913aea41ecf533bd.2592000.1680199081.282335-30837213")
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
            var that = this;
            //var url = "https://tsn.baidu.com/text2audio?tex=" + text + "&lan=zh&cuid=c211ccc3407c45038492e623bb358524&ctp=1&tok=24.e3cd3b426636b471a2f288cebadca276.2592000.1719346650.282335-30837213";
            var url = baseUrl + "/translate/ttsChinese?ttsText=" + text;
            //var textAudio;
            that.textAudio = new Audio();
            that.textAudio.onloadeddata = function() {
                that.textAudio.play();
            };
            that.textAudio.src = url; // put your url here
            that.textAudio.play();
        },
        getRecorderToText() {
            let that = this;
            // 创建一个formData对象
            var formData = new FormData()
            let voiceData;
            var pcmBlob = this.recorder.getPCMBlob();
            console.log(pcmBlob);
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
            console.log(formData);
            //上传wav录音数据

            //axios.post("/AIBot/uploadVoiceBlob",formData)
            uploadVoiceBlob(formData)
                .then(async (response) => {
                    console.log(response.data.data)
                    //let text=response.data.data.result[0]
                    that.inputChat = response.data.data.result[0];
                    that.handleMsg()
                }).catch(function(error) {
                    console.log(error);
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
                console.log('请先点击合成')
            } else {
                that.textAudio.pause();
            }
        },
        // 暂停播放文字转语音按钮
        stopTextAudio() {
            var that = this;
            if (that.textAudio === null) {
                console.log('没有语音，请先合成')
            } else {
                that.textAudio.stop();
            }
        },
        startAudio(txt) {
            var msg = new SpeechSynthesisUtterance();
            var voicePack = speechSynthesis.getVoices();
            speechSynthesis.cancel();
            console.log('开始播放')
            console.log(voicePack)
            msg.text = txt
            msg.volume = 1 //音量
            msg.rate = 1 //语速
            //msg.voice =
            msg.lang = 'zh-cn'
            speechSynthesis.speak(msg);
        },
        openMsg() {
            const h = this.$createElement;
            this.$notify({
                title: '通知内容',
                duration: 5500,
                position: 'top-right',
                offset: 30,
                message: h('i', { style: 'color: teal' }, '聊天功能升级，增加语音回复与语音输入（默认关闭语音回复）。启用请发送”开启语音“，关闭发送“关闭语音”，发送“暂停播放”、“暂停”、“stop”实现停止播放语音，发送“继续播放”、“继续”、“play”可继续播放语音。左下角语音输入功能已更新！点击语音，然后结束！就可以发送语音文字！')
            });
        },
        setOpenAiKey() {
            this.$prompt('请输入openAiKey', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^sk-[\w]+$/,
                inputErrorMessage: 'openAiKey格式不正确'
            }).then(({ value }) => {
                this.$message({
                    type: 'success',
                    message: '你的openAiKey是: ' + value,
                    duration: 2500
                });
                this.openAiKey = value;
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消输入',
                    duration: 2000
                });
            });
        },
        //遍历数组，把里面的每一条json字符串转为json对象
        jsonStrToObj(msgArr) {
            var len = msgArr.length;
            for (var i = 0; i < len; i++) {
                var temp = JSON.parse(msgArr[i]);
                this.msgList.push(temp);
            }
            //return msgArr;
        },
        //遍历聊天记录数组，把里面的每一条json字符串转为json对象
        chatHistoryToJson(msgArr) {
            let tempMessage = [];
            var len = msgArr.length;
            if(len > 0) {
                for (var i = 0; i < len; i++) {
                    // var temp = JSON.parse(msgArr[i]);
                    // this.msgList.push(temp);
                    if (msgArr[i].align == "right") {
                        tempMessage.push({role: "user", parts: [{text: msgArr[i].text}]});
                        //tempMessage += "{\"role\": \"user\",\"parts\": [{\"text\": \"" + msgArr[i].text + "\"}]},";
                        // tempMessage += JSON.stringify({role: "user", parts: [{text: msgArr[i].text}]})+",";
                    } else if (msgArr[i].align == "left") {
                        tempMessage.push({role: "model", parts: [{text: msgArr[i].text}]});
                        //tempMessage += "{\"role\": \"model\",\"parts\": [{\"text\": \"" + msgArr[i].text + "\"}]},";
                        // tempMessage += JSON.stringify({role: "model", parts: [{text: msgArr[i].text}]})+",";
                    }
                }
            }
            this.historyMsgData = tempMessage;
            // this.preChatData = JSON.stringify(tempMessage);
            // this.preChatData = tempMessage;
        },
        // 定义一个函数，将Markdown转换为HTML，并去除多余的空行
        markdownToHtmlWithoutExtraLines(markdown) {
            //let html = converter.makeHtml(markdown); // 将Markdown转换为HTML
            let html = marked.parse(markdown, { headerIds: false, mangle: false, breaks: true }); // 将Markdown转换为HTML
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
            return html;
        },
        getChatDateTime() {
            let now = new Date(),
                y = now.getFullYear(),
                m = now.getMonth() + 1,
                d = now.getDate();
            let dateTimeStr = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substring(0, 8);
            return this.dateTimeAgo(dateTimeStr);
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

body {
    background-color: rgba(239, 239, 239, 0.98);
    margin: 0;
    padding: 0;
}

#app {
    margin: 0 auto;
    padding: 0;
    overflow-x: hidden;
}

.chatBoxHeader {
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    text-align: center;
    background-color: rgb(118, 164, 219);
    color: #ffffff;
    font-weight: bolder;
    display: flex;
    flex-flow: row;
    flex-wrap: nowrap;
    justify-content: space-between;
}

.chatBoxHeader div {
    flex-grow: 0;
    flex-shrink: 0;
    align-self: center;
    padding-left: 6px;
    padding-right: 6px;
}

.bigChatBox {
    height: 500px;
    overflow-y: scroll;
    padding: 0 2px;
}

.bigChatBox::-webkit-scrollbar {
    display: none;
}

.listChatMsg {
    font-size: 16px;
    font-weight: 500;
    margin: 8px auto;
}

.listChatItemL {
    display: flex;
    justify-content: flex-start;
    margin-top: 2px;
    margin-bottom: 2px;
}

.listChatItemR {
    display: flex;
    justify-content: flex-end;
    margin-top: 2px;
    margin-bottom: 2px;
}

.listChatItemL .listChatItemContent {
    border-radius: 5px;
    border-width: 1px;
    border-color: mediumaquamarine;
    background-color: #66CEAA;
    padding: 5px;
    color: #1b1a1a;
    /*word-break: break-all;
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;*/
    overflow-x: auto;
    margin-right: 49px;
}

.listChatItemL .listChatItemContent::-webkit-scrollbar {
    display: none;
}

.listChatItemR .listChatItemContent {
    border-radius: 5px;
    border-width: 1px;
    border-color: #355CBF;
    background-color: #4c65b8;
    padding: 5px;
    color: #f0efef;
    margin-left: 49px;
    white-space: pre-wrap;
    overflow-x: auto;
}

.listChatItemL .pcChatTextSpan {
    color: #252020;
    border-color: mediumaquamarine;
    background-color: #66CEAA;
    border-radius: 5px;
    padding: 5px;
    /*word-break: break-all;
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;*/
    overflow-x: auto;
}

.listChatItemL .pcChatTextSpan::-webkit-scrollbar {
    display: none;
}

.listChatItemR .pcChatTextSpan {
    background-color: #366abb;
    border-radius: 5px;
    color: #fcfafa;
    padding: 5px;
    white-space: pre-wrap;
    overflow-X: auto;
}

.chatUserIcon {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    /* padding-right: 10px;
    padding-left: 10px; */
    margin-right: 7px;
    margin-left: 7px;
}

.chatBoxFooter {
    /* position: fixed;
    bottom: 10px;
    left: 0px; */
    width: 100%;
    margin-top: 15px;
}

.chatBoxFooterBtn {
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
    justify-content: space-between;
    background-color: #83a097;
}

.chatBoxFooterBtn span {
    flex-grow: 0;
    flex-shrink: 0;
    /**margin:auto;
        align-items:center;*/
    align-self: flex-end;
}

.input-with-chatgpt {
    vertical-align: middle;
    line-height: inherit;
    margin: auto;
    align-self: center;
}
</style>
