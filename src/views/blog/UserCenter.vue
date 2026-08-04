<template>
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container user-center">
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
          <router-link class="gp-btn" to="/user/comments">留言管理</router-link>
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

      <!-- 内容互动：留言管理主入口 -->
      <section class="uc-quick gp-surface-card" v-if="username">
        <div class="gp-surface-card__header">
          <span class="category-title">我的互动</span>
        </div>
        <div class="gp-surface-card__body uc-interact">
          <router-link class="uc-interact__card" to="/user/comments">
            <i class="el-icon-chat-dot-round"></i>
            <div>
              <strong>留言管理</strong>
              <p>查看自己的网站留言与文章评论{{ isAdmin ? '（管理员可看全站）' : '' }}</p>
            </div>
          </router-link>
          <router-link class="uc-interact__card" to="/user/comments?tab=article">
            <i class="el-icon-document"></i>
            <div>
              <strong>文章评论</strong>
              <p>按文章维度浏览评论，一键跳转定位</p>
            </div>
          </router-link>
          <router-link class="uc-interact__card" to="/leave-word">
            <i class="el-icon-edit-outline"></i>
            <div>
              <strong>去留言板</strong>
              <p>公开留言区，写下想说的话</p>
            </div>
          </router-link>
        </div>
      </section>

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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isBlogSiteAdmin } from '@/utils/blogAdmin'

export default {
  name: 'UserCenter',
  data() {
    return {
      defaultAvatar: require('@/assets/mai.png')
    }
  },
  computed: {
    ...mapGetters(['username', 'nickname', 'avatar', 'userId']),
    isAdmin() {
      return isBlogSiteAdmin()
    }
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
.gp-blog-page__hero {
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-color);
}

h1 {
  margin: 0 0 8px;
  font-size: 1.6rem;
  color: var(--text-color-2);
}

.lead {
  margin: 0;
  color: var(--text-color);
  font-size: 14px;
}

.uc-card {
  margin-bottom: 14px;
}

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

  h2 {
    margin: 0 0 6px;
    font-size: 1.25rem;
  }

  p {
    margin: 0 0 4px;
    font-size: 13px;
    color: var(--muted-1-color);
  }
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
    color: var(--text-color);
    text-decoration: none;
    text-align: center;

    &:hover {
      color: var(--theme-color);
    }
  }
}

.uc-interact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.uc-interact__card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 12px;
  background: var(--background-2);
  color: inherit;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  i {
    font-size: 22px;
    color: var(--theme-color);
    margin-top: 2px;
  }

  strong {
    display: block;
    margin-bottom: 4px;
    font-size: 15px;
    color: var(--text-color-2);
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.45;
    color: var(--muted-1-color);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);

    strong {
      color: var(--theme-color);
    }
  }
}
</style>
