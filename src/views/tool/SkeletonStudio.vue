<template>
  <div class="gp-page container gp-tool-page">
    <div class="gp-tool-page-wash">
      <header class="gp-tool-page__hd no-print">
        <div>
          <h1 class="gp-tool-page__title">骨架屏工作室</h1>
          <p class="gp-tool-page__sub">
            占位 Schema 拖拽（非表单构建）· 结构与预览并排 · 导出 HTML/CSS/Vue
          </p>
        </div>
        <div>
          <router-link class="gp-tool-link" to="/tool/pptStudio">PPT 工作室</router-link>
        </div>
      </header>
      <SkeletonStudio />
    </div>
  </div>
</template>

<script>
import '@/plugins/element-admin'
import SkeletonStudio from '@/components/skeleton/SkeletonStudio.vue'

export default {
  name: 'SkeletonStudioPage',
  components: { SkeletonStudio },
}
</script>
