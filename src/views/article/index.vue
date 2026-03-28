<template>
  <div class="app-container">
    <div class="header">
      <img src="logo.png" alt="Logo" class="logo">
      <el-input placeholder="请输入搜索关键词" class="search-input"></el-input>
      <el-button icon="el-icon-edit"></el-button>
      <el-button type="text">APP</el-button>
      <img src="avatar.png" alt="Avatar" class="avatar">
    </div>
    <div class="content">
      <h1>关注点一点, 金币礼物走一走</h1>
      <div class="video-container">
        <video controls :src="videoSrc"></video>
        <el-button class="play-button" icon="el-icon-video-play" circle></el-button>
      </div>
      <div class="button-group">
        <el-button>普通1</el-button>
        <el-button>普通2</el-button>
        <el-button>VIP线路</el-button>
      </div>
    </div>
    <div class="footer">
      <el-link type="primary" :underline="false" @click="showSendMessageDrawer = true">一起来拍砖</el-link>
      <el-button icon="el-icon-present" @click="giftAction">礼物</el-button>
      <el-button icon="el-icon-star" @click="collectAction">收藏</el-button>
      <el-button icon="el-icon-thumb" @click="likeAction">点赞</el-button>
      <el-button icon="el-icon-share" @click="shareAction">分享</el-button>
    </div>
    <el-drawer custom-class="no-header-drawer" :visible.sync="showSendMessageDrawer" direction="btt"
      :before-close="handleCloseSendMessage" :show-close="false">
      <span>这是一些发送消息的输入框和按钮</span>
      <el-input v-model="message" placeholder="请输入消息"></el-input>
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </el-drawer>
    <el-dialog title="分享" :visible.sync="showShareDialog" width="30%">
      <canvas ref="shareCanvas" width="300" height="200"></canvas>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showShareDialog = false">取 消</el-button>
        <el-button type="primary" @click="showShareDialog = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from 'qrcode'; // 引入二维码生成库

export default {
  data() {
    return {
      videoSrc: 'video.mp4', // 视频地址
      showSendMessageDrawer: false,
      message: '',
      showShareDialog: false,
      articleTitle: '关注点一点, 金币礼物走一走',
      articleLink: 'https://example.com/article',
    };
  },
  methods: {
    giftAction() {
      // 礼物相关操作
      console.log("礼物")
    },
    collectAction() {
      // 收藏相关操作
      console.log("收藏")
    },
    likeAction() {
      // 点赞相关操作
      console.log("点赞")

    },

    handleCloseSendMessage(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    sendMessage() {
      // 发送消息逻辑
      console.log("发送消息:", this.message)
      this.showSendMessageDrawer = false;
    },
    async shareAction() {
      this.showShareDialog = true;

      // 在对话框打开后绘制canvas
      this.$nextTick(async () => {
        const canvas = this.$refs.shareCanvas;
        const ctx = canvas.getContext('2d');

        // 绘制背景
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制标题
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(this.articleTitle, 20, 30);

        // 绘制链接
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'blue';
        ctx.fillText(this.articleLink, 20, 60);

        // 生成二维码
        const qrCode = await QRCode.toDataURL(this.articleLink, { width: 80, height: 80 });
        const qrCodeImg = new Image();
        qrCodeImg.src = qrCode;
        qrCodeImg.onload = () => {
          ctx.drawImage(qrCodeImg, canvas.width - 100, canvas.height - 100, 80, 80);
        };
      });
    }
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.logo {
  height: 30px;
  margin-right: 10px;
}

.search-input {
  width: 200px;
  margin-right: 10px;
}

.avatar {
  height: 30px;
  border-radius: 50%;
}

.content {
  flex: 1;
  padding: 10px;
  overflow: auto;
}

.video-container {
  position: relative;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.button-group {
  margin-top: 10px;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #eee;
}
</style>
