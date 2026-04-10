<template>
  <div class="container-fluid">
    <el-container class="container">
      <el-main>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
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
          </el-col>
          <el-col :xs="24" :sm="24" :md="7" :lg="7" :xl="7">
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

              <el-card v-if="!isMobile" class="box-card">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-search"></i>搜索</span>
                  </div>
                </div>
                <el-input placeholder="搜索文章" v-model="searchQuery" @keyup.enter.native="searchArticles" clearable>
                  <el-button slot="append" icon="el-icon-search" @click="searchArticles"></el-button>
                </el-input>
              </el-card>

              <el-card class="box-card" :class="{ 'mobile-view': isMobile }">
                <Adsense data-ad-format="rectangle, vertical, horizontal" data-full-width-responsive="yes"
                  data-ad-client="ca-pub-7291512442295477" data-ad-slot="1460930833">
                </Adsense>
              </el-card>

              <el-card class="box-card" :class="{ 'mobile-view': isMobile }">
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

              <!-- <div class="bottom-ad">
                <el-tag type="danger" closable>广告</el-tag>
                <h2>新用户注册将免费进行到底</h2>
                <p>100+款云产品免费试用，支持开发者0门槛上云。赠亚马逊云科技 logo 无线耳机，无线键盘活动</p>
                <p>亚马逊云科技</p>
                <el-button type="primary">打开 <i class="el-icon-arrow-right"></i></el-button>
              </div> -->

              <el-card class="related-articles" :class="{ 'mobile-view': isMobile }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>相关文章</span>
                  </div>
                </div>
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
              </el-card>

              <el-card class="box-card" :class="{ 'mobile-view': isMobile }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>推荐文章</span>
                  </div>
                </div>
                <div class="recommend-article-container">
                  <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                    <router-link :to="`/article/${article.id}`">{{ article.articleTitle }}</router-link>
                  </div>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    <transition name="el-fade-in-linear">
      <plus-footer></plus-footer>
    </transition>
    <div class="share-wrapper" v-show="showShareDialog">
      <div class="share-overlay" @click="toggleShareWith"></div>
      <div class="share-box" :class="{ open: showShareDialog }">
        <div class="share-box__main">
          <div class="share-box__header">
            <div class="share-box__close-btn" @click="toggleShareWith">
              <span class="dialog__close-btn"><i class="el-icon-close"></i></span>
            </div>
          </div>
          <div class="share-box-container">
            <div class="share-container" id="share-card" ref="shareCard">
              <div class="share-cover"
                :style="{ backgroundImage: 'url(' + (articleInfo.indexPicture ? articleInfo.indexPicture : articleCover) + ')' }">
              </div>
              <div class="share-title">{{ articleInfo.articleTitle }}</div>
              <div class="share-summary">{{ articleInfo.abstractText }}</div>
              <div class="share-footer">
                <div class="web-share-logo">
                  <img :src="require('@/assets/logo.png')">
                  <div class="web-share-title">极客普拉斯</div>
                </div>
                <div class="qr-code-img"><img :src="qrCodeImg"></div>
              </div>
              <div class="share-link">{{ windowUrl }}</div>
            </div>
          </div>
          <div class="share-box__btn">
            <button class="share-btn is-save" @click="saveShareCardImg">分享保存图片</button>
            <button class="share-btn" @click="onLinkButtonTap">复制链接</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'; // 引入二维码生成库
import html2canvas from 'html2canvas'; // 引入dom转换库

import PostBreadcrumb from '@/layout/components/Breadcrumb/primary'
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
      shareCardImg: ""
    };
  },
  async created() {
    // 动态导入 vue-google-adsense
    // try {
    //   const Ads = await import('vue-google-adsense');
    //   const AdsModule = Ads.default;
    //   // 注册组件
    //   this.$options.components.Adsense = AdsModule.Adsense;
    //   this.$options.components.InArticleAdsense = AdsModule.InArticleAdsense;
    //   this.$options.components.InFeedAdsense = AdsModule.InFeedAdsense;
    // } catch (error) {
    //   console.error('Failed to load vue-google-adsense:', error);
    // }
    //     2: show the navbar only when the screen width is greater than 768 pixels
    //     3: show the navbar only when the screen width is greater than 992 pixels
    //     4: show the navbar only when the screen width is greater than 1200 pixels
    //图片预览器
    //用于图片预览的指令方式调用 在元素上加上会处理元素下所有的图片,为图片添加点击事件,点击即可预览
    // 全局注册指令（仅首次加载时执行）
    // 注意：this.$app 是 Vue 2 中的写法；Vue 3 中应使用 app.directive()，但需在 main.js 中保留一个空的 app 实例用于后续注册。
    // this.$app.directive('viewer', viewerDirective({
    //   //debug: true
    // }));
    // this.$nextTick(() => {});
    this.getAllArticleTags();
    this.getRecommendArticles();
    this.getArticleContent();
    // window.document.title = (res.data.articleTitle || this.$route.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
  },
  mounted() { },
  watch: {
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
      // var id = this.$route.params.articleId;
      const param = { id: this.articleId };
      getArticleDetail(param).then((res) => {
        if (res.data) {
          this.getBreadCrumb(res.data.articleCategory);
          this.articleInfo = res.data;
          this.prevArticle = res.prevRow;
          this.nextArticle = res.nextRow;
          window.document.title = (res.data.articleTitle || this.$route.meta.title) + " - 极客普拉斯,拾光梦集,极客普拉斯&拾光梦集 - GeekPlus";
        }
        this.loading = false;
      }).catch((error) => {
        this.$message({
          message: error.msg || error,
          duration: 3000,
          type: 'error'
        });
      });
    },
    getRecommendArticles() {
      getRandomRecommendArt().then((res) => {
        this.recommendedArticles = res.data;
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
  background-color: var(--color-background, #27292b);
  /* Dark background */
  color: var(--fontColor, #fff);
  /* White text color */
  min-height: 100vh;
}

.left-sidebar {
  width: 200px;
  /* Adjust width as needed */
  background-color: var(--color-background, #212121);
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
  background-color: var(--color-background, #212121);
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

.article-container {
  padding: 6px;
  margin-bottom: 10px;
  background-color: var(--background-1, #303133);
  border-radius: 4px;
}

.article-comments-container {
  overflow: hidden;
  border-radius: 4px;
}

.article-header .article-title {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.article-meta {
  font-size: 0.8em;
  color: #999;
  margin-bottom: 15px;
}

.article-meta span {
  margin-right: 10px;
}

.article-content {
  line-height: 1.4;
  font-size: 1em;
}

.tips {
  background-color: var(--color-background, #212121);
  padding: 10px;
  margin-bottom: 20px;
}

.more-info {
  background-color: var(--color-background, #212121);
  padding: 10px;
}

.more-info .info-item {
  margin-bottom: 20px;
}

.more-info h3 {
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

.bottom-ad {
  padding: 15px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  margin-bottom: 15px;
}

.related-articles {
  background-color: var(--background-1, #212121);
  /* padding: 15px;
    border-radius: 4px; */
}

.related-article-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.related-article-item+.related-article-item {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--borderColor, #999);
  /* Add a separator between related articles */
}

.related-article-cover {
  display: flex;
  overflow: hidden;
  border-radius: 3px;
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
}

.share-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: slide-top 0.15s both;
}

.share-box {
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
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

.share-box__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 8px 0;
}

.share-btn {
  height: 30px;
  width: 100%;
  border-radius: 30px;
  border: 1px solid #409eff;
  color: #409eff;
  outline: none;
  margin: 10px auto 0;
}

.is-save {
  background: #409eff;
  color: #fff;
}

//分享卡片容器
.share-container {
  width: 100%;
  height: 100%;
  background: var(--background-2);
  padding: 10px;
}

.share-card-img {
  width: 100%;
  height: 100%;
}

.share-container .share-cover {
  width: 100%;
  min-height: 125px;
  height: 100%;
  max-height: 150px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  object-fit: cover;
  object-position: center;
}

.share-container .share-title {
  width: 100%;
  line-height: 27px;
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
  padding: 0 5px;
  color: var(--fontColor);
}

.share-container .share-summary {
  width: 100%;
  line-height: 17px;
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
  padding: 0 5px;
  color: var(--font-color);
}

.share-container .share-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 10px auto;
}

.share-footer .web-share-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.share-footer .web-share-logo img {
  width: 40px;
  height: 40px;
}

.web-share-logo .web-share-title {
  text-align: center;
  color: var(--font-color);
  margin: 5px auto;
}

.share-link {
  font-size: 8px;
  color: var(--plus-grey-9);
  padding: 5px;
}

.share-article-cover {
  width: 100%;
  height: 100%;
}
</style>
