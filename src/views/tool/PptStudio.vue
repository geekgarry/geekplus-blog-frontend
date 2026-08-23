<template>
  <div class="gp-page container gp-tool-page ppt-page">
    <div class="gp-tool-page-wash">
      <header class="gp-tool-page__hd no-print">
        <div>
          <h1 class="gp-tool-page__title">PPT 工作室</h1>
          <p class="gp-tool-page__sub">独立演示文稿工具：手输 / 上传文档 / 简历素材 · 主题动画 · 大纲脑图 · 激光笔</p>
        </div>
        <div class="ppt-page__links">
          <router-link class="gp-tool-link" to="/tool/resumeGenerator">简历生成</router-link>
        </div>
      </header>
      <PptStudio />
    </div>
  </div>
</template>

<script>
import '@/plugins/element-admin'
import PptStudio from '@/components/ppt/PptStudio.vue'

export default {
  name: 'PptStudioPage',
  components: { PptStudio },
}
</script>
