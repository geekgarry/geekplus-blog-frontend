<template>
  <!--
    动态条件查询：按字段 valueType 适配输入；
    isNull/isNotNull 时值控件禁用；运算符按类型裁剪。
  -->
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
        placeholder="条件"
        :size="ctrlSize"
        :style="{ width: opWidth }"
        @change="onOperatorChange(cond)"
      >
        <el-option
          v-for="op in opsForCondition(cond)"
          :key="op.value"
          :label="effectiveShowLabel ? op.label : op.symbol"
          :value="op.value"
        />
      </el-select>
      <span v-if="showRowLabels && index === 0" class="gp-dq-label">值</span>
      <span v-else-if="showRowLabels" class="gp-dq-label gp-dq-label--spacer" />
      <el-input
        v-if="isNullOp(cond.op)"
        value=""
        disabled
        placeholder="无需填写"
        :size="ctrlSize"
        :style="{ width: valueWidth }"
      />
      <el-select
        v-else-if="valueTypeOf(cond) === 'select'"
        v-model="cond.value"
        clearable
        filterable
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
      <el-input-number
        v-else-if="valueTypeOf(cond) === 'number'"
        v-model="cond.value"
        controls-position="right"
        :size="ctrlSize"
        :style="{ width: valueWidth }"
        class="gp-dq-value"
      />
      <!--
        Element 官方 el-date-picker（datetime 含「此刻/确定」）。
        必须 append-to-body：行容器有横向滚动时面板挂在行内会错位且点确定关不掉。
        全局 .el-picker-panel 禁止改 margin，否则 Popper 相对输入框偏移。
      -->
      <span
        v-else-if="valueTypeOf(cond) === 'date'"
        class="gp-dq-value gp-dq-date-wrap"
        :style="{ width: valueWidth }"
      >
        <el-date-picker
          :ref="'dqDate_' + cond._key"
          v-model="cond.value"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          :size="ctrlSize"
          style="width: 100%"
          :append-to-body="true"
          popper-class="gp-dq-picker-popper"
          :popper-options="datePopperOptions"
          @change="() => closeDatePicker(cond._key)"
        />
      </span>
      <span
        v-else-if="valueTypeOf(cond) === 'datetime'"
        class="gp-dq-value gp-dq-date-wrap"
        :style="{ width: valueWidth }"
      >
        <el-date-picker
          :ref="'dqDate_' + cond._key"
          v-model="cond.value"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期时间"
          :size="ctrlSize"
          style="width: 100%"
          :append-to-body="true"
          popper-class="gp-dq-picker-popper"
          :popper-options="datePopperOptions"
          default-time="00:00:00"
          @change="() => closeDatePicker(cond._key)"
        />
      </span>
      <el-switch
        v-else-if="valueTypeOf(cond) === 'switch'"
        v-model="cond.value"
        :active-value="1"
        :inactive-value="0"
        class="gp-dq-value gp-dq-switch"
      />
      <el-input
        v-else
        v-model="cond.value"
        clearable
        placeholder="请输入值"
        :size="ctrlSize"
        :style="{ width: valueWidth }"
        class="gp-dq-value"
        @keyup.enter.native.stop="emitSearch"
      />
      <el-button
        type="danger"
        icon="el-icon-minus"
        circle
        plain
        native-type="button"
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
        native-type="button"
        :size="ctrlSize"
        :disabled="conditions.length >= maxConditionsLocal"
        @click="addCondition"
      >{{ isCompact ? '条件' : '增加条件' }}</el-button>
      <el-button type="primary" icon="el-icon-search" native-type="button" :size="ctrlSize" @click="emitSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" native-type="button" :size="ctrlSize" @click="emitReset">重置</el-button>
      <el-button
        v-if="!isCompact"
        type="text"
        native-type="button"
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
import {
  QUERY_OPERATORS,
  defaultOpForValueType,
  operatorsForValueType,
  normalizeValueType,
} from './queryFieldTypes'

let keySeq = 1

function emptyCondition (defaults = {}) {
  return {
    _key: `dq_${keySeq++}`,
    field: defaults.field || undefined,
    op: defaults.op || 'like',
    value: defaults.value !== undefined ? defaults.value : undefined,
  }
}

/**
 * 组装列表查询参数。
 * 【互斥】有动态条件只写 conditionsJson；attachFlat 仅在未写 conditionsJson 时生效。
 * conditions 可带 valueType（与 DynamicQueryForm 字段配置一致），后端按类型拼 SQL。
 * @param fields 可选：{ value, valueType }[]，用于补全条件上的 valueType
 */
export function buildDynamicQueryParams (conditions, base = {}, options = {}) {
  const {
    attachConditionsJson = true,
    attachFlat = false,
    fields = options.fields || [],
  } = options
  const typeMap = {}
  ;(fields || []).forEach((f) => {
    if (f && f.value) typeMap[f.value] = f.valueType || 'text'
  })
  const params = { ...base }
  const list = []
  ;(conditions || []).forEach((c) => {
    if (!c || !c.field || !c.op) return
    let value = c.value
    if (typeof value === 'string') {
      value = value.trim()
    }
    const empty = value === undefined || value === null || value === ''
    const valueType = c.valueType || typeMap[c.field] || undefined
    if (c.op === 'isNull' || c.op === 'isNotNull') {
      list.push({ field: c.field, op: c.op, value, valueType })
      return
    }
    if (empty) return
    list.push({ field: c.field, op: c.op, value, valueType })
  })
  if (!list.length) {
    return params
  }
  if (attachConditionsJson) {
    params.conditionsJson = JSON.stringify(list)
    return params
  }
  if (attachFlat) {
    list.forEach((c) => {
      if (c.op === 'isNull' || c.op === 'isNotNull') return
      params[c.field] = c.value
    })
  }
  return params
}

export { QUERY_OPERATORS, operatorsForValueType, normalizeValueType, defaultOpForValueType }
export { inferValueTypeFromDb } from './queryFieldTypes'

export default {
  name: 'DynamicQueryForm',
  props: {
    /** { value, label, valueType?, options? }[] */
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
      viewportW: typeof window !== 'undefined' ? window.innerWidth : 1200,
      // 关闭 gpuAcceleration，减少 transform 与全局样式叠加导致的偏移
      datePopperOptions: {
        boundariesElement: 'viewport',
        gpuAcceleration: false,
      },
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
      return this.isCompact ? '150px' : '220px'
    },
  },
  mounted () {
    this._onResize = () => { this.viewportW = window.innerWidth }
    window.addEventListener('resize', this._onResize)
    // 捕获「此刻 / 确定」点击：部分场景 change 不触发，面板关不掉
    this._onDqPickerFooterClick = (e) => {
      const t = e.target
      if (!t || typeof t.closest !== 'function') return
      const popper = t.closest('.gp-dq-picker-popper')
      if (!popper) return
      const btn = t.closest('.el-picker-panel__link-btn')
      if (!btn) return
      setTimeout(() => { this.closeAllDatePickers() }, 0)
    }
    document.addEventListener('click', this._onDqPickerFooterClick, true)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this._onResize)
    document.removeEventListener('click', this._onDqPickerFooterClick, true)
  },
  methods: {
    seedConditions () {
      if (this.initialConditions && this.initialConditions.length) {
        return this.initialConditions.map((c) => {
          const row = emptyCondition(c)
          if (row.field && !c.op) {
            row.op = defaultOpForValueType(this.fieldMeta(row.field).valueType)
          }
          return row
        })
      }
      const n = Math.max(this.minRows, this.defaultRows)
      const rows = []
      for (let i = 0; i < n; i++) rows.push(emptyCondition())
      return rows
    },
    fieldMeta (field) {
      const found = (this.fields || []).find((f) => f.value === field)
      if (!found) return { valueType: 'text', options: [] }
      return {
        ...found,
        valueType: normalizeValueType(found.valueType),
        options: found.options || [],
      }
    },
    valueTypeOf (cond) {
      return this.fieldMeta(cond.field).valueType
    },
    opsForCondition (cond) {
      return operatorsForValueType(this.valueTypeOf(cond))
    },
    isNullOp (op) {
      return op === 'isNull' || op === 'isNotNull'
    },
    onFieldChange (cond) {
      cond.value = undefined
      const meta = this.fieldMeta(cond.field)
      const allowed = operatorsForValueType(meta.valueType).map((o) => o.value)
      if (!allowed.includes(cond.op)) {
        cond.op = defaultOpForValueType(meta.valueType)
      }
    },
    onOperatorChange (cond) {
      if (this.isNullOp(cond.op)) cond.value = undefined
    },
    closeAllDatePickers () {
      Object.keys(this.$refs || {}).forEach((k) => {
        if (k.indexOf('dqDate_') === 0) {
          this.closeDatePicker(k.slice('dqDate_'.length))
        }
      })
    },
    /** 强制收起日期面板（确定/此刻/change） */
    closeDatePicker (key) {
      const run = () => {
        const r = this.$refs['dqDate_' + key]
        const picker = Array.isArray(r) ? r[0] : r
        if (!picker) return
        try {
          picker.pickerVisible = false
        } catch (e) { /* ignore */ }
        if (picker.picker && typeof picker.picker.$emit === 'function') {
          try { picker.picker.$emit('dodestroy') } catch (e) { /* ignore */ }
        }
        if (typeof picker.hidePicker === 'function') {
          try { picker.hidePicker() } catch (e) { /* ignore */ }
        }
        const input = picker.$el && picker.$el.querySelector('input')
        if (input && typeof input.blur === 'function') input.blur()
      }
      this.$nextTick(run)
      setTimeout(run, 50)
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
      // 只读快照，不改动表单内条件（搜索不得清空输入）
      return this.conditions.map(({ field, op, value }) => ({ field, op, value }))
    },
    resetConditions () {
      this.conditions = this.seedConditions()
    },
    /** 搜索：保留当前输入，仅向外抛条件 */
    emitSearch () {
      this.$emit('search', this.getConditions())
    },
    /** 重置：清空/恢复默认行后再抛出 */
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
  /* overflow-x:auto 时若 overflow-y:visible，规范会把 y 算成 auto，易出现纵向滚动条 */
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
.gp-dq-label {
  display: inline-block;
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
.gp-dynamic-query__row > .el-input,
.gp-dynamic-query__row > .gp-dq-value {
  margin-right: 8px;
  flex-shrink: 0;
}
.gp-dq-date-wrap {
  display: inline-block;
  vertical-align: middle;
  position: relative;
}
.gp-dq-switch {
  margin-right: 8px;
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
  background: var(--background, #fafafa);
  border: 1px dashed var(--border-color-2, #e8e8e8);
  border-radius: var(--gp-border-radius-base, 4px);
}
.gp-dynamic-query.is-compact .gp-dq-label {
  display: none;
}
</style>
