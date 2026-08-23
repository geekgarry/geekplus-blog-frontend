<template>
  <!-- 后台系统工具入口：复用前台骨架工作室组件，样式走 admin Layout -->
  <div class="app-container admin-skeleton-tool">
    <el-alert
      class="admin-skeleton-tip"
      type="info"
      :closable="false"
      show-icon
      title="骨架屏 Schema 工作室"
      description="加载态占位 Schema（与表单构建不同模型）；左侧组件库 · 中间结构/预览并排 · 右侧属性。"
    />
    <SkeletonStudio />
  </div>
</template>

<script>
import '@/plugins/element-admin'
import SkeletonStudio from '@/components/skeleton/SkeletonStudio.vue'

export default {
  name: 'AdminSkeletonStudio',
  components: { SkeletonStudio },
}
</script>

<style scoped>
.admin-skeleton-tip {
  margin-bottom: 12px;
}
.admin-skeleton-tool {
  /* 后台内略压缩工具页洗底，避免与 app-container 双重留白过高 */
  min-height: calc(100vh - 120px);
}
</style>
