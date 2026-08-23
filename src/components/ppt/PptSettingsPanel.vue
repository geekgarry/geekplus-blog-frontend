<template>
  <div class="gp-settings-panel">
    <h3 class="gp-settings-panel__title">PPT 设置</h3>

    <div class="gp-form-field">
      <label class="gp-form-label">主题风格</label>
      <el-select v-model="local.stylePreset" class="gp-form-control" size="small" @change="onPreset">
        <el-option v-for="p in presets" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
    </div>

    <div class="gp-color-grid">
      <div class="gp-form-field">
        <label class="gp-form-label">主色调</label>
        <!-- active-change：拖动色板时实时预览，避免只有关闭面板才生效 -->
        <el-color-picker
          v-model="local.primaryColor"
          size="small"
          @change="emitChange"
          @active-change="emitChange"
        />
      </div>
      <div class="gp-form-field">
        <label class="gp-form-label">辅助色</label>
        <el-color-picker
          v-model="local.secondaryColor"
          size="small"
          @change="emitChange"
          @active-change="emitChange"
        />
      </div>
      <div class="gp-form-field">
        <label class="gp-form-label">背景色</label>
        <el-color-picker
          v-model="local.backgroundColor"
          size="small"
          @change="emitChange"
          @active-change="emitChange"
        />
      </div>
      <div class="gp-form-field">
        <label class="gp-form-label">标题色</label>
        <el-color-picker
          v-model="local.titleColor"
          size="small"
          @change="emitChange"
          @active-change="emitChange"
        />
      </div>
      <div class="gp-form-field gp-form-field--full">
        <label class="gp-form-label">字体色</label>
        <el-color-picker
          v-model="local.fontColor"
          size="small"
          @change="emitChange"
          @active-change="emitChange"
        />
      </div>
    </div>

    <div class="gp-form-field">
      <label class="gp-form-label">字体</label>
      <el-select v-model="local.fontFamily" class="gp-form-control" size="small" @change="emitChange">
        <el-option v-for="f in fonts" :key="f.id" :label="f.name" :value="f.id" />
      </el-select>
    </div>

    <div class="gp-form-field">
      <label class="gp-form-label">幻灯片切换</label>
      <el-select v-model="local.transition" class="gp-form-control" size="small" @change="emitChange">
        <el-option v-for="t in transitions" :key="t.id" :label="t.name" :value="t.id" />
      </el-select>
    </div>

    <div class="gp-form-field">
      <label class="gp-form-label">自动播放间隔(秒)</label>
      <el-input-number
        v-model="local.autoPlayInterval"
        class="gp-form-control gp-form-control--number"
        size="small"
        :min="2"
        :max="60"
        controls-position="right"
        @change="emitChange"
      />
    </div>

    <div class="gp-form-field">
      <label class="gp-form-label">显示选项</label>
      <div class="gp-check-row">
        <el-checkbox v-model="local.showControls" @change="emitChange">控制栏</el-checkbox>
        <el-checkbox v-model="local.showProgress" @change="emitChange">进度条</el-checkbox>
        <el-checkbox v-model="local.showPageNum" @change="emitChange">页码</el-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { PPT_STYLE_PRESETS, PPT_FONTS, PPT_TRANSITIONS } from './pptThemes'

function cloneSettings(s) {
  return {
    stylePreset: s.stylePreset || 'modern',
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
    backgroundColor: s.backgroundColor,
    titleColor: s.titleColor,
    fontColor: s.fontColor,
    fontFamily: s.fontFamily || 'system',
    transition: s.transition || 'fade',
    autoPlayInterval: s.autoPlayInterval || 5,
    showControls: s.showControls !== false,
    showProgress: s.showProgress !== false,
    showPageNum: s.showPageNum !== false,
  }
}

export default {
  name: 'PptSettingsPanel',
  props: {
    value: { type: Object, required: true },
  },
  data() {
    return {
      local: cloneSettings(this.value),
      presets: PPT_STYLE_PRESETS,
      fonts: PPT_FONTS,
      transitions: PPT_TRANSITIONS,
    }
  },
  watch: {
    value: {
      deep: true,
      handler(v) {
        this.local = cloneSettings(v)
      },
    },
  },
  methods: {
    onPreset(id) {
      const p = PPT_STYLE_PRESETS.find((x) => x.id === id)
      if (!p) return
      Object.assign(this.local, {
        stylePreset: p.id,
        primaryColor: p.primaryColor,
        secondaryColor: p.secondaryColor,
        backgroundColor: p.backgroundColor,
        titleColor: p.titleColor,
        fontColor: p.fontColor,
      })
      this.emitChange()
    },
    emitChange() {
      this.$emit('input', { ...this.local })
      this.$emit('change', { ...this.local })
    },
  },
}
</script>
