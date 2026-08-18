<template>
  <div class="gp-page container-fluid upe-page">
    <div class="upe-page__bar">
      <button type="button" class="upe-page__back" aria-label="返回" @click="goBack">
        <i class="el-icon-arrow-left"></i>
      </button>
      <h1>编辑资料</h1>
    </div>
    <div class="gp-page__inner container upe-page__body">
      <im-profile-edit-form @saved="onSaved" @cancel="goBack" />
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { ProfileEditForm } from '@/components/im-profile'

export default {
  name: 'UserProfileEdit',
  components: { ImProfileEditForm: ProfileEditForm },
  created() {
    if (!getToken()) {
      this.$message && this.$message.warning('请先登录')
      this.$router.replace({ path: '/user', query: { redirect: '/user/center/edit', method: 'login' } }).catch(() => {})
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) this.$router.back()
      else this.$router.push('/user/center').catch(() => {})
    },
    onSaved() {
      this.$router.replace('/user/center').catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.upe-page {
  min-height: 60vh;
  background: var(--background-1, #f3f5f6);
}
.upe-page__bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--gp-surface-bg, #fff);
  border-bottom: 1px solid var(--gp-surface-border, #e7ecee);
  position: sticky;
  top: 0;
  z-index: 5;
}
.upe-page__bar h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-2, #344449);
}
.upe-page__back {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  padding: 4px;
}
.upe-page__body {
  max-width: 640px;
  padding-top: 12px;
  padding-bottom: 32px;
}
@media (max-width: 720px) {
  .upe-page__body.container {
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
