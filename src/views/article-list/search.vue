<template>
  <div class="container-fluid">
    <el-container class="container">
      <el-main>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="7" :lg="7" :xl="7">
            <el-card class="profile-card">
              <div class="user-info">
                <img :src="userAvatar" alt="User Avatar" class="user-avatar" />
                <div class="user-details">
                  <h2 class="user-name">{{ userName }}</h2>
                  <p class="user-description">{{ userDescription }}</p>
                  <div class="user-stats">
                    <span class="stat"><i class="el-icon-s-opportunity"></i>
                      {{ categoryCount }}</span>
                    <span class="stat"><i class="el-icon-document"></i> {{ articleCount }}</span>
                    <span class="stat"><i class="el-icon-chat-line-square"></i>
                      {{ commentCount }}</span>
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
                  <div class="top-article-card" :key="index" v-if="index == 0">
                    <div class="top-article-card-cover">
                      <a class="thumbnail-b" href="javascript:void(0);" v-if="article.indexPicture" @click="
                        navToArticle(article.id)
                        " :style="{
                          backgroundImage: 'url(' + article.indexPicture + ')',
                        }"></a>
                      <a class="thumbnail-b" href="javascript:void(0);" v-else @click="
                        navToArticle(article.id)
                        " :style="{
                          backgroundImage: 'url(' + articleCover + ')',
                        }"></a>
                      <span class="top-article-card-caption"><router-link :to="'/article/' + article.id">{{
                        article.articleTitle
                          }}</router-link></span>
                    </div>
                  </div>
                  <div class="article-card-list" :key="index" v-else>
                    <div class="article-card-cover">
                      <a class="thumbnail-b" href="javascript:void(0);" v-if="article.indexPicture" @click="
                        navToArticle(article.id)
                        " :style="{
                          backgroundImage: 'url(' + article.indexPicture + ')',
                        }"></a>
                      <a class="thumbnail-b" href="javascript:void(0);" v-else @click="
                        navToArticle(article.id)
                        " :style="{
                          backgroundImage: 'url(' + articleCover + ')',
                        }"></a>
                    </div>
                    <div class="article-card-detail">
                      <div class="article-card-detail-title">
                        <router-link :to="'/article/' + article.id">{{
                          article.articleTitle
                          }}</router-link>
                      </div>
                      <div class="article-card-detail-date">
                        {{ dateTimeAgo(article.createTime) }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-card>

            <!-- <el-card v-if="!isMobile" class="box-card" :class="{ 'skeleton-loading': otherLoading }">
              <div slot="header" class="clearfix">
                <div class="category-section">
                  <span class="category-title"><i class="el-icon-data-board"></i>推荐文章</span>
                </div>
              </div>
              <div class="recommend-article-container">
                <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                  <router-link :to="`/article/${article.id}`">{{
                    article.articleTitle
                    }}</router-link>
                </div>
              </div>
            </el-card> -->
          </el-col>

          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
            <!-- <div class="welcome">
              <i class="el-icon-speaker"></i> 欢迎光临! 查看文章: <a
                href="https://127.0.0.1/article/26">https://127.0.0.1/article/26</a>
            </div> -->
            <div class="section-header">
              <i v-show="tagName" class="el-icon-collection-tag"></i>
              <i v-show="keyWords" class="el-icon-reading"></i>
              <span v-if="tagName || keyWords" class="section-content">
                {{ tagName ? "#" + tagName : "“" + keyWords + "” 的搜索结果" }}
              </span>
              <span v-else class="section-content">
                这是一个搜索页面，请输入搜索内容
              </span>
            </div>

            <div class="article-list">
              <div v-if="!loading && total <= 0">
                没有内容，请重新搜索！！！
              </div>
              <div v-for="article in articlesList" :key="article.id" class="article-card is-always-shadow"
                :class="{ 'skeleton-loading': loading }">
                <div class="article-content">
                  <div class="article-content-wrapper">
                    <h3 class="article-title">
                      <router-link :to="'/article/' + article.id">{{
                        article.articleTitle
                        }}</router-link>
                    </h3>
                    <div class="article-info">
                      <p class="article-summary">{{ article.abstractText }}</p>
                    </div>
                  </div>
                  <div class="article-cover" v-if="article.indexPicture">
                    <router-link :to="'/article/' + article.id">
                      <img :src="article.indexPicture" :alt="article.articleTitle" class="article-image" />
                    </router-link>
                  </div>
                </div>
                <div class="article-footer">
                  <a class="article-author-a" href="javascript:void(0);">
                    <img class="author-avatar" :src="authorAvatar" :alt="article.authorName" />
                  </a>
                  <span class="author-name hidden-xs-only">{{ article.authorName }}</span>
                  <span v-for="(tag, index) in article.tags" :key="index" class="article-tag">
                    <router-link class="butt" :to="{ path: '/search', query: { tagName: tag.tagName } }">#{{ tag.tagName
                      }}</router-link>
                  </span>
                  <span class="view-count">
                    <i class="el-icon-view"></i> {{ article.viewCount }}
                  </span>
                  <span class="time-ago">
                    <i class="el-icon-time"></i>
                    {{ dateTimeAgo(article.createTime) }}
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

            <plus-pager @pagination="generalArticleList" :total="total" :page.sync="queryParams.pageNum"
              :limit="queryParams.pageSize"></plus-pager>
            <!-- <el-button type="text" class="more-button"> > MORE</el-button> -->
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
import PlusFooter from "@/layout/components/Footer";
import PlusPager from "@/components/PlusPager";
import {
  getArticleCategoryListByPath,
  getGpArticlesByCategory,
  selectGpArticlesListByKeyWords,
  selectArticleListForTag,
} from "@/api/geekplus/geekplus";

export default {
  components: {
    PlusFooter,
    PlusPager,
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
      searchQuery: "",
      authorAvatar: require("@/assets/logo.png"), // Replace with actual avatar path
      articlesList: [
        {
          id: 1,
          articleTitle: "在 ubuntu20.04上安装 docker",
          abstractText:
            "1、替换清华源 替换sources.list里面的内容 sudovim/etc/apt/sources.list #默认注释了源码镜像以\n提高aptupdate速度,如有需要可自行取消注释\ndebhttps://mirrors.tuna.tsinghua.edu.cn/ubuntu/focalmainrestricteduniversemultiverse #deb-srcht...",
          authorAvatar: require("@/assets/mai.png"), // Replace with actual avatar path
          authorName: "RisunJan",
          tags: [{ tagName: "学习笔记1" }, { tagName: "学习笔记2" }],
          viewCount: 87,
          createTime: "3周前",
          likeCount: 3,
          commentCount: 0,
        },
        {
          id: 2,
          articleTitle: "PVE虚拟机扩展磁盘空间",
          abstractText:
            "在PVE操作界面上调整虚拟机节点的磁盘大小。使用命令lsblk查看一下服务器上的分区情况。使用fdisk-i查看分区信息,可以看到我这边sda1和sda2加起来才用了100G,剩下的900G是需要手动挂载上去。使用parted/dev/sda磁盘分区...",
          authorAvatar: require("@/assets/mai.png"), // Replace with actual avatar path
          authorName: "陌溪",
          tags: [{ tagName: "学习笔记" }, { tagName: "小主机" }],
          viewCount: 23,
          createTime: "1周前",
          likeCount: 3,
          commentCount: 0,
        },
        {
          id: 3,
          articleTitle: "支付宝网站支付DEMO",
          abstractText:
            "支付宝网页支付的DEMO加上沙箱环境实现支付宝手机网站支付DEMO的试用测试。",
          authorAvatar: require("@/assets/mai.png"), // Replace with actual avatar path
          authorName: "蓝胖子",
          tags: [{ tagName: "后端开发" }, { tagName: "Java" }],
          viewCount: 124,
          createTime: "1月前",
          likeCount: 3,
          commentCount: 0,
          indexPicture: require("@/assets/images/cover1.jpeg"), // Replace with actual image path
        },
        {
          id: 4,
          articleTitle: "监控公网IP变动:利用Shell脚本自动化检测与邮件通知",
          abstractText:
            "本大爷使用的是AlmaLinux系统,最近跟着陌溪大佬的脚步一步一步的搭建了自己的小主机用来做服务器,成功的申请到了公网IP,有一个问题就是:公网会随时变动...",
          authorAvatar: require("@/assets/mai.png"), // Replace with actual avatar path
          authorName: "佚名",
          tags: [{ tagName: "Shell" }, { tagName: "Linux" }],
          viewCount: 56,
          createTime: "2月前",
          likeCount: 1,
          commentCount: 2,
          indexPicture: require("@/assets/images/cover1.jpeg"), // Replace with actual image path
        },
      ],
      //推荐文章
      recommendedArticles: [
        {
          id: 1,
          articleTitle: "Vue.js Best Practices",
          indexPicture: "/path/to/image1.jpg",
        },
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
      hotArticles: [],
      recommendArticles: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tagName: null,
        articleTitle: null,
      },
      articleCover: require("@/assets/images/cover2.jpeg"),
    };
  },
  created() {
    // this.$router.onReady(() => {});
    if (this.tagName) {
      window.document.title =
        this.tagName + " 标签文章列表 | 极客普拉斯&梦极客园" ||
        "极客普拉斯&梦极客园-GeekPlus";
      this.getArticleListByTagName();
    }
    if (this.keyWords) {
      window.document.title =
        this.keyWords + " 搜索文章列表 | 极客普拉斯&梦极客园" ||
        "极客普拉斯&梦极客园-GeekPlus";
      this.searchAllArticlesList();
    }
    this.otherLoading = false;
  },
  // beforeRouteUpdate(to, from, next) {
  //   //复用同一页面中，根据更新的路由to.path为要去往的页面
  //   next();
  //   if(to.fullPath !== from.fullPath) {
  //     if (this.tagName) {
  //       window.document.title =
  //         this.tagName + "标签文章列表 | 极客普拉斯&梦极客园" ||
  //         "极客普拉斯&梦极客园-GeekPlus";
  //       this.getArticleListByTagName();
  //     }
  //     if (this.keyWords) {
  //       window.document.title =
  //         this.keyWords + "搜索文章列表 | 极客普拉斯&梦极客园" ||
  //         "极客普拉斯&梦极客园-GeekPlus";
  //       this.searchAllArticlesList();
  //     }
  //   }
  // },
  watch: {
    $route(to, from) {}
  },
  computed: {
    tagName() {
      return this.$route.query.tagName;
    },
    keyWords() {
      return this.$route.query.keyWords;
    },
    hotArticleList() {
      return this.$store.getters.hotArticleList;
    },
    isMobile() {
      //根据用户吧浏览设备的用户信息判断是否是移动设备
      return this.$common.isMobile();
    },
  },
  methods: {
    searchArticles() {
      this.$router.push(
        { path: "/search", query: { keyWords: this.searchQuery } },
        (onComplete) => { },
        (onAbort) => { }
      );
      this.searchQuery = "";
    },
    navToArticle(id) {
      this.$router.push({ path: `/article/${id}` }, (onComplete) => { }, (onAbort) => { });
    },
    generalArticleList() {
      if (this.tagName) {
        this.getArticleListByTagName();
      } else if (this.keyWords) {
        this.searchAllArticlesList();
      }
    },
    //根据标签查询文章分页
    getArticleListByTagName() {
      this.queryParams.articleTitle = null;
      this.queryParams.tagName = this.tagName;
      this.loading = true;
      selectArticleListForTag(this.queryParams)
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
            type: "error",
          });
        });
    },
    //正常搜索分页加载
    searchAllArticlesList() {
      this.queryParams.tagName = null;
      this.queryParams.articleTitle = this.keyWords;
      this.loading = true;
      selectGpArticlesListByKeyWords(this.queryParams)
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
            type: "error",
          });
        });
    },
    //通过路径查询不同分类文章
    getArticleListByPathCategory() {
      getGpArticlesByCategory(this.queryParams)
        .then((response) => {
          this.articlesList = response.rows;
          this.total = response.total;
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error",
          });
        })
        .finally(() => { });
    },
    getAllArticleCategory() {
      // let tempMenuList = this.$router.options.routes.filter(
      //   (item) => { return item.type == "servermenu"}
      // );
      this.allCategoryList = this.getListSubCategory(
        this.$store.getters.addMenuRoutes
      );
    },
    getListSubCategory(list) {
      let listCategory = new Array();
      list.forEach((parent) => {
        parent.children.forEach((child) => {
          let childCategory = {
            path: parent.path + "/" + child.path,
            pathName: child.path,
            categoryName: child.categoryName,
          };
          listCategory.push(childCategory);
        });
      });
      return listCategory;
    },
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

/* .blog-home {} */

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

  img {
    max-width: 170px;
    width: 100%;
    min-width: 100px;
    user-select: none;
  }
}

.article-cover {
  max-width: 165px;
  width: 100%;
  min-width: 90px;
  min-height: 70px;
  height: 100%;
  max-height: 90px;
  overflow: hidden;
  border-radius: 5px;
  margin-left: 6px;
  object-position: center;
  display: grid;
}

.article-cover:hover img {
  transform: scale(110%);
}

.article-image {
  max-width: 100%;
  min-height: 70px;
  height: 100%;
  max-height: 150px;
  display: block;
  /* Prevents image from affecting layout */
  border-radius: 5px;
  -moz-border-radius: 5px;
  -ms-border-radius: 5px;
  -webkit-border-radius: 5px;
  -o-border-radius: 5px;
  background-size: cover;
  background-position: 50%;
  -o-object-fit: cover;
  object-fit: cover;
  position: relative;
  transition: all 0.4s linear;
}

.article-title {
  margin: 0 0 5px 0;
  font-size: 15px;
  white-space: break-spaces;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
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
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*! autoprefixer: off */
  -webkit-box-orient: vertical;
  box-orient: vertical;
  font-size: 14px;
}

.article-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 3px;
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
}

.recommend-article-container {
  .recommended-article {
    line-height: 20px;
    margin-bottom: 4px;
  }
}
</style>
