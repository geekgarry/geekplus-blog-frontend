<template>
  <div class="topbar-logo-container" :class="{'collapse':collapse}">
    <transition name="topbarLogoFade">
      <router-link v-if="collapse" key="collapse" class="topbar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="topbar-logo">
        <h1 v-else class="topbar-title">{{ title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="topbar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="topbar-logo">
        <h1 class="topbar-title">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
import logo from "@/assets/images/logo/geekplus.png"
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    },
    logo: {
      type: String,
      default: () => {
        return logo;
      }
    },
    title: {
      type: String,
      default: () => {
        return 'GeekPlusAdmin';
      }
    }
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.topbarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.topbarLogoFade-enter,
.topbarLogoFade-leave-to {
  opacity: 0;
}

.topbar-logo-container {
  position: relative;
  width: 200px;
  height: 50px;
  line-height: 50px;
  background: #f0f0f0;
  text-align: center;
  overflow: hidden;

  & .topbar-logo-link {
    height: 100%;
    width: 100%;

    & .topbar-logo {
      width: auto;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .topbar-title {
      display: inline-block;
      margin: 0;
      color: #252525;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .topbar-logo {
      margin-right: 0px;
    }
  }
}
</style>
