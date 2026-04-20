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
                      <!-- <span class="stat"><i class="el-icon-document"></i> {{ articleCount }}</span> -->
                      <span class="stat"><i class="el-icon-chat-line-square"></i> {{ commentCount
                      }}</span>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card class="box-card hidden-xs-only">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-search"></i>搜索</span>
                  </div>
                </div>
                <el-input placeholder="搜索文章" v-model="searchQuery" @keyup.enter.native="searchArticles" clearable>
                  <el-button slot="append" icon="el-icon-search" @click="searchArticles"></el-button>
                </el-input>
              </el-card>

              <el-card class="box-card hidden-xs-only" :class="{ 'skeleton-loading': loading }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-folder-opened"></i>分类云</span>
                    <el-button type="text" class="more-button">更多 <i class="el-icon-arrow-right"></i></el-button>
                  </div>
                </div>
                <div class="article-category-wrapper">
                  <span class="article-category" v-for="(cat, index) in allCategoryList" :key="index">
                    <a class="butt" href="javascript:;"
                      @click="$router.push({ path: cat.path })">
                      {{ cat.categoryName }}
                    </a>
                  </span>
                </div>
              </el-card>

              <el-card class="box-card hidden-xs-only">
                <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="5487504434">
                </Adsense>
              </el-card>

              <el-card class="box-card hidden-xs-only" :class="{ 'skeleton-loading': loading }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>网站公告</span>
                  </div>
                </div>
                <div class="announcement">
                  小站初建，欢迎来访~
                </div>
              </el-card>

              <el-card class="box-card" :class="{ 'skeleton-loading': loading }">
                <div slot="header" class="clearfix">
                  <div class="category-section">
                    <span class="category-title"><i class="el-icon-data-board"></i>网站链接</span>
                  </div>
                </div>
                <div class="website_link-container">
                  <span class="website_link-content" v-for="(item, index) in webSiteLink" :key="index">
                    <a :title="item.linkIntro" :href="item.linkUrl" target="_blank">{{ item.linkName }}</a>
                  </span>
                </div>
              </el-card>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="17" :lg="17" :xl="17">
            <div class="article-container" :class="{ 'skeleton-loading': loading }" v-viewer>
              <div class="article-title">
                <h2>
                  {{
                    aboutMeData.gpTitle ? aboutMeData.gpTitle : "关于极客普拉斯"
                  }}
                </h2>
              </div>
              <div class="article-meta">
                <label>作者：{{
                  aboutMeData.gpName ? aboutMeData.gpName : "geekplus"
                  }}
                </label>|
                <label>发布：{{
                  aboutMeData.createTime ? aboutMeData.createTime : "2019-12-12"
                  }}
                </label>
              </div>
              <article>
                <div class="article-content" v-if="aboutMeData.gpContent" v-html="aboutMeData.gpContent"></div>
                <div class="article-content" v-else>
                  <p>欢迎来到梦极客园!!!</p>
                  <div class="alert alert-info alert-no-margin" role="alert">
                    <p>做政治试卷，是我这辈子，说谎最多的时候。</p>
                    <p>做政治试卷，是我这辈子，说谎最多的时候。</p>
                    <p>做任何事情一定要坚持下去，总会让你看到，失败的那一天。</p>
                  </div>
                  <p>我坚信技术改变世界,创新引领生活!</p>
                  <div class="alert alert-info alert-no-margin" role="alert">
                    <p>
                      本站是一个技术分享,生活记录,个人随笔,科技杂谈的博客类网站!
                    </p>
                    <p>
                      软件设计要考虑诸多方面，权衡各种利弊，以设计一个趋于完美的解决方案。在方案未落实之前，这也是争论的焦点，探讨的是方案的可行性，
                      然而无论再好的方案都有弊端的，只是众多方案中选优罢了，这点正是本文的主题。程序设计不可能集所有优点于一身，必有牺牲的一面，常常
                      因为为了满足准确性，而牺牲了性能，为了满足某些需求，而冗余了代码，甚至入侵了业务也不惜，因此代码是没有双全法的，有得必有失，不必苛求。
                    </p>
                    <p>
                      代码尚且如此，人生又何尝不是？人生是不完美的，也无法做到十全十美，这不是付出多少的问题，这就是一个真命题，就像地球引力一般的存在，
                      再成功的人也有他遗憾的问题，是因为他厚此薄彼的结果，当然厚此薄彼要加上引号，其动机没有不纯，这就是2选1的问题，举个不恰当的例子，一
                      个男人有了外遇，被老婆知道了，老婆和情人其实都有一个共同的诉求，就是男人必须在两者之间选择一个，这时男人不管如何做出选择都是痛的，
                      如若男人继续做出中庸的选择，那么两头都不讨好，最后只能竹篮打水一场空，两个人都得不到，举这个例子可能不太恰当，但能说明问题所在。
                    </p>
                  </div>
                  <div class="container-fluid">
                    <div class=""></div>
                    <div class="row">
                      <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <div class="model">
                          <div class="title">
                            我的QQ: 1789615426
                          </div>
                          <!-- <div class="content">
                          <img
                            alt="geekplus,极客普拉斯,我的QQ"
                            class="donate-image-code"
                            src="/imgs/mysocialQRCode/QQCode.jpg"
                          />
                        </div> -->
                        </div>
                      </div>
                      <!-- <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="model">
                        <div class="title">
                          我的微信
                        </div>
                        <div class="content">
                          <img
                            alt="geekplus,极客普拉斯,我的微信"
                            class="donate-image-code"
                            src="/imgs/mysocialQRCode/WexinCode.jpg"
                          />
                        </div>
                      </div>
                    </div> -->
                    </div>
                  </div>
                </div>
              </article>
              <div class="row mx-4">
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="6482220433">
                  </Adsense>
                </div>
              </div>
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
import lazyLoadDirectives from '@/mixins/lazyLoadDirectives'
import { getArticleCategoryListByPath, getAboutMyGpWeb, displayFriendlyLink } from '@/api/geekplus/geekplus';

export default {
  name: "Articles",
  mixins: [lazyLoadDirectives],
  components: {
    PlusFooter
  },
  data() {
    return {
      loading: true,
      userAvatar: require("@/assets/mai.png"), // Replace with your avatar image path
      userName: "麦壳儿",
      userDescription: "青衫烟雨间，挽风踏清歌",
      categoryCount: 14,
      articleCount: 29,
      commentCount: 5,
      allCategoryList: [],
      searchQuery: '',
      aboutMeData: {},
      webSiteLink: []
    };
  },
  async created() {
    // this.$router.onReady(() => {
    //   window.document.title = "关于我们 | 拾光梦集-极客普拉斯&梦极客园";
    // });
    this.getAboutMeAndMyWeb();
    this.getWebSiteFriendlyLink();
    this.getAllArticleCategory();
  },
  async mounted() { },
  watch: {
    $route(to, from) {
      if (to.path == '/about') {
        this.getAboutMeAndMyWeb();
      }
    }
  },
  computed: {
    hotArticleList() {
      return this.$store.getters.hotArticleList;
    }
  },
  methods: {
    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } }, onComplete => { }, onAbort => { });
      this.searchQuery = "";
    },
    getAboutMeAndMyWeb() {
      //let params = { id: 1 };
      var params = 1;
      getAboutMyGpWeb(1)
        .then((response) => {
          //console.log(response)
          this.aboutMeData = response.data;
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getWebSiteFriendlyLink() {
      displayFriendlyLink().then((res) => {
        this.webSiteLink = res.data;
      })
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

/* .user-details {} */

.user-name {
  margin: 0;
  font-size: 1.5em;
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
}

.article-container {
  background-color: var(--background-1, #303133);
  border-radius: 4px;
  padding: 6px;
  margin-bottom: 15px;
}

.article-header h1 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.article-meta {
  font-size: 0.9em;
  color: #999;
  margin-bottom: 20px;
}

.article-meta span {
  margin-right: 10px;
}

.article-content {
  line-height: 1.4;
  font-size: 1em;
}
</style>
