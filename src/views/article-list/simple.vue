<template>
  <!-- 页面骨架：gp-page 替代 el-container/el-main/el-row/el-col -->
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-xl-7 gp-col-lg-7 gp-col-md-7 gp-col-sm-24 gp-col-xs-24">
            <div class="blog-side-container">
              <!-- 侧边栏用户信息：gp-surface-card 替代 el-card -->
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

              <div v-if="!isMobile" class="gp-surface-card box-card">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-folder-opened"></i>分类云</span>
                    <button type="button" class="more-button">更多 <i class="el-icon-arrow-right"></i></button>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="article-category-wrapper">
                    <span class="article-category" v-for="(cat, index) in allCategoryList" :key="index">
                      <a class="butt" href="javascript:;" @click="$router.push({ path: cat.path })">
                        {{ cat.categoryName }}
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="!isMobile" class="gp-surface-card box-card">
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
          <div class="gp-col-24 gp-col-xl-17 gp-col-lg-17 gp-col-md-17 gp-col-sm-24 gp-col-xs-24">
            <div class="section-header"><i class="el-icon-menu"></i><plus-breadcrumb></plus-breadcrumb></div>
            <div class="blog-post-container">
              <div class="post-item item-list" v-for="(post, index) in blogPosts" :key="index"
                :class="{ 'skeleton-loading': loading }">
                <h3 class="item-title"><router-link :to="{ path: `/article/${post.id}` }">{{ post.articleTitle
                    }}</router-link></h3>
                <div class="item-meta">
                  <span class="meta-author">{{ post.authorName }}</span>
                  <span class="meta-dot">·</span>
                  <span>{{ dateTimeAgo(post.createTime) }}</span>
                  <span class="meta-tag" v-for="(tag, index) in post.tags" :key="index">
                    <router-link class="butt" :to="{ path: '/search', query: { tagName: tag.tagName } }">#{{ tag.tagName
                      }}</router-link>
                  </span>
                </div>
                <p class="item-summary" v-show="post.abstractText">{{ post.abstractText }}</p>
                <div class="item-actions">
                  <router-link :to="`/article/${post.id}`" class="read-more">阅读全文</router-link>
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
    <transition name="el-fade-in-linear">
      <plus-footer></plus-footer>
    </transition>
  </div>
</template>

<script>
import PlusBreadcrumb from '@/layout/components/Breadcrumb'
import PlusPager from '@/components/PlusPager'
import PlusFooter from '@/layout/components/Footer'
import { getArticleCategoryListByPath, getGpArticlesByCategory, selectGpArticlesListByKeyWords, selectArticleListForTag } from '@/api/geekplus/geekplus';

export default {
  name: "Articles",
  components: {
    PlusBreadcrumb,
    PlusPager,
    PlusFooter
  },
  data() {
    return {
      loading: false,
      userAvatar: require("@/assets/mai.png"), // Replace with your avatar image path
      userName: "麦壳儿",
      userDescription: "青衫烟雨间，挽风踏清歌",//"静水流深，沧笙踏歌",
      categoryCount: 14,
      articleCount: 29,
      commentCount: 6,
      allCategoryList: [],
      blogPosts: [
        {
          id: 1,
          articleTitle: "微信JSAPI支付",
          authorName: "niyueling",
          createTime: "2024-07-24 15:50:13",
          tags: [{ tagName: "微信" }, { tagName: "JSAPI支付" }],
          abstractText:
            "文章摘要: 最近接到新的需求,需要在公众号引入微信支付,之前微信支付方式使用过Native当面付以及H5支付。",
        },
        {
          id: 2,
          articleTitle: "一篇文章搞明白CORS跨域",
          authorName: "逆月",
          createTime: "2019-07-24 15:52:13",
          tags: [{ tagName: "CORS" }, { tagName: "跨域" }, { tagName: "必读" }],
          abstractText:
            "文章摘要: 面试问到数据交互的时候,经常会问跨域如何处理。大部分人都会回答JSONP,然后面试官紧接着就会问:“JSONP缺点是什么啊?“这个时候坑就来了。",
        },
        {
          id: 3,
          articleTitle: "阿里云--获取短信验证码",
          authorName: "逆月",
          createTime: "2019-07-25 14:40:00",
          tags: [{ tagName: "未分类" }],
          abstractText: "", // No excerpt provided in the original example
        },
      ],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pathName: '',
        articleTitle: null,
        tagName: null,
        tagId: null
      }
    };
  },
  created() {
    this.getAllArticleCategory();
    // window.document.title=(this.$route.meta.title || '文章列表') + "-极客普拉斯&梦极客园";
    // this.$router.onReady(() => {});
  },
  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     if (from.name !== null) {
  //       // 如果from.name不为null，说明是从其他页面进入的
  //       // vm.queryParams.pathName = vm.$route.path.split('/')[2];
  //       vm.getArticleListByPathCategory();
  //       vm.isEntered = true;
  //     } else {
  //       // 如果from.name为null，说明是第一次进入页面
  //       // vm.queryParams.pathName = vm.$route.path.split('/')[2];
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
    this.getArticleListByPathCategory()
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
    //根据标签查询文章分页
    getArticleListByTagName() {
      this.queryParams.pathName = this.$route.path.split('/')[2];
      this.loading = true;
      selectArticleListForTag(this.queryParams)
        .then((response) => {
          this.blogPosts = response.rows;
          this.total = response.total;
          this.articleCount = response.total;
          this.loading = false;
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
        });
      this.backToTop();
    },
    //正常搜索分页加载
    searchAllArticlesList() {
      selectGpArticlesListByKeyWords(this.queryParams)
        .then((response) => {
          this.blogPosts = response.rows;
          this.total = response.total;
          this.articleCount = response.total;
          this.loading = false;
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
        });
      this.backToTop();
    },
    getArticleListByPathCategory() {
      this.loading = true;
      getGpArticlesByCategory(this.queryParams)
        .then((response) => {
          this.blogPosts = response.rows;
          this.articleCount = response.total;
          this.total = response.total;
          this.loading = false;
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
  }
};
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  margin: 0;
  font-size: 1.3em;
}

.user-description {
  margin: 5px 0;
  color: #888;
}

.user-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.stat {
  color: #666;
}

.article-category {
  margin: 0 5px 5px 0;
  padding: 3px 6px;
}

.blog-post-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  background-color: var(--background-1, #fff);
  color: var(--fontColor);
  padding: 16px 18px;
  margin-bottom: 0;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    transform: translateY(-1px);
  }

  h3.item-title {
    margin: 0 0 8px 0;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.35;
    white-space: break-spaces;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    box-orient: vertical;
  }

  p.item-summary {
    margin: 0 0 10px 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted-1-color, #666);
    white-space: break-spaces;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    box-orient: vertical;
  }
}

.post-item .item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;

  .meta-author {
    font-weight: 500;
    color: #666;
  }

  .meta-dot {
    opacity: 0.5;
  }

  .meta-tag a {
    font-size: 11px;
    margin-right: 2px;
    padding: 2px 5px;
  }
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  font-size: 13px;
  color: var(--theme-color, #409eff);
  float: none;
}

.item-tag {
  background-color: #333;
  padding: 2px 5px;
  margin-left: 5px;
  border-radius: 3px;
}

@media screen and (max-width: 768px) {
  .post-item {
    padding: 12px 14px;
    border-radius: 8px;

    h3.item-title {
      font-size: 15px;
    }

    p.item-summary {
      font-size: 13px;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
  }

  .user-avatar {
    width: 60px;
    height: 60px;
    margin-right: 12px;
  }
}
</style>
