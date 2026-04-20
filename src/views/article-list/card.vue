<template>
  <div class="container-fluid">
    <el-container class="container">
      <!-- <div class="blog-home">
          <div class="wave-container">
                  <div class="wave"></div>
                  <div class="wave">
                      <div class="wave-item wave1"></div>
                      <div class="wave-item wave2"></div>
                      <div class="wave-item wave3"></div>
                  </div>
              </div>
          </div> -->
      <!-- <el-header height="auto" class="header"></el-header> -->
      <el-main>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
            <el-card class="profile-card">
              <div class="user-info">
                <img :src="userAvatar" alt="User Avatar" class="user-avatar">
                <div class="user-details">
                  <h2 class="user-name">{{ userName }}</h2>
                  <p class="user-description">{{ userDescription }}</p>
                  <div class="user-stats">
                    <span class="stat"><i class="el-icon-s-opportunity"></i> {{ categoryCount
                      }}</span>
                    <span class="stat"><i class="el-icon-document"></i> {{ articleCount }}</span>
                    <span class="stat"><i class="el-icon-chat-line-square"></i> {{ commentCount
                      }}</span>
                  </div>
                </div>
              </div>
            </el-card>

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

            <el-card v-if="!isMobile" class="box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>点击热门</span>
                </div>
              </div>
              <div class="article-card-container">
                <template v-for="(article, index) in hotArticleList">
                  <div class="top-article-card" :key="'top-' + article.id" v-if="index == 0">
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
                  <div class="article-card-list" :key="'list-' + article.id" v-else>
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

            <el-card v-if="!isMobile" class="box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>推荐文章</span>
                </div>
              </div>
              <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                <router-link :to="`/article/${article.id}`">{{ article.articleTitle }}</router-link>
              </div>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
            <!-- <div class="welcome">
              <i class="el-icon-speaker"></i> 欢迎光临! 查看文章: <a
                href="https://127.0.0.1/article/26">https://127.0.0.1/article/26</a>
            </div> -->
            <div class="section-header"><i class="el-icon-s-grid"></i><plus-breadcrumb></plus-breadcrumb></div>

            <div class="row-wrapper mt-5"> <!-- Use el-row for grid layout -->
              <div class="col-item" v-for="article in cardList" :key="article.id">
                <div class="post-item item-grid" :class="{ 'skeleton-loading': loading }">
                  <div class="item-img">
                    <a class="thumbnail-b sa" v-if="article.indexPicture" rel="BookMarks" href="javascript:;"
                      :style="{ backgroundImage: 'url(' + article.indexPicture + ')' }"
                      @click="navToArticle(article.id)"></a>
                    <a class="thumbnail-b sa" v-else rel="BookMarks" href="javascript:;"
                      :style="{ backgroundImage: 'url(' + articleCover + ')' }" @click="navToArticle(article.id)"></a>
                  </div>
                  <div class="item-entry">
                    <h3 class="item-title"><router-link :to="`/article/${article.id}`">{{
                      article.articleTitle }}</router-link>
                    </h3>
                    <div class="item-stats hidden-xs-only">
                      <span><i class="el-icon-view"></i> {{ article.viewCount }}</span>
                      <span v-show="article.comments"><i class="el-icon-chat-line-round"></i> {{ article.comments
                      }}</span>
                      <span v-show="article.likeCount"><i class="el-icon-star-on"></i> {{ article.likeCount || 0
                      }}</span>
                    </div>
                    <!-- <p class="item-excerpt">{{ article.abstractText }}</p> -->
                    <div class="item-meta">
                      <div class="item-date"><i class="el-icon-date"></i> {{
                        dateTimeAgo(article.createTime) }}</div>
                      <div class="item-tags">
                        <a v-for="(tag, index) in article.tags" :key="index" href="javascript:void(0);"
                          @click="$router.push({ path: '/search', query: { tagName: tag.tagName } })">#{{ tag.tagName
                          }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <plus-pager @pagination="getArticleListByPathCategory" :total="total" :page.sync="queryParams.pageNum"
              :limit="queryParams.pageSize"></plus-pager>
            <!-- <el-button type="text" class="more-button"> > MORE</el-button> -->
            <br />
            <div class="ads-container">
              <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="6482220433">
              </Adsense>
            </div>
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
import PlusBreadcrumb from '@/layout/components/Breadcrumb'
import PlusFooter from '@/layout/components/Footer'
import PlusPager from '@/components/PlusPager'
import { getGpArticlesByCategory, getRandomRecommendArt, getTagArticleCount, getFourPlusOneArticles, getWebHotUserComment, getArticleLatestUserComment } from '@/api/geekplus/geekplus'

export default {
  components: {
    PlusBreadcrumb,
    PlusFooter,
    PlusPager
  },
  data() {
    return {
      loading: true,
      otherLoading: true,
      userAvatar: require("@/assets/mai.png"), // Replace with your avatar image path
      userName: "麦壳儿",
      userDescription: "青衫烟雨间，挽风踏清歌",
      categoryCount: 14,
      articleCount: 28,
      commentCount: 6,
      searchQuery: "",
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
      cardList: [
        {
          id: 101,
          articleTitle: "My First Blog Post",
          createTime: "2024-03-15",
          viewCount: 120,
          comments: 5,
          likeCount: 20,
          abstractText:
            "This is a short excerpt of my first blog post. It's a great starting point...",
          indexPicture: require("@/assets/images/cover1.jpeg"),
          tags: [
            { id: 1, tagName: "vue" },
            { id: 2, tagName: "javascript" },
            { id: 3, tagName: "webdev" }
          ],
        },
        {
          id: 102,
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
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pathName: '',
      },
      iLogo: require("@/assets/logo.png"),
      articleCover: require("@/assets/images/cover2.jpeg"),
      isEntered: false, // 用于标记是否再次进入页面
    };
  },
  created() {
    this.getRandomRecommendArticles();
    window.document.title = (this.$route.meta.title || '文章列表') + "-极客普拉斯&梦极客园";
    this.$router.onReady(() => {});
  },
  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     if (from.name !== null) {
  //       // 如果from.name不为null，说明是从其他页面进入的
  //       // vm.queryParams.pathName = vm.$route.path.split('/')[2];
  //       // vm.getArticleListByPathCategory();
  //       vm.isEntered = true;
  //     } else {
  //       // 如果from.name为null，说明是第一次进入页面
  //       // vm.queryParams.pathName = vm.$route.path.split('/')[2];
  //       // vm.getArticleListByPathCategory();
  //       vm.isEntered = false;
  //     }
  //   });
  // },
  // beforeRouteUpdate(to, from, next) {
  //   //复用同一页面中，根据更新的路由to.path为要去往的页面
  //   next();
  //   this.getArticleListByPathCategory();
  // },
  // beforeRouteLeave(to, from, next) {
  //   // 当离开该页面时，将标记重置
  //   next();
  //   this.isEntered = false;
  // },
  //使用Vue组件切换过程钩子activated(keep-alive组件激活时调用)，而不是挂载钩子mounted
  activated: function() {
    this.getArticleListByPathCategory()
  },
  watch: {
    $route(to,from){}
  },
  computed: {
    pathName() {
      //this.$route.query.id
      return this.$route.params.pathName;
    },
    breadCrumbList() {
      return this.getBreadCrumb(this.pathName);
    },
    // myBreadCrumbRoute() {
    //   const _this = this;
    //   return _this.breadCrumbList.filter(function(item) {return item.path === _this.$route.path})[0];
    // },
    hotArticleList() {
      return this.$store.getters.hotArticleList;
    },
    isMobile() {
      //根据用户吧浏览设备的用户信息判断是否是移动设备
      return this.$common.isMobile();
    }
  },
  methods: {
    getArticleListByPathCategory() {
      this.queryParams.pathName = this.$route.path.split('/')[2];
      this.loading = true;
      getGpArticlesByCategory(this.queryParams)
        .then((response) => {
          this.cardList = response.rows;
          this.total = response.total;
          this.articleCount = response.total;
          this.loading = false;
          // this.backToTop();
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
          // this.$toasted.error(error.msg, {
          //   position: "top-center",
          //   duration: 3000,
          //   theme: "bubble",
          // });
        }).finally(() => {
          this.loading = false;
        });
    },
    getRandomRecommendArticles() {
      getRandomRecommendArt().then((res) => {
        this.recommendedArticles = res.data;
        this.otherLoading = false;
      });
    },
    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } }, onComplete => { }, onAbort => { });
      this.searchQuery = "";
    },
    navToArticle(id) {
      this.$router.push({ path: `/article/${id}` }, onComplete => { }, onAbort => { });
    },
    //获取路径的面包屑，首页/其他页/其他页
    getBreadCrumb(pathName) {
      const menuCategory = this.$store.getters.addMenuRoutes;
      var breadCrumbList = new Array();
      // this.breadCrumbList = [];
      menuCategory.forEach((item) => {
        item.children.forEach((childItem) => {
          if (childItem.path.indexOf(pathName) !== -1) {
            breadCrumbList.push(
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
      // breadCrumbList.push({ path: "", meta: { title: "文章" } });
      return breadCrumbList;
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

.row-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.col-item {
  width: 50%;
  overflow: hidden;
  padding: 5px;
}

.mt-5 {
  margin-left: -5px;
  margin-right: -5px;
}

@media screen and (min-width: 768px) {
  .col-item {
    width: 50%;
    padding: 5px;
  }
}

@media screen and (min-width: 992px) {
  .col-item {
    width: 33.33%;
    padding: 5px;
  }
}

@media screen and (min-width: 1200px) {
  .col-item {
    width: 20%;
    padding: 5px;
  }
}

@media screen and (min-width: 1920px) {
  .col-item {
    width: 20%;
    padding: 5px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.user-name {
  margin: 0;
  font-size: 1.4em;
}

.user-description {
  margin: 5px 0;
  color: #888;
}

.user-stats {
  display: flex;
}

.stat {
  margin-right: 20px;
  color: #666;
}

.header {
  background-color: var(--background-1, #f5f7fa);
  /* Or another suitable color */
  padding: 30px 0;
  /* Add padding to the header */
}

.recommended-article {
  margin-bottom: 10px;
}

.post-item {
  border-radius: 4px;
  background: var(--background-1);
  color: var(--fontColor);
  /* border: 1px solid var(--borderColor); */
  display: inline-block;
  width: 100%;

  .item-img {
    width: 100%;
    min-height: 120px;
    height: 100%;
    max-height: 220px;
    /* Fixed height for image */
    /* object-fit: cover;
    display: block; */
    margin-bottom: 0px;
    position: relative;
    padding-top: 75%;
    overflow: hidden;
    border-radius: 4px 4px 0 0;

    a.thumbnail-b {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 4px 4px 0 0;
      -webkit-filter: grayscale(20%);
      filter: grayscale(20%);
    }

    .thumbnail-b.sa {
      -webkit-transition: all .3s ease-out 0s;
      -moz-transition: all .3s ease-out 0s;
      -o-transition: all .3s ease-out 0s;
      transition: all .3s ease-out 0s;
    }
  }
}

//展示项相关内容
.item-entry {
  margin: 5px 10px 10px 10px;

  /* Space between image and details on larger screens */
  .item-title {
    margin: 3px auto;
    position: relative;
    line-height: 20px;
    height: 40px;
    white-space: break-spaces;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    box-orient: vertical;

    a {
      font-size: 15px;
    }
  }

  .item-stats {
    font-size: 13px;
    margin-top: 3px;
    color: var(--plus-grey-9, #999);
    /* Lighter gray for stats */
    white-space: break-spaces;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    box-orient: vertical;
  }

  .item-stats span {
    margin-right: 5px;
    /* Space between icon and text */
  }

  .item-meta {
    line-height: 20px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    font-size: 13px;
    margin-top: 3px;
  }

  .item-date {
    color: var(--plus-grey-9);
    white-space: nowrap;
    overflow: auto;
    flex: 1 1 auto;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    box-orient: vertical;
    height: 20px;
  }

  .item-tags {
    color: var(--plus-grey-9);
    white-space: nowrap;
    overflow: auto;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    box-orient: vertical;
    height: 20px;
    color: var(--plus-grey-9);
  }

  .item-tags a {
    display: inline-block;
    font-size: 12px;
  }

  .item-tags a+a {
    margin-left: 5px;
  }
}

.more-button {
  margin-top: 20px;
  text-align: right;
  /* Align to right */
  display: block;
}

.wave-decorator {
  /* Implement the wave SVG or image styling here */
  height: 100px;
  background-image: url("../../icons/svg/wave.svg");
  /* Or use an inline SVG */
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
}

@media screen and (max-width: 576px) {
  .item-entry .item-meta {
    flex-direction: column;
  }
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

.item-excerpt {
  margin-top: 10px;
  white-space: break-spaces;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
  margin: 0 auto;
  height: 40px;
  line-height: 20px;
}

/* Example of adding a subtle hover effect to articles */
.post-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  /* Subtle lift on hover */
  transform: translateY(-2px);
  /* Slight vertical shift on hover*/
  transition: all 0.2s ease;
  /* Smooth transition */
}

.post-item .item-img:hover {
  a.thumbnail-b {
    scale: 110%;
    -webkit-filter: grayscale(60%);
    filter: grayscale(60%);
  }
}
</style>
