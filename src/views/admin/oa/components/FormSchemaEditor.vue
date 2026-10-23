<template>
  <div class="form-schema-editor">
    <div class="toolbar">
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="addField">添加字段</el-button>
      <el-button size="mini" @click="loadPreset('leave')">请假模板</el-button>
      <el-button size="mini" @click="loadPreset('expense')">报销模板</el-button>
      <el-button size="mini" type="text" @click="showJson = !showJson">
        {{ showJson ? '隐藏 JSON' : '查看 JSON' }}
      </el-button>
    </div>

    <el-table :data="fields" size="mini" border style="width:100%;margin-top:8px">
      <el-table-column label="字段名" width="110">
        <template slot-scope="{row}">
          <el-input v-model="row.key" size="mini" placeholder="英文key" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="100">
        <template slot-scope="{row}">
          <el-input v-model="row.label" size="mini" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110">
        <template slot-scope="{row}">
          <el-select v-model="row.type" size="mini" style="width:100%" @change="emitChange">
            <el-option label="文本" value="text" />
            <el-option label="多行" value="textarea" />
            <el-option label="数字" value="number" />
            <el-option label="金额" value="amount" />
            <el-option label="日期" value="date" />
            <el-option label="单选" value="radio" />
            <el-option label="多选" value="checkbox" />
            <el-option label="下拉" value="select" />
            <el-option label="开关" value="switch" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="必填" width="60" align="center">
        <template slot-scope="{row}">
          <el-checkbox v-model="row.required" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="选项/占位" min-width="120">
        <template slot-scope="{row}">
          <el-input
            v-if="['radio','checkbox','select'].includes(row.type)"
            v-model="row.optionsText"
            size="mini"
            placeholder="选项用逗号分隔"
            @change="onOptionsChange(row)"
          />
          <el-input v-else v-model="row.placeholder" size="mini" placeholder="占位提示" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template slot-scope="{$index}">
          <el-button type="text" size="mini" style="color:#f56c6c" @click="removeField($index)">删</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-input
      v-if="showJson"
      :value="schemaJson"
      type="textarea"
      :rows="6"
      readonly
      style="margin-top:8px;font-family:monospace"
    />
    <div class="tip">保存后发起审批将按此 Schema 渲染表单，提交结果以 JSON 随流程流转。</div>
  </div>
</template>

<script>
const PRESETS = {
  leave: [
    { key: 'leaveType', label: '请假类型', type: 'select', required: true, options: ['事假', '病假', '年假', '调休'], optionsText: '事假,病假,年假,调休' },
    { key: 'days', label: '请假天数', type: 'number', required: true, placeholder: '请输入天数' },
    { key: 'startDate', label: '开始日期', type: 'date', required: true },
    { key: 'endDate', label: '结束日期', type: 'date', required: true },
    { key: 'reason', label: '请假事由', type: 'textarea', required: true, placeholder: '请说明事由' }
  ],
  expense: [
    { key: 'expenseType', label: '报销类型', type: 'select', required: true, options: ['差旅', '办公', '招待', '其他'], optionsText: '差旅,办公,招待,其他' },
    { key: 'amount', label: '报销金额', type: 'amount', required: true, placeholder: '元' },
    { key: 'reason', label: '报销说明', type: 'textarea', required: true }
  ]
}

export default {
  name: 'FormSchemaEditor',
  props: {
    value: { type: [String, Object], default: '' }
  },
  data() {
    return {
      fields: [],
      showJson: false
    }
  },
  computed: {
    schemaJson() {
      return JSON.stringify({ fields: this.normalizeFields() }, null, 2)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        this.fields = this.parseValue(v)
      }
    }
  },
  methods: {
    parseValue(v) {
      try {
        let obj = v
        if (typeof v === 'string' && v.trim()) obj = JSON.parse(v)
        const fields = (obj && obj.fields) || (Array.isArray(obj) ? obj : [])
        return fields.map(f => ({
          key: f.key || '',
          label: f.label || '',
          type: f.type || 'text',
          required: !!f.required,
          placeholder: f.placeholder || '',
          options: f.options || [],
          optionsText: Array.isArray(f.options) ? f.options.join(',') : (f.optionsText || '')
        }))
      } catch (e) {
        return []
      }
    },
    normalizeFields() {
      return this.fields
        .filter(f => f.key)
        .map(f => {
          const item = {
            key: String(f.key).trim(),
            label: f.label || f.key,
            type: f.type || 'text',
            required: !!f.required
          }
          if (f.placeholder) item.placeholder = f.placeholder
          if (['radio', 'checkbox', 'select'].includes(f.type)) {
            item.options = (f.optionsText || '')
              .split(/[,，]/)
              .map(s => s.trim())
              .filter(Boolean)
          }
          return item
        })
    },
    emitChange() {
      const schema = { fields: this.normalizeFields() }
      this.$emit('input', JSON.stringify(schema))
      this.$emit('change', schema)
    },
    addField() {
      this.fields.push({
        key: 'field' + (this.fields.length + 1),
        label: '新字段',
        type: 'text',
        required: false,
        placeholder: '',
        options: [],
        optionsText: ''
      })
      this.emitChange()
    },
    removeField(index) {
      this.fields.splice(index, 1)
      this.emitChange()
    },
    onOptionsChange(row) {
      row.options = (row.optionsText || '').split(/[,，]/).map(s => s.trim()).filter(Boolean)
      this.emitChange()
    },
    loadPreset(name) {
      this.fields = JSON.parse(JSON.stringify(PRESETS[name] || []))
      this.emitChange()
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.tip { margin-top: 8px; font-size: 12px; color: #909399; line-height: 1.4; }
</style>
