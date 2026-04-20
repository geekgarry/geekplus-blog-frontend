<template>
  <div class="bread">
    <!-- <slot /> -->
    <item v-for="(item, index) in breadCrumbList" :key="index" :to="index + 1 == breadCrumbList.length ? '' : item.path">{{
      item.meta.title }}</item>
  </div>
</template>

<script>
import Item from './Item'

export default {
  name: "PostBreadcrumb",
  components: {
    Item
  },
  props: {
    breadCrumbList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
    }
  },
  created() {
  },
  watch: {
  },
  methods: {
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
