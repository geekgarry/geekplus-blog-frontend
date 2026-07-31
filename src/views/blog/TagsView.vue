<template>
  <div class="gp-blog-page">
    <header class="gp-blog-page__hero">
      <p class="eyebrow">Tags</p>
      <h1>热门标签</h1>
      <p class="lead">点击标签进入搜索结果。</p>
    </header>
    <div class="tag-cloud gp-surface-card">
      <div class="gp-surface-card__body">
        <button
          v-for="(tag, i) in tags"
          :key="i"
          type="button"
          class="tag-chip"
          :style="{ fontSize: sizeOf(tag) + 'px' }"
          @click="goTag(tag)"
        >#{{ tag.tagName || tag.name }}
          <small v-if="tag.count != null">({{ tag.count }})</small>
        </button>
        <p v-if="!loading && !tags.length" class="empty">暂无标签</p>
        <p v-if="loading" class="empty">加载中…</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getTagArticleCount } from '@/api/geekplus/geekplus'

export default {
  name: 'TagsView',
  data() {
    return { tags: [], loading: true }
  },
  created() {
    getTagArticleCount().then((res) => {
      this.tags = res.data || res.rows || []
      this.loading = false
    }).catch(() => { this.loading = false })
  },
  methods: {
    sizeOf(tag) {
      const c = Number(tag.count || tag.articleCount || 1)
      return Math.min(22, Math.max(13, 12 + Math.log2(c + 1) * 2))
    },
    goTag(tag) {
      const name = tag.tagName || tag.name
      this.$router.push({ path: '/search', query: { tagName: name } })
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-blog-page__hero { margin-bottom: 20px; }
.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-color);
}
h1 { margin: 0 0 8px; font-size: 1.6rem; color: var(--text-color-2); }
.lead { margin: 0; color: var(--text-color); font-size: 14px; }
.tag-chip {
  border: none;
  background: var(--background-2, #f7f4f0);
  color: var(--text-color);
  border-radius: 999px;
  padding: 6px 12px;
  margin: 0 8px 10px 0;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  &:hover {
    background: var(--theme-color-muted);
    color: var(--theme-color);
  }
  small { opacity: 0.7; margin-left: 2px; }
}
.empty { color: var(--muted-1-color); }
</style>
