<template>
  <div class="gp-dynamic-query" :class="{ 'is-compact': isCompact }">
    <div
      v-for="(cond, index) in conditions"
      :key="cond._key"
      class="gp-dynamic-query__row"
    >
      <span v-if="showRowLabels && index === 0" class="gp-dq-label">查询字段</span>
      <span v-else-if="showRowLabels" class="gp-dq-label gp-dq-label--spacer" />
      <el-select
        v-model="cond.field"
        clearable
        :placeholder="isCompact ? '字段' : '选择字段'"
        :size="ctrlSize"
        :style="{ width: fieldWidth }"
        @change="onFieldChange(cond)"
      >
        <el-option
          v-for="opt in fields"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <span v-if="showRowLabels && index === 0" class="gp-dq-label">条件</span>
      <span v-else-if="showRowLabels" class="gp-dq-label gp-dq-label--spacer" />
      <el-select
        v-model="cond.op"
        :placeholder="'条件'"
        :size="ctrlSize"
        :style="{ width: opWidth }"
        @change="onOperatorChange(cond)"
      >
        <el-option
          v-for="op in operatorOptions"
          :key="op.value"
          :label="effectiveShowLabel ? op.label : op.symbol"
          :value="op.value"
        />
      </el-select>
      <span v-if="showRowLabels && index === 0" class="gp-dq-label">值</span>
      <span v-else-if="showRowLabels" class="gp-dq-label gp-dq-label--spacer" />
      <el-select
        v-if="fieldMeta(cond.field).valueType === 'select' && !isNullOp(cond.op)"
        v-model="cond.value"
        clearable
        placeholder="请选择"
        :size="ctrlSize"
        :style="{ width: valueWidth }"
      >
        <el-option
          v-for="opt in fieldMeta(cond.field).options || []"
          :key="String(opt.value)"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-input
        v-else
        v-model="cond.value"
        clearable
        placeholder="请输入值"
        :size="ctrlSize"
        :style="{ width: valueWidth }"
        :disabled="isNullOp(cond.op)"
        @keyup.enter.native="emitSearch"
      />
      <el-button
        type="danger"
        icon="el-icon-minus"
        circle
        plain
        :size="ctrlSize"
        :disabled="conditions.length <= minRows"
        class="gp-dq-remove"
        @click="removeCondition(index)"
      />
    </div>
    <div class="gp-dynamic-query__actions">
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        :size="ctrlSize"
        :disabled="conditions.length >= maxConditionsLocal"
        @click="addCondition"
      >{{ isCompact ? '条件' : '增加条件' }}</el-button>
      <el-button type="primary" icon="el-icon-search" :size="ctrlSize" @click="emitSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" :size="ctrlSize" @click="emitReset">重置</el-button>
      <el-button
        v-if="!isCompact"
        type="text"
        :size="ctrlSize"
        @click="configOpen = !configOpen"
      >{{ configOpen ? '收起配置' : '查询配置' }}</el-button>
    </div>
    <div v-show="configOpen && !isCompact" class="gp-dynamic-query__config">
      <span class="gp-dq-label">最大条件数</span>
      <el-input-number v-model="maxConditionsLocal" :min="minRows" :max="20" size="mini" />
      <span class="gp-dq-label" style="margin-left: 12px">运算符文案</span>
      <el-switch v-model="showOperatorLabel" />
    </div>
  </div>
</template>

<script>
let keySeq = 1

export const QUERY_OPERATORS = [
  { value: 'eq', symbol: '=', label: '等于' },
  { value: 'ne', symbol: '≠', label: '不等于' },
  { value: 'gt', symbol: '>', label: '大于' },
  { value: 'ge', symbol: '≥', label: '大于等于' },
  { value: 'lt', symbol: '<', label: '小于' },
  { value: 'le', symbol: '≤', label: '小于等于' },
  { value: 'like', symbol: '≈', label: '包含' },
  { value: 'notLike', symbol: '!~', label: '不包含' },
  { value: 'isNull', symbol: '∅', label: '为空' },
  { value: 'isNotNull', symbol: '≠∅', label: '不为空' },
]

function emptyCondition (defaults = {}) {
  return {
    _key: `dq_${keySeq++}`,
    field: defaults.field || undefined,
    op: defaults.op || 'like',
    value: defaults.value !== undefined ? defaults.value : undefined,
  }
}

export function buildDynamicQueryParams (conditions, base = {}, options = {}) {
  const {
    attachConditionsJson = true,
    attachFlat = false,
  } = options
  const params = { ...base }
  const list = []
  ;(conditions || []).forEach((c) => {
    if (!c || !c.field || !c.op) return
    const empty = c.value === undefined || c.value === null || c.value === ''
    if (c.op === 'isNull' || c.op === 'isNotNull') {
      list.push({ field: c.field, op: c.op, value: c.value })
      return
    }
    if (empty) return
    list.push({ field: c.field, op: c.op, value: c.value })
    if (attachFlat) params[c.field] = c.value
  })
  if (attachConditionsJson && list.length) {
    params.conditionsJson = JSON.stringify(list)
  }
  return params
}

export default {
  name: 'DynamicQueryForm',
  props: {
    fields: { type: Array, required: true },
    defaultRows: { type: Number, default: 2 },
    minRows: { type: Number, default: 1 },
    maxConditions: { type: Number, default: 8 },
    initialConditions: { type: Array, default: () => [] },
  },
  data () {
    return {
      conditions: this.seedConditions(),
      showOperatorLabel: true,
      configOpen: false,
      maxConditionsLocal: this.maxConditions,
      operatorOptions: QUERY_OPERATORS,
      viewportW: typeof window !== 'undefined' ? window.innerWidth : 1200,
    }
  },
  computed: {
    isCompact () {
      return this.viewportW < 768
    },
    showRowLabels () {
      return !this.isCompact
    },
    effectiveShowLabel () {
      return this.isCompact ? false : this.showOperatorLabel
    },
    ctrlSize () {
      return this.isCompact ? 'mini' : 'small'
    },
    fieldWidth () {
      return this.isCompact ? '110px' : '140px'
    },
    opWidth () {
      return this.isCompact ? '72px' : '110px'
    },
    valueWidth () {
      return this.isCompact ? '140px' : '180px'
    },
  },
  mounted () {
    this._onResize = () => { this.viewportW = window.innerWidth }
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    seedConditions () {
      if (this.initialConditions && this.initialConditions.length) {
        return this.initialConditions.map((c) => emptyCondition(c))
      }
      const n = Math.max(this.minRows, this.defaultRows)
      const rows = []
      for (let i = 0; i < n; i++) rows.push(emptyCondition())
      return rows
    },
    fieldMeta (field) {
      return (this.fields || []).find((f) => f.value === field) || { valueType: 'text', options: [] }
    },
    isNullOp (op) {
      return op === 'isNull' || op === 'isNotNull'
    },
    onFieldChange (cond) {
      cond.value = undefined
      const meta = this.fieldMeta(cond.field)
      if (meta.valueType === 'select' && (cond.op === 'like' || cond.op === 'notLike')) {
        cond.op = 'eq'
      }
    },
    onOperatorChange (cond) {
      if (this.isNullOp(cond.op)) cond.value = undefined
    },
    addCondition () {
      if (this.conditions.length >= this.maxConditionsLocal) return
      this.conditions.push(emptyCondition())
    },
    removeCondition (index) {
      if (this.conditions.length <= this.minRows) return
      this.conditions.splice(index, 1)
    },
    getConditions () {
      return this.conditions.map(({ field, op, value }) => ({ field, op, value }))
    },
    resetConditions () {
      this.conditions = this.seedConditions()
    },
    emitSearch () {
      this.$emit('search', this.getConditions())
    },
    emitReset () {
      this.resetConditions()
      this.$emit('reset', this.getConditions())
    },
  },
}
</script>

<style scoped>
.gp-dynamic-query {
  margin-bottom: 8px;
  max-width: 100%;
}
.gp-dynamic-query__row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 6px;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.gp-dq-label {
  display: inline-block;
  width: 64px;
  flex-shrink: 0;
  font-size: 13px;
  color: #606266;
  text-align: right;
  padding-right: 8px;
  white-space: nowrap;
}
.gp-dq-label--spacer {
  visibility: hidden;
}
.gp-dynamic-query__row > .el-select,
.gp-dynamic-query__row > .el-input {
  margin-right: 8px;
  flex-shrink: 0;
}
.gp-dq-remove {
  flex-shrink: 0;
}
.gp-dynamic-query__actions {
  margin: 4px 0 8px;
  white-space: nowrap;
}
.gp-dynamic-query__config {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px dashed #e8e8e8;
  border-radius: 2px;
}
.gp-dynamic-query.is-compact .gp-dq-label {
  display: none;
}
</style>
