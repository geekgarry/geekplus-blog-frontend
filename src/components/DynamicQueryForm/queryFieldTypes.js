/**
 * 动态条件查询 · 字段类型与运算符适配
 * 查询区 valueType: text | number | select | date | datetime | switch
 * （不用 textarea，长文本列也按 text 单行输入）
 */
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

/** 各 valueType 可用运算符（为空/不为空通用） */
export const OPERATORS_BY_VALUE_TYPE = {
  text: ['eq', 'ne', 'like', 'notLike', 'isNull', 'isNotNull'],
  textarea: ['eq', 'ne', 'like', 'notLike', 'isNull', 'isNotNull'],
  number: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'isNull', 'isNotNull'],
  select: ['eq', 'ne', 'isNull', 'isNotNull'],
  date: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'isNull', 'isNotNull'],
  datetime: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'isNull', 'isNotNull'],
  switch: ['eq', 'ne', 'isNull', 'isNotNull'],
}

export function normalizeValueType (valueType) {
  const t = (valueType || 'text').toLowerCase()
  // 查询区不用 textarea（布局易撑开），一律按普通文本输入
  if (t === 'textarea') return 'text'
  if (OPERATORS_BY_VALUE_TYPE[t]) return t
  return 'text'
}

export function defaultOpForValueType (valueType) {
  const t = normalizeValueType(valueType)
  if (t === 'text') return 'like'
  return 'eq'
}

export function operatorsForValueType (valueType) {
  const keys = OPERATORS_BY_VALUE_TYPE[normalizeValueType(valueType)] || OPERATORS_BY_VALUE_TYPE.text
  return QUERY_OPERATORS.filter((op) => keys.indexOf(op.value) >= 0)
}

/**
 * 从库类型 / java 类型推断 valueType（生成模板与手工配置共用）
 * 注意：查询场景不返回 textarea，长文本列也用 text + 单行 input。
 */
export function inferValueTypeFromDb (columnDataType, javaType, htmlType) {
  if (htmlType) {
    const h = String(htmlType).toLowerCase()
    if (h === 'select' || h === 'radio') return 'select'
    if (h === 'checkbox' || h === 'switch') return 'switch'
    if (h === 'datetime' || h === 'datepicker') return 'datetime'
    if (h === 'date') return 'date'
    if (h === 'textarea' || h === 'editor') return 'text'
    if (h === 'number' || h === 'input-number') return 'number'
    if (h === 'input') return 'text'
  }
  const jt = javaType || ''
  const dt = (columnDataType || '').toLowerCase()
  if (jt === 'Date' || dt === 'datetime' || dt === 'timestamp' || dt === 'time') return 'datetime'
  if (dt === 'date' || dt === 'year') return 'date'
  if (jt === 'Integer' || jt === 'Long' || jt === 'Double' || jt === 'Float' || jt === 'BigDecimal' ||
      dt === 'int' || dt === 'bigint' || dt === 'tinyint' || dt === 'smallint' || dt === 'mediumint' ||
      dt === 'decimal' || dt === 'numeric' || dt === 'float' || dt === 'double') {
    return 'number'
  }
  return 'text'
}
