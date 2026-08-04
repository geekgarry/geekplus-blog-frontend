<template>
  <!-- 页面骨架：gp-page 替代 el-container/el-main；内层专题卡片栅格仍用 el-row -->
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container">
      <!-- <div class="app-home">
          <div class="wave-container">
                  <div class="wave"></div>
                  <div class="wave">
                      <div class="wave-item wave1"></div>
                      <div class="wave-item wave2"></div>
                      <div class="wave-item wave3"></div>
                  </div>
              </div>
          </div> -->
      <!-- <el-main>
              <el-row :gutter="10">
                  <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <div class="index-carousel-wrapper">
                          <el-carousel :interval="3000" arrow="always" ref="slideCarousel">
                              <el-carousel-item v-for="(item, index) in carouselList" :key="index">
                                  <img class="carousel-item__img" :src="item.carouselImg" :alt="item.carouselTitle" />
                                  <div class="carousel-item__caption"><a :href="carouselLink">{{ item.carouselTitle }}</a></div>
                              </el-carousel-item>
                          </el-carousel>
                      </div>
                  </el-col>
              </el-row>
          </el-main> -->
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-xl-17 gp-col-lg-17 gp-col-md-17 gp-col-sm-24 gp-col-xs-24">
            <!--
              首页轮播：使用自研 PlusCarousel（桌面支持滚轮 + 鼠标拖拽）
              若需 Element UI 原版 el-carousel，改用 @/components/ElCarouselBanner
            -->
            <div class="index-carousel-wrapper" :class="{ 'skeleton-loading': carouselLoading }">
              <plus-carousel
                mode="desktop"
                :items="carouselList"
                :height="280"
                :interval="3500"
                :touch="false"
                :mouse-drag="true"
                :mouse-wheel="true"
              />
            </div>
            <div class="welcome">
              <i class="el-icon-s-opportunity"></i>
              <span class="welcome-message">欢迎光临! 体验AI助手: <router-link to="/chat" target="_blank">点击直达</router-link></span>
            </div>
            <div class="special-recommend-container" v-if="sixSpecialArticles && sixSpecialArticles.length > 0">
              <div class="gp-row special-recommend-row">
                <div
                  class="gp-col-24 gp-special-col"
                  v-for="(item, index) in sixSpecialArticles"
                  :key="index"
                >
                  <div class="special-article-wrapper is-always-shadow" :class="{ 'skeleton-loading': otherLoading }">
                    <div class="special-article-content">
                      <div class="special-article-cover" @click="navToArticle(item.id)">
                        <img
                          class="special-cover-img"
                          :src="item.indexPicture || articleCover"
                          :alt="item.articleTitle"
                          loading="lazy"
                        >
                      </div>
                    </div>
                    <div class="special-article-caption">
                      <a href="javascript:;" @click="navToArticle(item.id)">{{ item.articleTitle }}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="tabs-container">
              <ul class="tabs">
                <li v-for="(cat, index) in sortCategoryList" :key="index" :class="{ active: currentTab === index }" @click="selectTab(index)">
                  {{ cat.categoryName }}
                </li>
              </ul>
              <div class="tab-content">
                "cat.categoryName"
              </div>
            </div> -->
            <!-- <el-tabs class="my-tabs-plus">
              <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
              <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
              <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
            </el-tabs> -->
            <div class="section-header"><i class="el-icon-s-home"></i><plus-breadcrumb></plus-breadcrumb></div>
            <div class="index-blog-post">
              <div class="article-list">
                <div v-for="article in articlesList" :key="article.id" class="article-card is-always-shadow"
                  :class="{ 'skeleton-loading': loading }">
                  <div class="article-content">
                    <div class="article-content-wrapper">
                      <h3 class="article-title"><a href="javascript:void(0);"
                          @click="$router.push({ path: '/article/' + article.id })">{{ article.articleTitle }}</a></h3>
                      <div class="article-info">
                        <p class="article-summary">{{ article.abstractText }}</p>
                      </div>
                    </div>
                    <div class="article-cover">
                      <router-link :to="'/article/' + article.id" class="article-cover-link">
                        <img
                          class="article-image"
                          :src="article.indexPicture || articleCover"
                          :alt="article.articleTitle"
                          loading="lazy"
                        >
                      </router-link>
                    </div>
                  </div>
                  <div class="article-footer">
                    <a class="article-author-a" href="javascript:void(0);">
                      <img class="author-avatar" :src="article.authorAvatar || userAvatar" :alt="article.authorName">
                    </a>
                    <span class="author-name hidden-xs-only">{{ article.authorName }}</span>
                    <span v-for="tag in article.tags" :key="tag.tagName" class="article-tag">
                      <router-link class="butt" :to="{ path: '/search', query: { tagName: tag.tagName } }">#{{ tag.tagName
                        }}</router-link>
                    </span>
                    <span class="view-count">
                      <i class="el-icon-view"></i> {{ article.viewCount }}
                    </span>
                    <span class="time-ago">
                      <i class="el-icon-time"></i> {{ dateTimeAgo(article.createTime) }}
                    </span>
                    <!-- <span class="collect-count">
                                          <i class="el-icon-star-off"></i> {{ article.collectCount }}
                                      </span> -->
                    <span class="like-count hidden-xs-only" v-show="article.likeCount">
                      <i class="el-icon-thumb"></i> {{ article.likeCount }}
                    </span>
                    <!-- <span class="comment-count">
                                          <i class="el-icon-chat-line-round"></i> {{ article.commentCount }}
                                      </span> -->
                  </div>
                </div>
              </div>
            </div>
            <!-- <el-pagination background :pagerCount="5" layout="prev, pager, next" :total="1000"></el-pagination> -->
            <plus-pager @pagination="getIndexArticleList" :total="total" :page.sync="queryParams.pageNum"
              :limit="queryParams.pageSize"></plus-pager>
            <br />
            <!-- <el-button type="text" class="more-button"> > MORE</el-button> -->
          </div>

          <div class="gp-col-24 gp-col-xl-7 gp-col-lg-7 gp-col-md-7 gp-col-sm-24 gp-col-xs-24">
            <!-- 侧栏卡片：第一批去掉 el-card，改用 gp-surface-card -->
            <div class="gp-surface-card profile-card">
              <div class="gp-surface-card__body">
                <div class="profile-image-wrapper">
                  <img :src="profileCover" alt="Profile Image" class="profile-image" />
                </div>
                <div class="stats">
                  <p>文章: {{ articleCount }}</p>
                  <p>分类: {{ categoryCount }}</p>
                  <div class="stats-visit">
                    <p>总访问: {{ abbreviateNumber(visitCount) }}</p>
                    <p v-if="visitToday != null" class="stats-sub">今 {{ abbreviateNumber(visitToday) }} / 月 {{ abbreviateNumber(visitMonth) }}</p>
                    <p v-if="visitYear != null" class="stats-sub">季 {{ abbreviateNumber(visitQuarter) }} / 年 {{ abbreviateNumber(visitYear) }}</p>
                  </div>
                </div>
                <div style="text-align: center;">
                  <button class="butt my-github" @click="goToExternalLink('https://github.com/geekgarry')"><svg-icon icon-class="github"></svg-icon></button>
                </div>
              </div>
            </div>

            <div class="gp-surface-card box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div class="gp-surface-card__header">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>网站公告</span>
                </div>
              </div>
              <div class="gp-surface-card__body">
                <div class="web-notice-container">
                  <span v-html="oneNewNotice.noticeContent"></span>
                </div>
              </div>
            </div>

            <div class="gp-surface-card box-card">
              <div class="gp-surface-card__body">
                <my-calendar></my-calendar>
              </div>
            </div>

            <div class="gp-surface-card box-card">
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

            <div class="gp-surface-card box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div class="gp-surface-card__header">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>点击热门</span>
                </div>
              </div>
              <div class="gp-surface-card__body">
                <div class="article-card-container">
                  <template v-for="(article, index) in hotArticleList">
                    <div class="top-article-card" :key="index" v-if="index == 0">
                      <div class="top-article-card-cover">
                        <a class="thumbnail-b" href="javascript:void(0);" v-if="article.indexPicture"
                          @click="navToArticle(article.id)"
                          :style="{ backgroundImage: 'url(' + article.indexPicture + ')' }"></a>
                        <a class="thumbnail-b" href="javascript:void(0);" v-else @click="navToArticle(article.id)"
                          :style="{ backgroundImage: 'url(' + articleCover + ')' }"></a>
                        <span class="top-article-card-caption"><router-link :to="'/article/' + article.id">{{
                          article.articleTitle }}</router-link></span>
                      </div>
                    </div>
                    <div class="article-card-list" :key="article.id" v-else>
                      <div class="article-card-cover">
                        <a class="thumbnail-b" href="javascript:void(0);" v-if="article.indexPicture"
                          @click="navToArticle(article.id)"
                          :style="{ backgroundImage: 'url(' + article.indexPicture + ')' }"></a>
                        <a class="thumbnail-b" href="javascript:void(0);" v-else @click="navToArticle(article.id)"
                          :style="{ backgroundImage: 'url(' + articleCover + ')' }"></a>
                      </div>
                      <div class="article-card-detail">
                        <div class="article-card-detail-title"><router-link :to="'/article/' + article.id">{{
                          article.articleTitle }}</router-link>
                        </div>
                        <div class="article-card-detail-date">{{ dateTimeAgo(article.createTime) }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="gp-surface-card box-card" :class="{ 'skeleton-loading': commentLoading }">
              <div class="gp-surface-card__header">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>留言足迹</span>
                  <button type="button" class="more-button" @click="$router.push('/leave-word')">更多 <i
                      class="el-icon-arrow-right"></i></button>
                </div>
              </div>
              <div class="gp-surface-card__body">
                <div class="hot-user-comment" v-for="(item, index) in hotUserComment" :key="index">
                  <div class="user-comment-info">
                    <span class="comment-name">{{ item.name }}</span>
                    <div class="comment-meta-info">
                      <span>热度: <strong style="color: #f10202">{{ item.replyCount * 999 }}</strong></span>
                      <div class="comment-time">{{ dateTimeAgo(item.createTime) }}</div>
                    </div>
                  </div>
                  <div class="user-comment-content">
                    <p v-html="item.content" v-if="checkHtml(item.content)"
                      :style="'color:' + getRandomTulipColor() + ';'"></p>
                    <p v-text="item.content" v-else :style="'color:' + getRandomTulipColor() + ';'"></p>
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
  </div>
</template>

<script>
import PlusBreadcrumb from '@/layout/components/Breadcrumb'
import PlusFooter from '@/layout/components/Footer'
import MyCalendar from '@/components/PlusCalendar/primary.vue'
import PlusPager from '@/components/PlusPager'
import PlusCarousel from '@/components/PlusCarousel'
// 备用：Element UI 原版轮播封装，其它页面可按需 import
// import ElCarouselBanner from '@/components/ElCarouselBanner'
import { Message, Pagination } from 'element-ui'
import {
  getVisitInfo, getCarousel, getArticlesByCategoryLimit, getArticleLatestUserComment, getWebHotUserComment,
  getIndexAllCategoryArticleList, getGpNoticeNewOne
} from '@/api/geekplus/geekplus'
import { runWhenIdle, runAfter, cancelIdle } from '@/utils/deferRequest'

export default {
  name: 'DesktopIndexView',
  components: {
    PlusBreadcrumb,
    PlusFooter,
    MyCalendar,
    PlusPager,
    PlusCarousel
  },
  data() {
    return {
      currentTab: 0, // 当前激活的Tab索引
      //在数据渲染前加载状态
      carouselLoading: true,
      loading: true,
      otherLoading: true,
      commentLoading: false,
      oneNewNotice: {},
      carouselList: [
        {
          carouselImg: require("@/assets/images/cover1.jpeg"),
          carouselTitle: "first pic is",
          carouselLink: "#"
        },
        {
          carouselImg: require("@/assets/images/cover2.jpeg"),
          carouselTitle: "second pic",
          carouselLink: "#"
        },
        {
          carouselImg: require("@/assets/images/cover3.jpeg"),
          carouselTitle: "third pic",
          carouselLink: "#"
        }
      ],
      userAvatar: require("@/assets/mai.png"),
      articleCount: 58,
      categoryCount: 14,
      visitCount: 1,
      visitToday: null,
      visitMonth: null,
      visitQuarter: null,
      visitYear: null,
      searchQuery: "",
      //右侧面板推荐区域，推荐文章列表
      recommendedArticles: [
        { id: 1, articleTitle: "Vue.js Best Practices", indexPicture: "/path/to/image1.jpg" },
        {
          id: 2,
          articleTitle: "Building a Blog with Element UI",
          indexPicture: require("@/assets/images/cover1.jpeg"),
        },
        {
          id: 3,
          articleTitle: "Responsive Design Tips",
          indexPicture: require("@/assets/images/cover1.jpeg"),
        },
      ],
      //首页六个特别推荐文章
      sixSpecialArticles: [1, 2, 3, 4, 5, 6],
      //首页文章列表
      articlesList: [
        {
          id: 101,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "My First Blog Post",
          createTime: "2024-03-15",
          viewCount: 120,
          comments: 5,
          likeCount: 20,
          abstractText:
            "This is a short excerpt of my first blog post. It's a great starting point...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [
            { tagName: "vue" },
            { tagName: "javascript" },
            { tagName: "webdev" }
          ],
        },
        {
          id: 102,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Exploring Element UI",
          createTime: "2024-03-20",
          viewCount: 85,
          comments: 3,
          likeCount: 15,
          abstractText: "Element UI is a fantastic Vue.js component library...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "vue" }, { tagName: "element-ui" }, { tagName: "ui" }],
        },
        {
          id: 103,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Responsive Design Challenges",
          createTime: "2009-03-25",
          viewCount: 50,
          comments: 1,
          likeCount: 8,
          abstractText: "Creating truly responsive designs can be tricky...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "webdev" }, { tagName: "responsive" }, { tagName: "css" }],
        },
        {
          id: 104,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Responsive Design Challenges",
          createTime: "2024-03-25",
          viewCount: 50,
          comments: 1,
          likeCount: 8,
          abstractText: "Creating truly responsive designs can be tricky...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "webdev" }, { tagName: "responsive" }, { tagName: "css" }],
        },
        {
          id: 105,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Responsive Design Challenges",
          createTime: "2024-03-25",
          viewCount: 50,
          comments: 1,
          likeCount: 8,
          abstractText: "Creating truly responsive designs can be tricky...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "webdev" }, { tagName: "responsive" }, { tagName: "css" }],
        },
        {
          id: 106,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Responsive Design Challenges",
          createTime: "2024-03-25",
          viewCount: 50,
          comments: 1,
          likeCount: 8,
          abstractText: "Creating truly responsive designs can be tricky...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "webdev" }, { tagName: "responsive" }, { tagName: "css" }],
        },
        {
          id: 107,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Responsive Design Challenges",
          createTime: "2024-03-25",
          viewCount: 50,
          comments: 1,
          likeCount: 8,
          abstractText: "Creating truly responsive designs can be tricky...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "webdev" }, { tagName: "responsive" }, { tagName: "css" }],
        },
        {
          id: 108,
          authorName: "GeekPlus",
          authorAvatar: "",
          articleTitle: "Responsive Design Challenges",
          createTime: "2024-03-25",
          viewCount: 50,
          comments: 1,
          likeCount: 8,
          abstractText: "Creating truly responsive designs can be tricky...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [{ tagName: "webdev" }, { tagName: "responsive" }, { tagName: "css" }],
        },
        // ... more articles
      ],
      total: 0,
      profileCover: require("@/assets/images/profile_cover.jpg"),
      articleCover: require("@/assets/images/cover3.jpeg"),
      calendarValue: new Date(),
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      hotUserComment: []
    };
  },
  created() {
    this.getIndexViewCarousel();
    this.getIndexArticleList();
    // 侧栏非关键请求：错开并发，idle 后串行拉取
    this._secondaryIdleId = runWhenIdle(() => {
      this.getSixRecommendArticle();
      runAfter(() => this.getOneNewestNotice(), 400);
      runAfter(() => this.getPageVisitInfo(), 800);
      runAfter(() => this.getWebHotUserComments(), 1200);
    }, 1800);
  },
  mounted() {
    //TODO: 注释掉轮播图滑动，因为已经没有在用官方element UI的el-carousel了
    // this.slideBanner();
  },
  beforeDestroy() {
    cancelIdle(this._secondaryIdleId);
  },
  computed: {
    hotArticleList() {
      return this.$store.getters.hotArticleList;
    },
    isMobile() {
      //根据用户吧浏览设备的用户信息判断是否是移动设备
      return this.$common.isMobile();
    },
    sortCategoryList() {
      return this.getListSubCategory(this.$store.getters.addMenuRoutes);
    }
  },
  methods: {
    selectTab(index) {
      this.currentTab = index; // 设置当前激活的Tab索引
    },
    //获取首页轮播图：接口失败或空数据时保留本地默认图，避免白屏
    getIndexViewCarousel() {
      this.carouselLoading = true;
      getCarousel().then((res) => {
        const list = res && res.data !== undefined ? res.data : res;
        if (Array.isArray(list) && list.length) {
          this.carouselList = list;
        }
      }).catch(() => {
        // 保留 data 里的本地封面
      }).finally(() => {
        this.carouselLoading = false;
      });
    },
    getPageVisitInfo() {
      getVisitInfo().then((res) => {
        this.visitCount = res.visitCount != null ? res.visitCount : this.visitCount;
        this.visitToday = res.today != null ? res.today : null;
        this.visitMonth = res.month != null ? res.month : null;
        this.visitQuarter = res.quarter != null ? res.quarter : null;
        this.visitYear = res.year != null ? res.year : null;
      });
    },
    abbreviateNumber(value) {
        if (value == null || value === '') return '0';
        value = Number(value) || 0;
        const suffixes = ['', 'K', 'M', 'B', 'T']; // Thousand, Million, Billion, Trillion
        let suffixNum = 0;
        while (value >= 1000) {
            value /= 1000;
            suffixNum++;
        }
        return value.toFixed(suffixNum === 0 ? 0 : 2) + suffixes[suffixNum];
    },
    //获取网站热门留言
    getWebHotUserComments() {
      this.commentLoading = true;
      getWebHotUserComment().then((res) => {
        this.hotUserComment = res && res.data !== undefined ? res.data : res || [];
      }).finally(() => {
        this.commentLoading = false
      });
    },
    //获取六个推荐
    getSixRecommendArticle() {
      var params = { pathName: "java", limitCount: 6 };
      getArticlesByCategoryLimit(params)
        .then((res) => {
          this.sixSpecialArticles = res && res.data !== undefined ? res.data : res || [];
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
        })
        .finally(() => {
          this.otherLoading = false;
        });
    },
    getOneNewestNotice() {
      getGpNoticeNewOne().then((res) => {
        this.oneNewNotice = res.data;
      });
    },
    //点击到文章页面
    navToArticle(id) {
      this.$router.push({ path: "/article/" + id }, onComplete => { }, onAbort => { });
    },
    getIndexArticleList() {
      this.loading = true;
      getIndexAllCategoryArticleList(this.queryParams).then((res) => {
        this.articlesList = res.rows;
        this.total = res.total;
        this.articleCount = res.total;
        this.loading = false;
      })
    },
    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } });
      this.searchQuery = "";
    },
    slideBanner() {
      var box = document.querySelector(".el-carousel__container");
      box.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
      });
      var startPointX = 0;
      var stopPointX = 0;
      var resetPoint = function () {
        startPointX = 0;
        stopPointX = 0;
      };
      box.addEventListener("mousedown", function (e) {
        startPointX = e.clientX;
      });
      box.addEventListener("mouseup", function (e) {
        const mouseEndX = e.clientX;
        const deltaX = mouseEndX - startPointX;

        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            resetPoint();
            that.$refs.slideCarousel.prev();
          } else {
            resetPoint();
            that.$refs.slideCarousel.next();
          }
        }
      });
      box.addEventListener("touchstart", function (e) {
        startPointX = e.changedTouches[0].pageX;
      }, { passive: true });
      box.addEventListener("touchmove", function (e) {
        stopPointX = e.changedTouches[0].pageX;
      }, { passive: true });
      let that = this;
      box.addEventListener("touchend", function (e) {
        if (stopPointX == 0 || startPointX - stopPointX == 0) {
          resetPoint();
          return;
        }
        if (startPointX - stopPointX > 0) {
          resetPoint();
          that.$refs.slideCarousel.next();
          return;
        }
        if (startPointX - stopPointX < 0) {
          resetPoint();
          that.$refs.slideCarousel.prev();
          return;
        }
      });
    },
    goToExternalLink(link) {
      // 替换为你想要跳转到的外部链接
      const externalLink = link;
      // 使用 window.open 在新窗口中打开链接
      window.open(externalLink, "_blank");
      // window.location.href = externalLink;
    },
    //获取所有一级分类下的二级分类
    getListSubCategory(list) {
      let listCategory = new Array();
      list.forEach(parent => {
        parent.children.forEach(child => {
          let childCategory = {
            path: parent.path + '/' + child.path,
            pathName: child.path,
            categoryName: child.categoryName,
          }
          listCategory.push(childCategory)
        })
      });
      return listCategory;
    }
  },
};
</script>

<style lang="scss" scoped>
.wave-container {
  position: fixed;
  bottom: 0;
  width: 100%;
}

.wave {
  position: fixed;
  bottom: 0px;
  height: 110px;
  width: 100%;
  overflow: hidden;
  background: repeating-linear-gradient(to bottom, #fff, #90cef1);
}

.wave .wave-item {
  position: absolute;
  width: 200%;
  height: 100%;
  background-size: 50% 100%;
  opacity: 0.4;
}

.wave .wave1 {
  top: 20px;
  left: -100%;
  opacity: 0.2;
  background: url(../../icons/svg/wave.svg);
  animation: to-right 15s infinite linear;
}

.wave .wave2 {
  top: 30px;
  left: 0;
  opacity: 0.3;
  background: url(../../icons/svg/wave.svg);
  animation: to-left 25s infinite linear;
}

.wave .wave3 {
  top: 45px;
  left: -100%;
  opacity: 0.2;
  background: url(../../icons/svg/wave.svg);
  animation: to-right 35s infinite linear;
}

@keyframes to-right {
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }

  50% {
    transform: translateX(25%) translateZ(0) scaleY(0.7);
  }

  100% {
    transform: translateX(50%) translateZ(0) scaleY(1);
  }
}

@keyframes to-left {
  from {
    transform: translate(0%, 0px);
  }

  to {
    transform: translate(-50%, 0px);
  }
}

.header {
  background-color: var(--gp-surface-bg, var(--background, #f5f7fa));
  /* Or another suitable color */
  padding: 30px 0;
  /* Add padding to the header */
}

/* 首页欢迎消息 */
.welcome {
  margin-bottom: 5px;
}

.welcome>*:first-child {
  margin: 0 5px;
}

.welcome-message {
  display: inline-block;
  font-style: italic;
  /* color: #666;
  Slightly darker text */
  font-size: 15px;
}

.welcome-message i {
  margin-right: 5px;
  /* Space between icon and text */
}

.welcome-message a {
  color: var(--theme-color, #6e8b8e);
  text-decoration: none;
  /* Remove underline from link */
}

.profile-image-wrapper {
  width: auto;
  height: 130px;
  /* Make it circular */
  overflow: hidden;
  /* Hide any image overflow */
  margin: -18px -18px 0 -18px;
  /* Center the image and add bottom margin */
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Ensure the image fills the circular area */
}

.stats {
  margin-bottom: 15px;
  /* Add margin below the stats */
  text-align: center;
  /* Center-align the stats */
  display: flex;
  align-items: flex-start;
  justify-content: space-evenly;
}

.stats-visit {
  text-align: center;
}

.stats-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-color, #666);
  line-height: 1.35;
}

.my-github {
  padding: 4px 6px;
  font-size: 12px;
}

.recommended-article {
  margin-bottom: 10px;
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-list a:hover {
  color: var(--theme-color);
}

.article-card {
  border-radius: var(--gp-surface-radius-sm, 10px);
  padding: var(--gp-surface-padding, 14px 16px);
  margin-bottom: 0;
  background: var(--gp-surface-bg, var(--background, #fafafa));
  color: var(--text-color-2);
  display: block;
  width: 100%;
  font-size: 0.95rem;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--gp-surface-border-hover, rgba(0, 0, 0, 0.06));
    box-shadow: var(--gp-surface-shadow-hover, 0 6px 18px rgba(15, 23, 42, 0.06));
    transform: translateY(-1px);
  }
}

.article-content {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;

  .article-content-wrapper {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.article-cover {
  flex: 0 0 168px;
  width: 168px;
  max-width: 34%;
  overflow: hidden;
  border-radius: 8px;
}

.article-cover-link {
  display: block;
  width: 100%;
  height: 0;
  padding-bottom: 62%;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.article-cover:hover .article-image {
  transform: scale(1.04);
}

.article-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 8px;
  object-fit: cover;
  object-position: center;
  transition: transform 0.35s ease;
  user-select: none;
}

.article-title {
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  white-space: break-spaces;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: -moz-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.article-info {
  display: flex;
}

.article-summary {
  margin: 0;
  flex: 1 1 auto;
  color: var(--muted-1-color, #777);
  white-space: break-spaces;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: -moz-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
  font-size: 14px;
  line-height: 1.55;
}

.article-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 12px;
  line-height: 1.2;
  color: var(--muted-1-color);
}

.article-author-a {
  display: grid;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 4px;
  object-fit: cover;
}

.author-name {
  margin-right: 4px;
  font-weight: 600;
}

.article-tag a {
  font-size: 11px;
  padding: 2px 5px;
  margin-right: 2px;
}

.view-count,
.time-ago,
.collect-count,
.like-count,
.comment-count {
  margin-right: 4px;
  padding: 2px 0;
}

.special-recommend-container {
  margin: 8px 0 14px;
}

.special-recommend-row {
  margin-left: -6px;
  margin-right: -6px;
}

.gp-special-col {
  width: 50%;
  padding: 6px;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .gp-special-col {
    width: 33.333333%;
  }
}

.special-article-wrapper {
  margin-bottom: 10px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--gp-surface-bg, var(--background, #fafafa));
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    transform: translateY(-2px);
  }
}

.special-article-cover {
  width: 100%;
  height: 0;
  padding-bottom: 62%;
  position: relative;
  overflow: hidden;
  background: #eef1f5;
  cursor: pointer;
}

.special-cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.35s ease;
}

.special-article-wrapper:hover .special-cover-img {
  transform: scale(1.04);
}

.special-article-caption {
  padding: 8px 10px 10px;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 48px;
}

/* 首页轮播容器：与 PlusCarousel 圆角对齐 */
.index-carousel-wrapper {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

/* 欢迎条：轻渐变提示，不抢轮播视觉 */
.welcome {
  margin: 0 0 14px;
  padding: 10px 14px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(47, 111, 237, 0.08), rgba(47, 111, 237, 0.02));
  border: 1px solid rgba(47, 111, 237, 0.1);
}

.welcome-message {
  display: inline-block;
  font-style: normal;
  font-size: 14px;
  color: #4a5563;
}

.welcome-message a {
  color: #2f6fed;
  text-decoration: none;
  font-weight: 600;
}

@media screen and (max-width: 992px) {
  .article-cover {
    flex-basis: 140px;
    width: 140px;
  }

  .article-title {
    font-size: 16px;
  }
}

@media screen and (max-width: 768px) {
  .article-card {
    padding: 10px;
    border-radius: 8px;
  }

  .article-content {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .article-cover {
    flex: none;
    width: 100%;
    max-width: 100%;
  }

  .article-cover-link {
    padding-bottom: 52%;
  }

  .special-article-caption {
    font-size: 13px;
    min-height: 40px;
  }

  .profile-image-wrapper {
    height: 110px;
  }
}
</style>
