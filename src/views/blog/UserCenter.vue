<template>
  <div class="gp-blog-page user-center">
    <header class="gp-blog-page__hero">
      <p class="eyebrow">Profile</p>
      <h1>个人中心</h1>
      <p class="lead">前台账户信息与常用入口。管理端资料仍可在后台完善。</p>
    </header>

    <div class="uc-card gp-surface-card" v-if="username">
      <div class="gp-surface-card__body uc-head">
        <img class="avatar" :src="avatar || defaultAvatar" alt="" />
        <div>
          <h2>{{ nickname || username }}</h2>
          <p>账号：{{ username }}</p>
          <p v-if="userId">ID：{{ userId }}</p>
        </div>
      </div>
      <div class="uc-actions">
        <router-link class="gp-btn gp-btn--primary" to="/write">去投稿</router-link>
        <router-link class="gp-btn" to="/leave-word">留言板</router-link>
        <router-link class="gp-btn" to="/file-transfer">文件中转</router-link>
        <router-link class="gp-btn" to="/admin/user/profile">后台资料</router-link>
        <button type="button" class="gp-btn" @click="logout">退出登录</button>
      </div>
    </div>

    <div class="uc-card gp-surface-card" v-else>
      <div class="gp-surface-card__body">
        <p>你还没有登录。登录后可同步昵称、投稿与后台资料。</p>
        <div class="uc-actions">
          <router-link class="gp-btn gp-btn--primary" to="/user">登录 / 注册</router-link>
          <router-link class="gp-btn" to="/about">了解本站</router-link>
        </div>
      </div>
    </div>

    <section class="uc-quick gp-surface-card">
      <div class="gp-surface-card__header">
        <span class="category-title">快捷入口</span>
      </div>
      <div class="gp-surface-card__body uc-grid">
        <router-link to="/categories">分类浏览</router-link>
        <router-link to="/tags">热门标签</router-link>
        <router-link to="/search">搜索文章</router-link>
        <router-link to="/resumeGenerator">简历生成</router-link>
        <a href="/chat" target="_blank" rel="noopener">AI 助手</a>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserCenter',
  data() {
    return {
      defaultAvatar: require('@/assets/mai.png')
    }
  },
  computed: {
    ...mapGetters(['username', 'nickname', 'avatar', 'userId'])
  },
  methods: {
    async logout() {
      try {
        await this.$store.dispatch('user/logout')
      } catch (e) { /* ignore */ }
      this.$router.push('/user')
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-blog-page__hero { margin-bottom: 20px; }
.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-color);
}
h1 { margin: 0 0 8px; font-size: 1.6rem; color: var(--fontColor); }
.lead { margin: 0; color: var(--font-color); font-size: 14px; }
.uc-card { margin-bottom: 14px; }
.uc-head {
  display: flex;
  gap: 16px;
  align-items: center;
  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
  }
  h2 { margin: 0 0 6px; font-size: 1.25rem; }
  p { margin: 0 0 4px; font-size: 13px; color: var(--muted-1-color); }
}
.uc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 16px;
}
.uc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  a {
    padding: 12px;
    border-radius: 10px;
    background: var(--background-2);
    color: var(--font-color);
    text-decoration: none;
    text-align: center;
    &:hover { color: var(--theme-color); }
  }
}
</style>
