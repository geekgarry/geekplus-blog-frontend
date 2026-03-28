<template>
  <div class="bread-item">
    <RouterLink v-if="to!=''" :to="to"><slot /></RouterLink>
    <span v-else><slot /></span>
    <i class="el-icon-arrow-right" v-if="to!=''" style="margin:0 1px;"></i>
    <!-- <font-awesome-icon :icon="['fas', 'chevron-right']" /> -->
  </div>
</template>
<!-- 使用时 -->
<!-- <bread-item to="/xxx/id"></bread-item> -->
<!-- <bread-item :to='{path:"/xxx/id"}'></bread-item> -->
<script>
export default {
  name: "Item",
  props: {
    to: {
      type: [String, Object], //to的值即可以是字符串，也可以是对象
    },
  },
};
</script>
<style scoped>
.bread-item {
  line-height: 22px;
}
.bread-item a{
  color: var(--theme-color,#139F95);
}
.bread-item span{
  color: var(--plus-grey-9,#6d7d86);
}
</style>
