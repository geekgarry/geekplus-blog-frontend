<template>
  <div class="container-fluid">
    <el-container class="container" direction="vertical">
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
          <el-col :xs="24" :sm="24" :md="{ span: 16, offset: 4 }" :lg="{ span: 16, offset: 4 }" :xl="{ span: 12, offset: 6 }">
            <!--
              移动端首页轮播：PlusCarousel + touch 跟手滑动
              Element UI 原版保留在 @/components/ElCarouselBanner，勿直接删除历史能力
            -->
            <div class="index-carousel-wrapper" :class="{ 'skeleton-loading': carouselLoading }">
              <plus-carousel
                mode="mobile"
                :items="carouselList"
                :height="180"
                :interval="4000"
                :touch="true"
                :show-arrows="false"
                :mouse-drag="false"
                :mouse-wheel="false"
              />
            </div>
            <div class="welcome">
              <i class="el-icon-s-opportunity"></i>
              <span class="welcome-message">欢迎光临! 体验AI助手: <router-link to="/chat">点击直达</router-link></span>
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
            <el-tabs class="my-tabs-plus" v-model="activeName" @tab-click="handleClick">
              <el-tab-pane v-for="(cat, index) in sortCategoryList" :key="index" :label="cat.categoryName" :name="cat.pathName">
                <div class="index-blog-post" ref="articleListContainer" v-pull-refresh="onPullRefresh" v-infinite-scroll="onInfiniteScroll">
                  <div v-if="isPullingDown" class="refresh-indicator">
                    <span v-if="pullDownDistance < 50">下拉刷新</span>
                    <span v-else>释放刷新</span>
                  </div>
                  <div class="article-list">
                    <div v-for="(article, index) in articlesList" :key="index" class="article-card is-always-shadow"
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
                          <router-link
                            class="article-cover-link"
                            :to="'/article/' + article.id"
                          >
                            <img
                              class="article-image"
                              :src="article.indexPicture || require('@/assets/images/cover1.jpeg')"
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
                  <div v-if="total>queryParams.pageSize" class="load-more-tips">
                    <a class="load-more-btn" href="javascript:void(0);" @click="loadMore" v-if="queryParams.pageNum < total/queryParams.pageSize">点击加载更多</a>
                    <a class="load-more-btn" href="javascript:void(0);" v-else>没有了...</a>
                  </div>
                  <div v-if="isLoadingMore" class="loading-indicator">加载中...</div>
                </div>
              </el-tab-pane>
              <!-- <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
              <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
              <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane> -->
            </el-tabs>
            <!-- <el-pagination background :pagerCount="5" layout="prev, pager, next" :total="1000"></el-pagination> -->
            <!-- <plus-pager @pagination="getIndexArticleList" :total="total" :page.sync="queryParams.pageNum"
              :limit="queryParams.pageSize"></plus-pager> -->
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
import PlusFooter from '@/layout/components/Footer'
import PlusCarousel from '@/components/PlusCarousel'
// 备用：原 el-carousel 封装组件，便于其它页面继续使用官方轮播
// import ElCarouselBanner from '@/components/ElCarouselBanner'
import { Message, Pagination } from 'element-ui'
import {
  getHomeViewData, getCarousel, getArticlesByCategoryLimit, getArticleLatestUserComment, getWebHotUserComment,
  getIndexAllCategoryArticleList, getGpArticlesByCategory, getGpNoticeNewOne
} from '@/api/geekplus/geekplus'

export default {
  name: 'MobileIndexView',
  components: {
    PlusFooter,
    PlusCarousel
  },
  data() {
    return {
      //el-tab选中的名字
      activeName: 'index',
      currentTab: 0, // 当前激活的Tab索引
      //在数据渲染前加载状态
      carouselLoading: true,
      loading: true,
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
      iLogo: require("@/assets/logo.png"),
      articleCover: require("@/assets/images/cover3.jpeg"),
      calendarValue: new Date(),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pathName: null
      },
      pullDownDistance: 0,
      isLoading: false,
      isPullingDown: false,
      isLoadingMore: false,
    };
  },
  created() {
    this.getIndexViewCarousel();
    this.getIndexArticleList();
    // this.getOneNewestNotice();
  },
  mounted() {
    //TODO: 注释掉轮播图滑动，因为已经没有在用官方element UI的el-carousel了
    // this.slideBanner();
    // this.loadMore(); // Initial data load
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
  directives: {
    pullRefresh: {
      mounted(el, binding, vnode) {
        let startY = 0;
        let initialScrollTop = 0;
        const vm = vnode.context;
        el.addEventListener('touchstart', (e) => {
            if (vm.isLoading || el.scrollTop > 0) return; // Check vm.isLoading
            startY = e.touches[0].clientY;
            initialScrollTop = el.scrollTop;
            vm.isPullingDown = true; // Show the indicator immediately
        });
        el.addEventListener('touchmove', (e) => {
          if (vm.isLoading || el.scrollTop > 0) return;
          const currentY = e.touches[0].clientY;
          vm.pullDownDistance = currentY - startY;
            if (vm.pullDownDistance > 0) {
                e.preventDefault();
                el.scrollTop = initialScrollTop - vm.pullDownDistance * 0.5;
            }
        });
        el.addEventListener('touchend', () => {
          if (vm.pullDownDistance > 50) {
              binding.value();  // Call the refresh method
          } else if (vm.pullDownDistance > 0) {
             el.scrollTop = 0;
          }
          vm.isPullingDown = false; // Hide the refresh indicator
          vm.pullDownDistance = 0;
        });
      },
    },
    infiniteScroll: {
      mounted(el, binding, vnode) {
        let isLoading = false;  // Local loading state
        const vm = vnode.context; // Component instance
        el.addEventListener('scroll', () => {
          if (isLoading || vm.isLoading) return; // Use both loading flags
          const { scrollTop, scrollHeight, clientHeight } = el;
          if (scrollTop + clientHeight >= scrollHeight - 100) {
              isLoading = true; // Set local loading state
              binding.value().finally(() => {
                  isLoading = false; // Reset local loading state
              });
          }
        });
      },
    },
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event);
      this.activeName = tab.name;
      this.queryParams = { pageNum: 1, pageSize: 10, pathName: tab.name && tab.name === 'index' ? null : tab.name };
      // if(tab.name && tab.name !== '') {
      //   this.$set('index', {
      //     'articlesList': [],
      //     'total': 0,
      //     'queryParams': {
      //       'pageNum': 1,
      //       'pageSize': 10,
      //       'pathName': tab.name
      //     }
      //   })
      // }
      this.getIndexArticleList();
    },
    selectTab(index) {
      this.currentTab = index; // 设置当前激活的Tab索引
    },
    //获取首页轮播图
    getIndexViewCarousel() {
      this.carouselLoading = true;
      getCarousel().then((res) => {
        this.carouselList = res && res.data !== undefined ? res.data : res || [];
      }).finally(() => {
        this.carouselLoading = false;
      });
    },
    getOneNewestNotice() {
      getGpNoticeNewOne().then((res) => {
        this.oneNewNotice = res && res.data !== undefined ? res.data : res || {};
      });
    },
    //点击到文章页面
    navToArticle(id) {
      this.$router.push({ path: "/article/" + id }, onComplete => { }, onAbort => { });
    },
    getIndexArticleList() {
      this.loading = true;
      getGpArticlesByCategory(this.queryParams).then((res) => {
        this.articlesList = res && res.rows !== undefined ? res.rows : (Array.isArray(res) ? res : [])
        this.total = res && res.total !== undefined ? res.total : 0
        this.articleCount = res && res.total !== undefined ? res.total : 0
      }).catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
      }).finally(() => {
        this.loading = false;
        this.isLoading = false;
      });
    },
    loadMore() {
      this.queryParams.pageNum++;
      this.loading = true;
      getGpArticlesByCategory(this.queryParams).then((res) => {
        var tempArt = this.articlesList;
        this.articlesList = tempArt.concat(res.rows)
        this.total = res.total;
        this.articleCount = res.total;
        this.loading = false;
        this.isLoading = false;
      }).catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
      });
    },
    onPullRefresh() {
      this.isLoading = true;
      this,queryParams.pageNum = 1;
      this.getIndexArticleList();
    },
    onInfiniteScroll() {
      if (this.isLoading) return; // Prevent concurrent loads
      this.isLoading = true; // Set the overall loading state
      this.queryParams.pageNum++;
      this.loading = true;
      this.queryParams.pathName = this.activeName;
      getGpArticlesByCategory(this.queryParams).then((res) => {
        this.articlesList = this.articleList.concat(res.rows)
        this.total = res.total;
        this.articleCount = res.total;
        this.loading = false;
        this.isLoading = false;
      }).catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
      });
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
      listCategory.push({ path: '/', pathName: 'index', categoryName: '首页' });
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

.index-blog-post {
  height: 100%;
}

.load-more-tips {
  width: 100%;
  text-align: center;
}

.profile-image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  /* Make it circular */
  overflow: hidden;
  /* Hide any image overflow */
  margin: 0 auto 15px auto;
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


.recommended-article {
  margin-bottom: 10px;
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-list a:hover {
  color: var(--theme-color);
}

.article-card {
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 0;
  background: var(--background-1);
  color: var(--fontColor);
  display: block;
  width: 100%;
  font-size: 0.9rem;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  }
}

.article-content {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;

  .article-content-wrapper {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.article-cover {
  flex: 0 0 112px;
  width: 112px;
  max-width: 34%;
  min-height: 80px;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: stretch; /* 确保子元素垂直方向撑满 */
  gap: 16px; /* 左右间距 */
}

.article-cover-link {
  flex-shrink: 0; /* 防止图片容器被左侧内容挤压缩小 */
  width: 100%; /* 根据需要设定固定宽度 */
  height: 100%; /* 继承父容器的高度 */
  display: flex; /* 让图片作为 flex item 更好控制 */
  /* padding-bottom: 68%;
  border-radius: 8px; */
  position: relative;
  overflow: hidden;
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

.article-cover:hover .article-image {
  transform: scale(1.04);
}

.article-title {
  margin: 0 0 6px 0;
  font-size: 15px;
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
  font-size: 13px;
  line-height: 1.5;
}

.article-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  font-size: 12px;
  line-height: 1.2;
  color: var(--muted-1-color);
}

.article-author-a {
  display: grid;
}

.author-avatar {
  width: 22px;
  height: 22px;
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
  margin-right: 2px;
  padding: 2px 0;
}

.index-carousel-wrapper {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.welcome {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(47, 111, 237, 0.08), rgba(47, 111, 237, 0.02));
  border: 1px solid rgba(47, 111, 237, 0.1);
  font-size: 13px;
}

@media screen and (max-width: 480px) {
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

  .article-title {
    font-size: 15px;
  }
}
</style>
