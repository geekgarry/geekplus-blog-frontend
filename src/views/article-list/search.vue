<template>
  <!-- 页面骨架：gp-page 替代 el-container/el-main/el-row/el-col -->
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-xl-7 gp-col-lg-7 gp-col-md-7 gp-col-sm-24 gp-col-xs-24">
            <!-- 侧边栏用户信息：gp-surface-card 替代 el-card -->
            <div class="gp-surface-card profile-card">
              <div class="gp-surface-card__body">
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
              </div>
            </div>

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
                  <div class="article-card-list" :key="'list-' + article.id" v-else>
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
              </div>
            </div>

            <!-- 推荐文章块已注释，保留 el-card 注释供日后恢复 -->
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
          </div>

          <div class="gp-col-24 gp-col-xl-17 gp-col-lg-17 gp-col-md-17 gp-col-sm-24 gp-col-xs-24">
            <!-- <div class="welcome">
              <i class="el-icon-speaker"></i> 欢迎光临! 查看文章: <a
                href="https://127.0.0.1/article/26">https://127.0.0.1/article/26</a>
            </div> -->
            <div class="section-header">
              <i v-show="tagName" class="el-icon-collection-tag"></i>
              <i v-show="keyWords" class="el-icon-reading"></i>
              <span v-if="hasSearchQuery" class="section-content">
                {{ tagName ? "#" + tagName : "“" + keyWords + "” 的搜索结果" }}
              </span>
              <div v-else class="search-idle">
                <div class="search-container" style="max-width: 360px;">
                  <div class="gp-input-group">
                    <input
                      class="gp-input"
                      placeholder="输入关键词搜索文章"
                      v-model="searchQuery"
                      @keyup.enter="searchArticles"
                    >
                    <button type="button" class="gp-btn gp-btn--append" @click="searchArticles">
                      <i class="el-icon-search"></i>
                    </button>
                  </div>
                </div>
                <p class="search-idle__tip">输入关键词或从标签页进入，即可查看结果</p>
              </div>
            </div>

            <div class="article-list" v-if="hasSearchQuery">
              <template v-if="loading">
                <div
                  v-for="n in 3"
                  :key="'sk-' + n"
                  class="article-card is-always-shadow skeleton-loading"
                  style="min-height: 120px"
                ></div>
              </template>
              <div class="archive-empty" v-else-if="total <= 0">
                没有找到与「<span class="archive-empty-keywords">{{ keyWords || tagName }}</span>」相关的内容
              </div>
              <template v-else>
                <div
                  v-for="article in articlesList"
                  :key="article.id"
                  class="article-card is-always-shadow"
                >
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
                    <div class="article-cover">
                      <router-link :to="'/article/' + article.id" class="article-cover-link">
                        <img
                          :src="article.indexPicture || articleCover || authorAvatar"
                          :alt="article.articleTitle"
                          class="article-image"
                          loading="lazy"
                        />
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
                    <span class="like-count hidden-xs-only" v-show="article.likeCount">
                      <i class="el-icon-thumb"></i> {{ article.likeCount }}
                    </span>
                  </div>
                </div>
              </template>
            </div>

            <plus-pager
              v-if="hasSearchQuery"
              @pagination="generalArticleList"
              :total="total"
              :page.sync="queryParams.pageNum"
              :limit="queryParams.pageSize"
            ></plus-pager>
            <!-- <el-button type="text" class="more-button"> > MORE</el-button> -->
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
      loading: false,
      otherLoading: true,
      userAvatar: require("@/assets/mai.png"),
      userName: "麦壳儿",
      userDescription: "青衫烟雨间，挽风踏清歌",
      categoryCount: 14,
      articleCount: 29,
      commentCount: 6,
      searchQuery: "",
      authorAvatar: require("@/assets/logo.png"),
      articlesList: [],
      recommendedArticles: [],
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
    this.bootstrapFromRoute();
    this.otherLoading = false;
  },
  activated() {
    // keep-alive 场景下再次进入搜索页时同步 URL 查询条件
    this.bootstrapFromRoute();
  },
  watch: {
    // 同页改 query（搜索框提交）需重新拉数据；无参数时清空列表，避免骨架假数据
    "$route.query": {
      handler() {
        this.bootstrapFromRoute();
      },
      deep: true,
    },
  },
  computed: {
    tagName() {
      const t = this.$route.query.tagName;
      return t != null && String(t).trim() !== "" ? String(t).trim() : "";
    },
    keyWords() {
      const k = this.$route.query.keyWords;
      return k != null && String(k).trim() !== "" ? String(k).trim() : "";
    },
    hasSearchQuery() {
      return !!(this.tagName || this.keyWords);
    },
    hotArticleList() {
      return this.$store.getters.hotArticleList;
    },
    isMobile() {
      return this.$common.isMobile();
    },
  },
  methods: {
    bootstrapFromRoute() {
      if (this.tagName) {
        window.document.title =
          this.tagName + " 标签文章列表 | 极客普拉斯&梦极客园";
        this.queryParams.pageNum = 1;
        this.getArticleListByTagName();
        return;
      }
      if (this.keyWords) {
        window.document.title =
          this.keyWords + " 搜索文章列表 | 极客普拉斯&梦极客园";
        this.searchQuery = this.keyWords;
        this.queryParams.pageNum = 1;
        this.searchAllArticlesList();
        return;
      }
      // 无搜索条件：不请求、不展示骨架列表
      this.loading = false;
      this.articlesList = [];
      this.total = 0;
      window.document.title = "搜索文章 | 极客普拉斯&梦极客园";
    },
    searchArticles() {
      const q = (this.searchQuery || "").trim();
      if (!q) {
        this.$message && this.$message.warning("请输入搜索关键词");
        return;
      }
      // 已在搜索页时也必须触发查询（靠 $route.query watch）
      this.$router
        .push({ path: "/search", query: { keyWords: q } })
        .catch(() => {});
    },
    navToArticle(id) {
      this.$router.push({ path: `/article/${id}` }, () => {}, () => {});
    },
    generalArticleList() {
      if (this.tagName) {
        this.getArticleListByTagName();
      } else if (this.keyWords) {
        this.searchAllArticlesList();
      }
    },
    getArticleListByTagName() {
      this.queryParams.articleTitle = null;
      this.queryParams.tagName = this.tagName;
      this.loading = true;
      selectArticleListForTag(this.queryParams)
        .then((response) => {
          this.articlesList = response.rows || [];
          this.total = response.total || 0;
          this.articleCount = this.total;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.articlesList = [];
          this.total = 0;
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error",
          });
        });
    },
    searchAllArticlesList() {
      this.queryParams.tagName = null;
      this.queryParams.articleTitle = this.keyWords;
      this.loading = true;
      selectGpArticlesListByKeyWords(this.queryParams)
        .then((response) => {
          this.articlesList = response.rows || [];
          this.total = response.total || 0;
          this.articleCount = this.total;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.articlesList = [];
          this.total = 0;
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

.user-details {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  min-width: 0;
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
  margin-right: 0;
  color: #666;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.archive-empty {
  text-align: center;
  padding: 60px 0;
  font-size: 14px;
  color: var(--font-color, #777);
  background: var(--background-1, #f8f9fa);
  border-radius: var(--border-radius, 8px);
}

.search-idle {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0 8px;
}

.search-idle__tip {
  margin: 0;
  font-size: 13px;
  color: var(--muted-1-color, #8a8580);
}

.archive-empty-keywords {
  color: var(--theme-color);
  font-weight: 600;
}

.archive-empty-tips {
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: var(--font-color, #777);
  background: var(--background-1, #f8f9fa);
  border-radius: var(--border-radius, 8px);
}

.archive-empty-tips p {
  margin: 0;
  font-size: 14px;
  color: var(--font-color, #777);
}

.archive-empty-tips ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.article-list a:hover {
  color: var(--theme-color);
}

.article-card {
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 0;
  background: var(--background-1);
  color: var(--fontColor);
  display: block;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    transform: translateY(-1px);
  }
}

.article-content {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 8px;

  .article-content-wrapper {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.article-cover {
  flex: 0 0 150px;
  width: 150px;
  max-width: 36%;
  overflow: hidden;
  border-radius: 8px;
}

.article-cover-link {
  display: block;
  width: 100%;
  height: 0;
  padding-bottom: 66%;
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
  border-radius: 8px;
  transition: transform 0.35s ease;
}

.article-title {
  margin: 0 0 8px 0;
  font-size: 16px;
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
  margin-right: 4px;
}

.view-count,
.time-ago,
.collect-count,
.like-count,
.comment-count {
  margin-right: 4px;
}

.recommend-article-container {
  .recommended-article {
    line-height: 20px;
    margin-bottom: 4px;
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

  .article-title {
    font-size: 15px;
  }

  .article-summary {
    font-size: 13px;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
    margin-right: 12px;
  }
}
</style>
