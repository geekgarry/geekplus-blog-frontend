<template>
  <div class="gp-page container-fluid gp-workbench-page">
    <div class="gp-page__inner container">
      <div class="gp-page__main">
        <!-- 前台应用工作台：非默认首页，由个人中心或 workbench 布局模式进入 -->
        <workbench-home scope="blog" :show-classic-home-link="true" />
      </div>
    </div>
  </div>
</template>

<script>
import WorkbenchHome from '@/components/WorkbenchHome/index'

export default {
  name: 'WorkbenchView',
  components: { WorkbenchHome }
}
</script>

<style lang="scss" scoped>
/* 与博客其它 gp-page 一致，使用 gp-page-wash 深浅色背景 */
.gp-workbench-page {
  background: var(--gp-page-wash, var(--background-color));
  min-height: 60vh;
}
</style>
