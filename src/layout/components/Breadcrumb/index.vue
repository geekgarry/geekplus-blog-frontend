<template>
  <div class="bread">
    <!-- <slot /> -->
    <item v-for="(item, index) in levelList" :key="index" :to="index + 1 == levelList.length ? '' : item.path">{{
      item.meta.title }}</item>
  </div>
</template>

<script>
import Item from './Item'

export default {
  name: "PlusBreadcrumb",
  components: {
    Item
  },
  data() {
    return {
      levelList: null
    }
  },
  created() {
    this.getBreadcrumb();
  },
  watch: {
    $route(to, from) {
      this.getBreadcrumb();
    }
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]
      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    }
  }
};
</script>

<style scoped lang='scss'>
.bread {
  display: flex;
  font-size: 13px;

  :deep(&-item) {
    a {
      color: #666;
      transition: all 0.4s;

      &:hover {
        color: #27ba9b;
      }
    }
  }

  :deep(i) {
    font-size: 12px;
    margin-left: 5px;
    margin-right: 5px;
    line-height: 22px;
  }
}
</style>
