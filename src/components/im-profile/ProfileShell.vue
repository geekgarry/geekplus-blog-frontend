<template>
  <!--
    可移植个人中心壳：微信/QQ 风格
    - 顶部资料卡 → 点击进入编辑
    - 下方分组菜单列表（由 menus 注入，产品可替换）
    - 移动端单栏；桌面端左资料 + 右菜单（或居中卡片流）
  -->
  <div class="im-profile" :class="{ 'is-mobile': isMobile, 'is-desktop': !isMobile }">
    <header v-if="showNav" class="im-profile__nav">
      <button type="button" class="im-profile__back" aria-label="返回" @click="$emit('back')">
        <i class="el-icon-arrow-left"></i>
      </button>
      <h1>{{ title }}</h1>
      <span class="im-profile__nav-spacer"></span>
    </header>

    <div class="im-profile__layout">
      <aside class="im-profile__aside">
        <button
          type="button"
          class="im-profile__hero"
          :disabled="!loggedIn"
          @click="onHeroClick"
        >
          <img
            class="im-profile__avatar"
            :src="avatarUrl"
            alt=""
            @error="onAvatarErr"
          />
          <div class="im-profile__hero-text">
            <template v-if="loggedIn">
              <strong>{{ displayName }}</strong>
              <span v-if="username">账号 {{ username }}</span>
              <!-- <span v-if="userId">ID {{ userId }}</span> -->
            </template>
            <template v-else>
              <strong>点击登录</strong>
              <span>登录后同步昵称与资料</span>
            </template>
          </div>
          <i class="el-icon-arrow-right im-profile__chevron"></i>
        </button>
        <p v-if="loggedIn" class="im-profile__hint">点击上方资料可编辑头像与个人信息</p>
      </aside>

      <div class="im-profile__main">
        <template v-if="loggedIn">
          <section
            v-for="(group, gi) in visibleMenus"
            :key="group.title || gi"
            class="im-profile__group"
          >
            <h2 v-if="group.title" class="im-profile__group-title">{{ group.title }}</h2>
            <div class="im-profile__cells">
              <component
                :is="cellTag(item)"
                v-for="item in group.items"
                :key="item.key"
                class="im-profile__cell"
                v-bind="cellBind(item)"
                @click.native="onCellClick(item, $event)"
              >
                <i v-if="item.icon" :class="item.icon" class="im-profile__cell-icon"></i>
                <div class="im-profile__cell-body">
                  <strong>{{ item.label }}</strong>
                  <p v-if="item.desc">{{ item.desc }}</p>
                </div>
                <i class="el-icon-arrow-right im-profile__cell-arrow"></i>
              </component>
            </div>
          </section>
        </template>

        <section v-else class="im-profile__group">
          <div class="im-profile__cells">
            <router-link class="im-profile__cell" :to="loginTo">
              <i class="el-icon-user im-profile__cell-icon"></i>
              <div class="im-profile__cell-body">
                <strong>登录 / 注册</strong>
                <p>登录后使用个人中心与即时沟通</p>
              </div>
              <i class="el-icon-arrow-right im-profile__cell-arrow"></i>
            </router-link>
            <router-link class="im-profile__cell" to="/about">
              <i class="el-icon-info im-profile__cell-icon"></i>
              <div class="im-profile__cell-body">
                <strong>了解本站</strong>
              </div>
              <i class="el-icon-arrow-right im-profile__cell-arrow"></i>
            </router-link>
          </div>
        </section>

        <div class="im-profile__footer" v-if="loggedIn">
          <slot name="footer">
            <button type="button" class="im-profile__logout" @click="$emit('logout')">退出登录</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveAvatarUrl, DEFAULT_AVATAR } from '@/components/RealtimeChat/avatar'

const MQ = '(max-width: 720px)'

export default {
  name: 'ImProfileShell',
  props: {
    title: { type: String, default: '个人中心' },
    showNav: { type: Boolean, default: false },
    loggedIn: { type: Boolean, default: false },
    nickname: { type: String, default: '' },
    username: { type: String, default: '' },
    userId: { type: [String, Number], default: '' },
    avatar: { type: String, default: '' },
    /** [{ title, items: [{ key, label, desc, icon, to, href, external }] }] */
    menus: { type: Array, default: () => [] },
    editTo: { type: String, default: '/user/center/edit' },
    loginTo: { type: String, default: '/user' }
  },
  data() {
    return {
      isMobile: false,
      broken: false,
      mq: null
    }
  },
  computed: {
    displayName() {
      return this.nickname || this.username || '用户'
    },
    avatarUrl() {
      if (this.broken || !this.avatar) return DEFAULT_AVATAR
      return resolveAvatarUrl(this.avatar)
    },
    visibleMenus() {
      return (this.menus || []).filter((g) => g && g.items && g.items.length)
    }
  },
  mounted() {
    this.mq = window.matchMedia(MQ)
    this.isMobile = this.mq.matches
    this.onMq = () => { this.isMobile = this.mq.matches }
    if (this.mq.addEventListener) this.mq.addEventListener('change', this.onMq)
    else this.mq.addListener(this.onMq)
  },
  beforeDestroy() {
    if (!this.mq) return
    if (this.mq.removeEventListener) this.mq.removeEventListener('change', this.onMq)
    else this.mq.removeListener(this.onMq)
  },
  methods: {
    onAvatarErr() {
      this.broken = true
    },
    onHeroClick() {
      if (!this.loggedIn) {
        this.$router.push(this.loginTo).catch(() => {})
        return
      }
      this.$emit('edit')
      if (this.editTo) this.$router.push(this.editTo).catch(() => {})
    },
    cellTag(item) {
      if (item.href || item.external) return 'a'
      if (item.to) return 'router-link'
      return 'button'
    },
    cellBind(item) {
      if (item.href || item.external) {
        return {
          href: item.href || item.to,
          target: item.external ? '_blank' : undefined,
          rel: item.external ? 'noopener' : undefined
        }
      }
      if (item.to) return { to: item.to }
      return { type: 'button' }
    },
    onCellClick(item, e) {
      if (!item.to && !item.href) {
        e && e.preventDefault && e.preventDefault()
        this.$emit('action', item)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.im-profile {
  --ip-bg: var(--background-1, #f3f5f6);
  --ip-card: var(--gp-surface-bg, #fff);
  --ip-border: var(--gp-surface-border, #e7ecee);
  --ip-text: var(--text-color-2, #344449);
  --ip-muted: var(--muted-1-color, #8a9699);
  --ip-theme: var(--theme-color, #5f7d80);
  min-height: 100%;
  background: var(--ip-bg);
  color: var(--ip-text);
}
.im-profile__nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--ip-card);
  border-bottom: 1px solid var(--ip-border);
  position: sticky;
  top: 0;
  z-index: 5;
}
.im-profile__nav h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.im-profile__back {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  padding: 4px;
}
.im-profile__nav-spacer { margin-left: auto; width: 28px; }

.im-profile__layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 12px;
}
.im-profile__hero {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: var(--ip-card);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
  cursor: pointer;
  text-align: left;
  color: inherit;
}
.im-profile__hero:disabled {
  cursor: pointer;
  opacity: 1;
}
.im-profile__avatar {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--background-2, #edf1f2);
  flex-shrink: 0;
}
.im-profile__hero-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.im-profile__hero-text strong {
  font-size: 18px;
  font-weight: 650;
}
.im-profile__hero-text span {
  font-size: 12px;
  color: var(--ip-muted);
}
.im-profile__chevron {
  color: var(--ip-muted);
  font-size: 16px;
}
.im-profile__hint {
  margin: 8px 4px 0;
  font-size: 12px;
  color: var(--ip-muted);
}

.im-profile__group {
  margin-top: 14px;
}
.im-profile__group-title {
  margin: 0 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ip-muted);
  letter-spacing: 0.04em;
}
.im-profile__cells {
  border-radius: 14px;
  overflow: hidden;
  background: var(--ip-card);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
}
.im-profile__cell {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 14px;
  border: none;
  border-bottom: 1px solid var(--ip-border);
  background: transparent;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
}
.im-profile__cell:last-child { border-bottom: none; }
.im-profile__cell:hover {
  background: rgba(0, 0, 0, 0.03);
}
.im-profile__cell-icon {
  font-size: 20px;
  color: var(--ip-theme);
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}
.im-profile__cell-body {
  flex: 1;
  min-width: 0;
}
.im-profile__cell-body strong {
  display: block;
  font-size: 15px;
  font-weight: 600;
}
.im-profile__cell-body p {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--ip-muted);
  line-height: 1.4;
}
.im-profile__cell-arrow {
  color: var(--ip-muted);
  font-size: 14px;
  flex-shrink: 0;
}

.im-profile__footer {
  margin: 20px 0 28px;
}
.im-profile__logout {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  background: var(--ip-card);
  color: #c45656;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.im-profile__logout:hover {
  background: rgba(196, 86, 86, 0.08);
}

/* 桌面：左资料卡 + 右菜单 */
.im-profile.is-desktop .im-profile__layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 18px;
  align-items: start;
  padding: 24px 20px 40px;
}
.im-profile.is-desktop .im-profile__aside {
  position: sticky;
  top: 16px;
}
.im-profile.is-desktop .im-profile__hero {
  flex-direction: column;
  align-items: flex-start;
  padding: 22px;
}
.im-profile.is-desktop .im-profile__avatar {
  width: 88px;
  height: 88px;
  border-radius: 16px;
}
.im-profile.is-desktop .im-profile__chevron {
  position: absolute;
  right: 18px;
  top: 18px;
}
.im-profile.is-desktop .im-profile__hero {
  position: relative;
}
.im-profile.is-desktop .im-profile__group-title {
  font-size: 13px;
}
.im-profile.is-desktop .im-profile__cells {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.im-profile.is-desktop .im-profile__cell {
  border-right: 1px solid var(--ip-border);
}
.im-profile.is-desktop .im-profile__cell:nth-child(2n) {
  border-right: none;
}
.im-profile.is-desktop .im-profile__logout {
  max-width: 280px;
}

@media (max-width: 720px) {
  .im-profile__layout { padding: 10px 10px 24px; }
  .im-profile__avatar { width: 56px; height: 56px; }
  .im-profile__hero-text strong { font-size: 17px; }
}
</style>
