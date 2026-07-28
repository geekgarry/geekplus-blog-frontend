<template>
  <div class="gp-blog-page">
    <header class="gp-blog-page__hero">
      <p class="eyebrow">Categories</p>
      <h1>分类浏览</h1>
      <p class="lead">按栏目浏览文章，结构来自站点栏目配置。</p>
    </header>
    <div class="cat-grid" v-if="groups.length">
      <section v-for="(group, gi) in groups" :key="gi" class="cat-card gp-surface-card">
        <div class="gp-surface-card__header">
          <span class="category-title">{{ group.title }}</span>
        </div>
        <div class="gp-surface-card__body">
          <router-link
            v-for="(child, ci) in group.children"
            :key="ci"
            class="cat-link"
            :to="child.path"
          >{{ child.title }}</router-link>
        </div>
      </section>
    </div>
    <p v-else class="empty">暂无分类数据</p>
  </div>
</template>

<script>
export default {
  name: 'CategoriesView',
  computed: {
    groups() {
      const routes = this.$store.getters.addMenuRoutes || []
      return routes.map((parent) => ({
        title: (parent.meta && parent.meta.title) || parent.categoryName || parent.name,
        children: (parent.children || []).map((child) => {
          const p = (parent.path || '').replace(/\/$/, '')
          const c = (child.path || '').replace(/^\//, '')
          const path = child.path && child.path.startsWith('/')
            ? child.path
            : `${p}/${c}`.replace(/\/+/g, '/')
          return {
            title: (child.meta && child.meta.title) || child.categoryName || child.name,
            path
          }
        })
      })).filter((g) => g.children.length)
    }
  }
}
</script>

<style lang="scss" scoped>
.gp-blog-page__hero {
  margin-bottom: 20px;
}
.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-color);
}
h1 {
  margin: 0 0 8px;
  font-size: 1.6rem;
  color: var(--fontColor);
}
.lead {
  margin: 0;
  color: var(--font-color);
  font-size: 14px;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.cat-link {
  display: inline-block;
  margin: 0 8px 8px 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--theme-color-muted);
  color: var(--font-color);
  text-decoration: none;
  font-size: 13px;
  &:hover { color: var(--theme-color); }
}
.empty { color: var(--muted-1-color); }
</style>
