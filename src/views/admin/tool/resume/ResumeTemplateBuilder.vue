<template>
  <div class="resume-template-builder">
    <header class="builder-header">
      <div class="header-left">
        <el-button type="text" icon="el-icon-close" @click="goBack">关闭</el-button>
        <h2>{{ editingId ? '编辑简历模板' : '创建自定义动态模板' }}</h2>
      </div>
      <el-button type="primary" icon="el-icon-check" :loading="saving" @click="handleSave">
        保存并发布
      </el-button>
    </header>

    <div class="builder-body">
      <aside class="builder-sidebar">
        <section class="panel">
          <h3><i class="el-icon-menu"></i> 拖拽 / 点击添加模块</h3>
          <div
            v-for="block in availableBlocks"
            :key="block.type"
            class="palette-item"
            draggable="true"
            @dragstart="onDragStartNew($event, block.type)"
            @click="addBlock(block.type)"
          >
            <i class="el-icon-rank"></i>
            <span class="palette-icon">{{ block.icon }}</span>
            <div class="palette-text">
              <div class="palette-label">{{ block.label }}</div>
              <div class="palette-hint">点击或拖到右侧画布</div>
            </div>
          </div>
        </section>

        <section class="panel">
          <h3><i class="el-icon-s-grid"></i> 布局结构</h3>
          <div class="layout-btns">
            <button
              type="button"
              :class="{ active: layoutType === 'single' }"
              @click="layoutType = 'single'"
            >
              <i class="el-icon-s-operation"></i>
              上下单列
            </button>
            <button
              type="button"
              :class="{ active: layoutType === 'two-column' }"
              @click="layoutType = 'two-column'"
            >
              <i class="el-icon-s-fold"></i>
              左右混合
            </button>
          </div>
          <div v-if="layoutType === 'two-column'" class="sidebar-pos">
            <span>侧边栏位置</span>
            <el-radio-group v-model="sidebarPosition" size="mini">
              <el-radio-button label="left">居左</el-radio-button>
              <el-radio-button label="right">居右</el-radio-button>
            </el-radio-group>
          </div>
        </section>

        <section class="panel">
          <h3><i class="el-icon-brush"></i> 颜色与基础设置</h3>
          <div class="color-row">
            <label>主题颜色</label>
            <input v-model="themeColor" type="color" />
          </div>
          <div class="color-row">
            <label>字体颜色</label>
            <input v-model="fontColor" type="color" />
          </div>
          <div class="color-row">
            <label>背景颜色</label>
            <input v-model="backgroundColor" type="color" />
          </div>
          <div v-if="layoutType === 'two-column'" class="color-row">
            <label>侧边栏背景</label>
            <input v-model="sidebarBackgroundColor" type="color" />
          </div>
          <el-form label-position="top" size="small" class="meta-form">
            <el-form-item label="模板名称">
              <el-input v-model="form.name" placeholder="如：极简蓝、商务灰" />
            </el-form-item>
            <el-form-item label="模板描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="一句话介绍模板特点"
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="form.isVip">设为 VIP 专属模板</el-checkbox>
            </el-form-item>
          </el-form>
        </section>
      </aside>

      <main class="builder-canvas-wrap">
        <div
          class="builder-canvas"
          :class="{ 'flex-row-reverse': layoutType === 'two-column' && sidebarPosition === 'right' }"
          :style="{ backgroundColor, color: fontColor }"
        >
          <div
            v-if="layoutType === 'two-column'"
            class="canvas-zone sidebar-zone"
            :style="{ backgroundColor: sidebarBackgroundColor }"
            @dragover.prevent
            @drop="onDropCanvas($event, 'sidebar')"
          >
            <div class="zone-label">侧边栏区域</div>
            <div v-if="!sidebarBlocks.length" class="zone-empty">拖拽至此</div>
            <div
              v-for="(block, index) in sidebarBlocks"
              :key="block.id"
              class="canvas-block"
            >
              <div class="canvas-block-head">
                <span>{{ blockLabel(block.type) }}</span>
                <span class="block-actions">
                  <i class="el-icon-top" title="上移" @click="moveBlock(index, 'up', 'sidebar')" />
                  <i class="el-icon-bottom" title="下移" @click="moveBlock(index, 'down', 'sidebar')" />
                  <i class="el-icon-delete" title="删除" @click="removeBlock(block.id, 'sidebar')" />
                </span>
              </div>
              <div class="canvas-block-body">模块内容将在此处渲染</div>
            </div>
          </div>

          <div
            class="canvas-zone main-zone"
            :class="{ 'is-full': layoutType === 'single' }"
            @dragover.prevent
            @drop="onDropCanvas($event, 'main')"
          >
            <div class="zone-label">主内容区域</div>
            <div v-if="!mainBlocks.length" class="zone-empty large">
              <i class="el-icon-document-add"></i>
              <p>将左侧组件拖拽至此区域</p>
            </div>
            <div
              v-for="(block, index) in mainBlocks"
              :key="block.id"
              class="canvas-block"
            >
              <div class="canvas-block-head">
                <span>{{ blockLabel(block.type) }}</span>
                <span class="block-actions">
                  <i class="el-icon-top" title="上移" @click="moveBlock(index, 'up', 'main')" />
                  <i class="el-icon-bottom" title="下移" @click="moveBlock(index, 'down', 'main')" />
                  <i class="el-icon-delete" title="删除" @click="removeBlock(block.id, 'main')" />
                </span>
              </div>
              <div class="canvas-block-body">模块内容将在此处渲染</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { getTemplates, saveTemplate } from '@/api/resume';
import { createResumeId } from '@/components/resume/export/idUtils';
import '@/components/resume/styles/tailwind.css';

const AVAILABLE_BLOCKS = [
  { type: 'header', label: '个人信息头', icon: '👤' },
  { type: 'summary', label: '个人总结', icon: '📝' },
  { type: 'jobIntention', label: '求职意向', icon: '🎯' },
  { type: 'work', label: '工作经历', icon: '💼' },
  { type: 'projects', label: '项目经验', icon: '💻' },
  { type: 'education', label: '教育经历', icon: '🎓' },
  { type: 'awards', label: '获奖情况', icon: '🏆' },
  { type: 'certifications', label: '资格证书', icon: '📜' },
  { type: 'portfolio', label: '作品集', icon: '🔗' },
  { type: 'skills', label: '技能与爱好', icon: '🛠' },
];

const DEFAULT_LAYOUT = {
  layoutType: 'single',
  sidebarPosition: 'left',
  themeColor: '#2563eb',
  fontColor: '#333333',
  backgroundColor: '#ffffff',
  sidebarBackgroundColor: '#f8fafc',
  mainBlocks: [],
  sidebarBlocks: [],
};

export default {
  name: 'ResumeTemplateBuilder',
  data() {
    return {
      availableBlocks: AVAILABLE_BLOCKS,
      editingId: null,
      saving: false,
      form: { name: '', description: '', isVip: false },
      layoutType: DEFAULT_LAYOUT.layoutType,
      sidebarPosition: DEFAULT_LAYOUT.sidebarPosition,
      themeColor: DEFAULT_LAYOUT.themeColor,
      fontColor: DEFAULT_LAYOUT.fontColor,
      backgroundColor: DEFAULT_LAYOUT.backgroundColor,
      sidebarBackgroundColor: DEFAULT_LAYOUT.sidebarBackgroundColor,
      mainBlocks: [],
      sidebarBlocks: [],
    };
  },
  created() {
    const id = this.$route.query.id || this.$route.params.id;
    if (id) {
      this.editingId = id;
      this.loadTemplate(id);
    }
  },
  methods: {
    blockLabel(type) {
      const found = AVAILABLE_BLOCKS.find((b) => b.type === type);
      return found ? `${found.icon} ${found.label}` : type;
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push({ path: '/admin/tool/resume/template' });
      }
    },
    resetBuilder() {
      this.form = { name: '', description: '', isVip: false };
      this.layoutType = DEFAULT_LAYOUT.layoutType;
      this.sidebarPosition = DEFAULT_LAYOUT.sidebarPosition;
      this.themeColor = DEFAULT_LAYOUT.themeColor;
      this.fontColor = DEFAULT_LAYOUT.fontColor;
      this.backgroundColor = DEFAULT_LAYOUT.backgroundColor;
      this.sidebarBackgroundColor = DEFAULT_LAYOUT.sidebarBackgroundColor;
      this.mainBlocks = [];
      this.sidebarBlocks = [];
    },
    applyLayout(layout) {
      if (!layout) return;
      this.layoutType = layout.layoutType || 'single';
      this.sidebarPosition = layout.sidebarPosition || 'left';
      this.themeColor = layout.themeColor || '#2563eb';
      this.fontColor = layout.fontColor || '#333333';
      this.backgroundColor = layout.backgroundColor || '#ffffff';
      this.sidebarBackgroundColor = layout.sidebarBackgroundColor || '#f8fafc';
      this.mainBlocks = (layout.mainBlocks || layout.blocks || []).slice();
      this.sidebarBlocks = (layout.sidebarBlocks || []).slice();
    },
    loadTemplate(id) {
      getTemplates()
        .then((res) => {
          const list = Array.isArray(res) ? res : (res && res.data) || [];
          const t = list.find((item) => String(item.id || item.key) === String(id));
          if (!t) {
            this.$message.warning('未找到模板，将创建新模板');
            this.editingId = null;
            this.resetBuilder();
            return;
          }
          this.form = {
            name: t.name || '',
            description: t.description || '',
            isVip: !!(t.isVip || t.vip),
          };
          let layout = t.layoutData;
          if (!layout && t.layoutJson) {
            try {
              layout = typeof t.layoutJson === 'string' ? JSON.parse(t.layoutJson) : t.layoutJson;
            } catch (e) {
              layout = null;
            }
          }
          if (layout) this.applyLayout(layout);
          else this.resetBuilder();
        })
        .catch(() => {
          this.$message.error('加载模板失败');
        });
    },
    onDragStartNew(e, type) {
      e.dataTransfer.setData('blockType', type);
    },
    onDropCanvas(e, zone) {
      e.preventDefault();
      const type = e.dataTransfer.getData('blockType');
      if (!type || !AVAILABLE_BLOCKS.some((b) => b.type === type)) return;
      const block = { id: createResumeId(), type };
      if (zone === 'main') this.mainBlocks = this.mainBlocks.concat(block);
      else this.sidebarBlocks = this.sidebarBlocks.concat(block);
    },
    addBlock(type) {
      this.mainBlocks = this.mainBlocks.concat({ id: createResumeId(), type });
    },
    moveBlock(index, direction, zone) {
      const list = zone === 'main' ? this.mainBlocks.slice() : this.sidebarBlocks.slice();
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return;
      const tmp = list[index];
      list[index] = list[target];
      list[target] = tmp;
      if (zone === 'main') this.mainBlocks = list;
      else this.sidebarBlocks = list;
    },
    removeBlock(id, zone) {
      if (zone === 'main') {
        this.mainBlocks = this.mainBlocks.filter((b) => b.id !== id);
      } else {
        this.sidebarBlocks = this.sidebarBlocks.filter((b) => b.id !== id);
      }
    },
    handleSave() {
      if (!this.form.name) {
        this.$message.warning('请填写模板名称');
        return;
      }
      if (!this.mainBlocks.length && !this.sidebarBlocks.length) {
        this.$message.warning('请至少拖入一个模块');
        return;
      }
      const layoutData = {
        layoutType: this.layoutType,
        sidebarPosition: this.sidebarPosition,
        themeColor: this.themeColor,
        fontColor: this.fontColor,
        backgroundColor: this.backgroundColor,
        sidebarBackgroundColor: this.sidebarBackgroundColor,
        mainBlocks: this.mainBlocks,
        sidebarBlocks: this.sidebarBlocks,
      };
      const id = this.editingId || `custom_${Date.now()}`;
      const payload = {
        id,
        key: id,
        name: this.form.name,
        description: this.form.description,
        isVip: this.form.isVip,
        layoutData,
        layoutJson: JSON.stringify(layoutData),
        readonly: false,
      };
      this.saving = true;
      saveTemplate(payload)
        .then(() => {
          this.$message.success('模板保存成功');
          this.goBack();
        })
        .catch(() => {
          this.$message.error('保存失败，请检查后端服务');
        })
        .finally(() => {
          this.saving = false;
        });
    },
  },
};
</script>

<style scoped>
.resume-template-builder {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
  font-family: system-ui, -apple-system, sans-serif;
}

.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.builder-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.builder-sidebar {
  width: 320px;
  max-width: 100%;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: grab;
  transition: all 0.15s;
}

.palette-item:hover {
  border-color: #60a5fa;
  background: #eff6ff;
}

.palette-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.palette-label {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.palette-hint {
  font-size: 11px;
  color: #9ca3af;
}

.layout-btns {
  display: flex;
  gap: 8px;
}

.layout-btns button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #4b5563;
}

.layout-btns button.active {
  border-color: #6366f1;
  background: #eef2ff;
  color: #4338ca;
}

.sidebar-pos {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 13px;
}

.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #374151;
}

.color-row input[type='color'] {
  width: 36px;
  height: 28px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.meta-form {
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.builder-canvas-wrap {
  flex: 1;
  overflow: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #d1d5db;
}

.builder-canvas {
  width: 100%;
  max-width: 800px;
  min-height: 800px;
  display: flex;
  flex-direction: row;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.builder-canvas.flex-row-reverse {
  flex-direction: row-reverse;
}

.canvas-zone {
  padding: 16px;
  box-sizing: border-box;
  min-height: 100%;
}

.sidebar-zone {
  width: 33.333%;
  border-right: 1px dashed rgba(0, 0, 0, 0.12);
}

.main-zone {
  width: 66.666%;
}

.main-zone.is-full {
  width: 100%;
}

.zone-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.45;
  text-align: center;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.15);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.zone-empty {
  height: 120px;
  border: 2px dashed rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.35);
  font-size: 13px;
}

.zone-empty.large {
  height: 220px;
  flex-direction: column;
  gap: 8px;
}

.zone-empty.large i {
  font-size: 40px;
  opacity: 0.4;
}

.canvas-block {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.canvas-block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
  color: #2563eb;
  margin-bottom: 6px;
}

.block-actions i {
  margin-left: 6px;
  color: #9ca3af;
  cursor: pointer;
}

.block-actions i:hover {
  color: #2563eb;
}

.block-actions .el-icon-delete:hover {
  color: #dc2626;
}

.canvas-block-body {
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 900px) {
  .builder-body {
    flex-direction: column;
  }
  .builder-sidebar {
    width: 100%;
    max-height: 42vh;
  }
}
</style>
