<template>
  <div class="resume-template-manager">
    <div class="toolbar">
      <h2>简历模板库管理</h2>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="goCreate">
        可视化构建新模板
      </el-button>
    </div>

    <el-row :gutter="16">
      <el-col
        v-for="t in templates"
        :key="t.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card shadow="hover" class="tpl-card">
          <div
            class="tpl-thumb"
            :style="{ backgroundColor: thumbBg(t) }"
          >
            <i class="el-icon-document" :style="{ color: thumbColor(t) }"></i>
            <el-tag v-if="t.isVip" size="mini" type="warning" class="vip-tag">VIP</el-tag>
            <span v-if="t.layoutData" class="layout-tag">
              {{ t.layoutData.layoutType === 'two-column' ? '左右混合' : '上下单列' }}
            </span>
          </div>
          <div class="tpl-body">
            <div class="tpl-title-row">
              <h3>{{ t.name }}</h3>
              <div>
                <el-button v-if="!t.readonly && !isSystemPreset(t.id)" type="text" icon="el-icon-edit" @click="goEdit(t)">编辑</el-button>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  class="danger"
                  v-if="!t.readonly && !isSystemPreset(t.id)"
                  @click="removeTemplate(t.id)"
                >删除</el-button>
              </div>
            </div>
            <p class="tpl-desc">{{ t.description || '暂无描述' }}</p>
            <div class="tpl-id">ID: {{ t.id }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!templates.length" description="暂无模板，点击右上角开始构建" />
  </div>
</template>

<script>
import { getTemplates, deleteTemplate } from '@/api/resume';
import { DEFAULT_TEMPLATES } from '@/components/resume';

export default {
  name: 'ResumeTemplateManager',
  data() {
    return {
      templates: [],
    };
  },
  created() {
    this.loadTemplates();
  },
  methods: {
    isSystemPreset(key) {
      return DEFAULT_TEMPLATES.some((t) => t.key === key);
    },
    thumbBg(t) {
      const c = t.layoutData && t.layoutData.themeColor;
      return c ? `${c}22` : '#f3f4f6';
    },
    thumbColor(t) {
      return (t.layoutData && t.layoutData.themeColor) || '#d1d5db';
    },
    loadTemplates() {
      getTemplates()
        .then((res) => {
          let list = [];
          if (Array.isArray(res)) list = res;
          else if (res && Array.isArray(res.data)) list = res.data;

          const mapped = list.map((t) => this.normalize(t));
          if (!mapped.length) {
            this.templates = DEFAULT_TEMPLATES.map((t) => ({ ...t, layoutData: null }));
          } else {
            this.templates = mapped;
          }
        })
        .catch(() => {
          this.templates = DEFAULT_TEMPLATES.map((t) => ({ ...t, layoutData: null }));
          this.$message.warning('后端模板不可用，已展示系统预设列表');
        });
    },
    normalize(t) {
      let layout = t.layoutData;
      if (!layout && t.layoutJson) {
        try {
          layout = typeof t.layoutJson === 'string' ? JSON.parse(t.layoutJson) : t.layoutJson;
        } catch (e) {
          layout = null;
        }
      }
      return {
        id: t.id || t.key || t.templateKey,
        name: t.name || t.templateName,
        description: t.description || '',
        isVip: !!(t.isVip || t.vip),
        readonly: !!t.readonly,
        layoutData: layout,
      };
    },
    goCreate() {
      this.$router.push({ path: '/admin/tool/resume/template-builder' });
    },
    goEdit(template) {
      this.$router.push({
        path: '/admin/tool/resume/template-builder',
        query: { id: template.id },
      });
    },
    removeTemplate(id) {
      this.$confirm('确认删除该模板吗？', '删除提示', { type: 'warning' })
        .then(() =>
          deleteTemplate(id).then(() => {
            this.$message.success('模板已删除');
            this.loadTemplates();
          })
        )
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.resume-template-manager {
  padding: 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.toolbar h2 {
  margin: 0;
  font-size: 18px;
}
.tpl-card {
  margin-bottom: 16px;
  overflow: hidden;
}
.tpl-thumb {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid var(--border-color, #f3f4f6);
  background-color: var(--background-origin, #fff);
}
.tpl-thumb i {
  font-size: 40px;
}
.vip-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}
.layout-tag {
  position: absolute;
  left: 10px;
  bottom: 10px;
  font-size: 11px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 4px;
}
.tpl-body {
  padding-top: 4px;
}
.tpl-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  height: 36px;
  line-height: 36px;
}
.tpl-title-row h3 {
  margin: 0;
  font-size: 16px;
}
.tpl-desc {
  margin: 8px 0;
  font-size: 13px;
  color: #6b7280;
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-id {
  font-size: 11px;
  color: #9ca3af;
}
.danger {
  color: #f56c6c;
}
</style>
