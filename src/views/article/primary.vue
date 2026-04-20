<template>
  <div class="container-fluid">

    <el-container class="container">
      <div class="left-aside">
        <div class="left-tool-area" :style="{ position: 'fixed', top: fixedTopHeight }">
          <el-button type="primary" circle>
            <svg-icon icon-class="thumb-up"></svg-icon>
          </el-button>
          <el-button type="danger" icon="el-icon-share" circle></el-button>
          <!-- <el-button type="success" icon="el-icon-star-off" circle></el-button> -->
          <!-- <el-button type="info" icon="el-icon-full-screen" circle></el-button> -->
          <!-- <el-button type="warning" icon="el-icon-money" circle></el-button> -->
          <el-button type="primary" icon="el-icon-chat-round" circle></el-button>
        </div>
      </div>
      <el-main>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
            <div class="article-container" :class="{ 'skeleton-loading': loading }">
              <h1 v-if="!loading">{{ articleInfo.articleTitle || '概率抽奖算法工具类'}}</h1>
              <div v-else class="skeleton-block article-skeleton-title"></div>

              <div v-if="!loading" class="user-info">
                <img :src="userAvatar" alt="User Avatar" class="avatar">
                <span>{{ articleInfo.authorName || '伴个白天'}}</span>
                <el-tag type="warning">学习笔记</el-tag>
                <el-tag type="success">Java</el-tag>
                <el-tag type="info">学习笔记</el-tag>
                <span class="views">{{ articleInfo.viewCount || '357'}}</span>
                <span class="time">{{ articleInfo.createTime || '2023-08-11 16:24:57' }}</span>
                <el-button type="text" size="small">举报</el-button>
              </div>
              <div v-else class="article-skeleton-meta"></div>

              <div v-if="!loading && articleInfo.articleContent" class="article-content"
               v-html="renderMdText(articleInfo.articleContent)" v-highlight v-viewer>
              </div>
              <div v-else-if="!loading" class="article-content">
                <div class="errata">
                  <span>勘误</span>
                </div>
                <el-alert title="版权 本文为蘑菇社区原创文章，转载无需和我联系，但请注明来自蘑菇社区 https://www.moguit.cn" type="info" show-icon
                  :closable="false" />

                <h2>抽奖算法</h2>
                <p>问题描述:做过营销活动都会遇到按照概率抽奖的需求,按照不同的概率,通过多次抽奖,获取到的奖品 = 配置好的概率。</p>

                <el-table :data="tableData" border style="width: 100%">
                  <el-table-column prop="name" label="物品名称" width="180"></el-table-column>
                  <el-table-column prop="id" label="物品ID" width="180"></el-table-column>
                  <el-table-column prop="probability" label="抽奖概率"></el-table-column>
                </el-table>

                <h2>奖品配置实体类 (概率)</h2>
                <pre class="code-block">
                        public class Gift {
                          // ... your code here
                        }
                </pre>
              </div>
              <div v-else class="article-skeleton-body"></div>
            </div>

            <div class="article-comments-container is-always-shadow">
              <comment-reply v-show="articleInfo.articleContent" :hasLogin="!$common.isEmpty(username)"
                :total="commentsCount" :comments="articleComments" :isArticle="true"
                @comment="sendComment"></comment-reply>
              <plus-pager @pagination="getArticleAllUserComments" :total="total" :page.sync="queryParams.pageNum"
                :limit="queryParams.pageSize">
              </plus-pager>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="7" :lg="7" :xl="7">
            <div class="user-profile" v-if="!isMobile">
              <div class="user-image">
                <img :src="userAvatar">
              </div>
              <p>{{ articleInfo.authorName }}</p>
              <!-- <el-tag type="info">管理员</el-tag> -->
              <div class="user-stats">
                <!-- <span><i class="el-icon-document"></i>12</span> -->
                <span>
                  <i class="el-icon-chat-dot-round"></i>
                  {{ commentsCount || 0 }}
                </span>
                <span>
                  <i class="el-icon-view"></i>
                  {{ articleInfo.viewCount || 0 }}
                </span>
                <span>
                  <!-- <i class="el-icon-thumb"></i> -->
                  <svg-icon icon-class="thumb"></svg-icon>
                  {{ articleInfo.likeCount || 0 }}
                </span>
              </div>
            </div>

            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>标签云</span>
                </div>
              </div>
              <div class="tag-cloud">
                <span v-for="(tag, index) in styledTags" :key="index" :style="tag.style">
                  <router-link :to="{ path: '/search', query: { tagName: tag.tagName }, }" exact>
                    {{ tag.tagName }} ({{ tag.articleCount }})
                  </router-link>
                </span>
              </div>
            </el-card>

            <!-- Related Articles Section -->
            <section class="related-articles">
              <h2>相关文章</h2>
              <ul>
                <li v-for="(article, index) in articles" :key="index">
                  {{ article }}
                </li>
              </ul>
            </section>
          </el-col>
        </el-row>

        <!-- Like and Comment Section -->
        <!-- <section class="interaction-section">
          <div class="like-button">
            <button @click="likePost">👍 点赞 ({{ likes }})</button>
          </div>

          <div class="comment-section">
            <h3>发表评论</h3>
            <input type="text" placeholder="姓名" />
            <textarea v-model="newComment" placeholder="留下你的评论..."></textarea>
            <button @click="submitComment">发送评论</button>
            <ul>
              <li v-for="(comment, index) in comments" :key="index">
                {{ comment }}
              </li>
            </ul>
          </div>
        </section> -->
      </el-main>
      <!-- <div class="right-aside">
        <div class="right-content" :style="{position: 'fixed', top: fixedTopHeight}">
          <ul>
            <li>奖品配置实体类(概率)</li>
            <li>抽奖工具类</li>
            <li>测试</li>
          </ul>
        </div>
      </div> -->
    </el-container>
  </div>
</template>

<script>
import PlusFooter from '@/layout/components/Footer'
import CommentReply from '@/components/CommentReply'
import PlusPager from '@/components/PlusPager';
import lazyLoadDirectives from '@/mixins/lazyLoadDirectives'

import {
  getArticleDetailIsDisplay, getArticleDetail, getRandomRecommendArt, getTagArticleCount, getFourPlusOneArticles,
  updateViewCountAndLikeCount, getArticleLatestUserComment, getWebHotUserComment, getAllArticleComment, sendArticleComment
} from '@/api/geekplus/geekplus'

export default {
  mixins: [lazyLoadDirectives],
  components: {
    PlusFooter,
    CommentReply,
    PlusPager
  },
  data() {
    return {
      loading: true,
      userAvatar: require('@/assets/images/user-placeholder.png'),
      tableData: [
        { name: '物品1', id: 'P1', probability: 0.2 },
        { name: '物品2', id: 'P2', probability: 0.1 },
        { name: '物品3', id: 'P3', probability: 0.4 },
        { name: '物品4', id: 'P4', probability: 0.3 },
        { name: '物品5', id: 'P5', probability: 0.0 },
        { name: '物品6', id: 'P6', probability: -0.1 },
        { name: '物品7', id: 'P7', probability: 0.008 },
      ],
      articleTags: [
        { tagName: '标签1', articleCount: 10 },
        { tagName: '标签2', articleCount: 20 },
        { tagName: '标签3', articleCount: 30 },
        // ... 更多标签
      ],
      article: {
        articleTitle: "WPS免费定制版本合集",
        categoryName: "资源教程",
        createTime: "9个月前更新",
        authorName: "admin",
        viewCount: 69561,
        comments: 0,
        likeCount: 0,
        articleContent: `WPS是金山公司开发的一款办公软件,它包括WPS文字、WPS演示和WPS表格三个应用程序。WPS以其简洁的设计风格、易于操作的界面和强大的功能而受到广大用户的喜爱。它完全兼容Microsoft Office格式,WPS还提供了云端存储和分享功能,使用户能够方便地在不同设备之间进行文档的共享和协作。可以满足用户在办公中的多种需求。\n然而,需要指出的是,WPS免费版虽然功能较为齐全,但许多高级功能需要通过充值会员才能使用。此外,免费版中存在较多广告,给用户的使用体验带来一定的影响。`,
        // officialLink: "https://platform.wps.cn/",
      },
      articleCover: require('@/assets/images/cover2.jpeg'),
      likes: 10,
      articles: [
        "PVE虚拟机扩展磁盘空间",
        "安装docker步骤 (Ubuntu 20.04)",
        "Mybatis异常报错处理",
        "定期备份数据的方法",
      ],
      newComment: "",
      comments: ["你好！", "这是一个示例评论。"],
      scrollTop: 0,
      fixedTopHeight: 70,
      articleInfo: {},
      prevArticle: {},
      nextArticle: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        topicId: null
      },
      userMessage: {},
      articleComments: [],
      total: 0,
      commentsCount: 0,
      showShareDialog: false,
      qrCodeImg: "",
      shareCardImg: ""
    };
  },
  created() {
    this.getAllArticleTags();
    this.getRecommendArticles();
    this.getArticleContent();
  },
  mounted() {
    window.addEventListener("scroll", this.onScrollPage);
  },
  destroyed() {
    window.removeEventListener("scroll", this.onScrollPage);
  },
  computed: {
    isMobile() {
      //根据用户浏览设备的用户信息和浏览器窗口大小判断是否是移动设备
      return this.$common.isMobile() || this.$store.state.mobileMode;
    },
    shuffledTags() {
      // 复制数组，防止改变原数组
      const shuffled = [...this.articleTags];
      // 随机打乱数组
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    styledTags() {
      return this.shuffledTags.map(tag => {
        const size = this.calculateFontSize(tag.articleCount);
        return {
          ...tag,
          style: {
            'font-size': `${size}px`,
            'color': `${this.getRandomTulipColor()}`
          },
        };
      });
    },
    relatedArticles() {
      const articles = [{ articleTitle: "这是一篇文章", indexPicture: require('@/assets/images/cover3.jpeg'), abstractText: "这是文章摘要", createTime: '2024-08-03 10:09:38' }];
      return this.$store.getters.hotArticleList || articles;
    },
    articleId() {
      //this.$route.query.id
      return this.$route.params.id || 1;
    },
    windowUrl() {
      return window.location.href;
    },
    userId() {
      return this.$store.getters.userId;
    },
    username() {
      return this.$store.getters.username;
    },
    nickname() {
      return this.$store.getters.nickname;
    }
  },
  watch: {
    scrollTop(scrollTop, oldScrollTop) {
      const top = scrollTop > 60 || scrollTop - oldScrollTop > 0;
      if (top) {
        this.fixedTopHeight = 70;
      }
    },
    articleInfo(val) {
      this.articleInfo = val;
      this.modifyViewCount();
      this.getArticleAllUserComments();
    },
    $route(to, from) {
      if (to.path.includes("/article")) {
        this.getArticleContent();
      }
    }
  },
  methods: {
    sendComment(data) {
      if (this.userId && this.nickname) {
        data.name = this.nickname;
        data.userId = this.userId;
      }
      this.userMessage = { topicId: this.articleId, ...data };
      sendArticleComment(this.userMessage).then((res) => {
        if (res.code === 200) {
          this.getArticleAllUserComments();
          this.$message({
            message: "发送成功",
            type: "success",
            duration: 2000,
          });
        }
      });
    },
    getArticleAllUserComments() {
      this.queryParams.topicId = this.articleId;
      getAllArticleComment(this.queryParams).then((res) => {
        this.articleComments = res.rows;
        this.total = res.total;
        this.commentsCount = res.count;
      });
    },
    getArticleContent() {
      this.loading = true;
      // var id = this.$route.params.articleId;
      const param = { id: this.articleId };
      getArticleDetail(param).then((res) => {
        if (res && res.data !== undefined) {
          this.articleInfo = res.data;
          this.prevArticle = res.prevRow;
          this.nextArticle = res.nextRow;
          window.document.title = (res.data.articleTitle || this.$route.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
        }
      }).catch((error) => {
        this.$message({
          message: error.msg || error,
          duration: 3000,
          type: 'error'
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    getRecommendArticles() {
      getRandomRecommendArt().then((res) => {
        this.recommendedArticles = res && res.data !== undefined ? res.data : (res || []);
      });
    },
    //获取所有文章标签和文章数量
    getAllArticleTags() {
      getTagArticleCount()
        .then((response) => {
          this.articleTags = response.data;
        })
        .catch((error) => {
          this.$PlusToast.errorM(error.msg, {
            theme: "light",
          });
        });
    },
    //修改文章的浏览量和点赞数
    modifyViewCount() {
      if (this.articleInfo.viewCount == null) {
        this.articleInfo.viewCount = 0;
      }
      const articleViewAndLike = { viewCount: this.articleInfo.viewCount + 1, id: this.articleId };
      updateViewCountAndLikeCount(articleViewAndLike)
        .then((response) => { })
        .catch((error) => { });
    },
    modifyLikeCount() {
      if (this.articleInfo.likeCount == null) {
        this.articleInfo.likeCount = 0;
      }
      const articleViewAndLike = { likeCount: this.articleInfo.likeCount, id: this.articleId };
      updateViewCountAndLikeCount(articleViewAndLike)
        .then((response) => { })
        .catch((error) => { });
    },
    onThumbsUpButtonTap() {
      this.articleInfo.likeCount += 1;
      this.modifyLikeCount();
    },
    //分享
    toggleShareWith() {
      this.showShareDialog = !this.showShareDialog;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // 设置canvas的尺寸与div相同
      canvas.width = 90;
      canvas.height = 90;
      // 生成二维码
      QRCode.toDataURL(this.windowUrl, { width: 80, height: 80 }, (err, res) => {
        if (err) throw err;
        this.qrCodeImg = res;
        // let img = new Image();
        // img.onload = function (){
        //   document.body.appendChild(img);
        // }
      });
      // QRCode.toCanvas('hello wrold', (err,res) => {
      // if(err) throw err;
      // 返回的结果是canvas元素
      // document.body.appendChild(res);
      // });
      // 在对话框打开后绘制canvas
      // this.$nextTick(async () => {
      //   const canvas = this.$refs.shareCanvas;
      //   const ctx = canvas.getContext('2d');

      //   // 绘制背景
      //   ctx.fillStyle = '#fff';
      //   ctx.fillRect(0, 0, canvas.width, canvas.height);

      //   // 绘制标题
      //   ctx.font = '14px sans-serif';
      //   ctx.fillStyle = '#000';
      //   ctx.fillText("<div class='share-article-title'>"+this.articleInfo.articleTitle+"</div>", 10, 40);

      //   // 绘制链接
      //   ctx.font = '12px sans-serif';
      //   ctx.fillStyle = 'blue';
      //   ctx.fillText(this.windowUrl, 10, canvas.height);

      //   // 生成二维码
      //   const qrCode = await QRCode.toDataURL(this.windowUrl, { width: 80, height: 80 });
      //   const qrCodeImg = new Image();
      //   qrCodeImg.src = qrCode;
      //   const articleBg = new Image();
      //   articleBg.src = require("@/assets/images/cover1.jpeg");
      //   const articleCover = new Image();
      //   articleCover.src = this.articleInfo.indexPicture;
      //   const logo = new Image();
      //   logo.src = require("@/assets/logo.png");
      //   qrCodeImg.onload = () => {
      //     // ctx.drawImage(articleBg, 0, 0, 300, 200);
      //     // ctx.drawImage(articleCover, 10, 0, 250, 100);
      //     // ctx.drawImage(qrCodeImg, canvas.width - 100, canvas.height - 100, 80, 80);
      //   };
      // });
    },
    //分享保存图片
    saveShareCardImg() {
      const _this = this;
      const div = this.$refs.shareCard;
      var shareCanvas = document.createElement('canvas');
      var shareCtx = shareCanvas.getContext('2d');

      // 设置canvas的尺寸与div相同
      shareCanvas.width = 300;
      shareCanvas.height = 600;
      // 使用html2canvas库来捕获div的内容
      html2canvas(div).then(function (shareCanvas) {
        // 将生成的canvas内容添加到页面上的canvas元素中（可选）
        // document.body.appendChild(shareCanvas);

        // 如果需要下载或处理生成的图片，可以进一步操作canvas对象
        // 例如，创建一个图片链接并下载
        var imgData = shareCanvas.toDataURL('image/png');
        // this.shareCardImg = imgData;
        var link = document.createElement('a');
        link.download = 'article'+ _this.articleInfo.id +'.png';
        link.href = imgData;
        link.click();
      });
    },
    //一键复制分享链接
    onLinkButtonTap(e) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(
            "【" + this.articleInfo.articleTitle + "】  \r\n" + this.windowUrl
          )
          .then(() => {
            this.$message({
              message: "复制成功",
              type: "success",
              duration: 3000
            });
          }).catch(() => {
            this.$message({
              message: "复制失败",
              type: "error",
              duration: 3000
            });
          });
      } else {
        // 创建text area
        const textArea = document.createElement("textarea");
        textArea.value =
          "【" + this.articleInfo.articleTitle + "】  \r\n" + this.windowUrl;
        // 使text area不在viewport，同时设置不可见
        document.body.appendChild(textArea);
        // textArea.focus();//会导致页面滚动到底部
        textArea.select();
        return new Promise((resolve, reject) => {
          // 执行复制命令并移除文本框
          document.execCommand("copy")
            ? resolve()
            : reject(new Error("出错了"));
          textArea.remove();
        }).then(
          () => {
            this.$PlusToast.successM("复制成功", {
              theme: "light",
            });
            this.$message({
              message: "复制失败",
              type: "error",
              duration: 3000
            });
          },
          () => {
            this.$PlusToast.errorM("复制失败", {
              theme: "light",
            });
          }
        );
      }
      // navigator.clipboard.writeText(this.windowUrl).then(() => {}).catch(() => {});
    },
    likePost() {
      this.likes++;
    },
    submitComment() {
      if (this.newComment.trim()) {
        this.comments.push(this.newComment.trim());
        this.newComment = "";
      }
    },
    onScrollPage() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    },
    // 计算标签的font-size
    calculateFontSize(count) {
      const minFontSize = 13; // 最小字体大小
      const maxFontSize = 24; // 最大字体大小
      const countRange = maxFontSize - minFontSize;
      // 将count范围统一到0-1之间
      const relativeCount = (count - Math.min(...this.articleTags.map(t => t.articleCount))) / (Math.max(...this.articleTags.map(t => t.articleCount)) - Math.min(...this.articleTags.map(t => t.articleCount)));
      // 计算字体大小
      return Math.round(minFontSize + relativeCount * countRange);
    },
    renderMdText(text) {
      this.$nextTick(() => {
        this.copyCode();
      });
      return text;
    },
  },
};
</script>

<style lang="scss" scoped>
.left-aside {
  width: 60px;
  /* background-color: #f5f7fa; */
  /* Element UI's light gray */
  /* Align buttons to top */
  height: fit-content;
}

.left-tool-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: fixed;
  top: 70px;
  left: auto;
}

.left-aside .el-button {
  margin-bottom: 10px;
}


.el-container {
  height: 100%;
  /* Make container fill viewport height */
}

.right-aside {
  width: 230px;
  height: fit-content;
  overflow: auto;
}

.right-content {
  background-color: var(--background-1, #f5f7fa);
  position: fixed;
  top: 70px;
  left: auto;
}

.right-content ul {
  margin: 0;
  padding: 5px 5px 5px 20px;
}

.el-button {
  margin-left: 10px;
}

.article-container {
  background-color: var(--background-1, #fff);
  /* Limit content width for readability */
  margin: 0 auto;
  padding: 6px;
  margin-bottom: 10px;
}

.user-profile {
  text-align: center;
  margin-bottom: 15px;
  padding: 10px;
  background: var(--background-1);
  border-radius: 4px;
}

.user-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 10px;

  overflow: hidden;
}

.user-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-stats span {
  margin: 0 10px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-info .avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-info .views,
.user-info .time {
  margin-left: 10px;
}


pre,
pre.code-block {
  background-color: var(--color-article-pre, #f5f5f5);
  color: var(--color-article-pre-font);
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  /* Use a monospace font for code */
}


/* Responsive adjustments */
@media (max-width: 992px) {
  .el-aside {
    width: auto;
    /* Allow aside to collapse */
  }

  .left-aside {
    flex-direction: column;
    justify-content: center;
    /* Distribute buttons evenly */
    padding: 10px 0;
  }

  .right-aside {
    display: none;
  }

  .article-container {
    max-width: 100%;
    /* Remove max-width on smaller screens */
  }

  .related-articles,
  .interaction-section {
    padding: 8px;
  }

  .like-button button,
  .comment-section button {
    font-size: 14px;
  }
}

/* Related Articles Section */
.related-articles {
  background-color: var(--background-1, #f9f9f9);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.related-articles h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.related-articles ul {
  list-style: none;
  padding: 0;
}

.related-articles li {
  padding: 5px 0;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.related-articles li:last-child {
  border-bottom: none;
}

/* Like and Comment Section */
.interaction-section {
  background-color: var(--background-1, #fff);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color, #ddd);
}

.skeleton-block {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  margin-bottom: 16px;
}

.article-skeleton-title {
  height: 32px;
  width: 60%;
}

.article-skeleton-meta {
  height: 18px;
  width: 50%;
  margin-bottom: 24px;
}

.article-skeleton-body {
  min-height: 320px;
  width: 100%;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.article-comments-container {
  overflow: hidden;
  border-radius: 4px;
}

.like-button {
  text-align: center;
  margin-bottom: 10px;
}

.like-button button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.like-button button:hover {
  background-color: #0056b3;
}

.comment-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.comment-section textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
  resize: none;
}

.comment-section button {
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-section button:hover {
  background-color: #1c7430;
}

.comment-section ul {
  list-style: none;
  padding: 0;
}

.comment-section li {
  padding: 5px 0;
  border-bottom: 1px solid var(--border-color, #ddd);
}

.comment-section li:last-child {
  border-bottom: none;
}
</style>
