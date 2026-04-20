<template>
  <div class="container-fluid">
    <el-container class="container" direction="vertical">
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
      <el-main>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
            <div class="index-carousel-wrapper" :class="{ 'skeleton-loading': carouselLoading }">
              <el-carousel :interval="3000" arrow="always" ref="slideCarousel">
                <el-carousel-item v-for="(item, index) in carouselList" :key="index">
                  <img class="carousel-item__img" :src="item.carouselImg" :alt="item.carouselTitle" />
                  <div class="carousel-item__caption">
                    <span class="caption-text">
                      <a :href="item.carouselLink">{{ item.carouselTitle }}</a>
                    </span>
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
            <div class="welcome">
              <i class="el-icon-s-opportunity"></i>
              <span class="welcome-message">欢迎光临! 体验AI助手: <a href="/chat" target="_blank">点击直达</a></span>
            </div>
            <div class="special-recommend-container" v-if="sixSpecialArticles && sixSpecialArticles.length > 0">
              <el-row :gutter="10">
                <el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8" v-for="(item, index) in sixSpecialArticles"
                  :key="index">
                  <div class="special-article-wrapper is-always-shadow" :class="{ 'skeleton-loading': otherLoading }">
                    <div class="special-article-content">
                      <div class="special-article-cover">
                        <a class="special-thumbnail-b" href="javascript:;" @click="navToArticle(item.id)"
                          v-if="item.indexPicture" :style="{ backgroundImage: 'url(' + item.indexPicture + ')' }"></a>
                        <a class="special-thumbnail-b" href="javascript:;" @click="navToArticle(item.id)" v-else
                          :style="{ backgroundImage: 'url(' + articleCover + ')' }"></a>
                      </div>
                    </div>
                    <div class="special-article-caption">
                      <a href="javascript:;" @click="navToArticle(item.id)">{{ item.articleTitle }}</a>
                    </div>
                  </div>
                </el-col>
              </el-row>
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
                    <div class="article-cover" v-if="article.indexPicture">
                      <router-link :to="'/article/' + article.id">
                        <!-- :style="{ backgroundImage: 'url(' + article.indexPicture + ')' }" -->
                        <img class="article-image" :src="article.indexPicture" :alt="article.articleTitle">
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
          </el-col>

          <el-col :xs="24" :sm="24" :md="7" :lg="7" :xl="7">
            <el-card class="profile-card">
              <div class="profile-image-wrapper"> <!-- Wrapper for circular image -->
                <img :src="profileCover" alt="Profile Image" class="profile-image" />
              </div>
              <!-- <h2 style="text-align: center;">GeekPlus</h2> -->
              <div class="stats">
                <p>文章: {{ articleCount }}</p>
                <p>分类: {{ categoryCount }}</p>
                <p>访问量: {{ abbreviateNumber(visitCount) }}</p>
              </div>
              <div style="text-align: center;">
                <button class="butt my-github" @click="goToExternalLink('https://github.com/geekgarry')"><svg-icon icon-class="github"></svg-icon></button>
              </div>
            </el-card>

            <el-card class="box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>网站公告</span>
                </div>
              </div>
              <div class="web-notice-container">
                <span v-html="oneNewNotice.noticeContent"></span>
                <!-- 欢迎来到我的网站！ -->
              </div>
            </el-card>

            <el-card class="box-card">
              <!-- <div slot="header" class="clearfix"><span>日历</span> </div> -->
              <div>
                <!-- <el-calendar v-model="calendarValue"></el-calendar> -->
                <my-calendar></my-calendar>
              </div>
            </el-card>

            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-search"></i>搜索</span>
                </div>
              </div>
              <el-input placeholder="搜索文章" v-model="searchQuery" @keyup.enter.native="searchArticles" clearable>
                <el-button slot="append" icon="el-icon-search" @click="searchArticles"></el-button>
              </el-input>
            </el-card>

            <el-card class="box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>点击热门</span>
                </div>
              </div>
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
                  <div class="article-card-list" :key="index" v-else>
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
            </el-card>

            <el-card class="box-card" :class="{ 'skeleton-loading': commentLoading }">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>留言足迹</span>
                  <el-button type="text" class="more-button" @click="$router.push('/leave-word')">更多 <i
                      class="el-icon-arrow-right"></i></el-button>
                </div>
              </div>
              <!-- <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                <router-link :to="`/article/${article.id}`">{{ article.articleTitle }}</router-link>
              </div> -->
              <div>
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
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    <transition name="el-fade-in-linear">
      <plus-footer></plus-footer>
    </transition>
  </div>
</template>

<script>
// import { Carousel, CarouselItem } from 'element-ui';
import PlusBreadcrumb from '@/layout/components/Breadcrumb'
import PlusFooter from '@/layout/components/Footer'
import MyCalendar from '@/components/PlusCalendar/primary.vue'
import PlusPager from '@/components/PlusPager';
import { Message, Pagination } from 'element-ui';
import {
  getVisitInfo, getCarousel, getArticlesByCategoryLimit, getArticleLatestUserComment, getWebHotUserComment,
  getIndexAllCategoryArticleList, getGpNoticeNewOne
} from '@/api/geekplus/geekplus'

export default {
  name: 'DesktopIndexView',
  components: {
    // [Carousel.name]: Carousel,
    // [CarouselItem.name]: CarouselItem,
    PlusBreadcrumb,
    PlusFooter,
    MyCalendar,
    PlusPager
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
    this.getSixRecommendArticle();
    this.getOneNewestNotice();
    this.getPageVisitInfo();
  },
  mounted() {
    this.slideBanner();
    this.getWebHotUserComments();
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
    //获取首页轮播图
    getIndexViewCarousel() {
      this.carouselLoading = true;
      getCarousel().then((res) => {
        this.carouselList = res.data;
        this.carouselLoading = false;
      });
    },
    getPageVisitInfo() {
      getVisitInfo().then((res) => {
        this.visitCount = res.visitCount;
      });
    },
    abbreviateNumber(value) {
        const suffixes = ['', 'K', 'M', 'B', 'T']; // Thousand, Million, Billion, Trillion
        let suffixNum = 0;
        while (value >= 1000) {
            value /= 1000;
            suffixNum++;
        }
        return value.toFixed(2) + suffixes[suffixNum];
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
  background-color: var(--background-1, #f5f7fa);
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
  color: #409eff;
  /* Element UI's primary color for links */
  text-decoration: none;
  /* Remove underline from link */
}

.profile-image-wrapper {
  width: auto;
  height: 130px;
  /* Make it circular */
  overflow: hidden;
  /* Hide any image overflow */
  margin: -15px -15px 15px -15px;
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
  align-items: center;
  justify-content: space-evenly;
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
  /* gap: 16px;
    Spacing between cards */
}

.article-list a:hover {
  color: var(--theme-color);
}

.article-card {
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  background: var(--background-1);
  color: var(--fontColor);
  display: inline-block;
  width: 100%;
  font-size: 0.9rem;
}

.article-content {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 5px;

  .article-content-wrapper {
    flex: 1 1 auto;
  }

  .article-cover {
    max-width: 170px;
    width: 100%;
    min-width: 95px;
    min-height: 80px;
    height: 100%;
    max-height: 100px;
    overflow: hidden;
    border-radius: 5px;
    margin-left: 6px;
    position: relative;
    display: grid;

    a {
      width: 100%;
      height: 0;
      padding-bottom: 70%;
      text-align: center;
      overflow: hidden;
      display: block;
    }

    a img {
      min-width: 100%;
      min-height: 80px;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .article-cover:hover img {
    transform: scale(110%);
  }
}

.article-image {
  width: 100%;
  height: 100%;
  display: block;
  /* Prevents image from affecting layout */
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  -webkit-border-radius: 4px;
  -o-border-radius: 4px;
  border-radius: 4px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  transition: all .4s linear;
  user-select: none;
  -o-object-fit: cover;
  object-fit: cover;
  -o-object-position: center;
  object-position: center;
}

.article-title {
  margin: 0 0 5px 0;
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
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.article-summary {
  margin: 0 0 5px 0;
  flex: 1 1 auto;
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

.article-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 12px;
  line-height: 1;
  color: var(--muted-1-color);
}

.article-author-a {
  display: grid;
}

.author-avatar {
  width: 25px;
  height: 25px;
  border-radius: 30px;
  margin-right: 5px;
}

.author-name {
  margin-right: 5px;
  font-weight: bold;
}

.article-tag a {
  font-size: 11px;
  padding: 2px 5px;
  margin-right: 5px;
}

.view-count,
.time-ago,
.collect-count,
.like-count,
.comment-count {
  margin-right: 6px;
  padding: 3px 0;
}

/* .more-button {
  text-align: right;
  display: block;
} */

.wave-decorator {
  /* Implement the wave SVG or image styling here */
  height: 100px;
  background-image: url("../../icons/svg/wave.svg");
  /* Or use an inline SVG */
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
}

/* Responsive styles (example) */
@media (max-width: 768px) {

  /* Example breakpoint */
  .el-menu--horizontal {
    flex-direction: column;
    /* Stack menu vertically */
  }

  .el-menu-item {
    display: block;
    /* Make each item full width */
    margin-bottom: 5px;
  }
}

@media (max-width: 768px) {

  /* ... (media query from last response) ... */

  /* ... other mobile styles ... */
}
</style>
