<template>
  <div class="container">
    <el-row :gutter="5">
      <el-col :xs="24" :sm="8" :md="8" :lg="6" :xl="4">
        <div class="left-board">
          <div class="logo-wrapper">
            <div class="logo" :style="activeStyle()">
              <img :src="logo" alt="logo"> 表单构建
            </div>
          </div>
          <el-scrollbar class="left-scrollbar">
            <div class="components-list">
              <div class="components-title">
                <svg-icon icon-class="component" />输入型组件
              </div>
              <draggable
                class="components-draggable"
                :list="inputComponents"
                :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
                :clone="cloneComponent"
                draggable=".components-item"
                :sort="false"
                @end="onEnd"
              >
                <div
                  v-for="(element, index) in inputComponents" :key="index" class="components-item"
                  @click="addComponent(element)"
                >
                  <div class="components-body">
                    <svg-icon :icon-class="element.tagIcon" />
                    {{ element.label }}
                  </div>
                </div>
              </draggable>
              <div class="components-title">
                <svg-icon icon-class="component" />选择型组件
              </div>
              <draggable
                class="components-draggable"
                :list="selectComponents"
                :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
                :clone="cloneComponent"
                draggable=".components-item"
                :sort="false"
                @end="onEnd"
              >
                <div
                  v-for="(element, index) in selectComponents"
                  :key="index"
                  class="components-item"
                  @click="addComponent(element)"
                >
                  <div class="components-body">
                    <svg-icon :icon-class="element.tagIcon" />
                    {{ element.label }}
                  </div>
                </div>
              </draggable>
              <div class="components-title">
                <svg-icon icon-class="component" /> 布局型组件
              </div>
              <draggable
                class="components-draggable" :list="layoutComponents"
                :group="{ name: 'componentsGroup', pull: 'clone', put: false }" :clone="cloneComponent"
                draggable=".components-item" :sort="false" @end="onEnd"
              >
                <div
                  v-for="(element, index) in layoutComponents" :key="index" class="components-item"
                  @click="addComponent(element)"
                >
                  <div class="components-body">
                    <svg-icon :icon-class="element.tagIcon" />
                    {{ element.label }}
                  </div>
                </div>
              </draggable>
            </div>
          </el-scrollbar>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8" :lg="12" :xl="16">
        <div class="center-board">
          <div class="action-bar">
            <el-dropdown size="mini" trigger="click" @command="applyPagePreset" style="margin-right:8px">
              <el-button type="text" size="mini" icon="el-icon-document">
                整页模板<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="list-query">查询列表页（表单+表格+分页）</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button icon="el-icon-download" type="text" @click="download">
              导出vue文件
            </el-button>
            <el-button class="copy-btn-main" icon="el-icon-document-copy" type="text" @click="copy">
              复制代码
            </el-button>
            <el-button class="delete-btn" icon="el-icon-delete" type="text" @click="empty">
              清空
            </el-button>
          </div>
          <el-scrollbar class="center-scrollbar">
            <el-row class="center-board-row" :gutter="formConf.gutter">
              <el-form
                :size="formConf.size"
                :label-position="formConf.labelPosition"
                :disabled="formConf.disabled"
                :label-width="formConf.labelWidth + 'px'"
              >
                <draggable
                  class="drawing-board"
                  :list="drawingList"
                  :animation="180"
                  group="componentsGroup"
                  ghost-class="drawing-ghost"
                  chosen-class="drawing-chosen"
                  drag-class="drawing-drag"
                  :empty-insert-threshold="12"
                >
                  <draggable-item
                    v-for="(element, index) in drawingList"
                    :key="element.renderKey"
                    :drawing-list="drawingList"
                    :element="element"
                    :index="index"
                    :active-id="activeId"
                    :form-conf="formConf"
                    @activeItem="activeFormItem"
                    @copyItem="drawingItemCopy"
                    @deleteItem="drawingItemDelete"
                  />
                </draggable>
                <div v-show="!drawingList.length" class="empty-info">
                  从左侧拖入或点选组件进行表单设计
                </div>
              </el-form>
            </el-row>
          </el-scrollbar>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8" :lg="6" :xl="4">
        <right-panel
          :active-data="activeData"
          :form-conf="formConf"
          :show-field="!!drawingList.length"
          @tag-change="tagChange"
        />
      </el-col>
    </el-row>

    <code-type-dialog
      :visible.sync="dialogVisible"
      title="选择生成类型"
      :show-file-name="showFileName"
      @confirm="generate"
    />
    <input id="copyNode" type="hidden">
  </div>
</template>

<script>
import '@/plugins/element-admin'
import draggable from 'vuedraggable'
import { saveAs } from 'file-saver'
import beautifier from 'js-beautify'
import ClipboardJS from 'clipboard'
import render from '@/utils/generator/render'
import RightPanel from './RightPanel'
import {
  inputComponents,
  selectComponents,
  layoutComponents,
  formConf
} from '@/utils/generator/config'
import {
  exportDefault, beautifierConf, isNumberStr, titleCase
} from '@/utils/index'
import {
  makeUpHtml, vueTemplate, vueScript, cssStyle
} from '@/utils/generator/html'
import { makeUpJs } from '@/utils/generator/js'
import { makeUpCss } from '@/utils/generator/css'
import drawingDefalut from '@/utils/generator/drawingDefalut'
import { createListPageDrawing } from '@/utils/generator/pagePresets'
import logo from '@/assets/mai.jpg'
import CodeTypeDialog from './CodeTypeDialog'
import DraggableItem from './DraggableItem'

const emptyActiveData = { style: {}, autosize: {} }
let oldActiveId
let tempActiveData

export default {
  components: {
    draggable,
    render,
    RightPanel,
    CodeTypeDialog,
    DraggableItem
  },
  data() {
    return {
      logo,
      idGlobal: 100,
      formConf,
      inputComponents,
      selectComponents,
      layoutComponents,
      labelWidth: 100,
      drawingList: drawingDefalut,
      drawingData: {},
      activeId: drawingDefalut[0].formId,
      drawerVisible: false,
      formData: {},
      dialogVisible: false,
      generateConf: null,
      showFileName: false,
      activeData: drawingDefalut[0]
    }
  },
  computed: {
    themeColor() {
      return this.$store.state.settings.themeColor;
    }
  },
  watch: {
    // eslint-disable-next-line func-names
    'activeData.label': function (val, oldVal) {
      if (
        this.activeData.placeholder === undefined
        || !this.activeData.tag
        || oldActiveId !== this.activeId
      ) {
        return
      }
      this.activeData.placeholder = this.activeData.placeholder.replace(oldVal, '') + val
    },
    activeId: {
      handler(val) {
        oldActiveId = val
      },
      immediate: true
    }
  },
  mounted() {
    const clipboard = new ClipboardJS('#copyNode', {
      text: trigger => {
        const codeStr = this.generateCode()
        this.$notify({
          title: '成功',
          message: '代码已复制到剪切板，可粘贴。',
          type: 'success'
        })
        return codeStr
      }
    })
    clipboard.on('error', e => {
      this.$message.error('代码复制失败')
    })
  },
  methods: {
    activeStyle() {
      if (!this.themeColor) return {};
      return {
        "color": this.themeColor,
      };
    },
    activeFormItem(element) {
      this.activeData = element
      this.activeId = element.formId
    },
    onEnd(obj, a) {
      if (obj.from !== obj.to) {
        this.activeData = tempActiveData
        this.activeId = this.idGlobal
      }
    },
    addComponent(item) {
      const clone = this.cloneComponent(item)
      this.drawingList.push(clone)
      this.activeFormItem(clone)
    },
    cloneComponent(origin) {
      const clone = JSON.parse(JSON.stringify(origin))
      clone.formId = ++this.idGlobal
      clone.span = clone.span || formConf.span
      clone.renderKey = +new Date() // 改变renderKey后可以实现强制更新组件
      if (!clone.layout) clone.layout = 'colFormItem'
      if (clone.layout === 'colFormItem') {
        // 表格保留 dataKey；按钮不改 placeholder
        if (clone.tag === 'el-table') {
          clone.vModel = clone.dataKey || 'tableData'
          clone.dataKey = clone.dataKey || 'tableData'
        } else if (clone.tag !== 'el-button') {
          clone.vModel = `field${this.idGlobal}`
          clone.placeholder !== undefined && (clone.placeholder += clone.label)
        }
        tempActiveData = clone
      } else if (clone.layout === 'rowFormItem') {
        delete clone.label
        clone.componentName = `row${this.idGlobal}`
        clone.gutter = this.formConf.gutter
        tempActiveData = clone
      }
      return tempActiveData
    },
    /** 套用整页模板：查询列表等 */
    applyPagePreset(cmd) {
      if (cmd !== 'list-query') return
      this.$confirm('将用「查询列表页」模板替换当前画布？', '整页模板', { type: 'warning' })
        .then(() => {
          const pack = createListPageDrawing(this.idGlobal)
          this.drawingList = pack.fields
          this.idGlobal = pack.idGlobal
          Object.assign(this.formConf, pack.formConfPatch)
          if (this.drawingList.length) this.activeFormItem(this.drawingList[0])
          this.$message.success('已套用查询列表页模板')
        })
        .catch(() => {})
    },
    AssembleFormData() {
      this.formData = {
        fields: JSON.parse(JSON.stringify(this.drawingList)),
        ...this.formConf
      }
    },
    generate(data) {
      const func = this[`exec${titleCase(this.operationType)}`]
      this.generateConf = data
      func && func(data)
    },
    execRun(data) {
      this.AssembleFormData()
      this.drawerVisible = true
    },
    execDownload(data) {
      const codeStr = this.generateCode()
      const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, data.fileName)
    },
    execCopy(data) {
      document.getElementById('copyNode').click()
    },
    empty() {
      this.$confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(
        () => {
          this.drawingList = []
        }
      )
    },
    drawingItemCopy(item, parent) {
      let clone = JSON.parse(JSON.stringify(item))
      clone = this.createIdAndKey(clone)
      parent.push(clone)
      this.activeFormItem(clone)
    },
    createIdAndKey(item) {
      item.formId = ++this.idGlobal
      item.renderKey = +new Date()
      if (item.layout === 'colFormItem') {
        item.vModel = `field${this.idGlobal}`
      } else if (item.layout === 'rowFormItem') {
        item.componentName = `row${this.idGlobal}`
      }
      if (Array.isArray(item.children)) {
        item.children = item.children.map(childItem => this.createIdAndKey(childItem))
      }
      return item
    },
    drawingItemDelete(index, parent) {
      parent.splice(index, 1)
      this.$nextTick(() => {
        const len = this.drawingList.length
        if (len) {
          this.activeFormItem(this.drawingList[len - 1])
        }
      })
    },
    generateCode() {
      const { type } = this.generateConf
      this.AssembleFormData()
      const script = vueScript(makeUpJs(this.formData, type))
      const html = vueTemplate(makeUpHtml(this.formData, type))
      const css = cssStyle(makeUpCss(this.formData))
      return beautifier.html(html + script + css, beautifierConf.html)
    },
    download() {
      this.dialogVisible = true
      this.showFileName = true
      this.operationType = 'download'
    },
    run() {
      this.dialogVisible = true
      this.showFileName = false
      this.operationType = 'run'
    },
    copy() {
      this.dialogVisible = true
      this.showFileName = false
      this.operationType = 'copy'
    },
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag)
      newTag.vModel = this.activeData.vModel
      newTag.formId = this.activeId
      newTag.span = this.activeData.span
      delete this.activeData.tag
      delete this.activeData.tagIcon
      delete this.activeData.document
      Object.keys(newTag).forEach(key => {
        if (this.activeData[key] !== undefined
          && typeof this.activeData[key] === typeof newTag[key]) {
          newTag[key] = this.activeData[key]
        }
      })
      this.activeData = newTag
      this.updateDrawingList(newTag, this.drawingList)
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex(item => item.formId === this.activeId)
      if (index > -1) {
        list.splice(index, 1, newTag)
      } else {
        list.forEach(item => {
          if (Array.isArray(item.children)) this.updateDrawingList(newTag, item.children)
        })
      }
    }
  }
}
</script>

<style lang='scss'>
body, html{
  margin: 0;
  padding: 0;
  background: #fff;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
}

input, textarea{
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
}

.editor-tabs{
  background: #121315;
  .el-tabs__header{
    margin: 0;
    border-bottom-color: #121315;
    .el-tabs__nav{
      border-color: #121315;
    }
  }
  .el-tabs__item{
    height: 32px;
    line-height: 32px;
    color: #888a8e;
    border-left: 1px solid #121315 !important;
    background: #363636;
    margin-right: 5px;
    user-select: none;
  }
  .el-tabs__item.is-active{
    background: #1e1e1e;
    border-bottom-color: #1e1e1e!important;
    color: #fff;
  }
  .el-icon-edit{
    color: #f1fa8c;
  }
  .el-icon-document{
    color: #a95812;
  }
}

// home
.right-scrollbar {
  .el-scrollbar__view {
    padding: 12px 18px 15px 15px;
  }
}
.left-scrollbar .el-scrollbar__wrap {
  box-sizing: border-box;
  overflow-x: hidden !important;
  margin-bottom: 0 !important;
}
.center-tabs{
  .el-tabs__header{
    margin-bottom: 0!important;
  }
  .el-tabs__item{
    width: 50%;
    text-align: center;
  }
  .el-tabs__nav{
    width: 100%;
  }
}
.reg-item{
  padding: 12px 6px;
  background: #f8f8f8;
  position: relative;
  border-radius: 4px;
  .close-btn{
    position: absolute;
    right: -6px;
    top: -6px;
    display: block;
    width: 16px;
    height: 16px;
    line-height: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    color: #fff;
    text-align: center;
    z-index: 1;
    cursor: pointer;
    font-size: 12px;
    &:hover{
      background: rgba(210, 23, 23, 0.5)
    }
  }
  & + .reg-item{
    margin-top: 18px;
  }
}
.action-bar{
  & .el-button+.el-button {
    margin-left: 15px;
  }
  & i {
    font-size: 20px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
}

.custom-tree-node{
  width: 100%;
  font-size: 14px;
  .node-operation{
    float: right;
  }
  i[class*="el-icon"] + i[class*="el-icon"]{
    margin-left: 6px;
  }
  .el-icon-plus{
    color: var(--theme-color, #5f7d80);
  }
  .el-icon-delete{
    color: #157a0c;
  }
}

.left-scrollbar .el-scrollbar__view{
  overflow-x: hidden;
}

.el-rate{
  display: inline-block;
  vertical-align: text-top;
}
.el-upload__tip{
  line-height: 1.2;
}

$selectedColor: var(--theme-color-muted, rgba(95, 125, 128, 0.14));
$lighterBlue: var(--theme-color, #5f7d80);

.container {
  /* position: relative; */
  width: 100%;
  height: 100%;
  background: var(--background-origin, #fffcf8);
  color: var(--text-color-2, #303133);
}

.components-list {
  padding: 8px;
  box-sizing: border-box;
  height: 100%;
  .components-item {
    display: inline-block;
    width: 48%;
    margin: 1%;
    transition: transform 0ms !important;
  }
}
.components-draggable{
  padding-bottom: 20px;
}
.components-title{
  font-size: 14px;
  color: var(--navbarFont, #2c2a28);
  margin: 6px 2px;
  .svg-icon{
    color: var(--theme-color, #5f7d80);
    font-size: 18px;
  }
}

.components-body {
  padding: 8px 10px;
  background: $selectedColor;
  font-size: 12px;
  cursor: move;
  border: 1px dashed var(--border-color-2, #d4cfc8);
  border-radius: 6px;
  color: var(--text-color-2, #303133);
  .svg-icon{
    color: var(--muted-1-color, #8a8580);
    font-size: 15px;
  }
  &:hover {
    border: 1px dashed $lighterBlue;
    color: $lighterBlue;
    .svg-icon {
      color: $lighterBlue;
    }
  }
}

.left-board {
  /* width: 260px;
  position: absolute;
  left: 0;
  top: 0; */
  height: 100vh;
}
.left-scrollbar{
  height: calc(100vh - 42px);
  overflow: hidden;
}
.center-scrollbar {
  height: calc(100vh - 42px);
  overflow: hidden;
  border-left: 1px solid var(--border-color, #ebe6e0);
  border-right: 1px solid var(--border-color, #ebe6e0);
  box-sizing: border-box;
  background: var(--background-2, #f3f0eb);
  .el-scrollbar__wrap {
    overflow-x: hidden !important;
  }
  .el-scrollbar__view {
    max-width: 100%;
    box-sizing: border-box;
  }
}
.center-board {
  height: 100vh;
  width: auto;
  /* margin: 0 350px 0 260px; */
  box-sizing: border-box;
}
.empty-info{
  position: absolute;
  top: 46%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 16px;
  color: var(--muted-1-color, #8a8580);
  letter-spacing: 2px;
}
.action-bar{
  position: relative;
  height: 42px;
  white-space: nowrap;
  overflow: auto;
  text-align: right;
  padding: 0 15px;
  box-sizing: border-box;
  border: 1px solid var(--border-color, #ebe6e0);
  border-top: none;
  border-left: none;
  background: var(--background-origin, #fffcf8);
  .delete-btn{
    color: var(--red, #F56C6C);
  }
}
.logo-wrapper{
  position: relative;
  height: 42px;
  background: var(--background-origin, #fffcf8);
  border-bottom: 1px solid var(--border-color, #ebe6e0);
  box-sizing: border-box;
}
.logo{
  position: absolute;
  left: 12px;
  top: 6px;
  line-height: 30px;
  color: var(--theme-color, #5f7d80);
  font-weight: 600;
  font-size: 17px;
  white-space: nowrap;
  > img{
    width: 30px;
    height: 30px;
    vertical-align: top;
  }
  .github{
    display: inline-block;
    vertical-align: sub;
    margin-left: 15px;
    > img{
      height: 22px;
    }
  }
}

.center-board-row {
  padding: 12px 12px 15px 12px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  & > .el-form {
    // 69 = 12+15+42
    height: calc(100vh - 69px);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
}
.drawing-board {
  height: 100%;
  width: 100%;
  max-width: 100%;
  position: relative;
  box-sizing: border-box;
  overflow-x: hidden;
  /* 防止 gutter 负 margin 撑破画布 */
  .el-row {
    max-width: 100%;
    box-sizing: border-box;
  }
  .el-col {
    max-width: 100%;
    box-sizing: border-box;
  }
  .components-body {
    padding: 0;
    margin: 0;
    font-size: 0;
  }
  /* 占位鬼影：固定高度，避免拖入行列时反复撑高抖动 */
  .drawing-ghost,
  .sortable-ghost {
    position: relative;
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    margin: 4px 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    opacity: 0.55;
    background: $selectedColor !important;
    border: 1px dashed $lighterBlue !important;
    border-radius: 4px;
    box-sizing: border-box !important;
    &::before {
      content: " ";
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 3px;
      background: $lighterBlue;
      z-index: 2;
    }
    /* 鬼影内控件全部隐藏，减少布局计算 */
    > * {
      visibility: hidden !important;
      height: 0 !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }
  }
  .drawing-chosen {
    opacity: 0.92;
  }
  .drawing-drag {
    opacity: 0.85;
  }
  .components-item.sortable-ghost,
  .components-item.drawing-ghost {
    width: 100% !important;
    height: 48px !important;
    background-color: $selectedColor;
  }
  .active-from-item {
    & > .el-form-item{
      background: $selectedColor;
      border-radius: 6px;
    }
    & > .drawing-item-copy, & > .drawing-item-delete{
      display: initial;
    }
    & > .component-name{
      color: $lighterBlue;
    }
  }
  .el-form-item{
    margin-bottom: 15px;
    max-width: 100%;
    box-sizing: border-box;
  }
  /* 画布内表单控件不超出列宽 */
  .el-input,
  .el-select,
  .el-cascader,
  .el-date-editor,
  .el-autocomplete,
  .el-textarea,
  .el-slider,
  .el-rate,
  .el-upload,
  .el-input-number,
  .el-color-picker {
    max-width: 100%;
  }
  .el-select,
  .el-cascader,
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100% !important;
  }
  .el-input-number {
    width: 100%;
  }
}
.drawing-item{
  position: relative;
  cursor: move;
  max-width: 100%;
  box-sizing: border-box;
  &.unfocus-bordered:not(.activeFromItem) > div:first-child  {
    border: 1px dashed #ccc;
  }
  .el-form-item{
    padding: 12px 10px;
    max-width: 100%;
    box-sizing: border-box;
  }
}
.drawing-row-col {
  max-width: 100%;
  box-sizing: border-box;
}
.drawing-row-item{
  position: relative;
  cursor: move;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  border: 1px dashed #ccc;
  border-radius: 3px;
  padding: 22px 6px 8px;
  margin-bottom: 12px;
  .drawing-row-item {
    margin-bottom: 2px;
  }
  /* 原先 margin-top:22 在拖入时反复撑高导致抖动，改为用父级 padding-top 预留标题 */
  .el-col{
    margin-top: 0;
  }
  .el-form-item{
    margin-bottom: 0;
  }
  .drag-wrapper{
    min-height: 72px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  &.active-from-item{
    border: 1px dashed $lighterBlue;
  }
  .component-name{
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    color: #bbb;
    display: inline-block;
    padding: 0 6px;
  }
}
.drawing-item, .drawing-row-item{
  &:hover {
    & > .el-form-item{
      background: $selectedColor;
      border-radius: 6px;
    }
    & > .drawing-item-copy, & > .drawing-item-delete{
      display: initial;
    }
  }
  & > .drawing-item-copy, & > .drawing-item-delete{
    display: none;
    position: absolute;
    top: -11px;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 50%;
    font-size: 12px;
    border: 1px solid;
    cursor: pointer;
    z-index: 1;
    .el-button {
      display: block;
      width: 20px;
      height: 20px;
      padding: 0;
      margin: 0;
    }
  }
  & > .drawing-item-copy{
    right: 56px;
    border-color: $lighterBlue;
    color: $lighterBlue;
    background: #fff;
    &:hover{
      background: $lighterBlue;
      color: #fff;
    }
  }
  & > .drawing-item-delete{
    right: 24px;
    border-color: #F56C6C;
    color: #F56C6C;
    background: #fff;
    &:hover{
      background: #F56C6C;
      color: #fff;
    }
  }
}

</style>
