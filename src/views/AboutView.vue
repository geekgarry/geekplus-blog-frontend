<template>
  <div class="gp-page about-page">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <div class="gp-row">
          <div class="gp-col-24 gp-col-xl-7 gp-col-lg-7 gp-col-md-7 gp-col-sm-24 gp-col-xs-24">
            <div class="blog-side-container">
              <div class="gp-surface-card profile-card">
                <div class="gp-surface-card__body">
                  <div class="user-info">
                    <img :src="userAvatar" alt="User Avatar" class="user-avatar">
                    <div class="user-details">
                      <h2 class="user-name">{{ userName }}</h2>
                      <p class="user-description">{{ userDescription }}</p>
                      <div class="user-stats">
                        <span class="stat">分类 {{ categoryCount }}</span>
                        <span class="stat">留言 {{ commentCount }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="gp-surface-card box-card hidden-xs-only">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title">搜索</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="gp-input-group">
                    <input class="gp-input" placeholder="搜索文章" v-model="searchQuery" @keyup.enter="searchArticles">
                    <button type="button" class="gp-btn gp-btn--append" @click="searchArticles">搜</button>
                  </div>
                </div>
              </div>

              <div class="gp-surface-card box-card hidden-xs-only" :class="{ 'skeleton-loading': loading }">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title">分类云</span>
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

              <div class="gp-surface-card box-card hidden-xs-only">
                <div class="gp-surface-card__body">
                  <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="5487504434" />
                </div>
              </div>

              <div class="gp-surface-card box-card" :class="{ 'skeleton-loading': loading }">
                <div class="gp-surface-card__header">
                  <div class="category-section">
                    <span class="category-title">网站链接</span>
                  </div>
                </div>
                <div class="gp-surface-card__body">
                  <div class="website_link-container">
                    <span class="website_link-content" v-for="(item, index) in webSiteLink" :key="index">
                      <a :title="item.linkIntro" :href="item.linkUrl" target="_blank" rel="noopener">{{ item.linkName }}</a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="gp-col-24 gp-col-xl-17 gp-col-lg-17 gp-col-md-17 gp-col-sm-24 gp-col-xs-24">
            <div class="about-main" :class="{ 'skeleton-loading': loading }">
              <header class="about-hero">
                <p class="about-hero__eyebrow">About</p>
                <h1 class="about-hero__title">
                  {{ aboutMeData.gpTitle || '关于极客普拉斯' }}
                </h1>
                <p class="about-hero__lead">
                  技术分享 · 生活记录 · 随笔杂谈。低饱和配色，希望你在这里读得久一点、累得少一点。
                </p>
                <div class="about-hero__meta">
                  <span>{{ aboutMeData.gpName || 'geekplus' }}</span>
                  <span>{{ aboutMeData.createTime || '2019-12-12' }}</span>
                </div>
              </header>

              <article class="about-article">
                <div class="article-content" v-if="aboutMeData.gpContent" v-html="aboutMeData.gpContent"></div>
                <div class="article-content" v-else>
                  <p>欢迎来到梦极客园。</p>
                  <div class="about-quote">
                    <p>做任何事情一定要坚持下去，总会让你看到，失败的那一天。—— 半开玩笑，半认真。</p>
                  </div>
                  <p>我坚信技术改变世界，创新引领生活。本站记录技术分享、生活随笔与科技杂谈。</p>
                  <div class="about-quote about-quote--soft">
                    <p>
                      软件设计要权衡利弊，代码很难十全十美；人生亦然。厚此薄彼不必苛责，选优即可。
                    </p>
                  </div>
                </div>

                <section class="about-blocks">
                  <div class="about-block" v-for="item in highlightBlocks" :key="item.title">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.text }}</p>
                  </div>
                </section>

                <section class="about-contact">
                  <h3>联系与交流</h3>
                  <p>有想法、纠错或合作，欢迎留言或邮件沟通。QQ：1789615426</p>
                  <div class="about-contact__actions">
                    <router-link class="gp-btn gp-btn--primary" to="/leave-word">去留言</router-link>
                    <router-link class="gp-btn" to="/">回首页</router-link>
                  </div>
                </section>

                <MorandiMemory />
              </article>

              <div class="about-ads">
                <Adsense data-ad-client="ca-pub-7291512442295477" data-ad-slot="6482220433" />
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
import MorandiMemory from '@/components/about/MorandiMemory.vue'
import lazyLoadDirectives from '@/mixins/lazyLoadDirectives'
import { getAboutMyGpWeb, displayFriendlyLink } from '@/api/geekplus/geekplus'

export default {
  name: 'AboutView',
  mixins: [lazyLoadDirectives],
  components: {
    PlusFooter,
    MorandiMemory
  },
  data() {
    return {
      loading: true,
      userAvatar: require('@/assets/mai.png'),
      userName: '麦壳儿',
      userDescription: '青衫烟雨间，挽风踏清歌',
      categoryCount: 14,
      commentCount: 5,
      allCategoryList: [],
      searchQuery: '',
      aboutMeData: {},
      webSiteLink: [],
      highlightBlocks: [
        { title: '写什么', text: '工程实践、工具折腾、偶尔一点生活与读书笔记。' },
        { title: '怎么读', text: '页面用雾霾青绿与暖灰纸感，减少高对比刺激，适合长时间浏览。' },
        { title: '玩一会', text: '下方有个轻量色块记忆游戏，累了可以翻几张卡片放松。' }
      ]
    }
  },
  async created() {
    this.getAboutMeAndMyWeb()
    this.getWebSiteFriendlyLink()
    this.getAllArticleCategory()
  },
  watch: {
    $route(to) {
      if (to.path === '/about') {
        this.getAboutMeAndMyWeb()
      }
    }
  },
  methods: {
    searchArticles() {
      this.$router.push({ path: '/search', query: { keyWords: this.searchQuery } }, () => {}, () => {})
      this.searchQuery = ''
    },
    getAboutMeAndMyWeb() {
      getAboutMyGpWeb(1)
        .then((response) => {
          this.aboutMeData = response.data || {}
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    getWebSiteFriendlyLink() {
      displayFriendlyLink().then((res) => {
        this.webSiteLink = res.data || []
      })
    },
    getAllArticleCategory() {
      this.allCategoryList = this.getListSubCategory(this.$store.getters.addMenuRoutes)
    },
    getListSubCategory(list) {
      const listCategory = []
      ;(list || []).forEach((parent) => {
        ;(parent.children || []).forEach((child) => {
          listCategory.push({
            path: parent.path + '/' + child.path,
            pathName: child.path,
            categoryName: child.categoryName
          })
        })
      })
      return listCategory
    }
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
}

.user-name {
  margin: 0;
  font-size: 1.35em;
  color: var(--text-color-2);
}

.user-description {
  margin: 6px 0;
  color: var(--muted-1-color, #8a8580);
  font-size: 13px;
}

.user-stats {
  display: flex;
  gap: 14px;
  font-size: 13px;
  color: var(--text-color, #5c5854);
}

.about-main {
  background: var(--gp-surface-bg, var(--background, #fafafa));
  border-radius: var(--gp-surface-radius, 14px);
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
  box-shadow: var(--gp-surface-shadow);
  padding: 8px 8px 20px;
  margin-bottom: 16px;
  overflow: hidden;
}

.about-hero {
  padding: 28px 22px 20px;
  background:
    radial-gradient(600px 200px at 8% 0%, rgba(154, 175, 177, 0.22), transparent 60%),
    radial-gradient(480px 180px at 100% 20%, rgba(196, 184, 174, 0.2), transparent 55%);
  border-bottom: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
}

.about-hero__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--theme-color, #6e8b8e);
}

.about-hero__title {
  margin: 0 0 10px;
  font-size: clamp(1.5rem, 2.4vw, 1.9rem);
  font-weight: 650;
  letter-spacing: 0.02em;
  color: var(--text-color-2);
  line-height: 1.35;
}

.about-hero__lead {
  margin: 0 0 14px;
  max-width: 42em;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-color, #5c5854);
}

.about-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  font-size: 12px;
  color: var(--muted-1-color, #8a8580);
}

.about-article {
  padding: 18px 22px 8px;
}

.article-content {
  line-height: 1.75;
  font-size: 15px;
  color: var(--articleFontColor, var(--text-color-2));
}

.about-quote {
  margin: 16px 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--theme-color-muted, rgba(110, 139, 142, 0.12));
  border-left: 3px solid var(--theme-color-soft, #9aafb1);
}

.about-quote p {
  margin: 0;
  color: var(--text-color, #5c5854);
  font-size: 14px;
  line-height: 1.65;
}

.about-quote--soft {
  background: rgba(196, 184, 174, 0.18);
  border-left-color: #c4b8ae;
}

.about-blocks {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 28px 0 8px;
}

@media (max-width: 900px) {
  .about-blocks {
    grid-template-columns: 1fr;
  }
}

.about-block {
  padding: 16px;
  border-radius: 12px;
  background: var(--background-2, #f7f4f0);
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.05));
}

.about-block h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--theme-color, #6e8b8e);
}

.about-block p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-color, #5c5854);
}

.about-contact {
  margin-top: 28px;
  padding: 18px 16px;
  border-radius: 12px;
  background: linear-gradient(120deg, rgba(110, 139, 142, 0.08), rgba(196, 184, 174, 0.12));
}

.about-contact h3 {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--text-color-2);
}

.about-contact p {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--text-color);
  line-height: 1.6;
}

.about-contact__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.about-ads {
  padding: 8px 16px 4px;
}

.article-category a {
  margin: 0 5px 5px 0;
  padding: 3px 6px;
}

@media screen and (min-width: 1920px) {
  .about-hero {
    padding: 36px 28px 24px;
  }
  .about-article {
    padding: 22px 28px 12px;
  }
}
</style>
