<template>
  <!-- 页面骨架：gp-page 替代 el-container/el-main/el-row/el-col -->
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-lg-17 gp-col-md-17 gp-col-sm-24 gp-col-xs-24">
            <div class="leave-word-container">
              <header class="lw-hero">
                <p class="lw-hero__eyebrow">Guestbook</p>
                <h1 class="lw-hero__title">给我留言</h1>
                <p class="lw-hero__lead">
                  想说的话、路过的脚印、纠错或点子，都欢迎留下。语气随意就好，这里偏安静一点。
                </p>
              </header>
              <div class="lw-body">
                <div class="skeleton-wrapper" v-if="loading"></div>
                <template v-else>
                  <comment-reply :hasLogin="!$common.isEmpty(username)" :comments="leaveWords" :isArticle="false"
                    @comment="sendComment"></comment-reply>
                </template>
                <plus-pager @pagination="getAllWebComments" :total="total" :page.sync="queryParams.pageNum"
                  :limit="queryParams.pageSize">
                </plus-pager>
                <div class="ads-container lw-ads">
                  <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="3776635819">
                  </Adsense>
                </div>
              </div>
            </div>
          </div>
          <div class="gp-col-24 gp-col-lg-7 gp-col-md-7 gp-col-sm-24 gp-col-xs-24">
            <div class="blog-side-container">
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
                        <span class="stat"><i class="el-icon-chat-line-square"></i> {{ commentCount }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="gp-surface-card box-card">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-folder-opened"></i>分类云</span>
                    <button type="button" class="more-button">更多 <i class="el-icon-arrow-right"></i></button>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="article-category-wrapper">
                    <span class="article-category" v-for="(cat, index) in allCategoryList" :key="index">
                      <router-link class="butt" :to="{ path: cat.path }">
                        {{ cat.categoryName }}
                      </router-link>
                    </span>
                  </div>
                </div>
              </div>

              <div class="gp-surface-card box-card">
                <div class="gp-surface-card__body">
                  <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="1460930833">
                  </Adsense>
                </div>
              </div>

              <div class="gp-surface-card box-card" :class="{ 'skeleton-loading': otherLoading }">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>推荐文章</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="recommend-article-container">
                    <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                      <router-link :to="`/article/${article.id}`">{{ article.articleTitle }}</router-link>
                    </div>
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
                  <div class="announcement">
                    <span v-html="oneNewNotice.noticeContent || '小站初建，欢迎来访~'"></span>
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
import PlusFooter from '@/layout/components/Footer'
import CommentReply from '@/components/CommentReply'
import PlusPager from '@/components/PlusPager'
import {
  getRandomRecommendArt, getArticleLatestUserComment, getWebHotUserComment,
  sendUserComment, getAllUserComment, getGpNoticeNewOne, getTagArticleCount
} from '@/api/geekplus/geekplus'

export default {
  components: {
    PlusFooter,
    CommentReply,
    PlusPager
  },
  data() {
    return {
      loading: true,
      otherLoading: true,
      searchQuery: '',
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      userAvatar: require("@/assets/mai.png"), // Replace with your avatar image path
      userName: "麦壳儿",
      userDescription: "青衫烟雨间，挽风踏清歌",
      categoryCount: 14,
      articleCount: 29,
      commentCount: 5,
      tags: [
        { name: "航模", type: "" },
        { name: "路由/NAS", type: "" },
        { name: "电子/嵌入式DIY", type: "" },
        { name: "建站", type: "success" },
        { name: "书架", type: "success" },
        { name: "笔迹", type: "info" },
      ],
      placeholderImage: require("@/assets/images/cover2.jpeg"), // Replace with a placeholder image path
      leaveWords: [],
      total: 0,
      userComment: {},
      allCategoryList: [],
      oneNewNotice: {},
      //随机推荐文章
      recommendedArticles: []
    };
  },
  created() {
    this.getAllWebComments();
    this.getRecommendArticles();
    this.getAllArticleCategory();
  },
  async mounted() {
    this.getOneNewestNotice();
  },
  watch: {
    $route(to, from) {
      if (to.path == '/leave-word') {
        this.getAllWebComments();
      }
    }
  },
  computed: {
    isMobile() {
      //根据用户吧浏览设备的用户信息判断是否是移动设备
      return this.$common.isMobile();
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
      this.userComment = data;
      // 用户点击确认操作
      sendUserComment(this.userComment)
        .then((res) => {
          if (res.code === 200) {
            this.getAllWebComments();
            this.$message({
              message: "发送成功",
              type: "success",
              duration: 2000,
            });
          }
        }).catch((error) => {
          this.$message({
            message: error.msg || error,
            type: "success",
            duration: 2000,
          });
        });
      // this.$confirm('评论留言需要审核，才能显示！', '提示', {
      //   confirmButtonText: '确定发布',
      //   cancelButtonText: '取消发布',
      //   type: 'warning'
      // }).then(() => {
      // }).catch(() => {});
    },
    getAllWebComments() {
      this.loading = true;
      getAllUserComment(this.queryParams)
        .then((res) => {
          //console.log(response);
          this.leaveWords = res.rows;
          this.total = res.total;
          this.commentCount = res.count;
          this.loading = false;
        })
        .catch((error) => {
          this.msgError(error.msg, {
            position: "top-center",
            duration: 3000,
          });
        });
    },
    getOneNewestNotice() {
      getGpNoticeNewOne().then((res) => {
        this.oneNewNotice = res.data;
      });
    },
    getRecommendArticles() {
      getRandomRecommendArt().then((res) => {
        this.recommendedArticles = res.data;
        this.otherLoading = false;
      });
    },
    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } }, onComplete => { }, onAbort => { });
      this.searchQuery = "";
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
    getTagAndArticleCount() {
      getTagArticleCount()
        .then((response) => {
          //console.log(response.data);
          // this.allTagArticleCount = response.data;
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
        });
    }
  }
};

</script>

<style lang="scss" scoped>
.leave-word-container {
  overflow: hidden;
  border-radius: var(--gp-surface-radius, 14px);
  background: var(--gp-surface-bg, var(--background-1));
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
  box-shadow: var(--gp-surface-shadow);
  margin-bottom: 16px;
}

.lw-hero {
  padding: 28px 22px 20px;
  background:
    radial-gradient(560px 200px at 12% -10%, rgba(154, 175, 177, 0.2), transparent 58%),
    radial-gradient(420px 160px at 95% 30%, rgba(196, 184, 174, 0.18), transparent 55%);
  border-bottom: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
}

.lw-hero__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--theme-color, #6e8b8e);
}

.lw-hero__title {
  margin: 0 0 10px;
  font-size: clamp(1.45rem, 2.2vw, 1.8rem);
  font-weight: 650;
  letter-spacing: 0.04em;
  color: var(--fontColor);
}

.lw-hero__lead {
  margin: 0;
  max-width: 40em;
  font-size: 14px;
  line-height: 1.7;
  color: var(--font-color, #5c5854);
}

.lw-body {
  padding: 16px 18px 20px;
}

.lw-ads {
  margin-top: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  margin: 0;
  font-size: 1.35em;
  color: var(--fontColor);
}

.user-description {
  margin: 5px 0;
  color: var(--muted-1-color, #8a8580);
  font-size: 13px;
}

.user-stats {
  display: flex;
  gap: 14px;
}

.stat {
  color: var(--font-color, #5c5854);
  font-size: 13px;
}

.article-category a {
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.recommend-article-container {
  .recommended-article {
    line-height: 1.5;
    margin-bottom: 8px;

    a {
      color: var(--font-color, #5c5854);
      text-decoration: none;

      &:hover {
        color: var(--theme-color, #6e8b8e);
      }
    }
  }
}

@media screen and (min-width: 1920px) {
  .lw-hero {
    padding: 36px 28px 24px;
  }
  .lw-body {
    padding: 20px 26px 24px;
  }
}
</style>
