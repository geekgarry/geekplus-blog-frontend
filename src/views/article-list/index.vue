<template>
  <!-- 页面骨架：gp-page 替代 el-container/el-main/el-row/el-col -->
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-md-7">
            <div class="blog-side-container">
              <!-- 侧边栏用户信息：gp-surface-card 替代 el-card，无独立 header -->
              <div class="gp-surface-card profile-card">
                <div class="gp-surface-card__body">
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
                </div>
              </div>

              <div v-if="!isMobile" class="gp-surface-card box-card" :class="{ 'skeleton-loading': otherLoading }">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>点击热门</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
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
                </div>
              </div>

              <div v-if="!isMobile" class="gp-surface-card box-card" :class="{ 'skeleton-loading': otherLoading }">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-folder-opened"></i>分类云</span>
                    <button type="button" class="more-button">更多 <i class="el-icon-arrow-right"></i></button>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="article-category-wrapper">
                    <span class="article-category" v-for="(cat, index) in allCategoryList" :key="index">
                      <a class="butt" href="javascript:;"
                        @click="$router.push({ path: cat.path })">
                        {{ cat.categoryName }}
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              <!-- 广告位：仅 __body，与 leave-word 侧栏一致 -->
              <div class="gp-surface-card box-card">
                <div class="gp-surface-card__body">
                  <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="1460930833">
                  </Adsense>
                </div>
              </div>

              <div class="gp-surface-card box-card" :class="{ 'skeleton-loading': otherLoading }">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>网站公告</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="announcement">
                    小站初建，欢迎来访~
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="gp-col-24 gp-col-md-17">
            <div class="section-header"><i class="el-icon-menu"></i><plus-breadcrumb></plus-breadcrumb></div>
            <div class="article-list-container">
              <div class="articles-entry">
                <div v-for="(article, index) in articlesList" :key="index" class="article-card is-always-shadow"
                  :class="{ 'skeleton-loading': loading }">
                  <div class="article-header">
                    <div class="article-cover">
                      <router-link :to="'/article/' + article.id" class="article-cover-link">
                        <img
                          :src="article.indexPicture || articleCover || placeholderImage"
                          :alt="article.articleTitle"
                          class="article-image"
                          loading="lazy"
                        >
                      </router-link>
                    </div>
                    <div class="article-details">
                      <h3 class="article-title"><router-link :to="`/article/${article.id}`">{{ article.articleTitle
                          }}</router-link></h3>
                      <p class="article-summary">{{ article.abstractText }}</p>
                    </div>
                  </div>
                  <div class="article-footer">
                    <div class="article-meta">
                      <span class="meta-item">{{ dateTimeAgo(article.createTime) }}</span>
                      <span class="meta-item"><i class="el-icon-view"></i> {{ article.viewCount
                        }}</span>
                      <!-- <span class="meta-item"><i class="el-icon-chat-dot-round"></i> {{
                        article.commentCount }}</span> -->
                      <span class="meta-item hidden-xs-only" v-show="article.likeCount">
                        <i class="el-icon-thumb"></i> {{ article.likeCount }}
                      </span>
                    </div>
                    <span class="meta-tag" v-for="(tag, index) in article.tags" :key="index">
                      <router-link class="butt" :to="{ path: '/search', query: { tagName: tag.tagName } }">
                        #{{ tag.tagName }}</router-link>
                    </span>
                  </div>
                </div>
              </div>
              <plus-pager @pagination="getArticleListByPathCategory" :total="total" :page.sync="queryParams.pageNum"
                :limit="queryParams.pageSize">
              </plus-pager>
              <br />
              <div class="ads-container">
                <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="3158275447">
                </Adsense>
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
import { getArticleCategoryListByPath, getGpArticlesByCategory } from '@/api/geekplus/geekplus';
import PlusBreadcrumb from '@/layout/components/Breadcrumb'
import PlusFooter from '@/layout/components/Footer'
import PlusPager from '@/components/PlusPager';
import { getCategory } from '@/api/geekplus/category';

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
      articleCount: 29,
      commentCount: 6,
      tags: [
        { name: "航模", type: "" },
        { name: "路由/NAS", type: "" },
        { name: "电子/嵌入式DIY", type: "" },
        { name: "建站", type: "success" },
        { name: "书架", type: "success" },
        { name: "笔迹", type: "info" },
      ],
      placeholderImage: require("@/assets/images/cover2.jpeg"), // Replace with a placeholder image path
      articlesList: [
        {
          articleTitle: "HAL库回调机制",
          abstractText: "在学习STM32中断的时候接触到了回调函数，虽然也在用，但对具体原理一直不明就里...",
          createTime: "2024-11-23",
          viewCount: 24,
          commentCount: 0,
          likeCount: 0,
          tags: [{ tagName: "电子/嵌入式" }],
          indexPicture: require("@/assets/images/cover1.jpeg")
        },
        {
          articleTitle: "电源学习（二）-- 开关电源的基本组成和工作过程",
          abstractText: "仅为个人学习记录，指导参考作用有限，如有纰漏之处请指教！ 转载引用内容若侵权请联系删除！...",
          createTime: "2024-11-21",
          viewCount: 52,
          commentCount: 0,
          likeCount: 0,
          tags: [{ tagName: "电子/嵌入式" }],
          indexPicture: require("@/assets/images/cover1.jpeg")
        },
        {
          articleTitle: "CW32充电检测仪",
          abstractText: "1元活动买的基于CW32L010单片机的电流检测仪小板...",
          createTime: "2024-11-17",
          viewCount: 35,
          commentCount: 1,
          likeCount: 0,
          tag: [{ tagName: "DIY" }],
          indexPicture: require("@/assets/images/cover1.jpeg")
        },
        {
          articleTitle: "电源学习（一）-- 电源介绍与分类",
          abstractText: "仅为个人学习记录，指导参考作用有限，如有纰漏之处请指教！...",
          createTime: "2024-11-15",
          viewCount: 47,
          commentCount: 0,
          likeCount: 0,
          tags: [{ tagName: "电子/嵌入式" }],
          indexPicture: require("@/assets/images/cover1.jpeg")
        },
        {
          articleTitle: "【转载】一个普通IT人的十年回顾--金旭亮",
          abstractText: "原文没有找到，转载自博客 一个普通IT人的十年回顾- Echo小窝...",
          createTime: "2024-11-11",
          viewCount: 43,
          commentCount: 0,
          likeCount: 0,
          tags: [{ tagName: "笔迹" }],
          indexPicture: require("@/assets/images/cover1.jpeg")
        },
        // ... more articles
      ],
      total: 0,
      recommendArticles: [],
      allCategoryList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pathName: '',
      },
      articleCover: require("@/assets/images/cover1.jpeg"),
      isEntered: false, // 用于标记是否再次进入页面
    };
  },
  created() {
    this.getAllArticleCategory();
    // window.document.title = (this.$route.meta.title || '文章列表') + "-极客普拉斯&梦极客园";
    // this.$router.onReady(() => {});
  },
  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     if (from.name !== null) {
  //       // 如果from.name不为null，说明是从其他页面进入的
  //       vm.getArticleListByPathCategory();
  //       vm.isEntered = true;
  //     } else {
  //       // 如果from.name为null，说明是第一次进入页面
  //       vm.getArticleListByPathCategory();
  //       vm.isEntered = false;
  //     }
  //   });
  // },
  // beforeRouteUpdate(to, from, next) {
  //   //复用同一页面中，根据更新的路由to.path为要去往的页面
  //   this.getArticleListByPathCategory();
  //   next();
  // },
  // beforeRouteLeave(to, from, next) {
  //   // 当离开该页面时，将标记重置
  //   this.isEntered = false;
  //   next();
  // },
  //使用Vue组件切换过程钩子activated(keep-alive组件激活时调用)，而不是挂载钩子mounted
  activated: function() {
    this.getArticleListByPathCategory();
  },
  watch: {
    // $route(to, from) {}
  },
  computed: {
    pathName() {
      //this.$route.query.id
      return this.$route.params.pathName;
    },
    breadCrumbList() {
      return this.getBreadCrumb(this.pathName);
    },
    myBreadCrumbRoute() {
      const _this = this;
      return _this.breadCrumbList.filter(function (item) { return item.path === _this.$route.path })[0];
    },
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
          this.articlesList = response.rows;
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
        }).finally(() => { });
    },
    getAllArticleCategory() {
      // let tempMenuList = this.$router.options.routes.filter(
      //   (item) => { return item.type == "servermenu"}
      // );
      this.allCategoryList = this.getListSubCategory(this.$store.getters.addMenuRoutes);
      this.otherLoading = false;
    },
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
    },
    //点击到文章页面
    navToArticle(id) {
      this.$router.push({ path: '/article/' + id }, onComplete => { }, onAbort => { });
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

.article-category a{
  margin: 0 5px 5px 0;
  /* Adjust spacing as needed */
  padding: 3px 6px;
  /* Add vertical margin */
}

.article-list-container {
  width: 100%;
}

.articles-entry {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  margin-bottom: 0;
  border-radius: 10px;
  background: var(--background-1);
  color: var(--fontColor);
  display: block;
  width: 100%;
  padding: 12px 14px;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    transform: translateY(-1px);
  }
}

.article-header {
  display: flex;
  align-items: stretch;
  gap: 14px;
  margin-bottom: 8px;
}

.article-cover {
  flex: 0 0 168px;
  width: 168px;
  max-width: 38%;
  overflow: hidden;
  border-radius: 8px;
  position: relative;
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
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.35s ease;
  border-radius: 8px;
}

.article-details {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.article-title {
  margin: 0 0 8px 0;
  white-space: break-spaces;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
  font-size: 17px;
  line-height: 1.35;
  font-weight: 600;
}

.article-summary {
  margin: 0;
  color: var(--muted-1-color, #777);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  font-size: 14px;
  line-height: 1.55;
}

.article-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.article-meta {
  color: var(--muted-1-color);
  font-size: 12px;
}

.meta-item {
  margin-right: 6px;
}

.meta-tag a {
  font-size: 11px;
  margin-right: 5px;
  padding: 2px 5px;
}

/* 平板：封面略收窄，摘要 2 行 */
@media screen and (max-width: 992px) {
  .article-cover {
    flex-basis: 140px;
    width: 140px;
  }

  .article-summary {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

/* 手机：封面全宽置顶，16:9 适配 */
@media screen and (max-width: 768px) {
  .article-card {
    padding: 10px;
    border-radius: 8px;
  }

  .article-header {
    flex-direction: column;
    gap: 10px;
  }

  .article-cover {
    flex: none;
    width: 100%;
    max-width: 100%;
  }

  .article-cover-link {
    padding-bottom: 56.25%;
  }

  .article-title {
    font-size: 16px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin-bottom: 6px;
  }

  .article-summary {
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 13px;
  }
}

@media screen and (max-width: 480px) {
  .article-cover-link {
    padding-bottom: 52%;
  }

  .article-title {
    font-size: 15px;
  }
}
</style>
