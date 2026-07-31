<template>
  <!-- 页面骨架：gp-page 替代 el-container/el-main/el-row/el-col -->
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-xs-24 gp-col-sm-17 gp-col-md-17 gp-col-lg-17 gp-col-xl-17">
            <div class="main-article-content">
              <div class="top-ads" v-if="showTopAds">
                <div class="ad-item" v-for="ad in topAds" :key="ad.title">
                  <el-tag :type="ad.tagType">{{ ad.title }}</el-tag>
                  <el-input v-model="ad.content"></el-input>
                </div>
              </div>
              <div class="article-container is-always-shadow" :class="{ 'mobile-view': isMobile }">
                <div class="section-header article-breadcrumb" :class="{ 'skeleton-loading': loading }">
                  <i class="el-icon-reading"></i>
                  <post-breadcrumb :breadCrumbList="breadCrumbList"></post-breadcrumb>
                </div>
                <div class="article-header" :class="{ 'skeleton-loading': loading }">
                  <h1 class="article-title">{{ articleInfo.articleTitle || '没有内容，找不到文章或主题！' }}</h1>
                  <div class="article-meta">
                    <!-- <span>{{ articleInfo.categoryName }} </span> -->
                    <span>{{ getYMDTime(articleInfo.createTime) }}</span>
                    <span><i class="el-icon-user-solid"></i> {{ articleInfo.authorName }}</span>
                    <span class="views"><i class="el-icon-view"></i> {{ articleInfo.viewCount || 0 }}</span>
                    <span class="comments"><i class="el-icon-chat-round"></i> {{ commentsCount || 0 }} </span>
                    <span class="stars">
                      <!-- <i class="el-icon-thumb"></i> -->
                      <svg-icon icon-class="thumb"></svg-icon> {{ articleInfo.likeCount || 0 }}
                    </span>
                  </div>
                </div>
                <div class="article-content" :class="{ 'skeleton-loading': loading }"
                  v-highlight v-viewer v-html="renderMdText(articleInfo.articleContent)">
                </div>
                <div class="plus-article-toolbar">
                  <!-- <button
                    class="toolbar-button"
                    data-container="body"
                    data-trigger="hover"
                    data-toggle="popover"
                    title="觉得有帮助，可以给我赞赏!"
                  >
                    <span class="glyphicon glyphicon-gift"></span>
                    赞助
                  </button> -->
                  <!-- <plus-tool-tip :maxWidth="240">
                  <template #title>
                    <div class='popover-container' >
                      <img :src='alipayImg' width='100px' height='100px'>&nbsp;
                      <img :src='wxpayImg' width='100px' height='100px'>
                    </div>
                  </template>
<button class="toolbar-button">
  <span class="glyphicon glyphicon-gift"></span>
  赞助
</button>
</plus-tool-tip> -->
                  <!-- <div class="plus-popover-wrapper">
                    <button class="toolbar-button plus-popover-trigger" data-placement="auto">
                      <span class="glyphicon glyphicon-gift"></span>赞助
                    </button>
                    <div class="plus-popover-tip">
                      <div class='popover-container' style="display: flex; flex-direction: row;">
                        <img :src='alipayImg' width='100px' height='100px'>&nbsp;
                        <img :src='wxpayImg' width='100px' height='100px'>
                      </div>
                    </div>
                  </div> -->
                  <button class="toolbar-button" type="button" @click="onThumbsUpButtonTap">
                    <!-- <i class="el-icon-thumb"></i> -->
                    <svg-icon icon-class="thumb"></svg-icon>
                    点赞 ({{ articleInfo.likeCount ? numFormatKWM(articleInfo.likeCount) : 0 }})
                  </button>
                  <button class="toolbar-button" type="button" @click="toggleShareWith">
                    <i class="el-icon-share"></i>
                    分享
                  </button>
                  <button class="toolbar-button" type="button" @click="onLinkButtonTap">
                    <i class="el-icon-link"></i>
                    链接
                    <div id="generatelink" value="生成链接" style="display: none">
                      生成链接
                    </div>
                  </button>
                </div>
                <div>
                  <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="3776635819">
                  </Adsense>
                </div>
                <!-- <div class="tips">
                  <p>官网： <a :href="article.officialLink">{{ article.officialLink }}</a></p>
                </div> -->
                <!-- <div class="article-tag">
                  <span class="tag-link" @click="getTagArticle(item.id)" v-for="(item, index) in articleInfo.tags" :key="index">{{ item.tagName }}</span>
                </div> -->
                <!-- <div class="more-info">
                  <div v-for="infoItem in extraInfo" :key="infoItem.title" class="info-item">
                    <h3>{{ infoItem.title }}</h3>
                    <ol>
                      <li v-for="point in infoItem.points" :key="point">
                        {{ point }}
                      </li>
                    </ol>
                  </div>
                </div> -->
                <div class="article-tag-container">
                  <div class="tag-wrapper">
                    <span v-for="(item, index) in articleInfo.tags" :key="index" class="plus-tag" aria-hidden="true">
                      <span class="plus-tag-label">
                        <router-link :to="{ path: '/search', query: { tagName: item.tagName } }">
                          <svg-icon iconClass="tag"></svg-icon>
                          {{ item.tagName }}
                        </router-link>
                      </span>
                    </span>
                  </div>
                </div>

                <div v-show="articleInfo.articleContent && (prevArticle || nextArticle)">
                  <div class="navigation-article-wrapper">
                    <!-- 使用三目运算符判断 按钮是否可以点击 -->
                    <div class="left-navigation">
                      <div v-if="prevArticle" class="navigation-info">
                        <router-link :to="'/article/' + prevArticle.id" :class="prevArticle ? 'btnClick' : 'noClick'">
                          <span><i class="el-icon-arrow-left"></i> 上一篇</span>
                        </router-link>
                        <span class="">{{ prevArticle.articleTitle }}</span>
                      </div>
                      <span v-else>
                        <span class="glyphicon glyphicon-hand-left" aria-hidden="true"></span>没有了
                      </span>
                    </div>
                    <!-- 使用三目运算符判断 按钮是否可以点击 -->
                    <div class="right-navigation">
                      <div v-if="nextArticle" class="navigation-info">
                        <span class="">{{ nextArticle.articleTitle }}</span>
                        <router-link :to="'/article/' + nextArticle.id" :class="nextArticle ? 'btnClick' : 'noClick'">
                          <span>下一篇 <i class="el-icon-arrow-right"></i></span>
                        </router-link>
                      </div>
                      <span v-else>
                        没有了<span class="glyphicon glyphicon-hand-right" aria-hidden="true"></span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="article-comments-container is-always-shadow" :class="{ 'mobile-view': isMobile }">
                <comment-reply v-show="articleInfo.articleContent" :hasLogin="!$common.isEmpty(username)"
                  :total="commentsCount" :comments="articleComments" :isArticle="true"
                  @comment="sendComment"></comment-reply>
                <plus-pager @pagination="getArticleAllUserComments" :total="total" :page.sync="queryParams.pageNum"
                  :limit="queryParams.pageSize">
                </plus-pager>
              </div>

            </div>
          </div>
          <div class="gp-col-24 gp-col-xs-24 gp-col-sm-7 gp-col-md-7 gp-col-lg-7 gp-col-xl-7">
            <!-- <div class="left-sidebar">
                          <el-menu default-active="more" class="el-menu-vertical-demo" background-color="#27292b"
                              text-color="#fff" active-text-color="#ffd04b">
                              <el-menu-item index="more">
                                  <i class="el-icon-menu"></i>
                                  <span slot="title">更多导航</span>
                              </el-menu-item>
                              <el-menu-item index="life">
                                  <i class="el-icon-house"></i>
                                  <span slot="title">生活休闲</span>
                              </el-menu-item>
                              <el-menu-item index="video">
                                  <i class="el-icon-video-camera-solid"></i>
                                  <span slot="title">影视资源</span>
                              </el-menu-item>
                              <el-menu-item index="comic">
                                  <i class="el-icon-folder-add"></i>
                                  <span slot="title">动漫漫画</span>
                              </el-menu-item>
                              <el-menu-item index="search">
                                  <i class="el-icon-search"></i>
                                  <span slot="title">资源搜索</span>
                              </el-menu-item>
                              <el-menu-item index="software">
                                  <i class="el-icon-s-grid"></i>
                                  <span slot="title">软件应用</span>
                              </el-menu-item>
                              <el-menu-item index="study">
                                  <i class="el-icon-school"></i>
                                  <span slot="title">学习提升</span>
                              </el-menu-item>
                          </el-menu>
                      </div> -->
            <div class="right-sidebar">
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

              <!-- 侧栏卡片：去掉 el-card，改用 gp-surface-card 统一博客侧栏视觉 -->
              <div v-if="!isMobile" class="gp-surface-card box-card">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-search"></i>搜索</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <!-- 侧栏搜索：gp-input-group 替代 el-input append 模式 -->
                  <div class="gp-input-group">
                    <input class="gp-input" placeholder="搜索文章" v-model="searchQuery" @keyup.enter="searchArticles">
                    <button type="button" class="gp-btn gp-btn--append" @click="searchArticles"><i class="el-icon-search"></i></button>
                  </div>
                </div>
              </div>

              <!-- 移动端隐藏侧栏：标签云 / 相关 / 推荐（同时不发起对应请求） -->
              <div v-if="!isMobile" class="gp-surface-card box-card">
                <div class="gp-surface-card__body">
                  <Adsense data-ad-format="rectangle, vertical, horizontal" data-full-width-responsive="yes"
                    data-ad-client="ca-pub-7291512442295477" data-ad-slot="1460930833">
                  </Adsense>
                </div>
              </div>

              <div v-if="!isMobile" class="gp-surface-card box-card">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>标签云</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="tag-cloud">
                    <span v-for="(tag, index) in styledTags" :key="index" :style="tag.style">
                      <router-link :to="{ path: '/search', query: { tagName: tag.tagName }, }" exact>
                        {{ tag.tagName }} ({{ tag.articleCount }})
                      </router-link>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="!isMobile" class="gp-surface-card related-articles">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>相关文章</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="related-article-item" v-for="(relatedArticle, index) in relatedArticles" :key="index">
                    <div class="related-article-cover">
                      <router-link :to="'/article/' + relatedArticle.id">
                        <el-image class="article-cover" :src="relatedArticle.indexPicture || articleCover" fit="cover">
                        </el-image>
                      </router-link>
                    </div>
                    <div class="related-article-intro">
                      <h3><router-link :to="'/article/' + relatedArticle.id">{{ relatedArticle.articleTitle
                          }}</router-link>
                      </h3>
                      <p>{{ relatedArticle.abstractText }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!isMobile" class="gp-surface-card box-card">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>推荐文章</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="recommend-article-container">
                    <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                      <router-link :to="`/article/${article.id}`">{{ article.articleTitle }}</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="el-fade-in-linear">
      <plus-footer></plus-footer>
    </transition>
    <div class="share-wrapper" v-show="showShareDialog">
      <div class="share-overlay"></div>
      <div class="share-box" :class="{ open: showShareDialog }">
        <div class="share-box__main">
          <div class="share-box__header">
            <div class="share-box__close-btn" @click="toggleShareWith">
              <span class="dialog__close-btn"><i class="el-icon-close"></i></span>
            </div>
          </div>
          <!-- Canvas 直绘分享图，无需离屏 DOM -->
          <div class="share-box-container">
            <!--
              预览必须可长按呼出系统「存储图像」。
              触控端用 dataURL（shareCardImg），避免 blob: 在 Web Share / a[download] 后被 WebKit 锁死导致无法长按。
            -->
            <div class="share-preview" v-if="shareCardImg">
              <img
                :key="'share-preview-' + sharePreviewKey"
                ref="sharePreviewImg"
                class="share-card-img"
                :src="sharePreviewSrc"
                alt="文章分享图"
                title="长按图片可保存到相册"
              >
              <p class="share-hint">{{ isTouchDevice ? '长按上方图片保存到相册，或点下方按钮分享/下载' : '可点击下方按钮下载图片' }}</p>
            </div>
            <div class="share-preview share-preview--loading" v-else>
              <i class="el-icon-loading"></i>
              <span>{{ shareStatusText }}</span>
            </div>
          </div>
          <div class="share-box__btn">
            <button
              class="share-btn is-save"
              :disabled="!shareCardImg || shareCardGenerating"
              @click="saveShareCardImg"
            >{{ isTouchDevice ? '分享/保存图片' : '下载分享图片' }}</button>
            <button class="share-btn" @click="onLinkButtonTap">复制链接</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'; // 引入二维码生成库

import PostBreadcrumb from '@/layout/components/Breadcrumb/primary'
import PlusFooter from '@/layout/components/Footer'
import CommentReply from '@/components/CommentReply'
import PlusPager from '@/components/PlusPager';
import lazyLoadDirectives from '@/mixins/lazyLoadDirectives'
import {
  getArticleDetail, getRandomRecommendArt, getTagArticleCount,
  updateViewCountAndLikeCount, getAllArticleComment, sendArticleComment
} from '@/api/geekplus/geekplus'
import { runWhenIdle, scheduleArticleViewCount, cancelIdle } from '@/utils/deferRequest'

export default {
  mixins: [lazyLoadDirectives],
  components: {
    PostBreadcrumb,
    PlusFooter,
    CommentReply,
    PlusPager
  },
  data() {
    return {
      loading: true,
      userAvatar: require('@/assets/images/user-placeholder.png'),
      showTopAds: false,
      topAds: [
        { title: "免费领取流量卡", content: "", tagType: "" },
        { title: "5118 AI写作工具", content: "", tagType: "warning" },
        { title: "免费AI创作", content: "", tagType: "success" },
        { title: "免费短剧", content: "", tagType: "" },
        { title: "立即入驻", content: "", tagType: "danger" },
      ],
      //贴文或post内容信息
      articleInfo: {
        articleTitle: "WPS免费定制版本合集",
        categoryName: "资源教程",
        createTime: "9个月前更新",
        authorName: "admin",
        viewCount: 69561,
        comments: 0,
        likeCount: 0,
        articleContent: `<div style='min-height: 500px;'><p>WPS是金山公司开发的一款办公软件,它包括WPS文字、WPS演示和WPS表格三个应用程序。WPS以其简洁的设计风格、易于操作的界面和强大的功能而受到广大用户的喜爱。</p><p>它完全兼容Microsoft Office格式,WPS还提供了云端存储和分享功能,使用户能够方便地在不同设备之间进行文档的共享和协作。可以满足用户在办公中的多种需求。\n</p><p>然而,需要指出的是,WPS免费版虽然功能较为齐全,但许多高级功能需要通过充值会员才能使用。此外,免费版中存在较多广告,给用户的使用体验带来一定的影响。</p><div>`,
        // officialLink: "https://platform.wps.cn/",
      },
      extraInfo: [
        { title: "官网个人免费版", points: ["官网： https://platform.wps.cn/"] },
        {
          title: "此外",
          points: [
            "WPS除了官方个人免费版本外，还提供了许多供高校和政府机构使用的定制版。这些定制版通常经过了特定机构的定制和优化，以满足特定用户群体的需求。它们功能齐全，界面清爽，并且没有广告的干扰。通过这些定制版，用户可以更好地适应自己所在机构的工作环境。以下是深度导航收集到的一些可用的版本：",

          ]
        },
        { title: "1. WPS教育专版", points: ["专为一级、二级WPS考试设计的版本，无广告。你可以在中国教育考试网上获取该版本。", "1.中国教育考试网： https://ncre.neea.edu.cn/html1/report/1507/861-1.htm"] },
        { title: "2. 高校定制版本", points: ["一些高校也推出了自己定制的WPS版本。例如，云南师范大学、西北大学、洛阳理工学院、温州大学商学院・金融学院以及石家庄信息工程职业学院等都发布了自己的定制版WPS。"] }
      ],
      articleTags: [
        { tagName: '标签1', articleCount: 10 },
        { tagName: '标签2', articleCount: 20 },
        { tagName: '标签3', articleCount: 30 },
        // ... 更多标签
      ],
      articleCover: require('@/assets/images/cover2.jpeg'),
      //随机推荐文章
      recommendedArticles: [],
      //文章页面的面包屑路径
      breadCrumbList: [],
      prevArticle: {},
      nextArticle: {},
      searchQuery: '',
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
      // 分享卡最终 JPEG dataURL（下载/分享用）
      shareCardImg: "",
      // blob URL 预览，移动端长按存图比超长 dataURL 更稳
      shareCardBlobUrl: "",
      shareCardGenerating: false,
      shareCardCacheKey: "",
      shareCoverDataUrl: "",
      shareLogoDataUrl: "",
      // 关闭弹层时递增，作废进行中的异步生成，避免竞态
      shareGenToken: 0,
      shareStatusText: "正在生成分享图…",
      // 强制重挂载预览 img，修复「点保存后无法长按」的 WebKit 问题
      sharePreviewKey: 0,
      _html2canvasPromise: null,
      // 浏览量上报句柄，离开页取消
      _viewCountJob: null,
      _sidebarIdleId: null,
      _commentsIdleId: null
    };
  },
  async created() {
    // 正文优先；侧栏标签/推荐仅桌面且 idle 后再请求，减轻移动端首屏并发
    this.getArticleContent();
  },
  watch: {
    // 不在 deep watch 里改 articleInfo / 刷浏览量，避免重复请求
    $route(to, from) {
      if (to.path !== from.path && String(to.path).indexOf('/article') === 0) {
        this.cancelDeferredJobs();
        this.getArticleContent();
      }
    }
  },
  computed: {
    isMobile() {
      //根据用户浏览设备的用户信息和浏览器窗口大小判断是否是移动设备
      return this.$common.isMobile() || this.$store.state.mobileMode;
    },
    routerMatch() {
      // console.log(this.$route.matched);
      // let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      // let levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
      return {};
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
    isTouchDevice() {
      if (typeof window === "undefined") return false;
      return "ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0);
    },
    /**
     * 预览图地址策略：
     * - 触控端始终用 dataURL，保证长按「存储图像」可用
     * - 桌面可用 blob URL（体积展示略省内存，不影响右键另存）
     */
    sharePreviewSrc() {
      if (!this.shareCardImg) return "";
      if (this.isTouchDevice) return this.shareCardImg;
      return this.shareCardBlobUrl || this.shareCardImg;
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
  mounted() {},
  beforeDestroy() {
    this.cancelDeferredJobs();
    this.revokeShareBlobUrl();
  },
  methods: {
    cancelDeferredJobs() {
      if (this._viewCountJob && this._viewCountJob.cancel) this._viewCountJob.cancel();
      this._viewCountJob = null;
      cancelIdle(this._sidebarIdleId);
      cancelIdle(this._commentsIdleId);
      this._sidebarIdleId = null;
      this._commentsIdleId = null;
    },
    /** 桌面侧栏：空闲后再拉标签云与推荐，移动端直接跳过 */
    scheduleSidebarRequests() {
      if (this.isMobile) return;
      this._sidebarIdleId = runWhenIdle(() => {
        this.getAllArticleTags();
        this.getRecommendArticles();
      }, 2500);
    },
    /** 评论区延后加载，优先保证正文 */
    scheduleCommentsRequest() {
      this._commentsIdleId = runWhenIdle(() => {
        this.getArticleAllUserComments();
      }, 1800);
    },
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
      // this.$confirm('评论留言需要审核，才能显示！', '提示', {
      //   confirmButtonText: '确定发布',
      //   cancelButtonText: '取消发布',
      //   type: 'warning'
      // }).then(() => { }).catch(() => { });
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
      const param = { id: this.articleId };
      getArticleDetail(param).then((res) => {
        if (res && res.data !== undefined) {
          this.getBreadCrumb(res.data.articleCategory);
          this.articleInfo = res.data;
          this.prevArticle = res.prevRow;
          this.nextArticle = res.nextRow;
          // 更新页面标题,更新路由元信息中的标题,路径参数中的标题和分类名称
          window.document.title = (res.data.articleTitle || this.$route.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
          this.$route.meta.title = res.data.articleTitle;
          this.$route.params.title = res.data.articleTitle;
          this.$route.params.categoryName = res.data.articleCategory.categoryName;
          // 乐观更新本地展示；真实上报走延后+会话去重
          if (this.articleInfo.viewCount == null) this.articleInfo.viewCount = 0;
          this.articleInfo.viewCount = Number(this.articleInfo.viewCount) + 1;
          this.scheduleViewCountUpdate();
          this.scheduleCommentsRequest();
          this.scheduleSidebarRequests();
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
      if (this.isMobile) return;
      getRandomRecommendArt().then((res) => {
        this.recommendedArticles = res && res.data !== undefined ? res.data : (res || []);
      });
    },
    //获取所有文章标签和文章数量
    getAllArticleTags() {
      if (this.isMobile) return;
      getTagArticleCount()
        .then((res) => {
          this.articleTags = res && res.data !== undefined ? res.data : (res || []);
        })
        .catch((error) => {
          this.$PlusToast.errorM(error.msg, {
            theme: "light",
          });
        });
    },
    /**
     * 浏览量：停留约 3s + idle 后再上报；同会话同篇只计一次（成熟站点常见做法）
     */
    scheduleViewCountUpdate() {
      if (this._viewCountJob && this._viewCountJob.cancel) this._viewCountJob.cancel();
      const id = this.articleId;
      const nextCount = this.articleInfo.viewCount;
      this._viewCountJob = scheduleArticleViewCount({
        articleId: id,
        dwellMs: 3000,
        send: () => updateViewCountAndLikeCount({ viewCount: nextCount, id })
      });
    },
    // 兼容旧调用名
    modifyViewCount() {
      this.scheduleViewCountUpdate();
    },
    modifyLikeCount() {
      if (this.articleInfo.likeCount == null) {
        this.articleInfo.likeCount = 0;
      }
      const articleViewAndLike = { likeCount: this.articleInfo.likeCount, id: this.articleId };
      updateViewCountAndLikeCount(articleViewAndLike)
        .then(() => {})
        .catch(() => {});
    },
    onThumbsUpButtonTap() {
      this.articleInfo.likeCount += 1;
      this.modifyLikeCount();
    },
    /**
     * 打开/关闭分享面板：Canvas 直绘分享图（无需 html2canvas，移动端更快）
     * 关闭时递增 shareGenToken，丢弃未完成任务
     */
    toggleShareWith() {
      this.showShareDialog = !this.showShareDialog;
      if (!this.showShareDialog) {
        // 关闭时作废进行中的生成，避免竞态导致再次打开/长按异常
        this.shareGenToken += 1;
        this.shareCardGenerating = false;
        this.shareStatusText = "已取消";
        return;
      }
      const cacheKey = [this.articleId, this.windowUrl, this.articleInfo.indexPicture || ""].join("|");
      if (this.shareCardImg && this.shareCardCacheKey === cacheKey) {
        return;
      }
      this.revokeShareBlobUrl();
      this.shareCardImg = "";
      this.shareCardGenerating = true;
      this.shareCardCacheKey = cacheKey;
      this.shareStatusText = "正在准备封面与二维码…";
      this.prepareAndGenerateShareCard();
    },
    revokeShareBlobUrl() {
      if (this.shareCardBlobUrl) {
        try {
          URL.revokeObjectURL(this.shareCardBlobUrl);
        } catch (e) { /* ignore */ }
        this.shareCardBlobUrl = "";
      }
    },
    resolveShareCoverSrc(src) {
      if (!src) return "";
      if (typeof src !== "string") return src;
      if (/^(data:|blob:|https?:)/i.test(src)) return src;
      if (src.charAt(0) === "/") return window.location.origin + src;
      return src;
    },
    /** 封面候选 URL：原地址、同源补全、去掉 query 再试 */
    buildShareCoverCandidates(src) {
      if (!src || typeof src !== "string") return [];
      const list = [];
      const add = (u) => {
        if (u && list.indexOf(u) === -1) list.push(u);
      };
      const raw = String(src).trim();
      add(raw);
      add(this.resolveShareCoverSrc(raw));
      if (raw.charAt(0) === "/") {
        add(window.location.origin + raw);
      }
      // 去掉 ?x= 后再试（部分 CDN 签名参数导致 canvas CORS 失败）
      const noQuery = raw.split("?")[0];
      if (noQuery !== raw) {
        add(noQuery);
        add(this.resolveShareCoverSrc(noQuery));
      }
      return list;
    },
    /** 经 fetch→blob→objectURL 加载，规避跨域导致 canvas 无法导出 */
    async fetchCoverAsObjectUrl(url) {
      if (!url || /^(data:|blob:)/i.test(url)) return "";
      try {
        const res = await fetch(url, { mode: "cors", credentials: "omit", cache: "force-cache" });
        if (!res.ok) return "";
        const blob = await res.blob();
        // 空文件（线上偶发 200 + Content-Length:0）视为失败
        if (!blob || !blob.size) return "";
        if (blob.type && blob.type.indexOf("image") === -1 && blob.type.indexOf("octet") === -1) {
          // 仍可能是图片但 type 不准，继续尝试
        }
        return URL.createObjectURL(blob);
      } catch (e) {
        return "";
      }
    },
    /** 检测图能否安全画入 canvas 并 toDataURL（防污染） */
    canUseImageInCanvas(img) {
      if (!img || !img.naturalWidth) return false;
      try {
        const c = document.createElement("canvas");
        c.width = 2;
        c.height = 2;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, 2, 2);
        c.toDataURL("image/jpeg", 0.5);
        return true;
      } catch (e) {
        return false;
      }
    },
    /**
     * 加载分享封面：优先文章 indexPicture（多候选 + blob 中转），失败才用默认 articleCover。
     */
    async loadShareCoverImage(remoteCover, localCover) {
      const candidates = this.buildShareCoverCandidates(remoteCover);
      for (let i = 0; i < candidates.length; i++) {
        const url = candidates[i];
        // 1) fetch→blob：同源/可 CORS 时最稳，objectURL 可直接进 canvas
        const blobUrl = await this.fetchCoverAsObjectUrl(url);
        if (blobUrl) {
          const img = await this.loadImageEl(blobUrl, 3200, { crossOrigin: null });
          if (img && this.canUseImageInCanvas(img)) {
            img._revokeUrl = blobUrl;
            return img;
          }
          try { URL.revokeObjectURL(blobUrl); } catch (e) { /* ignore */ }
        }
        // 2) 直接 Image + anonymous
        const imgCors = await this.loadImageEl(url, 2800, { crossOrigin: "anonymous" });
        if (imgCors && this.canUseImageInCanvas(imgCors)) return imgCors;
      }
      // 确无可用封面时再回退默认图
      return this.loadImageEl(localCover, 800, { crossOrigin: null });
    },
    /**
     * 加载图片为 HTMLImageElement。
     * 注意：线上部分 /profile/upload 会 200 但空文件，onload 后 naturalWidth=0，需立刻失败回退。
     * @param {string} src
     * @param {number} timeoutMs
     * @param {{ crossOrigin?: string|null }} [opts]
     */
    loadImageEl(src, timeoutMs, opts) {
      return new Promise((resolve) => {
        if (!src) {
          resolve(null);
          return;
        }
        if (typeof src !== "string") {
          if (src && src.tagName === "IMG") {
            resolve(src);
            return;
          }
        }
        const absolute = this.resolveShareCoverSrc(src);
        const img = new Image();
        let done = false;
        const finish = (val) => {
          if (done) return;
          done = true;
          resolve(val);
        };
        img.onload = () => {
          if (!img.naturalWidth) finish(null);
          else finish(img);
        };
        img.onerror = () => finish(null);
        const cross = opts && Object.prototype.hasOwnProperty.call(opts, "crossOrigin")
          ? opts.crossOrigin
          : undefined;
        if (cross) {
          img.crossOrigin = cross;
        } else if (cross !== null) {
          // 默认：跨站才加 anonymous，避免同站误设导致失败
          const isRemote = /^https?:\/\//i.test(absolute) && absolute.indexOf(window.location.origin) !== 0;
          if (isRemote) img.crossOrigin = "anonymous";
        }
        img.src = absolute;
        if (img.complete && img.naturalWidth) finish(img);
        window.setTimeout(() => finish(img.naturalWidth ? img : null), timeoutMs || 2500);
      });
    },
    /**
     * 组装素材并 Canvas 绘制分享卡。
     * 相比 html2canvas：无动态大包、无 DOM 截图，移动端通常可在 1s 内完成。
     */
    async prepareAndGenerateShareCard() {
      const token = ++this.shareGenToken;
      const localCover = this.articleCover;
      const logoSrc = require("@/assets/logo.png");
      const remoteCover = this.articleInfo.indexPicture || this.articleInfo.cover || "";
      let coverBlobToRevoke = "";
      try {
        this.shareStatusText = remoteCover ? "加载文章封面…" : "准备默认封面…";
        const [coverImg, logoImg, qrData] = await Promise.all([
          this.loadShareCoverImage(remoteCover, localCover),
          this.loadImageEl(logoSrc, 400, { crossOrigin: null }),
          new Promise((resolve) => {
            QRCode.toDataURL(
              this.windowUrl,
              { width: 120, height: 120, margin: 1, errorCorrectionLevel: "M" },
              (err, res) => resolve(err ? "" : res)
            );
          })
        ]);
        if (coverImg && coverImg._revokeUrl) coverBlobToRevoke = coverImg._revokeUrl;
        if (token !== this.shareGenToken || !this.showShareDialog) return;
        if (!qrData) {
          this.shareCardGenerating = false;
          this.shareStatusText = "二维码生成失败";
          this.$message({ message: "二维码生成失败", type: "error", duration: 2500 });
          return;
        }
        this.qrCodeImg = qrData;
        this.shareStatusText = "渲染中…";
        const qrImg = await this.loadImageEl(qrData, 300, { crossOrigin: null });
        if (token !== this.shareGenToken || !this.showShareDialog) return;
        const dataUrl = this.drawShareCardToDataUrl({
          coverImg: coverImg || null,
          logoImg: logoImg || null,
          qrImg: qrImg || null,
          title: this.articleInfo.articleTitle || "",
          summary: this.articleInfo.abstractText || "",
          link: this.windowUrl || "",
          brand: "极客普拉斯"
        });
        if (token !== this.shareGenToken || !this.showShareDialog) return;
        this.shareCardImg = dataUrl;
        this.revokeShareBlobUrl();
        // 触控端预览只用 dataURL，不建 blob，避免 Web Share 后长按菜单失效
        if (!this.isTouchDevice) {
          try {
            this.shareCardBlobUrl = URL.createObjectURL(this.dataUrlToBlob(dataUrl));
          } catch (e) {
            this.shareCardBlobUrl = "";
          }
        }
        this.shareStatusText = "已生成";
      } catch (e) {
        if (token !== this.shareGenToken) return;
        this.shareStatusText = "生成失败";
        this.$message({ message: "分享图生成失败，请稍后重试", type: "error", duration: 3000 });
      } finally {
        if (coverBlobToRevoke) {
          try { URL.revokeObjectURL(coverBlobToRevoke); } catch (e) { /* ignore */ }
        }
        if (token === this.shareGenToken) this.shareCardGenerating = false;
      }
    },
    wrapText(ctx, text, maxWidth, maxLines) {
      const str = String(text || "").replace(/\s+/g, " ").trim();
      if (!str) return [];
      const lines = [];
      let line = "";
      for (let i = 0; i < str.length; i++) {
        const test = line + str[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = str[i];
          if (lines.length >= maxLines) break;
        } else {
          line = test;
        }
      }
      if (lines.length < maxLines && line) lines.push(line);
      if (lines.length >= maxLines) {
        let last = lines[maxLines - 1];
        while (last.length > 1 && ctx.measureText(last + "…").width > maxWidth) {
          last = last.slice(0, -1);
        }
        lines[maxLines - 1] = last + "…";
      }
      return lines;
    },
    drawCoverFit(ctx, img, x, y, w, h) {
      if (!img) {
        ctx.fillStyle = "#e8ecf1";
        ctx.fillRect(x, y, w, h);
        return;
      }
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    },
    /**
     * 在离屏 canvas 上绘制固定 360 宽分享卡并导出 JPEG。
     * dpr=2 兼顾清晰度与体积；封面缺失时画灰底占位。
     */
    drawShareCardToDataUrl({ coverImg, logoImg, qrImg, title, summary, link, brand }) {
      const cssW = 360;
      const dpr = this.isTouchDevice ? 2 : 2;
      const pad = 14;
      const coverH = 170;
      // 预估高度
      const cssH = 14 + coverH + 12 + 52 + 10 + 54 + 12 + 68 + 10 + 28 + 14;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      // 背景
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cssW, cssH);
      // 封面
      this.roundRect(ctx, pad, pad, cssW - pad * 2, coverH, 8);
      ctx.save();
      ctx.clip();
      this.drawCoverFit(ctx, coverImg, pad, pad, cssW - pad * 2, coverH);
      ctx.restore();
      let y = pad + coverH + 12;
      // 标题
      ctx.fillStyle = "#1f2329";
      ctx.font = "600 16px -apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei,sans-serif";
      const titleLines = this.wrapText(ctx, title, cssW - pad * 2, 2);
      titleLines.forEach((ln) => {
        ctx.fillText(ln, pad, y + 16);
        y += 22;
      });
      y += 6;
      // 摘要
      ctx.fillStyle = "#646a73";
      ctx.font = "12px -apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei,sans-serif";
      const sumLines = this.wrapText(ctx, summary, cssW - pad * 2, 3);
      sumLines.forEach((ln) => {
        ctx.fillText(ln, pad, y + 12);
        y += 18;
      });
      y += 10;
      // footer
      const qrSize = 64;
      if (logoImg) {
        ctx.drawImage(logoImg, pad, y + 18, 28, 28);
      } else {
        ctx.fillStyle = "#2f6fed";
        ctx.fillRect(pad, y + 18, 28, 28);
      }
      ctx.fillStyle = "#1f2329";
      ctx.font = "500 13px -apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei,sans-serif";
      ctx.fillText(brand || "极客普拉斯", pad + 36, y + 36);
      if (qrImg) {
        ctx.drawImage(qrImg, cssW - pad - qrSize, y, qrSize, qrSize);
      }
      y += qrSize + 8;
      // link
      ctx.fillStyle = "#8a919f";
      ctx.font = "10px -apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei,sans-serif";
      const linkLines = this.wrapText(ctx, link, cssW - pad * 2, 2);
      linkLines.forEach((ln) => {
        ctx.fillText(ln, pad, y + 10);
        y += 14;
      });
      return canvas.toDataURL("image/jpeg", 0.88);
    },
    roundRect(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    },
    dataUrlToBlob(dataUrl) {
      const parts = String(dataUrl).split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = (mimeMatch && mimeMatch[1]) || "image/jpeg";
      const bin = atob(parts[1] || "");
      const len = bin.length;
      const u8 = new Uint8Array(len);
      for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
      return new Blob([u8], { type: mime });
    },
    /**
     * 下载/分享分享图。
     * 根因说明：触控端点此按钮后长按失效，常见于
     * 1) 预览使用 blob:，Web Share / 程序化 download 后 WebKit 不再对同页 blob 图弹出存储菜单
     * 2) iOS 上 a[download]+blob 会干扰后续长按
     * 处理：触控预览固定 dataURL；分享只传 files；触控不再走 a[download]；结束后强制重挂载预览图。
     */
    async saveShareCardImg() {
      if (!this.shareCardImg) {
        if (!this.shareCardGenerating) {
          this.prepareAndGenerateShareCard();
        }
        this.$message({ message: "分享图生成中，请稍候", type: "info", duration: 2000 });
        return;
      }
      const fileName = "article-" + (this.articleInfo.id || this.articleId || "share") + ".jpg";
      let blob;
      try {
        blob = this.dataUrlToBlob(this.shareCardImg);
      } catch (e) {
        this.$message({ message: "图片处理失败，请长按上方图片保存", type: "warning", duration: 3000 });
        this.reviveSharePreviewLongPress();
        return;
      }

      // —— 触控端：优先系统分享；失败/取消后恢复长按，且不触发 a[download] ——
      if (this.isTouchDevice) {
        let shared = false;
        try {
          if (navigator.share && navigator.canShare) {
            const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
            // iOS：files 与 title/text 同时传时行为异常，只传 files
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file] });
              shared = true;
              this.$message({ message: "已打开系统分享", type: "success", duration: 2000 });
            }
          }
        } catch (e) {
          // 用户取消分享：不报错，但仍需恢复长按能力
          if (e && e.name !== "AbortError" && e.name !== "NotAllowedError") {
            this.$message({
              message: "分享未完成，请长按上方图片保存",
              type: "info",
              duration: 3000
            });
          }
        } finally {
          // 无论成功/取消/失败，都重挂载预览，避免 WebKit 长按菜单丢失
          this.reviveSharePreviewLongPress();
        }
        if (!shared) {
          this.$message({
            message: "请长按上方图片，选择“存储图像/保存图片”",
            type: "info",
            duration: 3500
          });
        }
        return;
      }

      // —— 桌面端：blob + a[download] ——
      const objectUrl = URL.createObjectURL(blob);
      try {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = objectUrl;
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.$message({ message: "已开始下载", type: "success", duration: 2000 });
      } catch (e) {
        this.fallbackOpenImage(objectUrl);
      } finally {
        window.setTimeout(() => {
          try { URL.revokeObjectURL(objectUrl); } catch (err) { /* ignore */ }
        }, 60000);
        this.reviveSharePreviewLongPress();
      }
    },
    /**
     * 恢复预览图的系统长按菜单。
     * WebKit 在系统分享面板关闭后，常需短延迟 + 重挂载 img 才恢复 callout。
     */
    reviveSharePreviewLongPress() {
      const run = () => {
        this.sharePreviewKey += 1;
        this.$nextTick(() => {
          const img = this.$refs.sharePreviewImg;
          const src = this.sharePreviewSrc;
          if (!img || !src) return;
          // 先清空再赋回，强制 WebKit 重新识别为可存储图片
          try {
            img.removeAttribute("src");
            // eslint-disable-next-line no-unused-expressions
            img.offsetWidth;
            img.src = src;
          } catch (e) { /* ignore */ }
        });
      };
      // 分享面板动画/焦点切回页面后再重挂载，比立刻执行更稳
      window.setTimeout(run, this.isTouchDevice ? 160 : 0);
    },
    fallbackOpenImage(url) {
      const src = url || this.shareCardBlobUrl || this.shareCardImg;
      const win = window.open("", "_blank");
      if (win) {
        win.document.title = "长按保存图片";
        const img = win.document.createElement("img");
        img.src = src;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "0 auto";
        win.document.body.appendChild(img);
        const tip = win.document.createElement("p");
        tip.textContent = "请长按图片选择“存储图像/保存图片”";
        tip.style.textAlign = "center";
        tip.style.color = "#666";
        win.document.body.appendChild(tip);
      } else {
        this.$message({
          message: "请直接长按上方预览图保存；若被拦截弹窗请允许后重试",
          type: "warning",
          duration: 3500
        });
      }
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
    renderMdText(text) {
      this.$nextTick(() => {
        this.copyCode();
      });
      return text;
    },
    getTagSize(count) {
      // 根据count的大小，返回对应的el-tag的size
      return count > 50 ? 'small' : count > 30 ? 'medium' : 'large';
    },
    calculateSize(count) {
      // 根据标签的出现次数计算大小
      // 此处使用简单的线性关系，可根据需求调整
      return 5 + (count - 1);
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
    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } });
      this.searchQuery = "";
    },
    //获取路径的面包屑，首页/其他页/其他页
    getBreadCrumb(categoryId) {
      //let categoryId=this.articleInfo.articleCategory;
      const menuCategory = this.$store.getters.addMenuRoutes;
      // var breadCrumbList = new Array();
      this.breadCrumbList = [];
      menuCategory.forEach((item) => {
        item.children.forEach((childItem) => {
          if (childItem.id == categoryId) {
            const menuCate = [
              {
                path: item.path,
                meta: {
                  title: item.categoryName,
                },
              },
              {
                path: item.path + "/" + childItem.path,
                meta: {
                  title: childItem.categoryName,
                },
              },
            ];
            this.breadCrumbList.push(
              {
                path: item.path,
                meta: {
                  title: item.categoryName,
                },
              },
              {
                path: item.path + "/" + childItem.path,
                meta: {
                  title: childItem.categoryName,
                },
              }
            );
          }
        });
      });
      //匹配路由地址，用来显示路径面包屑
      // let matched = this.$route.matched.filter(
      //   (item) => item.meta && item.meta.title && item.path !== ""
      // );
      // const first = breadCrumbList[0];
      // if (!this.isHome(first)) {
      //   var resultBreadCrumb = [
      //     { path: "/", name: "home", meta: { title: "首页" } },
      //   ].concat(breadCrumbList);
      // }
      this.breadCrumbList.push({ path: "", meta: { title: "阅读" } });
      // this.breadCrumbList = matched.filter(
      //   (item) => item.meta && item.meta.title !== ''
      // );
      //匹配路由地址，用来显示路径面包屑
    },
    //判断当前路由是否是首页，返回两者等于的结果true
    isHome(route) {
      const name = route && route.name;
      if (!name) {
        return false;
      }
      return name.trim().toLocaleLowerCase() === "index".toLocaleLowerCase(); //返回true
    }
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  background-color: var(--background-color, #27292b);
  /* Dark background */
  color: var(--text-color-2, #fff);
  /* White text color */
  min-height: 100vh;
}

.left-sidebar {
  width: 200px;
  /* Adjust width as needed */
  background-color: var(--background-color, #212121);
  padding: 10px;
}

/* Responsive sidebar */
@media (max-width: 768px) {
  .left-sidebar {
    width: 100%;
    /* Full width on mobile */
    flex-direction: column;
  }
}

.main-article-content {
  flex: 1;
  /* Take up remaining space */
  padding: 0;
}

.right-sidebar {
  width: 100%;
  background-color: var(--background-color, #212121);
}

/* Responsive sidebar */
@media (max-width: 768px) {
  .right-sidebar {
    width: 100%;
    order: -1;
    /* Put right sidebar on top in mobile view */
  }
}

.top-ads {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* Responsive ads */
  grid-gap: 20px;
  margin-bottom: 15px;
}

.ad-item {
  display: flex;
  flex-direction: column;
}

/* 文章阅读区：圆角卡片 + 舒适行高，适配移动端阅读 */
.article-container {
  padding: 16px 14px 18px;
  margin-bottom: 12px;
  background-color: var(--gp-surface-bg, var(--background, #fff));
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.article-comments-container {
  overflow: hidden;
  border-radius: 12px;
  background: var(--gp-surface-bg, var(--background, #fafafa));
  padding: 8px 4px 4px;
}

.article-header .article-title {
  font-size: 1.35rem;
  line-height: 1.4;
  font-weight: 700;
  margin: 4px 0 12px;
  color: var(--text-color-2, #1f2329);
  letter-spacing: 0.01em;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 12px;
  color: #8a919f;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.article-meta span {
  margin-right: 0;
}

.article-content {
  line-height: 1.75;
  font-size: 15px;
  color: var(--text-color-2, #2b2f36);
  word-break: break-word;
}

/* 点赞/分享/链接：胶囊按钮，触控更友好 */
.plus-article-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.plus-article-toolbar .toolbar-button {
  flex: 1 1 auto;
  min-width: 88px;
  height: 36px;
  border-radius: 20px;
  border: 1px solid rgba(47, 111, 237, 0.28);
  background: rgba(47, 111, 237, 0.06);
  color: #2f6fed;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.2s ease, transform 0.15s ease;

  &:active {
    transform: scale(0.98);
    background: rgba(47, 111, 237, 0.12);
  }
}

@media screen and (max-width: 768px) {
  .article-container {
    padding: 14px 12px 16px;
    border-radius: 10px;
    margin-left: -2px;
    margin-right: -2px;
  }

  .article-header .article-title {
    font-size: 1.2rem;
  }

  .article-content {
    font-size: 15px;
    line-height: 1.7;
  }
}

.tips {
  background-color: var(--background-color, #212121);
  padding: 10px;
  margin-bottom: 20px;
}

.more-info {
  background-color: var(--background-color, #212121);
  padding: 10px;
}

.more-info .info-item {
  margin-bottom: 20px;
}

.more-info h3 {
  margin-bottom: 10px;
}

/* 侧栏用户卡：表面由全局 Token 统一，这里只保留布局细节 */
.user-profile {
  text-align: center;
  margin-bottom: 14px;
  padding: 18px 14px;
  background: var(--gp-surface-bg, var(--background, #faf1f5));
  border-radius: var(--gp-surface-radius, 12px);
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
  box-shadow: var(--gp-surface-shadow, 0 2px 12px rgba(15, 23, 42, 0.04));
}

.user-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.user-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-stats span {
  margin: 0 10px;
}

.bottom-ad {
  padding: 15px;
  background-color: #409eff;
  color: white;
  border-radius: var(--gp-surface-radius-sm, 10px);
  margin-bottom: 15px;
}

/* 相关文章块与 post 列表卡片同一表面语言 */
.related-articles {
  background-color: var(--gp-surface-bg, var(--background, #eef1f5));
  border-radius: var(--gp-surface-radius, 12px);
}

.related-article-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.related-article-item:hover {
  background: var(--interactive-bg-secondary-hover);
}

.related-article-item+.related-article-item {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--gp-surface-border, var(--borderColor));
}

.related-article-cover {
  display: flex;
  overflow: hidden;
  border-radius: 8px;
  -o-object-fit: cover;
  object-fit: cover;
  -o-object-position: center;
  object-position: center;
}

.related-article-cover a {
  display: flex;
}

.related-article-cover .article-cover {
  width: 65px;
  height: 65px;
}

.related-article-intro {
  flex: 1;
}

.related-article-item h3 {
  margin: 0 0 5px 10px;
  overflow: hidden;
  /* Prevent long summaries from overflowing */
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.related-article-item p {
  margin: 0 0 0 10px;
  font-size: 0.9em;
  color: #999;
  overflow: hidden;
  /* Prevent long summaries from overflowing */
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.tag-cloud {
  margin: 5px 0;
}

.tag-cloud span {
  display: inline-block;
  padding: 2px 5px 2px 0;
}

.recommend-article-container {
  .recommended-article {
    line-height: 20px;
    margin-bottom: 4px;
  }
}

.mobile-view {
  box-shadow: none;
  margin-right: -8px;
  margin-left: -8px;
  border-radius: 0;
}

.article-breadcrumb,
.article-breadcrumb .bread {
  font-size: 12px;
}

/* 弹出式分享卡片区域 */
.share-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  background: #0a0a0a70;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding-top: 3em;
  padding-bottom: 3em;
  transition: all 0.3s ease-in-out;
  /* 允许长按图片；避免继承页面其它 user-select:none */
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
}

.share-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: slide-top 0.15s both;
  /* 遮罩不拦截长按手势 */
  pointer-events: none;
}

.share-box {
  position: relative;
  z-index: 2;
  background: transparent;
  flex-direction: column;
  justify-content: center;
  display: flex;
  transform: translateY(-100%);
  transition: transform 0.5s ease-in-out;
  animation: slide-top 0.3s both;
  width: calc(-20px + 100vw);
  max-height: calc(-5em + 100vh);
  max-width: 320px;
  min-width: 220px;
  pointer-events: auto;
  -webkit-touch-callout: default;
}

.share-box.open {
  transform: translateY(0);
}

.share-box__main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.share-box__header {
  height: 40px;
  line-height: 40px;
  text-align: center;
}

.share-box__close-btn {
  height: 35px;
  width: 100%;
  font-size: 20px;
  cursor: pointer;
}

.share-box__close-btn i {
  cursor: pointer;
  transition: all 0.6s;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.share-box__close-btn i:hover {
  transform: rotate(180deg);
}

.dialog__close-btn {
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-2);
  margin: 0 auto;
}

.share-box-container {
  position: relative;
  min-height: 200px;
  border-radius: 8px;
  /* 勿用 overflow:hidden：iOS 上祖先裁剪会导致长按「存储图像」菜单无法弹出 */
  overflow: visible;
  background: var(--background-origin, #fff);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.share-preview {
  width: 100%;
  text-align: center;
  padding: 8px;
  box-sizing: border-box;
  -webkit-touch-callout: default;
  -webkit-user-select: auto;
  user-select: auto;
}

.share-preview--loading {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  background: #f7f8fa;
}

.share-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

.share-box__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px 0;
  position: relative;
  z-index: 2;
  background: transparent;
}

.share-btn {
  height: 36px;
  width: 100%;
  border-radius: 30px;
  border: 1px solid #409eff;
  color: #409eff;
  outline: none;
  margin: 8px auto 0;
  background: #424242cc;
  font-size: 14px;
}

.share-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.is-save {
  background: #409eff;
  color: #fff;
}

/* 离屏固定画布：始终 360px，保证封面比例一致 */
.share-capture-source {
  position: fixed !important;
  left: -9999px !important;
  top: 0 !important;
  width: 360px !important;
  max-width: 360px !important;
  margin: 0 !important;
  z-index: -1;
  pointer-events: none;
}

.share-container {
  width: 360px;
  background: var(--background-origin, #fff);
  padding: 14px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.share-card-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  /* 允许长按「存储图像」；勿用 touch-action:manipulation（会抑制长按菜单） */
  -webkit-touch-callout: default !important;
  -webkit-user-select: auto !important;
  user-select: auto !important;
  pointer-events: auto;
  touch-action: auto;
  -webkit-user-drag: auto;
}

.share-cover-wrap {
  width: 100%;
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--gp-surface-bg, var(--background, #eef1f5));
}

.share-container .share-cover-img {
  width: 100%;
  height: 180px;
  display: block;
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
  background: var(--gp-surface-bg, var(--background, #eef1f5));
}

.share-container .share-title {
  width: 100%;
  line-height: 1.4;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: -moz-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
  padding: 10px 2px 4px;
  color: var(--text-color-2, #1f2329);
  font-weight: 600;
  min-height: 44px;
}

.share-container .share-summary {
  width: 100%;
  line-height: 1.45;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: -moz-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
  padding: 0 2px 4px;
  color: var(--text-color, #646a73);
  min-height: 52px;
}

.share-container .share-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 6px;
  padding: 0 2px;
  gap: 12px;
}

.share-footer .web-share-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.share-footer .web-share-logo img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}

.web-share-logo .web-share-title {
  font-size: 13px;
  color: var(--text-color-2, #1f2329);
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
}

.qr-code-img {
  width: 68px;
  height: 68px;
  flex-shrink: 0;
}

.qr-code-img img {
  width: 68px;
  height: 68px;
  display: block;
}

.share-link {
  font-size: 10px;
  color: var(--text-color, #8a919f);
  word-break: break-all;
  padding: 0 2px 2px;
  line-height: 1.35;
}
</style>
