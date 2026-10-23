<template>
  <div class="dynamic-form">
    <el-form-item
      v-for="field in fields"
      :key="field.key"
      :label="field.label || field.key"
      :required="field.required"
    >
      <el-input
        v-if="field.type === 'text' || !field.type"
        v-model="localValue[field.key]"
        :placeholder="field.placeholder || '请输入'"
        :disabled="disabled"
        @input="emitValue"
      />
      <el-input
        v-else-if="field.type === 'textarea'"
        v-model="localValue[field.key]"
        type="textarea"
        :rows="3"
        :placeholder="field.placeholder || '请输入'"
        :disabled="disabled"
        @input="emitValue"
      />
      <el-input-number
        v-else-if="field.type === 'number' || field.type === 'amount'"
        v-model="localValue[field.key]"
        :min="0"
        :precision="field.type === 'amount' ? 2 : 0"
        style="width:100%"
        :disabled="disabled"
        @change="emitValue"
      />
      <el-date-picker
        v-else-if="field.type === 'date'"
        v-model="localValue[field.key]"
        type="date"
        value-format="yyyy-MM-dd"
        style="width:100%"
        :disabled="disabled"
        @change="emitValue"
      />
      <el-radio-group
        v-else-if="field.type === 'radio'"
        v-model="localValue[field.key]"
        :disabled="disabled"
        @change="emitValue"
      >
        <el-radio v-for="opt in field.options || []" :key="opt" :label="opt">{{ opt }}</el-radio>
      </el-radio-group>
      <el-checkbox-group
        v-else-if="field.type === 'checkbox'"
        v-model="localValue[field.key]"
        :disabled="disabled"
        @change="emitValue"
      >
        <el-checkbox v-for="opt in field.options || []" :key="opt" :label="opt">{{ opt }}</el-checkbox>
      </el-checkbox-group>
      <el-select
        v-else-if="field.type === 'select'"
        v-model="localValue[field.key]"
        style="width:100%"
        :disabled="disabled"
        @change="emitValue"
      >
        <el-option v-for="opt in field.options || []" :key="opt" :label="opt" :value="opt" />
      </el-select>
      <el-switch
        v-else-if="field.type === 'switch'"
        v-model="localValue[field.key]"
        :disabled="disabled"
        @change="emitValue"
      />
      <el-input
        v-else
        v-model="localValue[field.key]"
        :disabled="disabled"
        @input="emitValue"
      />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'DynamicForm',
  props: {
    schema: { type: [String, Object], default: null },
    value: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return { localValue: {} }
  },
  computed: {
    fields() {
      try {
        let obj = this.schema
        if (typeof obj === 'string' && obj.trim()) obj = JSON.parse(obj)
        return (obj && obj.fields) || []
      } catch (e) {
        return []
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(v) {
        this.localValue = this.initLocal(v)
      }
    },
    schema: {
      immediate: true,
      handler() {
        this.localValue = this.initLocal(this.value)
      }
    }
  },
  methods: {
    initLocal(v) {
      const base = { ...(v || {}) }
      this.fields.forEach(f => {
        if (base[f.key] === undefined) {
          base[f.key] = f.type === 'checkbox'
            ? []
            : (f.type === 'number' || f.type === 'amount' ? undefined : (f.type === 'switch' ? false : ''))
        }
      })
      return base
    },
    emitValue() {
      this.$emit('input', { ...this.localValue })
      this.$emit('change', { ...this.localValue })
    },
    validate() {
      for (const f of this.fields) {
        if (!f.required) continue
        const val = this.localValue[f.key]
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length)) {
          return `请填写「${f.label || f.key}」`
        }
      }
      return ''
    }
  }
}
</script>
