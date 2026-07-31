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
          <p class="panel-tip">手机请长按模块再拖到右侧；轻点可添加（双栏会选投放区）。滑动列表不会误拖</p>
          <div
            v-for="block in availableBlocks"
            :key="block.type"
            class="palette-item"
            :class="{
              'is-pressing': touchDrag && touchDrag.type === block.type && !touchDrag.armed,
              'is-touching': touchDrag && touchDrag.type === block.type && touchDrag.armed
            }"
            draggable="true"
            @dragstart="onDragStartNew($event, block.type)"
            @touchstart.passive="onTouchStartPalette($event, block.type)"
            @touchmove="onTouchMovePalette"
            @touchend="onTouchEndPalette"
            @touchcancel="onTouchCancelPalette"
            @click="onPaletteClick(block.type)"
          >
            <i class="el-icon-rank"></i>
            <span class="palette-icon">{{ block.icon }}</span>
            <div class="palette-text">
              <div class="palette-label">{{ block.label }}</div>
              <div class="palette-hint">点击添加 · 长按拖拽</div>
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
          <h3><i class="el-icon-brush"></i> 颜色与背景</h3>
          <div class="color-row">
            <label>主题颜色</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(themeColor, '#2563eb')"
                @input="themeColor = $event.target.value"
              />
              <button type="button" class="color-clear" title="恢复默认" @click="clearColor('themeColor')">
                清除
              </button>
            </div>
          </div>
          <div class="color-row">
            <label>字体颜色</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(fontColor, '#333333')"
                @input="fontColor = $event.target.value"
              />
              <button type="button" class="color-clear" title="恢复默认" @click="clearColor('fontColor')">
                清除
              </button>
            </div>
          </div>
          <div class="color-row">
            <label>主背景色</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(backgroundColor, '#ffffff')"
                @input="backgroundColor = $event.target.value"
              />
              <button type="button" class="color-clear" title="恢复默认" @click="clearColor('backgroundColor')">
                清除
              </button>
            </div>
          </div>
          <div v-if="layoutType === 'two-column'" class="color-row">
            <label>侧边栏背景</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(sidebarBackgroundColor, '#f8fafc')"
                @input="sidebarBackgroundColor = $event.target.value"
              />
              <button
                type="button"
                class="color-clear"
                :class="{ active: isCleared(sidebarBackgroundColor) }"
                title="清除为透明"
                @click="clearColor('sidebarBackgroundColor')"
              >
                {{ isCleared(sidebarBackgroundColor) ? '已清' : '清除' }}
              </button>
            </div>
          </div>
          <div class="style-label">背景样式</div>
          <div class="chip-row">
            <button
              v-for="opt in backgroundStyleOptions"
              :key="opt.value"
              type="button"
              class="chip"
              :class="{ active: backgroundStyle === opt.value }"
              @click="backgroundStyle = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <template v-if="backgroundStyle !== 'solid'">
            <div class="color-row">
              <label>渐变 / 辅色 A</label>
              <div class="color-actions">
                <input
                  type="color"
                  :value="pickerValue(backgroundAccentA, '#dbeafe')"
                  @input="backgroundAccentA = $event.target.value"
                />
                <button
                  type="button"
                  class="color-clear"
                  :class="{ active: isCleared(backgroundAccentA) }"
                  title="清除为透明"
                  @click="clearColor('backgroundAccentA')"
                >
                  {{ isCleared(backgroundAccentA) ? '已清' : '清除' }}
                </button>
              </div>
            </div>
            <div class="color-row">
              <label>渐变 / 辅色 B</label>
              <div class="color-actions">
                <input
                  type="color"
                  :value="pickerValue(backgroundAccentB, '#fef3c7')"
                  @input="backgroundAccentB = $event.target.value"
                />
                <button
                  type="button"
                  class="color-clear"
                  :class="{ active: isCleared(backgroundAccentB) }"
                  title="清除为透明"
                  @click="clearColor('backgroundAccentB')"
                >
                  {{ isCleared(backgroundAccentB) ? '已清' : '清除' }}
                </button>
              </div>
            </div>
          </template>
        </section>

        <section class="panel">
          <h3><i class="el-icon-s-marketing"></i> 模块表头与主体</h3>
          <div class="style-label">表头样式</div>
          <div class="chip-row">
            <button
              v-for="opt in headerStyleOptions"
              :key="opt.value"
              type="button"
              class="chip"
              :class="{ active: headerStyle === opt.value }"
              @click="headerStyle = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <div class="color-row">
            <label>表头文字色</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(sectionHeaderColor, themeColor)"
                @input="sectionHeaderColor = $event.target.value"
              />
              <button
                type="button"
                class="color-clear"
                :class="{ active: isCleared(sectionHeaderColor) }"
                title="清除（跟随主题色）"
                @click="clearColor('sectionHeaderColor')"
              >
                {{ isCleared(sectionHeaderColor) ? '已清' : '清除' }}
              </button>
            </div>
          </div>
          <div class="color-row">
            <label>表头背景</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(sectionHeaderBg, '#eff6ff')"
                @input="sectionHeaderBg = $event.target.value"
              />
              <button
                type="button"
                class="color-clear"
                :class="{ active: isCleared(sectionHeaderBg) }"
                title="清除为透明"
                @click="clearColor('sectionHeaderBg')"
              >
                {{ isCleared(sectionHeaderBg) ? '已清' : '清除' }}
              </button>
            </div>
          </div>
          <div class="color-row">
            <label>模块主体背景</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(sectionBodyBg, '#ffffff')"
                @input="sectionBodyBg = $event.target.value"
              />
              <button
                type="button"
                class="color-clear"
                :class="{ active: isCleared(sectionBodyBg) }"
                title="清除为透明"
                @click="clearColor('sectionBodyBg')"
              >
                {{ isCleared(sectionBodyBg) ? '已清' : '清除' }}
              </button>
            </div>
          </div>
          <div class="color-row">
            <label>模块边框色</label>
            <div class="color-actions">
              <input
                type="color"
                :value="pickerValue(sectionBorderColor, '#e5e7eb')"
                @input="sectionBorderColor = $event.target.value"
              />
              <button
                type="button"
                class="color-clear"
                :class="{ active: isCleared(sectionBorderColor) }"
                title="清除为透明"
                @click="clearColor('sectionBorderColor')"
              >
                {{ isCleared(sectionBorderColor) ? '已清' : '清除' }}
              </button>
            </div>
          </div>
          <div class="slider-row">
            <label>圆角 {{ sectionRadius }}px</label>
            <el-slider v-model="sectionRadius" :min="0" :max="20" :show-tooltip="false" />
          </div>
          <div class="slider-row">
            <label>内边距 {{ sectionPadding }}px</label>
            <el-slider v-model="sectionPadding" :min="0" :max="24" :show-tooltip="false" />
          </div>
        </section>

        <section class="panel">
          <h3><i class="el-icon-edit-outline"></i> 基础信息</h3>
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
          :style="canvasRootStyle"
        >
          <div
            v-if="layoutType === 'two-column'"
            class="canvas-zone sidebar-zone"
            :class="{ 'is-drop-target': dropHighlight === 'sidebar' }"
            data-drop-zone="sidebar"
            :style="{ backgroundColor: sidebarBackgroundColor }"
            @dragover.prevent="onDragOverZone($event, 'sidebar')"
            @dragleave="onDragLeaveZone"
            @drop="onDropCanvas($event, 'sidebar')"
          >
            <div class="zone-label">侧边栏区域</div>
            <div v-if="!sidebarBlocks.length" class="zone-empty">拖拽至此</div>
            <div
              v-for="(block, index) in sidebarBlocks"
              :key="block.id"
              class="canvas-block"
              :style="previewBlockStyle"
            >
              <div class="canvas-block-head" :class="'hs-' + headerStyle" :style="previewHeadStyle">
                <span>{{ blockLabel(block.type) }}</span>
                <span class="block-actions">
                  <i class="el-icon-top" title="上移" @click="moveBlock(index, 'up', 'sidebar')" />
                  <i class="el-icon-bottom" title="下移" @click="moveBlock(index, 'down', 'sidebar')" />
                  <i class="el-icon-delete" title="删除" @click="removeBlock(block.id, 'sidebar')" />
                </span>
              </div>
              <div class="canvas-block-body" :style="previewBodyStyle">模块内容将在此处渲染</div>
            </div>
          </div>

          <div
            class="canvas-zone main-zone"
            :class="{
              'is-full': layoutType === 'single',
              'is-drop-target': dropHighlight === 'main'
            }"
            data-drop-zone="main"
            @dragover.prevent="onDragOverZone($event, 'main')"
            @dragleave="onDragLeaveZone"
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
              :style="previewBlockStyle"
            >
              <div class="canvas-block-head" :class="'hs-' + headerStyle" :style="previewHeadStyle">
                <span>{{ blockLabel(block.type) }}</span>
                <span class="block-actions">
                  <i class="el-icon-top" title="上移" @click="moveBlock(index, 'up', 'main')" />
                  <i class="el-icon-bottom" title="下移" @click="moveBlock(index, 'down', 'main')" />
                  <i class="el-icon-delete" title="删除" @click="removeBlock(block.id, 'main')" />
                </span>
              </div>
              <div class="canvas-block-body" :style="previewBodyStyle">模块内容将在此处渲染</div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 触摸拖拽幽灵层 -->
    <div
      v-if="touchDrag && touchDrag.armed"
      class="touch-ghost"
      :style="{ left: touchDrag.x + 'px', top: touchDrag.y + 'px' }"
    >
      {{ blockLabel(touchDrag.type) }}
    </div>

    <!-- 点击添加时选择投放区（双栏） -->
    <el-dialog
      title="选择投放区域"
      :visible.sync="zonePickerVisible"
      width="90%"
      custom-class="zone-picker-dialog"
      append-to-body
    >
      <p class="zone-picker-tip">将「{{ blockLabel(pendingBlockType) }}」放到：</p>
      <div class="zone-picker-btns">
        <el-button type="primary" @click="confirmAddToZone('main')">主内容区</el-button>
        <el-button @click="confirmAddToZone('sidebar')">侧边栏</el-button>
      </div>
    </el-dialog>
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

const HEADER_STYLE_OPTIONS = [
  { value: 'dot', label: '圆点' },
  { value: 'bar', label: '左边条' },
  { value: 'underline', label: '下划线' },
  { value: 'pill', label: '胶囊' },
  { value: 'block', label: '色块条' },
  { value: 'slash', label: '斜切' },
];

const BACKGROUND_STYLE_OPTIONS = [
  { value: 'solid', label: '纯色' },
  { value: 'gradient', label: '渐变' },
  { value: 'diagonal', label: '对角分割' },
  { value: 'blobs', label: '不规则色块' },
];

const DEFAULT_LAYOUT = {
  layoutType: 'single',
  sidebarPosition: 'left',
  themeColor: '#2563eb',
  fontColor: '#333333',
  backgroundColor: '#ffffff',
  sidebarBackgroundColor: '#f8fafc',
  backgroundStyle: 'solid',
  backgroundAccentA: '#dbeafe',
  backgroundAccentB: '#fef3c7',
  headerStyle: 'dot',
  sectionHeaderColor: '#2563eb',
  sectionHeaderBg: '#eff6ff',
  sectionBodyBg: '#ffffff',
  sectionBorderColor: '#e5e7eb',
  sectionRadius: 8,
  sectionPadding: 12,
  mainBlocks: [],
  sidebarBlocks: [],
};

const LONG_PRESS_MS = 420;
/** 长按未完成前，手指移动超过该距离则视为滚动，取消长按 */
const LONG_PRESS_MOVE_CANCEL_PX = 12;

const COLOR_CLEAR_VALUE = {
  // 基础色：清除 = 恢复默认
  themeColor: DEFAULT_LAYOUT.themeColor,
  fontColor: DEFAULT_LAYOUT.fontColor,
  backgroundColor: DEFAULT_LAYOUT.backgroundColor,
  // 装饰色：清除 = 透明 / 空（渲染时回退）
  sidebarBackgroundColor: 'transparent',
  backgroundAccentA: 'transparent',
  backgroundAccentB: 'transparent',
  sectionHeaderColor: '',
  sectionHeaderBg: 'transparent',
  sectionBodyBg: 'transparent',
  sectionBorderColor: 'transparent',
};

export default {
  name: 'ResumeTemplateBuilder',
  data() {
    return {
      availableBlocks: AVAILABLE_BLOCKS,
      headerStyleOptions: HEADER_STYLE_OPTIONS,
      backgroundStyleOptions: BACKGROUND_STYLE_OPTIONS,
      editingId: null,
      saving: false,
      form: { name: '', description: '', isVip: false },
      layoutType: DEFAULT_LAYOUT.layoutType,
      sidebarPosition: DEFAULT_LAYOUT.sidebarPosition,
      themeColor: DEFAULT_LAYOUT.themeColor,
      fontColor: DEFAULT_LAYOUT.fontColor,
      backgroundColor: DEFAULT_LAYOUT.backgroundColor,
      sidebarBackgroundColor: DEFAULT_LAYOUT.sidebarBackgroundColor,
      backgroundStyle: DEFAULT_LAYOUT.backgroundStyle,
      backgroundAccentA: DEFAULT_LAYOUT.backgroundAccentA,
      backgroundAccentB: DEFAULT_LAYOUT.backgroundAccentB,
      headerStyle: DEFAULT_LAYOUT.headerStyle,
      sectionHeaderColor: DEFAULT_LAYOUT.sectionHeaderColor,
      sectionHeaderBg: DEFAULT_LAYOUT.sectionHeaderBg,
      sectionBodyBg: DEFAULT_LAYOUT.sectionBodyBg,
      sectionBorderColor: DEFAULT_LAYOUT.sectionBorderColor,
      sectionRadius: DEFAULT_LAYOUT.sectionRadius,
      sectionPadding: DEFAULT_LAYOUT.sectionPadding,
      mainBlocks: [],
      sidebarBlocks: [],
      // HTML5 DnD 高亮
      dropHighlight: null,
      // 触摸拖拽：需长按后才 armed，避免滑动侧栏误拖
      touchDrag: null,
      touchSuppressClick: false,
      _longPressTimer: null,
      zonePickerVisible: false,
      pendingBlockType: null,
    };
  },
  computed: {
    canvasRootStyle() {
      const base = { color: this.fontColor };
      const a = this.isCleared(this.backgroundAccentA)
        ? 'transparent'
        : this.backgroundAccentA;
      const b = this.isCleared(this.backgroundAccentB)
        ? 'transparent'
        : this.backgroundAccentB;
      const bg = this.backgroundColor || DEFAULT_LAYOUT.backgroundColor;
      if (this.backgroundStyle === 'gradient') {
        return {
          ...base,
          backgroundImage: `linear-gradient(145deg, ${bg} 0%, ${a} 55%, ${b} 100%)`,
          backgroundColor: bg,
        };
      }
      if (this.backgroundStyle === 'diagonal') {
        return {
          ...base,
          backgroundImage: `linear-gradient(135deg, ${bg} 0%, ${bg} 46%, ${a} 46%, ${a} 100%)`,
          backgroundColor: bg,
        };
      }
      if (this.backgroundStyle === 'blobs') {
        return {
          ...base,
          backgroundColor: bg,
          backgroundImage: [
            `radial-gradient(ellipse 55% 40% at 12% 18%, ${a} 0%, transparent 70%)`,
            `radial-gradient(ellipse 45% 35% at 88% 82%, ${b} 0%, transparent 68%)`,
            `radial-gradient(ellipse 30% 28% at 70% 20%, ${this.themeColor}33 0%, transparent 70%)`,
          ].join(','),
        };
      }
      return { ...base, backgroundColor: bg };
    },
    previewBlockStyle() {
      const border = this.isCleared(this.sectionBorderColor)
        ? 'none'
        : `1px solid ${this.sectionBorderColor}`;
      return {
        border,
        borderRadius: `${this.sectionRadius}px`,
        overflow: 'hidden',
      };
    },
    previewHeadStyle() {
      return {
        color: this.isCleared(this.sectionHeaderColor)
          ? this.themeColor
          : this.sectionHeaderColor,
        backgroundColor: this.isCleared(this.sectionHeaderBg)
          ? 'transparent'
          : this.sectionHeaderBg,
        padding: `${Math.max(6, this.sectionPadding / 2)}px ${this.sectionPadding}px`,
      };
    },
    previewBodyStyle() {
      return {
        backgroundColor: this.isCleared(this.sectionBodyBg)
          ? 'transparent'
          : this.sectionBodyBg,
        padding: `${this.sectionPadding}px`,
      };
    },
  },
  created() {
    const id = this.$route.query.id || this.$route.params.id;
    if (id) {
      this.editingId = id;
      this.loadTemplate(id);
    }
  },
  beforeDestroy() {
    this.clearLongPressTimer();
    this.touchDrag = null;
    this.dropHighlight = null;
  },
  methods: {
    clearLongPressTimer() {
      if (this._longPressTimer) {
        clearTimeout(this._longPressTimer);
        this._longPressTimer = null;
      }
    },
    blockLabel(type) {
      const found = AVAILABLE_BLOCKS.find((b) => b.type === type);
      return found ? `${found.icon} ${found.label}` : type || '';
    },
    /** color input 不能为空，已清除时用 fallback 仅作取色盘展示 */
    pickerValue(value, fallback) {
      if (!value || value === 'transparent') return fallback || '#ffffff';
      return value;
    },
    isCleared(value) {
      return !value || value === 'transparent';
    },
    clearColor(key) {
      if (!Object.prototype.hasOwnProperty.call(COLOR_CLEAR_VALUE, key)) return;
      this[key] = COLOR_CLEAR_VALUE[key];
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
      Object.keys(DEFAULT_LAYOUT).forEach((k) => {
        if (k === 'mainBlocks' || k === 'sidebarBlocks') return;
        this[k] = DEFAULT_LAYOUT[k];
      });
      this.mainBlocks = [];
      this.sidebarBlocks = [];
    },
    applyLayout(layout) {
      if (!layout) return;
      this.layoutType = layout.layoutType || 'single';
      this.sidebarPosition = layout.sidebarPosition || 'left';
      this.themeColor = layout.themeColor || DEFAULT_LAYOUT.themeColor;
      this.fontColor = layout.fontColor || DEFAULT_LAYOUT.fontColor;
      this.backgroundColor = layout.backgroundColor || DEFAULT_LAYOUT.backgroundColor;
      // 允许透明 / 空串（清除态），勿用 || 盖掉
      this.sidebarBackgroundColor =
        layout.sidebarBackgroundColor != null
          ? layout.sidebarBackgroundColor
          : DEFAULT_LAYOUT.sidebarBackgroundColor;
      this.backgroundStyle = layout.backgroundStyle || DEFAULT_LAYOUT.backgroundStyle;
      this.backgroundAccentA =
        layout.backgroundAccentA != null
          ? layout.backgroundAccentA
          : DEFAULT_LAYOUT.backgroundAccentA;
      this.backgroundAccentB =
        layout.backgroundAccentB != null
          ? layout.backgroundAccentB
          : DEFAULT_LAYOUT.backgroundAccentB;
      this.headerStyle = layout.headerStyle || DEFAULT_LAYOUT.headerStyle;
      this.sectionHeaderColor =
        layout.sectionHeaderColor != null
          ? layout.sectionHeaderColor
          : layout.themeColor || DEFAULT_LAYOUT.sectionHeaderColor;
      this.sectionHeaderBg =
        layout.sectionHeaderBg != null ? layout.sectionHeaderBg : DEFAULT_LAYOUT.sectionHeaderBg;
      this.sectionBodyBg =
        layout.sectionBodyBg != null ? layout.sectionBodyBg : DEFAULT_LAYOUT.sectionBodyBg;
      this.sectionBorderColor =
        layout.sectionBorderColor != null
          ? layout.sectionBorderColor
          : DEFAULT_LAYOUT.sectionBorderColor;
      this.sectionRadius =
        typeof layout.sectionRadius === 'number'
          ? layout.sectionRadius
          : DEFAULT_LAYOUT.sectionRadius;
      this.sectionPadding =
        typeof layout.sectionPadding === 'number'
          ? layout.sectionPadding
          : DEFAULT_LAYOUT.sectionPadding;
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
      if (e.dataTransfer) {
        e.dataTransfer.setData('blockType', type);
        e.dataTransfer.effectAllowed = 'copy';
      }
    },
    onDragOverZone(e, zone) {
      e.preventDefault();
      this.dropHighlight = zone;
    },
    onDragLeaveZone() {
      this.dropHighlight = null;
    },
    onDropCanvas(e, zone) {
      e.preventDefault();
      this.dropHighlight = null;
      const type = e.dataTransfer && e.dataTransfer.getData('blockType');
      this.addBlock(type, zone);
    },
    /**
     * 触摸开始：仅启动长按计时；未 armed 前不拦截滚动。
     * 长按完成后再允许拖到画布，避免滑列表时误拖模块。
     */
    onTouchStartPalette(e, type) {
      if (!e.touches || !e.touches[0]) return;
      const t = e.touches[0];
      this.clearLongPressTimer();
      this.touchDrag = {
        type,
        startX: t.clientX,
        startY: t.clientY,
        x: t.clientX,
        y: t.clientY,
        armed: false,
        active: false,
      };
      this._longPressTimer = setTimeout(() => {
        if (!this.touchDrag || this.touchDrag.type !== type) return;
        this.touchDrag.armed = true;
        this.touchSuppressClick = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(12);
          } catch (err) {
            /* ignore */
          }
        }
      }, LONG_PRESS_MS);
    },
    onTouchMovePalette(e) {
      if (!this.touchDrag || !e.touches || !e.touches[0]) return;
      const t = e.touches[0];
      const dx = t.clientX - this.touchDrag.startX;
      const dy = t.clientY - this.touchDrag.startY;
      const dist = Math.hypot(dx, dy);

      // 长按未完成：滑动超过阈值 → 取消，交给原生滚动
      if (!this.touchDrag.armed) {
        if (dist > LONG_PRESS_MOVE_CANCEL_PX) {
          this.clearLongPressTimer();
          this.touchDrag = null;
          this.dropHighlight = null;
        }
        return;
      }

      // 已长按：跟手拖拽，阻止滚动
      if (!this.touchDrag.active) this.touchDrag.active = true;
      e.preventDefault();
      this.touchDrag.x = t.clientX;
      this.touchDrag.y = t.clientY;
      this.dropHighlight = this.zoneFromPoint(t.clientX, t.clientY);
    },
    onTouchEndPalette() {
      this.clearLongPressTimer();
      if (!this.touchDrag) return;
      const { armed, active, x, y, type } = this.touchDrag;
      this.touchDrag = null;
      this.dropHighlight = null;

      if (armed) {
        // 长按后松手：有位移则投放；无位移仅吞掉 click
        this.touchSuppressClick = true;
        if (active) {
          const zone = this.zoneFromPoint(x, y);
          if (zone) this.addBlock(type, zone);
        }
        setTimeout(() => {
          this.touchSuppressClick = false;
        }, 120);
        return;
      }
      // 短按未长按：交给 @click
    },
    onTouchCancelPalette() {
      this.clearLongPressTimer();
      this.touchDrag = null;
      this.dropHighlight = null;
      this.touchSuppressClick = false;
    },
    zoneFromPoint(x, y) {
      const el = document.elementFromPoint(x, y);
      if (!el || !el.closest) return null;
      const zoneEl = el.closest('[data-drop-zone]');
      return zoneEl ? zoneEl.getAttribute('data-drop-zone') : null;
    },
    onPaletteClick(type) {
      if (this.touchSuppressClick) return;
      if (this.layoutType === 'two-column') {
        this.pendingBlockType = type;
        this.zonePickerVisible = true;
        return;
      }
      this.addBlock(type, 'main');
    },
    confirmAddToZone(zone) {
      this.zonePickerVisible = false;
      this.addBlock(this.pendingBlockType, zone);
      this.pendingBlockType = null;
    },
    addBlock(type, zone) {
      if (!type || !AVAILABLE_BLOCKS.some((b) => b.type === type)) return;
      const target = zone === 'sidebar' && this.layoutType === 'two-column' ? 'sidebar' : 'main';
      const block = { id: createResumeId(), type };
      if (target === 'main') this.mainBlocks = this.mainBlocks.concat(block);
      else this.sidebarBlocks = this.sidebarBlocks.concat(block);
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
    buildLayoutData() {
      return {
        layoutType: this.layoutType,
        sidebarPosition: this.sidebarPosition,
        themeColor: this.themeColor,
        fontColor: this.fontColor,
        backgroundColor: this.backgroundColor,
        sidebarBackgroundColor: this.sidebarBackgroundColor,
        backgroundStyle: this.backgroundStyle,
        backgroundAccentA: this.backgroundAccentA,
        backgroundAccentB: this.backgroundAccentB,
        headerStyle: this.headerStyle,
        sectionHeaderColor: this.sectionHeaderColor,
        sectionHeaderBg: this.sectionHeaderBg,
        sectionBodyBg: this.sectionBodyBg,
        sectionBorderColor: this.sectionBorderColor,
        sectionRadius: this.sectionRadius,
        sectionPadding: this.sectionPadding,
        mainBlocks: this.mainBlocks,
        sidebarBlocks: this.sidebarBlocks,
      };
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
      const layoutData = this.buildLayoutData();
      const id = this.editingId || `${Date.now()}`;
      const payload = {
        id,
        key: 'template_custom_' + id,
        name: this.form.name,
        description: this.form.description,
        isVip: this.form.isVip ? 1 : 0,
        layoutData,
        layoutJson: JSON.stringify(layoutData),
        readonly: 0,
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
  touch-action: manipulation;
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
  -webkit-overflow-scrolling: touch;
}

.panel h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-tip {
  margin: -6px 0 10px;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
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
  user-select: none;
  -webkit-user-select: none;
  /* 未长按前允许纵向滑动侧栏；长按后由 JS preventDefault 接管 */
  touch-action: pan-y;
}

.palette-item.is-pressing {
  border-color: #93c5fd;
  background: #f0f7ff;
}

.palette-item.is-touching {
  opacity: 0.55;
  border-color: #60a5fa;
  touch-action: none;
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
  gap: 8px;
}

.color-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.color-row input[type='color'] {
  width: 36px;
  height: 28px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.color-clear {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-size: 11px;
  line-height: 1;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.color-clear:hover {
  border-color: #f87171;
  color: #dc2626;
  background: #fef2f2;
}

.color-clear.active {
  border-color: #fca5a5;
  color: #b91c1c;
  background: #fef2f2;
}

.style-label {
  font-size: 12px;
  color: #6b7280;
  margin: 8px 0 6px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.chip {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
}

.chip.active {
  border-color: #6366f1;
  background: #eef2ff;
  color: #4338ca;
}

.slider-row {
  margin-bottom: 8px;
  font-size: 12px;
  color: #4b5563;
}

.meta-form {
  margin-top: 4px;
}

.builder-canvas-wrap {
  flex: 1;
  overflow: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #d1d5db;
  -webkit-overflow-scrolling: touch;
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
  transition: box-shadow 0.15s, outline-color 0.15s;
  outline: 2px solid transparent;
}

.canvas-zone.is-drop-target {
  outline-color: #3b82f6;
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.35);
  background-color: rgba(59, 130, 246, 0.06) !important;
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
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.canvas-block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
}

.canvas-block-head.hs-bar {
  border-left: 4px solid currentColor;
}

.canvas-block-head.hs-underline {
  border-bottom: 2px solid currentColor;
}

.canvas-block-head.hs-pill {
  border-radius: 999px;
  margin: 6px;
  width: calc(100% - 12px);
  box-sizing: border-box;
}

.canvas-block-head.hs-slash {
  clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%);
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

.touch-ghost {
  position: fixed;
  z-index: 3000;
  pointer-events: none;
  transform: translate(-50%, -120%);
  padding: 8px 12px;
  border-radius: 10px;
  background: #1d4ed8;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(29, 78, 216, 0.35);
  white-space: nowrap;
}

.zone-picker-tip {
  margin: 0 0 16px;
  color: #374151;
}

.zone-picker-btns {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .builder-body {
    flex-direction: column;
  }
  .builder-sidebar {
    width: 100%;
    max-height: 42vh;
  }
  .builder-canvas-wrap {
    padding: 12px;
  }
  .builder-canvas {
    min-height: 520px;
    flex-direction: column;
  }
  .builder-canvas.flex-row-reverse {
    flex-direction: column-reverse;
  }
  .sidebar-zone,
  .main-zone,
  .main-zone.is-full {
    width: 100%;
  }
  .sidebar-zone {
    border-right: none;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.12);
    min-height: 160px;
  }
}
</style>
