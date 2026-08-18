<template>
  <!-- 可移植：IM / 社交顶栏「当前用户」入口 -->
  <button
    type="button"
    class="im-me-badge"
    :class="{ 'is-compact': compact, 'is-empty': !hasUser }"
    :title="hasUser ? displayName : '登录后查看个人中心'"
    @click="onClick"
  >
    <span class="im-me-badge__avatar-wrap">
      <img
        v-if="hasUser && avatarUrl"
        class="im-me-badge__avatar"
        :src="avatarUrl"
        alt=""
        @error="onAvatarErr"
      />
      <span v-else class="im-me-badge__avatar im-me-badge__avatar--blank">
        <i class="el-icon-user"></i>
      </span>
    </span>
    <span v-if="!compact" class="im-me-badge__meta">
      <span class="im-me-badge__name">{{ hasUser ? displayName : '未登录' }}</span>
      <span v-if="hasUser && subtitle" class="im-me-badge__sub">{{ subtitle }}</span>
    </span>
  </button>
</template>

<script>
import { mapGetters } from 'vuex'
import { resolveAvatarUrl, DEFAULT_AVATAR } from '@/components/RealtimeChat/avatar'

export default {
  name: 'ImMeBadge',
  props: {
    /** 紧凑：只显示头像（适合顶栏） */
    compact: { type: Boolean, default: true },
    /** 个人中心路由 */
    profileTo: { type: String, default: '/user/center' },
    /** 未登录跳转 */
    loginTo: { type: String, default: '/user' },
    /** 覆盖点击（不走默认路由） */
    customClick: { type: Boolean, default: false }
  },
  data() {
    return { broken: false }
  },
  computed: {
    ...mapGetters(['username', 'nickname', 'avatar', 'userId', 'token']),
    hasUser() {
      return !!(this.token && (this.username || this.userId))
    },
    displayName() {
      return this.nickname || this.username || '我'
    },
    subtitle() {
      return this.username && this.nickname && this.nickname !== this.username
        ? this.username
        : ''
    },
    avatarUrl() {
      if (this.broken) return DEFAULT_AVATAR
      return resolveAvatarUrl(this.avatar)
    }
  },
  methods: {
    onAvatarErr() {
      this.broken = true
    },
    onClick() {
      if (this.customClick) {
        this.$emit('click')
        return
      }
      if (!this.hasUser) {
        this.$router.push({
          path: this.loginTo,
          query: { redirect: this.profileTo, method: 'login' }
        }).catch(() => {})
        return
      }
      this.$router.push(this.profileTo).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.im-me-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 180px;
  border: none;
  background: transparent;
  padding: 2px 4px;
  margin: 0 0 0 auto;
  cursor: pointer;
  color: inherit;
  border-radius: 10px;
  text-align: left;
}
.im-me-badge:hover {
  background: rgba(0, 0, 0, 0.04);
}
.im-me-badge__avatar-wrap {
  flex-shrink: 0;
}
.im-me-badge__avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  background: var(--background-2, #edf1f2);
}
.im-me-badge__avatar--blank {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-1-color, #999);
  font-size: 18px;
  border: 1px dashed var(--gp-surface-border, #dce3e5);
}
.im-me-badge__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.im-me-badge__name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.im-me-badge__sub {
  font-size: 11px;
  color: var(--muted-1-color, #999);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.im-me-badge.is-compact .im-me-badge__avatar {
  width: 36px;
  height: 36px;
}
@media (min-width: 721px) {
  .im-me-badge:not(.is-compact) {
    padding: 4px 8px 4px 4px;
  }
}
</style>
