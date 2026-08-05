<template>
  <!-- 前台顶栏用户菜单：自研下拉，去掉 el-dropdown / el-avatar 依赖 -->
  <div class="gp-user-menu" v-click-outside="close" @keydown.esc="close">
    <button type="button" class="gp-user-menu__trigger" :aria-expanded="open ? 'true' : 'false'" @click.stop="toggle">
      <img
        class="gp-user-menu__avatar"
        :src="avatarSrc"
        alt="user"
        width="32"
        height="32"
      />
    </button>
    <div v-if="open" class="gp-user-menu__panel" :style="panelStyle" @click.stop>
      <template v-if="loggedIn">
        <!-- <button type="button" class="gp-user-menu__item" @click="go('/admin')">
          <i class="el-icon-house" aria-hidden="true"></i>
          <span>管理中心</span>
        </button> -->
        <button type="button" class="gp-user-menu__item" @click="go('/user/center')">
          <i class="el-icon-user" aria-hidden="true"></i>
          <span>个人中心</span>
        </button>
        <button type="button" class="gp-user-menu__item" @click="go('/write')">
          <i class="el-icon-edit" aria-hidden="true"></i>
          <span>写文章</span>
        </button>
        <button type="button" class="gp-user-menu__item" @click="onLogout">
          <i class="el-icon-switch-button" aria-hidden="true"></i>
          <span>退出登录</span>
        </button>
      </template>
      <button v-else type="button" class="gp-user-menu__item" @click="onLogin">
        <i class="fa fa-sign-in" aria-hidden="true"></i>
        <span>登录</span>
      </button>
    </div>
  </div>
</template>

<script>
const placeholder = require('@/assets/images/user-placeholder.png')

export default {
  name: 'BlogUserMenu',
  props: {
    username: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      open: false,
      panelStyle: {}
    }
  },
  computed: {
    loggedIn() {
      return !this.$common.isEmpty(this.username)
    },
    avatarSrc() {
      return this.loggedIn && this.avatar ? this.avatar : placeholder
    }
  },
  directives: {
    /** 点击外部关闭；避免再依赖 Element 的 clickoutside */
    clickOutside: {
      bind(el, binding) {
        el.__gpClickOutside__ = (e) => {
          if (!el.contains(e.target)) binding.value(e)
        }
        document.addEventListener('click', el.__gpClickOutside__)
      },
      unbind(el) {
        document.removeEventListener('click', el.__gpClickOutside__)
        delete el.__gpClickOutside__
      }
    }
  },
  methods: {
    toggle(e) {
      if (this.open) {
        this.close()
        return
      }
      this.open = true
      const trigger = (e && e.currentTarget) || this.$el.querySelector('.gp-user-menu__trigger')
      this.$nextTick(() => this.placePanel(trigger))
    },
    placePanel(trigger) {
      if (!trigger || !trigger.getBoundingClientRect) return
      const rect = trigger.getBoundingClientRect()
      this.panelStyle = {
        top: Math.round(rect.bottom + 8) + 'px',
        left: 'auto',
        right: Math.max(8, Math.round(window.innerWidth - rect.right)) + 'px'
      }
    },
    close() {
      this.open = false
      this.panelStyle = {}
    },
    go(path) {
      this.close()
      this.$emit('navigate', path)
      if (this.$route.path !== path) {
        this.$router.push(path, () => {}, () => {})
      }
    },
    onLogin() {
      this.close()
      this.$emit('login')
    },
    onLogout() {
      this.close()
      this.$emit('logout')
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-user-menu {
  position: relative;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.gp-user-menu__trigger {
  display: inline-flex;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
}

.gp-user-menu__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  box-shadow: 0 0 0 1px var(--gp-surface-border, rgba(15, 23, 42, 0.06));
}

.gp-user-menu__panel {
  position: fixed;
  top: 0;
  left: 0;
  min-width: 148px;
  padding: 8px;
  z-index: 3100;
  background: var(--gp-surface-bg, var(--background, #fafafa));
  border: 1px solid var(--gp-surface-border, rgba(15, 23, 42, 0.05));
  border-radius: var(--gp-surface-radius-sm, 10px);
  box-shadow: var(--gp-surface-shadow-hover, 0 6px 18px rgba(15, 23, 42, 0.06));
}

.gp-user-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0 0 4px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-color-2);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.gp-user-menu__item:last-child {
  margin-bottom: 0;
}

.gp-user-menu__item:hover {
  background: var(--gp-menu-active-bg, rgba(11, 173, 182, 0.1));
  color: var(--theme-color, #0badb6);
}

.gp-user-menu__item i {
  font-size: 14px;
  width: 1em;
  text-align: center;
}
</style>
