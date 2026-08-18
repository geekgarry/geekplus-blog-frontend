<template>
  <div class="gp-page container-fluid uc-page">
    <div class="gp-page__inner container uc-page__inner">
      <im-profile-shell
        :logged-in="!!username"
        :nickname="nickname"
        :username="username"
        :user-id="userId"
        :avatar="avatar"
        :menus="menus"
        edit-to="/user/center/edit"
        login-to="/user"
        @logout="logout"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isBlogSiteAdmin } from '@/utils/blogAdmin'
import { ProfileShell, blogProfileMenus } from '@/components/im-profile'

export default {
  name: 'UserCenter',
  components: { ImProfileShell: ProfileShell },
  computed: {
    ...mapGetters(['username', 'nickname', 'avatar', 'userId']),
    menus() {
      return blogProfileMenus({ isAdmin: isBlogSiteAdmin() })
    }
  },
  methods: {
    async logout() {
      try {
        await this.$store.dispatch('user/logout')
      } catch (e) { /* ignore */ }
      this.$router.push('/user').catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.uc-page {
  min-height: 60vh;
  background: transparent;
}
.uc-page__inner {
  max-width: 1000px;
  padding-left: 0;
  padding-right: 0;
}
@media (max-width: 720px) {
  .uc-page__inner.container {
    width: 100%;
    max-width: 100%;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
