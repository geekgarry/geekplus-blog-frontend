<template>
  <div class="app-container ai-admin">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="说明：可用 API Key 在后台浏览模型、探测 Key、管理 AI 源并用 GET/POST 实测连通性。申请免费 Key / 精确配额与账单仍需 Google AI Studio 或 Cloud Console。"
      class="mb12"
    />

    <el-tabs v-model="activeTab" @tab-click="onTabClick">
      <!-- 模型浏览器 -->
      <el-tab-pane label="Gemini 模型" name="models">
        <el-form :inline="true" size="small" class="mb8">
          <el-form-item label="能力">
            <el-select v-model="modelQuery.method" clearable placeholder="全部" style="width: 180px">
              <el-option
                v-for="(cnt, method) in methodStats"
                :key="method"
                :label="method + ' (' + cnt + ')'"
                :value="method"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="modelQuery.keyword"
              clearable
              placeholder="modelId / 名称 / 描述"
              style="width: 220px"
              @keyup.enter.native="loadModels"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="loadModels">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetModelQuery">重置</el-button>
            <el-button type="success" plain icon="el-icon-connection" :loading="probeLoading" @click="doProbe">
              探测 Key
            </el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="12" class="mb12" v-if="modelSource">
          <el-col :span="24">
            <el-tag size="mini" type="info">源：{{ modelSource.sourceName || '-' }}</el-tag>
            <el-tag size="mini" class="ml8">模型默认：{{ modelSource.model || '-' }}</el-tag>
            <el-tag size="mini" class="ml8">Key：{{ modelSource.apiKeyMasked || '-' }}</el-tag>
            <el-tag size="mini" class="ml8" type="success">共 {{ modelTotal }} 个</el-tag>
          </el-col>
        </el-row>

        <el-table v-loading="modelsLoading" :data="pagedModels" border stripe>
          <el-table-column prop="displayName" label="显示名" min-width="160" show-overflow-tooltip />
          <el-table-column prop="modelId" label="Model ID" min-width="200" show-overflow-tooltip />
          <el-table-column prop="tierHint" label="档位提示" width="160" show-overflow-tooltip />
          <el-table-column label="输入 Token" width="110" align="center">
            <template slot-scope="scope">{{ formatNum(scope.row.inputTokenLimit) }}</template>
          </el-table-column>
          <el-table-column label="输出 Token" width="110" align="center">
            <template slot-scope="scope">{{ formatNum(scope.row.outputTokenLimit) }}</template>
          </el-table-column>
          <el-table-column label="Thinking" width="80" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.thinking" size="mini" type="warning">是</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="能力" min-width="220">
            <template slot-scope="scope">
              <el-tag
                v-for="m in (scope.row.supportedGenerationMethods || [])"
                :key="m"
                size="mini"
                class="method-tag"
              >{{ m }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="showModelDetail(scope.row)">详情</el-button>
              <el-button type="text" size="mini" @click="addSourceFromModel(scope.row)">加为 AI 源</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="modelTotal > 0"
          :total="modelTotal"
          :page.sync="modelPage.pageNum"
          :limit.sync="modelPage.pageSize"
        />
      </el-tab-pane>

      <!-- AI 源管理 -->
      <el-tab-pane label="AI 源管理" name="sources">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openSourceDialog()">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-refresh" size="mini" @click="loadSources">刷新</el-button>
          </el-col>
        </el-row>
        <el-table v-loading="sourcesLoading" :data="sourceList" border>
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="name" label="名称" min-width="140" />
          <el-table-column label="提供方" width="140" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="providerTagType(scope.row.provider)">{{ scope.row.provider }}</el-tag>
              <div v-if="isForeignProvider(scope.row.provider)" class="provider-tip">国外·可能受限</div>
              <div v-else-if="!isBuiltinProvider(scope.row.provider)" class="provider-tip">通用协议</div>
            </template>
          </el-table-column>
          <el-table-column prop="model" label="模型" min-width="160" show-overflow-tooltip />
          <el-table-column label="启用" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabled === 1 ? 'success' : 'info'" size="mini">
                {{ scope.row.enabled === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="默认" width="80" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.isDefault === 1" type="warning" size="mini">默认</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          <el-table-column label="操作" width="300" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="openTestDialog(scope.row)">测试</el-button>
              <el-button type="text" size="mini" @click="openSourceDialog(scope.row)">编辑</el-button>
              <el-button type="text" size="mini" @click="handleSetDefault(scope.row)">设默认</el-button>
              <el-button type="text" size="mini" style="color:#f56c6c" @click="handleDeleteSource(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 能力边界 -->
      <el-tab-pane label="能力与配额说明" name="caps">
        <el-alert :title="capsSummary" type="warning" :closable="false" class="mb12" show-icon />
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card shadow="never" header="可用 API（本后台可完成）">
              <el-table :data="capsSupported" size="mini" border>
                <el-table-column prop="name" label="能力" width="140" />
                <el-table-column prop="api" label="接口" min-width="160" show-overflow-tooltip />
                <el-table-column prop="note" label="说明" min-width="160" show-overflow-tooltip />
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" header="官方不提供 / 需上 Google 网站或 GCP">
              <el-table :data="capsUnsupported" size="mini" border>
                <el-table-column prop="name" label="能力" width="140" />
                <el-table-column prop="api" label="现状" min-width="160" show-overflow-tooltip />
                <el-table-column prop="note" label="说明" min-width="180" show-overflow-tooltip />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="never" header="变通方案" class="mt12">
          <el-table :data="capsWorkarounds" size="mini" border>
            <el-table-column prop="name" label="方案" width="140" />
            <el-table-column prop="api" label="手段" min-width="180" show-overflow-tooltip />
            <el-table-column prop="note" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="action" label="效果" min-width="180" show-overflow-tooltip />
          </el-table>
          <div class="doc-links mt12" v-if="capsDocs.length">
            <div class="doc-title">官方文档</div>
            <div v-for="(d, i) in capsDocs" :key="i">
              <el-link :href="d" target="_blank" type="primary">{{ d }}</el-link>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 模型详情 -->
    <el-dialog :title="detailTitle" :visible.sync="detailVisible" width="720px" append-to-body>
      <el-descriptions v-if="detailModel" :column="2" border size="small">
        <el-descriptions-item label="显示名">{{ detailModel.displayName }}</el-descriptions-item>
        <el-descriptions-item label="Model ID">{{ detailModel.modelId }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detailModel.version }}</el-descriptions-item>
        <el-descriptions-item label="档位">{{ detailModel.tierHint }}</el-descriptions-item>
        <el-descriptions-item label="输入 Token">{{ formatNum(detailModel.inputTokenLimit) }}</el-descriptions-item>
        <el-descriptions-item label="输出 Token">{{ formatNum(detailModel.outputTokenLimit) }}</el-descriptions-item>
        <el-descriptions-item label="temperature">{{ detailModel.temperature }}</el-descriptions-item>
        <el-descriptions-item label="maxTemperature">{{ detailModel.maxTemperature }}</el-descriptions-item>
        <el-descriptions-item label="topP">{{ detailModel.topP }}</el-descriptions-item>
        <el-descriptions-item label="topK">{{ detailModel.topK }}</el-descriptions-item>
        <el-descriptions-item label="Thinking" :span="2">{{ detailModel.thinking ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailModel.description }}</el-descriptions-item>
        <el-descriptions-item label="能力" :span="2">
          <el-tag
            v-for="m in (detailModel.supportedGenerationMethods || [])"
            :key="m"
            size="mini"
            class="method-tag"
          >{{ m }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-input
        v-if="detailRaw"
        type="textarea"
        :rows="10"
        class="mt12"
        :value="detailRaw"
        readonly
      />
    </el-dialog>

    <!-- AI 源连通性测试：上 prompt，中 url+key，下响应 -->
    <el-dialog
      :title="'测试 AI 源' + (testForm.name ? ' - ' + testForm.name : '')"
      :visible.sync="testVisible"
      width="720px"
      append-to-body
      @open="refreshTestPreview"
    >
      <el-form label-width="90px" size="small">
        <el-form-item label="请求方式">
          <el-radio-group v-model="testForm.method" @change="refreshTestPreview">
            <el-radio-button label="POST">POST</el-radio-button>
            <el-radio-button label="GET">GET</el-radio-button>
          </el-radio-group>
          <span class="test-hint">POST：gemini 走 generateContent，其它提供方走通用 OpenAI 兼容；GET：gemini 打 models.list</span>
        </el-form-item>
        <el-form-item label="Prompt / 参数">
          <el-input
            v-model="testForm.prompt"
            type="textarea"
            :rows="6"
            placeholder="输入提示词；也可直接粘贴完整 JSON 作为请求体"
            @blur="refreshTestPreview"
          />
        </el-form-item>
        <el-form-item label="URL + Key">
          <el-input
            type="textarea"
            :rows="4"
            :value="testPreviewText"
            readonly
            class="mono-box"
          />
        </el-form-item>
        <el-form-item label="响应内容">
          <el-input
            type="textarea"
            :rows="10"
            :value="testResponse"
            readonly
            class="mono-box"
            placeholder="点击「发送请求」后显示响应"
          />
        </el-form-item>
        <el-form-item v-if="testMeta">
          <el-tag size="mini" type="info">HTTP {{ testMeta.httpStatus }}</el-tag>
          <el-tag size="mini" class="ml8">{{ testMeta.costMs }} ms</el-tag>
          <el-tag size="mini" class="ml8">{{ testMeta.provider }} / {{ testMeta.model }}</el-tag>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="testVisible = false">关闭</el-button>
        <el-button @click="refreshTestPreview" :loading="testPreviewLoading">刷新预览</el-button>
        <el-button type="primary" :loading="testLoading" @click="doTestSource">发送请求</el-button>
      </span>
    </el-dialog>

    <!-- AI 源表单 -->
    <el-dialog :title="sourceForm.id ? '编辑 AI 源' : '新增 AI 源'" :visible.sync="sourceVisible" width="560px" append-to-body>
      <el-form ref="sourceFormRef" :model="sourceForm" :rules="sourceRules" label-width="100px" size="small">
        <el-form-item label="名称" prop="name">
          <el-input v-model="sourceForm.name" />
        </el-form-item>
        <el-form-item label="提供方" prop="provider">
          <el-select
            v-model="sourceForm.provider"
            filterable
            allow-create
            default-first-option
            clearable
            placeholder="选择或手写提供方编码"
            style="width: 100%"
            @change="onProviderChange"
          >
            <el-option-group label="内置（国外，访问可能受限）">
              <el-option
                v-for="p in builtinProviders"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              >
                <span>{{ p.label }}</span>
                <span class="option-desc">{{ p.desc }}</span>
              </el-option>
            </el-option-group>
            <el-option-group label="常用国内 / OpenAI 兼容（走通用 AI 服务）">
              <el-option
                v-for="p in compatibleProviders"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              >
                <span>{{ p.label }}</span>
                <span class="option-desc">{{ p.desc }}</span>
              </el-option>
            </el-option-group>
          </el-select>
          <div class="form-tip">可下拉选择，也可直接输入自定义编码（如 my-llm），非 gemini/chatgpt 将走后端通用 AI 服务（OpenAI 兼容协议）</div>
        </el-form-item>
        <el-alert
          v-if="isForeignProvider(sourceForm.provider)"
          type="warning"
          :closable="false"
          show-icon
          class="mb12"
          title="Gemini / ChatGPT 为国外服务，国内网络访问常不稳定或受限，建议改用国内或自建 OpenAI 兼容接口。"
        />
        <el-alert
          v-else-if="sourceForm.provider && !isBuiltinProvider(sourceForm.provider)"
          type="success"
          :closable="false"
          show-icon
          class="mb12"
          title="当前为自定义/兼容提供方：将走后端 GenericAiService（OpenAI Chat Completions 协议），请填写完整 chat/completions URL 与 Key。"
        />
        <el-form-item label="模型" prop="model">
          <el-input v-model="sourceForm.model" :placeholder="modelPlaceholder" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="sourceForm.apiKey" type="password" show-password placeholder="空则回退 YAML（仅 gemini/chatgpt）" />
        </el-form-item>
        <el-form-item label="API URL" :required="!isBuiltinProvider(sourceForm.provider)">
          <el-input v-model="sourceForm.apiUrl" :placeholder="apiUrlPlaceholder" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="sourceForm.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="sourceForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="sourceForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="sourceForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="sourceVisible = false">取消</el-button>
        <el-button @click="openTestDialog(sourceForm)">测试</el-button>
        <el-button type="primary" @click="submitSource">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAiSource,
  addAiSource,
  updateAiSource,
  setDefaultAiSource,
  delAiSource,
  listGeminiModels,
  getGeminiModel,
  probeGeminiKey,
  getGeminiCapabilities,
  testAiSource
} from '@/api/system/ai'

export default {
  name: 'AiAdmin',
  data() {
    return {
      activeTab: 'models',
      modelsLoading: false,
      probeLoading: false,
      models: [],
      modelTotal: 0,
      modelSource: null,
      methodStats: {},
      modelQuery: { method: '', keyword: '' },
      modelPage: { pageNum: 1, pageSize: 10 },
      detailVisible: false,
      detailTitle: '模型详情',
      detailModel: null,
      detailRaw: '',
      sourcesLoading: false,
      sourceList: [],
      sourceVisible: false,
      sourceForm: this.emptySource(),
      sourceRules: {
        name: [{ required: true, message: '必填', trigger: 'blur' }],
        provider: [{ required: true, message: '必填，可手写自定义编码', trigger: 'change' }],
        model: [{ required: true, message: '必填', trigger: 'blur' }]
      },
      builtinProviders: [
        { value: 'gemini', label: 'gemini', desc: 'Google · 国外可能受限' },
        { value: 'chatgpt', label: 'chatgpt', desc: 'OpenAI · 国外可能受限' }
      ],
      compatibleProviders: [
        { value: 'deepseek', label: 'deepseek', desc: 'DeepSeek', url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
        { value: 'qwen', label: 'qwen', desc: '通义千问', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus' },
        { value: 'moonshot', label: 'moonshot', desc: '月之暗面 Kimi', url: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k' },
        { value: 'zhipu', label: 'zhipu', desc: '智谱 GLM', url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
        { value: 'baichuan', label: 'baichuan', desc: '百川', url: 'https://api.baichuan-ai.com/v1/chat/completions', model: 'Baichuan2-Turbo' },
        { value: 'yi', label: 'yi', desc: '零一万物', url: 'https://api.lingyiwanwu.com/v1/chat/completions', model: 'yi-lightning' },
        { value: 'openai-compatible', label: 'openai-compatible', desc: '任意 OpenAI 兼容网关', url: '', model: '' }
      ],
      testVisible: false,
      testLoading: false,
      testPreviewLoading: false,
      testForm: {
        sourceId: null,
        name: '',
        provider: 'gemini',
        model: '',
        apiKey: '',
        apiUrl: '',
        method: 'POST',
        prompt: '你好，请用一句话介绍你自己。'
      },
      testPreviewText: '',
      testResponse: '',
      testMeta: null,
      capsSummary: '',
      capsSupported: [],
      capsUnsupported: [],
      capsWorkarounds: [],
      capsDocs: []
    }
  },
  computed: {
    pagedModels() {
      const start = (this.modelPage.pageNum - 1) * this.modelPage.pageSize
      return this.models.slice(start, start + this.modelPage.pageSize)
    },
    apiUrlPlaceholder() {
      const p = (this.sourceForm.provider || '').toLowerCase()
      if (p === 'gemini') return 'Gemini baseUrl，如 https://generativelanguage.googleapis.com/v1beta'
      if (p === 'chatgpt' || p === 'openai') return '完整 chat/completions URL，如 https://api.openai.com/v1/chat/completions'
      return '必填：完整 OpenAI 兼容 chat/completions URL'
    },
    modelPlaceholder() {
      const p = (this.sourceForm.provider || '').toLowerCase()
      if (p === 'gemini') return '如 gemini-2.5-flash'
      if (p === 'chatgpt' || p === 'openai') return '如 gpt-4o-mini'
      return '如 deepseek-chat / qwen-plus / glm-4-flash'
    }
  },
  created() {
    this.sourceRules.apiUrl = [{ validator: this.validateApiUrl, trigger: 'blur' }]
    this.loadModels()
    this.loadSources()
    this.loadCapabilities()
  },
  methods: {
    isForeignProvider(provider) {
      const p = (provider || '').toLowerCase()
      return p === 'gemini' || p === 'chatgpt' || p === 'openai'
    },
    isBuiltinProvider(provider) {
      const p = (provider || '').toLowerCase()
      return p === 'gemini' || p === 'chatgpt' || p === 'openai'
    },
    providerTagType(provider) {
      if (this.isForeignProvider(provider)) return 'warning'
      if (!provider) return 'info'
      return 'success'
    },
    validateApiUrl(rule, value, callback) {
      if (!this.isBuiltinProvider(this.sourceForm.provider) && !(value && String(value).trim())) {
        callback(new Error('自定义提供方必须填写 API URL'))
        return
      }
      callback()
    },
    onProviderChange(val) {
      const p = (val || '').toLowerCase().trim()
      this.sourceForm.provider = p
      const preset = this.compatibleProviders.find((x) => x.value === p)
      if (p === 'gemini') {
        if (!this.sourceForm.apiUrl || this.sourceForm.apiUrl.includes('openai') || this.sourceForm.apiUrl.includes('chat/completions')) {
          this.sourceForm.apiUrl = 'https://generativelanguage.googleapis.com/v1beta'
        }
        if (!this.sourceForm.model || this.sourceForm.model.startsWith('gpt') || this.sourceForm.model.includes('deepseek')) {
          this.sourceForm.model = 'gemini-2.5-flash'
        }
      } else if (p === 'chatgpt' || p === 'openai') {
        if (!this.sourceForm.apiUrl || this.sourceForm.apiUrl.includes('generativelanguage')) {
          this.sourceForm.apiUrl = 'https://api.openai.com/v1/chat/completions'
        }
        if (!this.sourceForm.model || this.sourceForm.model.includes('gemini')) {
          this.sourceForm.model = 'gpt-4o-mini'
        }
      } else if (preset) {
        if (preset.url) this.sourceForm.apiUrl = preset.url
        if (preset.model && (!this.sourceForm.model || this.isBuiltinProvider(this.sourceForm.model) === false)) {
          // only fill model when empty or switching presets
          if (!this.sourceForm.model || this.sourceForm.model.includes('gemini') || this.sourceForm.model.startsWith('gpt')) {
            this.sourceForm.model = preset.model
          } else if (preset.model) {
            this.sourceForm.model = preset.model
          }
        }
        if (preset.model) this.sourceForm.model = preset.model
      }
    },
    emptySource() {
      return {
        id: null,
        name: '',
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        apiKey: '',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
        enabled: 1,
        isDefault: 0,
        sortOrder: 0,
        remark: ''
      }
    },
    formatNum(n) {
      if (n == null) return '-'
      return Number(n).toLocaleString()
    },
    onTabClick(tab) {
      if (tab.name === 'sources' && !this.sourceList.length) this.loadSources()
      if (tab.name === 'caps' && !this.capsSupported.length) this.loadCapabilities()
    },
    resetModelQuery() {
      this.modelQuery = { method: '', keyword: '' }
      this.modelPage.pageNum = 1
      this.loadModels()
    },
    loadModels() {
      this.modelsLoading = true
      listGeminiModels({
        method: this.modelQuery.method || undefined,
        keyword: this.modelQuery.keyword || undefined
      })
        .then((res) => {
          const data = res.data || res || {}
          this.models = data.models || []
          this.modelTotal = data.total || this.models.length
          this.modelSource = data.source || null
          this.methodStats = data.methodStats || {}
          this.modelPage.pageNum = 1
        })
        .catch(() => {
          this.models = []
          this.modelTotal = 0
        })
        .finally(() => {
          this.modelsLoading = false
        })
    },
    doProbe() {
      this.probeLoading = true
      probeGeminiKey()
        .then((res) => {
          const data = res.data || res || {}
          this.$modal
            ? this.$modal.msgSuccess(data.message || (data.ok ? 'Key 可用' : 'Key 不可用'))
            : this.$message[data.ok ? 'success' : 'error'](data.message || '')
        })
        .finally(() => {
          this.probeLoading = false
        })
    },
    showModelDetail(row) {
      this.detailTitle = row.displayName || row.modelId
      this.detailModel = row
      this.detailRaw = ''
      this.detailVisible = true
      getGeminiModel(row.modelId)
        .then((res) => {
          const data = res.data || res || {}
          if (data.model) this.detailModel = data.model
          if (data.raw) this.detailRaw = JSON.stringify(data.raw, null, 2)
        })
        .catch(() => {})
    },
    addSourceFromModel(row) {
      this.sourceForm = {
        ...this.emptySource(),
        name: row.displayName || row.modelId,
        provider: 'gemini',
        model: row.modelId,
        remark: row.tierHint || row.description || ''
      }
      this.sourceVisible = true
      this.activeTab = 'sources'
    },
    loadSources() {
      this.sourcesLoading = true
      listAiSource()
        .then((res) => {
          this.sourceList = res.data || res || []
          if (!Array.isArray(this.sourceList)) this.sourceList = []
        })
        .catch(() => {
          this.sourceList = []
        })
        .finally(() => {
          this.sourcesLoading = false
        })
    },
    openSourceDialog(row) {
      this.sourceForm = row ? { ...row } : this.emptySource()
      this.sourceVisible = true
    },
    openTestDialog(row) {
      if (!row) return
      const provider = (row.provider || 'gemini').toLowerCase()
      this.testForm = {
        sourceId: row.id || null,
        name: row.name || '',
        provider,
        model: row.model || '',
        apiKey: row.apiKey || '',
        apiUrl: row.apiUrl || '',
        method: 'POST',
        prompt: '你好，请用一句话介绍你自己。'
      }
      this.testResponse = ''
      this.testMeta = null
      this.testPreviewText = ''
      this.testVisible = true
      this.$nextTick(() => this.refreshTestPreview())
    },
    buildTestPayload(previewOnly) {
      return {
        sourceId: this.testForm.sourceId || undefined,
        provider: this.testForm.provider,
        model: this.testForm.model,
        apiKey: this.testForm.apiKey || undefined,
        apiUrl: this.testForm.apiUrl || undefined,
        method: this.testForm.method,
        prompt: this.testForm.prompt,
        previewOnly: !!previewOnly
      }
    },
    refreshTestPreview() {
      this.testPreviewLoading = true
      testAiSource(this.buildTestPayload(true))
        .then((res) => {
          const data = res.data || res || {}
          const lines = []
          lines.push('Method: ' + (data.method || this.testForm.method))
          lines.push('URL: ' + (data.url || '-'))
          if (data.urlWithKey && data.urlWithKey !== data.url) {
            lines.push('---')
            lines.push(data.urlWithKey)
          }
          lines.push('Key: ' + (data.apiKeyMasked || '-'))
          if (data.requestBody) {
            lines.push('--- Body ---')
            lines.push(data.requestBody)
          }
          this.testPreviewText = lines.join('\n')
        })
        .catch((err) => {
          this.testPreviewText = (err && err.message) || '预览失败'
        })
        .finally(() => {
          this.testPreviewLoading = false
        })
    },
    doTestSource() {
      this.testLoading = true
      this.testResponse = ''
      this.testMeta = null
      testAiSource(this.buildTestPayload(false))
        .then((res) => {
          const data = res.data || res || {}
          this.testMeta = {
            httpStatus: data.httpStatus,
            costMs: data.costMs,
            provider: data.provider,
            model: data.model
          }
          const resp = data.response
          this.testResponse = typeof resp === 'string' ? resp : JSON.stringify(resp, null, 2)
          const lines = []
          lines.push('Method: ' + (data.method || this.testForm.method))
          lines.push('URL: ' + (data.url || '-'))
          if (data.urlWithKey && data.urlWithKey !== data.url) {
            lines.push('---')
            lines.push(data.urlWithKey)
          }
          lines.push('Key: ' + (data.apiKeyMasked || '-'))
          if (data.requestBody) {
            lines.push('--- Body ---')
            lines.push(data.requestBody)
          }
          this.testPreviewText = lines.join('\n')
          if (data.httpStatus >= 400) {
            this.$message.error('请求返回 HTTP ' + data.httpStatus)
          } else {
            this.$message.success('请求完成')
          }
        })
        .catch((err) => {
          this.testResponse = (err && err.message) || '请求失败'
        })
        .finally(() => {
          this.testLoading = false
        })
    },
    submitSource() {
      this.$refs.sourceFormRef.validate((ok) => {
        if (!ok) return
        const form = { ...this.sourceForm }
        form.provider = (form.provider || '').toLowerCase().trim()
        const req = form.id ? updateAiSource : addAiSource
        req(form).then(() => {
          this.$message.success('保存成功')
          this.sourceVisible = false
          this.loadSources()
        })
      })
    },
    handleSetDefault(row) {
      setDefaultAiSource(row.id).then(() => {
        this.$message.success('已设为默认')
        this.loadSources()
      })
    },
    handleDeleteSource(row) {
      this.$confirm('确认删除该 AI 源？', '提示', { type: 'warning' })
        .then(() => delAiSource(row.id))
        .then(() => {
          this.$message.success('已删除')
          this.loadSources()
        })
        .catch(() => {})
    },
    loadCapabilities() {
      getGeminiCapabilities()
        .then((res) => {
          const data = res.data || res || {}
          this.capsSummary = data.summary || ''
          this.capsSupported = data.apiSupported || []
          this.capsUnsupported = data.apiUnsupported || []
          this.capsWorkarounds = data.workarounds || []
          this.capsDocs = data.docs || []
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.ai-admin .mb8 { margin-bottom: 8px; }
.ai-admin .mb12 { margin-bottom: 12px; }
.ai-admin .mt12 { margin-top: 12px; }
.ai-admin .ml8 { margin-left: 8px; }
.ai-admin .method-tag { margin: 0 4px 4px 0; }
.ai-admin .doc-title { font-weight: 600; margin-bottom: 6px; }
.ai-admin .test-hint { margin-left: 12px; color: #909399; font-size: 12px; }
.ai-admin .mono-box >>> textarea {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
}
.ai-admin .form-tip { margin-top: 4px; color: #909399; font-size: 12px; line-height: 1.4; }
.ai-admin .provider-tip { font-size: 11px; color: #909399; margin-top: 2px; }
.ai-admin .option-desc { float: right; color: #909399; font-size: 12px; }
</style>
