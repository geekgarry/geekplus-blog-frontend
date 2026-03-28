<template>
  <div class="container-fluid">
    <el-container class="container" type="flex" direction="vertical">
      <el-main>
        <el-row :gutter="10" justify="center">
          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
            <div class="leave-word-container is-always-shadow">
              <div class="text-title-container">
                <span class="text-title-plus typing">给我留言</span>
              </div>
              <div class="skeleton-wrapper" v-if="loading"></div>
              <template v-else>
                <comment-reply :hasLogin="!$common.isEmpty(username)" :comments="leaveWords" :isArticle="false"
                  @comment="sendComment"></comment-reply>
              </template>
              <plus-pager @pagination="getAllWebComments" :total="total" :page.sync="queryParams.pageNum"
                :limit="queryParams.pageSize">
              </plus-pager>
              <br />
              <div class="ads-container">
                <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="3776635819">
                </Adsense>
              </div>
            </div>
          </el-col>
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
                      <!-- <span class="stat"><i class="el-icon-document"></i> {{ articleCount }}</span> -->
                      <span class="stat"><i class="el-icon-chat-line-square"></i> {{ commentCount }}</span>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-folder-opened"></i>分类云</span>
                    <el-button type="text" class="more-button">更多 <i class="el-icon-arrow-right"></i></el-button>
                  </div>
                </div>
                <div class="article-category-wrapper">
                  <span class="article-category" v-for="(cat, index) in allCategoryList" :key="index">
                    <router-link class="butt" :to="{ path: cat.path }">
                      {{ cat.categoryName }}
                    </router-link>
                  </span>
                </div>
              </el-card>

              <el-card class="box-card">
                <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="1460930833">
                </Adsense>
              </el-card>

              <el-card class="box-card" :class="{ 'skeleton-loading': otherLoading }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>推荐文章</span>
                  </div>
                </div>
                <div class="recommend-article-container">
                  <div v-for="article in recommendedArticles" :key="article.id" class="recommended-article">
                    <router-link :to="`/article/${article.id}`">{{ article.articleTitle }}</router-link>
                  </div>
                </div>
              </el-card>

              <el-card class="box-card" :class="{ 'skeleton-loading': otherLoading }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>网站公告</span>
                  </div>
                </div>
                <div class="announcement">
                  <span v-html="oneNewNotice.noticeContent || '小站初建，欢迎来访~'"></span>
                </div>
              </el-card>
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
  mounted() {
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
/* 给我留言页面 */
.leave-word-container {
  overflow: hidden;
  border-radius: 4px;
  background-color: var(--background-1, #303133);
  margin-bottom: 10px;
}

.text-title-container {
  width: 100%;
  height: 32px;
  line-height: 32px;
  text-align: center;
  margin-bottom: 5px;
}

.text-title-plus {
  margin: 3px auto;
}

.text-flash {
  background: linear-gradient(90deg, black 0%, white 50%, black 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-animation: flashNone 3s linear infinite;
  animation: flashNone 3s linear infinite;
}

@keyframes flashNone {
  0% {}

  100% {
    transform: translateX(100%);
  }
}

.emit-light {
  color: var(--font-color, #3d3d3d);
  font-size: 22px;
  -webkit-animation: shining 0.5s alternate infinite;
  animation: shining 0.5s alternate infinite;
}

@keyframes shining {
  from {
    text-shadow: 0 0 10px lightblue, 0 0 20px lightblue, 0 0 30px lightblue, 0 0 40px skyblue, 0 0 50px skyblue, 0 0 60px skyblue;
  }

  to {
    text-shadow: 0 0 5px lightblue, 0 0 10px lightblue, 0 0 15px lightblue, 0 0 20px skyblue, 0 0 25px skyblue, 0 0 30px skyblue;
  }
}

.text-carousel {
  letter-spacing: 4px;
  font-size: 20px;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-background-size: 200% 100%;
  background-size: 200% 100%;
  background-image: -webkit-linear-gradient(to right, #147B96, #E6D205 25%, #147B96 50%, #E6D205 75%, #147B96);
  background: linear-gradient(to right, #147B96, #E6D205 25%, #147B96 50%, #E6D205 75%, #147B96);
  -webkit-animation: maskedAnimation 4s infinite linear;
  animation: maskedAnimation 4s infinite linear;
}

@keyframes maskedAnimation {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: -100% 0;
  }
}

.typing {
  display: block;
  color: var(--fontColor, black);
  font-size: 18px;
  width: 100px;
  height: 26px;
  line-height: 26px;
  border-right: 1px solid transparent;
  animation: typing 3s steps(42, end) forwards, blink-caret .8s step-end infinite;
  font-family: Consolas, Monaco;
  word-break: break-all;
  overflow: hidden;
  letter-spacing: 4px;
}

/* 打印效果 */
@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 100px;
  }
}

/* 光标 */
@keyframes blink-caret {

  from,
  to {
    border-color: transparent;
  }

  50% {
    border-color: currentColor;
  }
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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
  margin-right: 10px;
  /* Adjust spacing as needed */
  margin-bottom: 10px;
  /* Add vertical margin */
  cursor: pointer;
}

.recommend-article-container {
  .recommended-article {
    line-height: 20px;
    margin-bottom: 4px;
  }
}
</style>
