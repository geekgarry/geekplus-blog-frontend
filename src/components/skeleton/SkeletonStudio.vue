<template>
  <div class="skel-studio gp-tool-app">
    <!-- 工具栏分组：主操作 / 模板 / 导出 / 识别，避免一排按钮换行挤乱 -->
    <section class="gp-tool-toolbar skel-toolbar">
      <div class="skel-toolbar__group">
        <el-input v-model="schema.name" size="small" class="skel-name" placeholder="骨架名称" @change="persist" />
        <el-button size="mini" icon="el-icon-folder-checked" @click="persist(true)">保存</el-button>
        <el-button size="mini" plain @click="resetSchema">重置</el-button>
      </div>
      <span class="gp-tool-toolbar__sep" />
      <div class="skel-toolbar__group">
        <!-- <el-dropdown size="mini" split-button type="primary" @click="openPresetMenu" @command="onPresetCommand">
          <span>重置版块</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item divided disabled>重置套用版块</el-dropdown-item>
            <el-dropdown-item
              v-for="p in presets"
              :key="p.id"
              :command="'replace:' + p.id"
            >
              {{ p.name }}
              <span class="skel-preset-desc">{{ p.desc }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown size="mini" split-button type="success" @open="openPresetMenu" @command="onPresetCommand">
          <span>添加版块</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item divided disabled>追加到末尾</el-dropdown-item>
            <el-dropdown-item
              v-for="p in presets"
              :key="'a-' + p.id"
              :command="'append:' + p.id"
            >
              + {{ p.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown> -->
        <!-- 版块多时用 select + 滚动，避免 dropdown 高度撑爆视口 -->
        <el-select
          ref="presetReplaceSelect"
          v-model="presetReplaceId"
          size="mini"
          class="skel-preset-select"
          filterable
          clearable
          placeholder="重置版块…"
          popper-class="skel-preset-select-popper"
          @change="onPresetReplaceChange"
        >
          <el-option
            v-for="p in presets"
            :key="'r-' + p.id"
            :label="p.name"
            :value="p.id"
          >
            <span class="skel-preset-opt__name">{{ p.name }}</span>
            <span class="skel-preset-opt__desc">{{ p.desc }}</span>
          </el-option>
        </el-select>
        <el-select
          v-model="presetAppendId"
          size="mini"
          class="skel-preset-select"
          filterable
          clearable
          placeholder="添加版块…"
          popper-class="skel-preset-select-popper"
          @change="onPresetAppendChange"
        >
          <el-option
            v-for="p in presets"
            :key="'a-' + p.id"
            :label="p.name"
            :value="p.id"
          >
            <span class="skel-preset-opt__name">{{ p.name }}</span>
            <span class="skel-preset-opt__desc">{{ p.desc }}</span>
          </el-option>
        </el-select>
        <el-button size="mini" type="primary" plain @click="insertHeaderPreset">头像|文案</el-button>
      </div>
      <span class="gp-tool-toolbar__sep" />
      <div class="skel-toolbar__group">
        <el-dropdown size="mini" split-button type="danger" @command="onExportCommand">
          <!-- <el-button size="mini">
            导出 / 复制 <i class="el-icon-arrow-down el-icon--right" />
          </el-button> -->
          <span>导出 / 复制</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="copyLayout">复制布局 HTML</el-dropdown-item>
            <el-dropdown-item command="copyStyle">复制样式 CSS</el-dropdown-item>
            <el-dropdown-item command="copyCombined">复制布局+样式</el-dropdown-item>
            <el-dropdown-item divided command="downloadBoth">下载 HTML+CSS</el-dropdown-item>
            <el-dropdown-item command="downloadVue">下载 .vue</el-dropdown-item>
            <el-dropdown-item command="copyJson">复制 Schema JSON</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button size="mini" icon="el-icon-upload2" type="warning" plain @click="importVisible = true">
          识别导入
        </el-button>
      </div>
    </section>

    <div class="skel-workspace">
      <aside class="gp-tool-panel skel-palette">
        <h2 class="gp-tool-panel__title">组件库</h2>
        <p class="skel-hint">拖入中间结构区；也可点击添加。先放「横向行」再嵌套，可做左右布局。</p>

        <div class="skel-palette__section">
          <div class="skel-palette__section-title">布局</div>
          <draggable
            class="skel-palette__grid"
            :list="paletteLayout"
            :group="{ name: 'skelGroup', pull: 'clone', put: false }"
            :clone="clonePalette"
            :sort="false"
          >
            <div
              v-for="item in paletteLayout"
              :key="item.type"
              class="skel-palette__item is-layout"
              @click="addNode(item.type)"
            >
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
            </div>
          </draggable>
        </div>

        <div class="skel-palette__section">
          <div class="skel-palette__section-title">占位块</div>
          <draggable
            class="skel-palette__grid"
            :list="paletteLeaf"
            :group="{ name: 'skelGroup', pull: 'clone', put: false }"
            :clone="clonePalette"
            :sort="false"
          >
            <div
              v-for="item in paletteLeaf"
              :key="item.type"
              class="skel-palette__item"
              @click="addNode(item.type)"
            >
              <i :class="item.icon" />
              <span>{{ item.label }}</span>
            </div>
          </draggable>
        </div>
      </aside>

      <main class="gp-tool-panel skel-canvas-wrap">
        <div class="skel-canvas-split">
          <section class="skel-canvas-col">
            <h2 class="gp-tool-panel__title">结构编辑</h2>
            <div class="skel-canvas-frame" @click="activeId = ''">
              <draggable
                class="skel-canvas-drag"
                :list="schema.nodes"
                :group="{ name: 'skelGroup' }"
                animation="200"
                @change="persist"
              >
                <SkeletonTreeItem
                  v-for="node in schema.nodes"
                  :key="node.id"
                  :node="node"
                  :active-id="activeId"
                  @select="selectNode"
                  @copy="copyNodeByRef"
                  @remove="removeNodeByRef"
                  @change="persist"
                />
              </draggable>
              <p v-if="!schema.nodes.length" class="skel-empty">从左侧拖入或点击添加组件</p>
            </div>
          </section>
          <section class="skel-canvas-col skel-canvas-col--preview">
            <h2 class="gp-tool-panel__title">实时预览</h2>
            <div class="skel-full-preview">
              <SkeletonRenderer :schema="schema" :active-id="activeId" @select="selectNode" />
            </div>
          </section>
        </div>
      </main>

      <aside class="gp-tool-panel skel-props">
        <h2 class="gp-tool-panel__title">{{ activeNode ? '节点属性' : '画布属性' }}</h2>

        <template v-if="!activeNode">
          <div class="gp-form-field">
            <label class="gp-form-label">画布宽度 (px)</label>
            <el-input-number v-model="schema.canvas.width" size="small" :min="280" :max="1200" controls-position="right" @change="persist" />
          </div>
          <div class="gp-form-field">
            <label class="gp-form-label">内边距 (px)</label>
            <el-input-number v-model="schema.canvas.padding" size="small" :min="0" :max="64" controls-position="right" @change="persist" />
          </div>
          <div class="gp-form-field">
            <label class="gp-form-label">根节点纵向间距 (px)</label>
            <el-input-number v-model="schema.canvas.gap" size="small" :min="0" :max="48" controls-position="right" @change="persist" />
          </div>
        </template>

        <template v-else>
          <p class="skel-type-tag">{{ typeLabel(activeNode.type) }}</p>

          <!-- 布局容器：行 / 组 -->
          <template v-if="activeNode.type === 'row'">
            <div class="gp-form-field">
              <label class="gp-form-label">列间距 (px)</label>
              <el-input-number v-model="activeNode.gap" size="small" :min="0" :max="48" controls-position="right" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">垂直对齐</label>
              <el-select v-model="activeNode.align" size="small" class="gp-form-control" @change="persist">
                <el-option v-for="o in alignOptions" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">水平分布</label>
              <el-select v-model="activeNode.justify" size="small" class="gp-form-control" @change="persist">
                <el-option v-for="o in justifyOptions" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">行宽</label>
              <el-input v-model="activeNode.width" size="small" placeholder="100%" @change="persist" />
            </div>
          </template>

          <template v-if="activeNode.type === 'stack'">
            <div class="gp-form-field">
              <label class="gp-form-label">组内间距 (px)</label>
              <el-input-number v-model="activeNode.gap" size="small" :min="0" :max="48" controls-position="right" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">弹性占比 flex（在横向行内）</label>
              <el-input-number v-model="activeNode.flex" size="small" :min="0" :max="12" :step="1" controls-position="right" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">固定宽度（可选，覆盖 flex）</label>
              <el-input v-model="activeNode.width" size="small" placeholder="如 120 / 40%" @change="persist" />
            </div>
          </template>

          <!-- 叶子：在 row 内也可用 flex 占宽 -->
          <div
            v-if="activeNode.type !== 'row' && activeNode.type !== 'gap'"
            class="gp-form-field"
          >
            <label class="gp-form-label">弹性占比 flex（左右布局时）</label>
            <el-input-number
              v-model="activeNode.flex"
              size="small"
              :min="0"
              :max="12"
              controls-position="right"
              @change="persist"
            />
          </div>

          <div v-if="activeNode.type === 'circle'" class="gp-form-field">
            <label class="gp-form-label">直径 (px)</label>
            <el-input-number v-model="activeNode.size" size="small" :min="16" :max="200" controls-position="right" @change="persist" />
          </div>

          <template v-if="activeNode.type === 'line' || activeNode.type === 'lines' || activeNode.type === 'block' || activeNode.type === 'field' || activeNode.type === 'textarea'">
            <div class="gp-form-field">
              <label class="gp-form-label">宽度（如 100% / 70% / 200）</label>
              <el-input v-model="activeNode.width" size="small" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">高度 (px)</label>
              <el-input-number v-model="activeNode.height" size="small" :min="4" :max="480" controls-position="right" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">圆角 (px)</label>
              <el-input-number v-model="activeNode.radius" size="small" :min="0" :max="64" controls-position="right" @change="persist" />
            </div>
          </template>

          <template v-if="activeNode.type === 'lines'">
            <div class="gp-form-field">
              <label class="gp-form-label">行数</label>
              <el-input-number v-model="activeNode.count" size="small" :min="1" :max="12" controls-position="right" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">行间距 (px)</label>
              <el-input-number v-model="activeNode.gap" size="small" :min="0" :max="32" controls-position="right" @change="persist" />
            </div>
            <div class="gp-form-field">
              <label class="gp-form-label">末行宽度</label>
              <el-input v-model="activeNode.lastWidth" size="small" @change="persist" />
            </div>
          </template>

          <div v-if="activeNode.type === 'gap'" class="gp-form-field">
            <label class="gp-form-label">高度 (px)</label>
            <el-input-number v-model="activeNode.height" size="small" :min="4" :max="120" controls-position="right" @change="persist" />
          </div>
        </template>
      </aside>
    </div>

    <el-drawer
      :visible.sync="codeVisible"
      direction="rtl"
      size="min(520px, 96vw)"
      custom-class="gp-settings-drawer"
      append-to-body
      :title="codeTitle"
    >
      <div class="skel-code-panel">
        <el-button size="mini" type="primary" @click="copyCodePanel">复制当前内容</el-button>
        <pre class="skel-code">{{ codeText }}</pre>
      </div>
    </el-drawer>

    <!-- P1 粘贴/文件 → P2 URL → P3 图片 AI -->
    <el-drawer
      :visible.sync="importVisible"
      direction="rtl"
      size="min(480px, 96vw)"
      custom-class="gp-settings-drawer"
      append-to-body
      title="识别导入骨架"
    >
      <div class="skel-import-panel">
        <el-tabs v-model="importTab">
          <el-tab-pane label="P1 粘贴/文件" name="paste">
            <p class="skel-hint">粘贴 Schema JSON、HTML 或 Vue SFC；也可上传 .json/.html/.vue/.txt</p>
            <el-input
              v-model="importPaste"
              type="textarea"
              :rows="10"
              placeholder="在此粘贴布局代码…"
            />
            <div class="skel-import-acts">
              <input ref="importFile" type="file" class="skel-hidden-file" accept=".json,.html,.htm,.vue,.txt,text/*" @change="onImportFile" />
              <el-button size="mini" @click="$refs.importFile && $refs.importFile.click()">选择文件</el-button>
              <el-button size="mini" type="primary" :loading="importLoading" @click="runPasteImport('replace')">替换导入</el-button>
              <el-button size="mini" plain :loading="importLoading" @click="runPasteImport('append')">追加导入</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="P2 网址" name="url">
            <p class="skel-hint">后端代理抓取公开页 HTML（SPA 动态页可能不全），再本地启发式转 Schema</p>
            <el-input v-model="importUrl" size="small" placeholder="https://example.com/page" clearable />
            <div class="skel-import-acts">
              <el-button size="mini" type="primary" :loading="importLoading" @click="runUrlImport('replace')">抓取并替换</el-button>
              <el-button size="mini" plain :loading="importLoading" @click="runUrlImport('append')">抓取并追加</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="P3 图片 AI" name="image">
            <p class="skel-hint">上传界面截图/设计图，走站点 AI 生成骨架 JSON（需后端 AI 已配置）</p>
            <input ref="importImage" type="file" class="skel-hidden-file" accept="image/*" @change="onImportImage" />
            <el-button size="mini" icon="el-icon-picture" @click="$refs.importImage && $refs.importImage.click()">
              {{ importImageName || '选择图片' }}
            </el-button>
            <div class="skel-import-acts">
              <el-button size="mini" type="primary" :loading="importLoading" :disabled="!importImagePayload" @click="runImageImport('replace')">
                AI 识别并替换
              </el-button>
              <el-button size="mini" plain :loading="importLoading" :disabled="!importImagePayload" @click="runImageImport('append')">
                AI 识别并追加
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
        <p v-if="importStatus" class="skel-import-status">{{ importStatus }}</p>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import SkeletonRenderer from './SkeletonRenderer.vue'
import SkeletonTreeItem from './SkeletonTreeItem.vue'
import {
  SKELETON_PALETTE,
  LAYOUT_ALIGN_OPTIONS,
  LAYOUT_JUSTIFY_OPTIONS,
  createSkeletonNode,
  cloneSkeletonNode,
  defaultSkeletonSchema,
  loadSkeletonSchema,
  saveSkeletonSchema,
  findNodeInTree,
} from './skeletonSchema'
import { SKELETON_PRESETS, applySkeletonPreset } from './skeletonPresets'
import { importLayoutText, readFileAsText, compressImageToBase64 } from './skeletonImport'
import { fetchSkeletonUrl, skeletonFromImage } from '@/api/skeleton'
import { extractAiPayload, parseAiJson } from '@/utils/resumeAiPayload'
import {
  exportLayoutHtml,
  exportStyleCss,
  exportCombinedSnippet,
  exportVueSfc,
  downloadLayoutAndStyle,
  downloadTextFile,
} from './skeletonExport'

export default {
  name: 'SkeletonStudio',
  components: { draggable, SkeletonRenderer, SkeletonTreeItem },
  data() {
    return {
      schema: loadSkeletonSchema(),
      palette: SKELETON_PALETTE.map((p) => ({ ...p })),
      presets: SKELETON_PRESETS,
      alignOptions: LAYOUT_ALIGN_OPTIONS,
      justifyOptions: LAYOUT_JUSTIFY_OPTIONS,
      activeId: '',
      codeVisible: false,
      codeTitle: '',
      codeText: '',
      importVisible: false,
      importTab: 'paste',
      importPaste: '',
      importUrl: '',
      importLoading: false,
      importStatus: '',
      importImageName: '',
      importImagePayload: null,
      /** 版块 select：选中后立刻套用并清空，避免残留选中态 */
      presetReplaceId: '',
      presetAppendId: '',
    }
  },
  computed: {
    activeNode() {
      if (!this.activeId) return null
      const hit = findNodeInTree(this.schema.nodes, this.activeId)
      return hit ? hit.node : null
    },
    // 组件库分区：布局容器 vs 叶子占位（与表单构建「布局型/输入型」同交互，数据模型不同）
    paletteLayout() {
      return (this.palette || []).filter((p) => p.kind === 'layout')
    },
    paletteLeaf() {
      return (this.palette || []).filter((p) => p.kind !== 'layout')
    },
  },
  methods: {
    onExportCommand(cmd) {
      const map = {
        copyLayout: () => this.copyLayout(),
        copyStyle: () => this.copyStyle(),
        copyCombined: () => this.copyCombined(),
        downloadBoth: () => this.downloadBoth(),
        downloadVue: () => this.downloadVue(),
        copyJson: () => this.copyJson(),
      }
      if (map[cmd]) map[cmd]()
    },
    typeLabel(type) {
      const hit = SKELETON_PALETTE.find((p) => p.type === type)
      return (hit && hit.label) || type
    },
    clonePalette(item) {
      return createSkeletonNode(item.type)
    },
    addNode(type) {
      // 若当前选中容器，则往容器内追加；否则挂到根
      const active = this.activeNode
      if (active && (active.type === 'row' || active.type === 'stack')) {
        if (!Array.isArray(active.children)) this.$set(active, 'children', [])
        active.children.push(createSkeletonNode(type))
      } else {
        this.schema.nodes.push(createSkeletonNode(type))
      }
      this.persist()
    },
    /** 一键插入常见左右布局：头像 + 文案组 */
    insertHeaderPreset() {
      this.applyPreset('avatar-text', 'append')
    },
    onPresetReplaceChange(id) {
      if (!id) return
      this.applyPreset(id, 'replace')
      this.$nextTick(() => {
        this.presetReplaceId = id
        this.$refs.presetReplaceSelect.blur()
      })
    },
    onPresetAppendChange(id) {
      if (!id) return
      this.applyPreset(id, 'append')
      this.$nextTick(() => {
        this.presetAppendId = id
      })
    },
    applyPreset(presetId, mode) {
      const result = applySkeletonPreset(presetId)
      if (!result) return
      if (mode === 'append') {
        this.schema.nodes = this.schema.nodes.concat(result.nodes)
      } else {
        this.$confirm('将用该模板替换当前全部节点？可改选「添加」。', '套用模板', { type: 'warning' })
          .then(() => {
            this.schema.nodes = result.nodes
            this.activeId = ''
            this.persist(true)
          })
          .catch(() => {})
        return
      }
      this.persist(true)
    },
    applyImportedSchema(schema, mode, label) {
      if (!schema || !Array.isArray(schema.nodes)) {
        this.$message.error('导入结果无效')
        return
      }
      if (mode === 'append') {
        this.schema.nodes = this.schema.nodes.concat(schema.nodes)
      } else {
        this.schema = {
          ...this.schema,
          name: schema.name || this.schema.name,
          canvas: { ...this.schema.canvas, ...(schema.canvas || {}) },
          nodes: schema.nodes,
          version: schema.version || this.schema.version,
        }
        this.activeId = ''
      }
      this.persist(true)
      this.importStatus = `${label || '导入'}成功：${schema.nodes.length} 个根节点`
      this.$message.success(this.importStatus)
    },
    runPasteImport(mode) {
      const result = importLayoutText(this.importPaste)
      if (result.error) {
        this.$message.warning(result.error)
        this.importStatus = result.error
        return
      }
      this.applyImportedSchema(result.schema, mode, 'P1 ' + result.source)
    },
    async onImportFile(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.importLoading = true
      try {
        const text = await readFileAsText(file)
        this.importPaste = text
        const result = importLayoutText(text, file.name)
        if (result.error) {
          this.$message.warning(result.error)
          this.importStatus = result.error
          return
        }
        this.applyImportedSchema(result.schema, 'replace', 'P1 文件')
        this.importTab = 'paste'
      } catch (err) {
        this.$message.error((err && err.message) || '读取失败')
      } finally {
        this.importLoading = false
        e.target.value = ''
      }
    },
    async runUrlImport(mode) {
      const url = (this.importUrl || '').trim()
      if (!/^https?:\/\//i.test(url)) {
        this.$message.warning('请输入以 http(s):// 开头的网址')
        return
      }
      this.importLoading = true
      this.importStatus = '抓取中…'
      try {
        const res = await fetchSkeletonUrl(url)
        const html = (res && res.data && (res.data.html || res.data)) || ''
        if (typeof html !== 'string' || !html.trim()) {
          throw new Error((res && res.msg) || '未获取到 HTML')
        }
        const result = importLayoutText(html, url)
        if (result.error) throw new Error(result.error)
        if (result.schema && !result.schema.name) result.schema.name = 'URL 导入'
        this.applyImportedSchema(result.schema, mode, 'P2 URL')
      } catch (err) {
        const msg = (err && (err.msg || err.message)) || '抓取失败'
        this.importStatus = msg
        this.$message.error(msg)
      } finally {
        this.importLoading = false
      }
    },
    async onImportImage(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.importLoading = true
      try {
        const packed = await compressImageToBase64(file, 1280)
        this.importImagePayload = packed
        this.importImageName = file.name
        this.importStatus = `已选图片 ${packed.width}×${packed.height}`
      } catch (err) {
        this.$message.error((err && err.message) || '图片处理失败')
        this.importImagePayload = null
        this.importImageName = ''
      } finally {
        this.importLoading = false
        e.target.value = ''
      }
    },
    async runImageImport(mode) {
      if (!this.importImagePayload) {
        this.$message.warning('请先选择图片')
        return
      }
      this.importLoading = true
      this.importStatus = 'AI 识别中…'
      try {
        const res = await skeletonFromImage({
          mediaData: this.importImagePayload.base64,
          mediaMimeType: this.importImagePayload.mimeType,
        })
        let raw = extractAiPayload(res)
        if (raw && typeof raw === 'object' && raw.schema) raw = raw.schema
        if (typeof raw === 'string') raw = parseAiJson(raw) || raw
        // 兼容 AI 直接返回 nodes 或完整 schema / 包在 data 字符串里
        let schemaObj = raw
        if (typeof schemaObj === 'string') {
          const again = parseAiJson(schemaObj)
          schemaObj = again || null
        }
        if (schemaObj && schemaObj.data && !schemaObj.nodes) {
          schemaObj = typeof schemaObj.data === 'string' ? parseAiJson(schemaObj.data) : schemaObj.data
        }
        const textDump = typeof raw === 'string' ? raw : JSON.stringify(raw || {})
        const imported = importLayoutText(textDump)
        if (imported.error && schemaObj && schemaObj.nodes) {
          this.applyImportedSchema(
            {
              version: 2,
              name: '图片识别',
              canvas: schemaObj.canvas || this.schema.canvas,
              nodes: schemaObj.nodes,
            },
            mode,
            'P3 图片'
          )
        } else if (imported.error) {
          throw new Error(imported.error)
        } else {
          imported.schema.name = imported.schema.name || '图片识别'
          this.applyImportedSchema(imported.schema, mode, 'P3 图片')
        }
      } catch (err) {
        const msg = (err && (err.msg || err.message)) || 'AI 识别失败'
        this.importStatus = msg
        this.$message.error(msg)
      } finally {
        this.importLoading = false
      }
    },
    selectNode(node) {
      this.activeId = node && node.id
    },
    copyNodeByRef(node) {
      const hit = findNodeInTree(this.schema.nodes, node.id)
      if (!hit) return
      const copy = cloneSkeletonNode(hit.node)
      hit.parentList.splice(hit.index + 1, 0, copy)
      this.activeId = copy.id
      this.persist()
    },
    removeNodeByRef(node) {
      const hit = findNodeInTree(this.schema.nodes, node.id)
      if (!hit) return
      hit.parentList.splice(hit.index, 1)
      if (this.activeId === node.id) this.activeId = ''
      this.persist()
    },
    persist(showMsg) {
      saveSkeletonSchema(this.schema)
      if (showMsg === true) this.$message.success('已保存到本地')
    },
    resetSchema() {
      this.$confirm('恢复为默认示例骨架？当前编辑会覆盖。', '提示', { type: 'warning' })
        .then(() => {
          this.schema = defaultSkeletonSchema()
          this.activeId = ''
          this.persist()
        })
        .catch(() => {})
    },
    async copyText(text, okMsg) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        this.$message.success(okMsg || '已复制')
      } catch (e) {
        this.openCode('请手动复制', text)
      }
    },
    openCode(title, text) {
      this.codeTitle = title
      this.codeText = text
      this.codeVisible = true
    },
    copyLayout() {
      const html = exportLayoutHtml(this.schema)
      this.copyText(html, '布局 HTML 已复制')
      this.openCode('布局 HTML', html)
    },
    copyStyle() {
      const css = exportStyleCss(this.schema)
      this.copyText(css, '样式 CSS 已复制')
      this.openCode('样式 CSS', css)
    },
    copyCombined() {
      const all = exportCombinedSnippet(this.schema)
      this.copyText(all, '布局+样式已复制')
      this.openCode('布局 + 样式', all)
    },
    copyJson() {
      const json = JSON.stringify(this.schema, null, 2)
      this.copyText(json, 'Schema JSON 已复制')
      this.openCode('Schema JSON', json)
    },
    copyCodePanel() {
      this.copyText(this.codeText, '已复制')
    },
    downloadBoth() {
      downloadLayoutAndStyle(this.schema)
      this.$message.success('已下载 layout.html 与 style.css')
    },
    downloadVue() {
      const name = ((this.schema && this.schema.name) || 'skeleton').replace(/[\\/:*?"<>|]/g, '_')
      downloadTextFile(name + '.vue', exportVueSfc(this.schema), 'text/plain;charset=utf-8')
      this.$message.success('已下载 Vue 单文件组件')
    },
  },
}
</script>

<style scoped>
.skel-toolbar {
  margin-bottom: 12px;
  flex-wrap: wrap;
  row-gap: 8px;
}
.skel-toolbar__group {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.skel-name {
  width: min(180px, 36vw);
}
.skel-preset-select {
  width: 148px;
}
.skel-preset-opt__name {
  float: left;
}
.skel-preset-opt__desc {
  float: right;
  margin-left: 12px;
  font-size: 12px;
  color: var(--muted-1-color);
}
.skel-workspace {
  display: grid;
  /* 左窄组件库 · 中结构+预览 · 右属性；大屏更易一眼对照 */
  grid-template-columns: minmax(168px, 200px) minmax(0, 1fr) minmax(220px, 260px);
  gap: 12px;
  align-items: start;
}
.skel-palette,
.skel-props {
  position: sticky;
  top: 8px;
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.skel-palette__section {
  margin-bottom: 12px;
}
.skel-palette__section-title {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted-1-color);
}
.skel-palette__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  min-height: 32px;
}
.skel-palette__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  border: 1px dashed var(--border-color-2);
  border-radius: 8px;
  background: var(--background-2);
  cursor: grab;
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
  color: var(--text-color-2);
  user-select: none;
}
.skel-palette__item i {
  font-size: 16px;
  color: var(--theme-color);
}
.skel-palette__item.is-layout {
  border-color: var(--theme-color-soft);
  background: var(--theme-color-muted);
  grid-column: span 1;
}
.skel-palette__item:active {
  cursor: grabbing;
}
.skel-hint {
  margin: 0 0 10px;
  font-size: 11px;
  color: var(--muted-1-color);
  line-height: 1.45;
}
.skel-canvas-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.skel-canvas-col--preview .skel-full-preview {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}
.skel-canvas-frame {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--background-2);
  padding: 12px;
  min-height: 220px;
  max-height: calc(100vh - 200px);
  overflow: auto;
}
.skel-canvas-drag {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 48px;
}
.skel-empty {
  text-align: center;
  color: var(--muted-1-color);
  font-size: 13px;
  padding: 24px 0;
}
.skel-full-preview {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--background-origin, #fffcf8);
  padding: 12px;
  min-height: 220px;
  max-height: calc(100vh - 200px);
  overflow: auto;
}
.skel-type-tag {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-color);
}
.skel-props .el-input-number,
.skel-props .el-select {
  width: 100%;
}
.skel-code-panel {
  padding: 0 8px 24px;
}
.skel-code {
  margin-top: 12px;
  padding: 12px;
  max-height: 70vh;
  overflow: auto;
  font-size: 12px;
  line-height: 1.45;
  background: var(--background-2);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-color-2);
}
.skel-import-panel {
  padding: 0 8px 24px;
}
.skel-import-acts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.skel-hidden-file {
  display: none;
}
.skel-import-status {
  margin-top: 14px;
  font-size: 12px;
  color: var(--theme-color);
  line-height: 1.4;
}
@media (max-width: 1100px) {
  .skel-canvas-split {
    grid-template-columns: 1fr;
  }
  .skel-canvas-frame,
  .skel-full-preview {
    max-height: none;
  }
}
@media (max-width: 960px) {
  .skel-workspace {
    grid-template-columns: 1fr;
  }
  .skel-palette,
  .skel-props {
    position: static;
    max-height: none;
  }
  .skel-palette__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

<style>
/* select 下拉挂到 body：限制高度可滚动，避免版块过多撑出视口 */
.skel-preset-select-popper.el-select-dropdown {
  max-width: 320px;
}
.skel-preset-select-popper .el-select-dropdown__wrap {
  max-height: 280px;
}
.skel-preset-select-popper .skel-preset-opt__desc {
  color: var(--muted-1-color, #909399);
}
</style>
