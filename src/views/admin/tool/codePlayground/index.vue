<template>
  <!-- 系统工具：在线代码演练场（HTML / Vue / React） -->
  <div class="app-container admin-code-playground">
    <el-alert
      class="admin-cp-tip"
      type="info"
      :closable="false"
      show-icon
      title="代码演练场"
      description="下拉选择类型；左侧编辑、右侧预览（HTML/JS/CSS/Vue2/Vue3/React/TS/Markdown/JSON）。"
    />
    <code-playground default-mode="html" />
  </div>
</template>

<script>
import '@/plugins/element-admin'
import CodePlayground from '@/components/CodePlayground'

export default {
  // 与 local-routes name / tagsView.cachedViews 一致，才能被 keep-alive 缓存
  name: 'AdminCodePlayground',
  components: { CodePlayground },
}
</script>

<style scoped>
.admin-cp-tip {
  margin-bottom: 12px;
}
.admin-code-playground {
  min-height: calc(100vh - 120px);
}
</style>
