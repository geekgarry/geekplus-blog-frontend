<template>
  <div class="container-fluid">
    <el-container class="container" type="flex" direction="vertical">
      <el-main>
        <el-row :gutter="10" justify="center">
          <el-col :xs="24" :sm="24" :md="7" :lg="7" :xl="7">
            <div class="blog-side-container">
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
                    <span class="category-title"><i class="el-icon-folder-opened"></i>分类云</span>
                    <el-button type="text" class="more-button">更多 <i class="el-icon-arrow-right"></i></el-button>
                  </div>
                </div>
                <div class="article-category-wrapper">
                  <span class="article-category" v-for="(cat, index) in allCategoryList" :key="index">
                    <a class="butt" href="javascript:;" @click="$router.push({ path: cat.path })">
                      {{ cat.categoryName }}
                    </a>
                  </span>
                </div>
              </el-card>

              <el-card v-if="!isMobile" class="box-card">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>网站公告</span>
                  </div>
                </div>
                <div class="announcement">
                  小站初建，欢迎来访~
                </div>
              </el-card>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
            <div class="section-header"><i class="el-icon-menu"></i><plus-breadcrumb></plus-breadcrumb></div>
            <div class="blog-post-container">
              <div class="post-item item-list" v-for="(post, index) in blogPosts" :key="index"
                :class="{ 'skeleton-loading': loading }">
                <h3 class="item-title"><router-link :to="{ path: `/article/${post.id}` }">{{ post.articleTitle
                    }}</router-link></h3>
                <div class="item-meta">
                  {{ post.authorName }} 发表于: {{ dateTimeAgo(post.createTime) }} 标签:
                  <span class="meta-tag" v-for="(tag, index) in post.tags" :key="index">
                    <router-link class="butt" :to="{ path: '/search', query: { tagName: tag.tagName } }">{{ tag.tagName
                      }}</router-link>
                  </span>
                </div>
                <p class="item-summary" v-show="post.abstractText">{{ post.abstractText }}</p>
                <router-link :to="`/article/${post.id}`" class="read-more" style="float: right">阅读全文 ></router-link>
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
  margin-bottom: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-details {}

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

.article-category {
  margin: 0 5px 5px 0;
  /* Adjust spacing as needed */
  padding: 3px 6px;
}

.blog-post-container {
  background-size: cover;
  display: flex;
  flex-direction: column;
}

.post-item {
  background-color: var(--background-1, rgba(0, 0, 0, 0.7));
  color: var(--fontColor);
  box-shadow: 0 2px 5px 0 hsla(0, 0%, 57%, .1);
  /* Semi-transparent black background */
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  /* Add some rounded corners */

  h3.item-title {
    margin: 0 0 5px 0;
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
  }

  p.item-summary {
    margin: 0 0 5px 0;
    font-size: 0.9rem;
    white-space: break-spaces;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    box-orient: vertical;
  }

  .read-more {
    font-size: 0.8rem;
  }
}

.post-item .item-meta {
  font-size: 0.8em;
  color: #999;
  margin-bottom: 10px;
  white-space: break-spaces;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;

  .meta-tag a {
    font-size: 11px;
    margin-right: 5px;
    padding: 2px 5px;
  }
}

.item-tag {
  background-color: #333;
  padding: 2px 5px;
  margin-left: 5px;
  border-radius: 3px;
  /* Round the tags */
}
</style>
