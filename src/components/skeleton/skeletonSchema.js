/**
 * 骨架屏 Schema：叶子节点 + 布局容器（row / stack）。
 * - row：横向 flex，实现左右布局
 * - stack：纵向组，可嵌在 row 内（如头像旁的多行文案）
 * 叶子：circle | line | lines | block | gap | field | textarea
 * field/textarea：表单控件外形占位（非真实可输入组件，只服务骨架视觉）
 */
export const SKELETON_LOCAL_KEY = 'gp_skeleton_studio_v1'

export const SKELETON_PALETTE = [
  { type: 'row', label: '横向行', icon: 'el-icon-right', kind: 'layout' },
  { type: 'stack', label: '纵向组', icon: 'el-icon-bottom', kind: 'layout' },
  { type: 'circle', label: '圆形头像', icon: 'el-icon-user', kind: 'leaf' },
  { type: 'line', label: '单行文字', icon: 'el-icon-minus', kind: 'leaf' },
  { type: 'lines', label: '多行文字', icon: 'el-icon-s-order', kind: 'leaf' },
  { type: 'block', label: '矩形块', icon: 'el-icon-menu', kind: 'leaf' },
  { type: 'field', label: '输入框', icon: 'el-icon-edit-outline', kind: 'leaf' },
  { type: 'textarea', label: '文本域', icon: 'el-icon-tickets', kind: 'leaf' },
  { type: 'gap', label: '间距', icon: 'el-icon-rank', kind: 'leaf' },
]

export const LAYOUT_ALIGN_OPTIONS = [
  { value: 'stretch', label: '拉伸' },
  { value: 'flex-start', label: '顶对齐' },
  { value: 'center', label: '居中' },
  { value: 'flex-end', label: '底对齐' },
]

export const LAYOUT_JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: '靠左' },
  { value: 'center', label: '居中' },
  { value: 'flex-end', label: '靠右' },
  { value: 'space-between', label: '两端对齐' },
  { value: 'space-around', label: '环绕间距' },
]

export function defaultCanvas() {
  return {
    minWidth: 75,
    width: '100%',
    padding: 16,
    gap: 12,
    background: 'var(--background-origin, #fffcf8)',
  }
}

export function createNodeId() {
  return 'sk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
}

export function isContainerType(type) {
  return type === 'row' || type === 'stack'
}

/** 按类型生成节点；容器带 children，叶子可带 flex（在 row 内占宽） */
export function createSkeletonNode(type, partial) {
  const base = { id: createNodeId(), type }
  const defaults = {
    row: {
      gap: 12,
      align: 'center',
      justify: 'flex-start',
      // 相对父级宽度；空=100%
      width: '100%',
      children: [],
    },
    stack: {
      gap: 8,
      flex: 1,
      width: '',
      children: [],
    },
    circle: { size: 48, flex: '' },
    line: { width: '70%', height: 14, radius: 4, flex: '' },
    lines: { width: '100%', height: 12, count: 3, gap: 8, radius: 4, lastWidth: '55%', flex: '' },
    block: { width: '100%', height: 120, radius: 8, flex: '' },
    // 输入框占位：浅边框条，模拟搜索框/表单项
    field: { width: '100%', height: 36, radius: 6, flex: '' },
    // 多行文本域占位
    textarea: { width: '100%', height: 88, radius: 6, flex: '' },
    gap: { height: 16, flex: '' },
  }
  const merged = { ...base, ...(defaults[type] || defaults.block), ...partial }
  // partial 可能带旧 children；保证容器始终是数组
  if (isContainerType(merged.type) && !Array.isArray(merged.children)) {
    merged.children = []
  }
  return merged
}

/** 深拷贝节点树（新 id），用于复制 */
export function cloneSkeletonNode(node) {
  if (!node) return null
  const { id: _omit, children, ...rest } = node
  const next = createSkeletonNode(node.type, { ...rest })
  if (isContainerType(node.type)) {
    next.children = (children || []).map((c) => cloneSkeletonNode(c))
  }
  return next
}

export function defaultSkeletonSchema() {
  // 默认示例：头像 | 文案 左右布局 + 下方大图，说明 row/stack 用法
  const textStack = createSkeletonNode('stack', {
    flex: 1,
    children: [
      createSkeletonNode('line', { width: '70%', height: 16 }),
      createSkeletonNode('line', { width: '45%', height: 12 }),
    ],
  })
  const headerRow = createSkeletonNode('row', {
    align: 'center',
    gap: 12,
    children: [createSkeletonNode('circle', { size: 56 }), textStack],
  })
  return {
    version: 2,
    name: '未命名骨架',
    canvas: defaultCanvas(),
    nodes: [
      headerRow,
      createSkeletonNode('gap', { height: 12 }),
      createSkeletonNode('block', { height: 140, radius: 10 }),
      createSkeletonNode('gap', { height: 10 }),
      createSkeletonNode('lines', { count: 3 }),
    ],
  }
}

export function loadSkeletonSchema() {
  try {
    const raw = localStorage.getItem(SKELETON_LOCAL_KEY)
    if (!raw) return defaultSkeletonSchema()
    const obj = JSON.parse(raw)
    if (!obj || !Array.isArray(obj.nodes)) return defaultSkeletonSchema()
    return {
      ...defaultSkeletonSchema(),
      ...obj,
      canvas: { ...defaultCanvas(), ...(obj.canvas || {}) },
      nodes: obj.nodes,
    }
  } catch (e) {
    return defaultSkeletonSchema()
  }
}

export function saveSkeletonSchema(schema) {
  localStorage.setItem(SKELETON_LOCAL_KEY, JSON.stringify(schema))
}

export function toCssSize(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback || 'auto'
  if (typeof v === 'number') return v + 'px'
  return String(v)
}

/** 在树中按 id 查找节点，返回 { node, parentList, index } */
export function findNodeInTree(list, id, parentList) {
  const arr = list || []
  for (let i = 0; i < arr.length; i++) {
    const n = arr[i]
    if (n.id === id) return { node: n, parentList: parentList || arr, index: i }
    if (isContainerType(n.type) && n.children) {
      const hit = findNodeInTree(n.children, id, n.children)
      if (hit) return hit
    }
  }
  return null
}

/** flex / 宽度：用于 row 内子项 */
export function itemLayoutStyle(node) {
  const style = {}
  if (node.flex !== undefined && node.flex !== null && node.flex !== '') {
    const f = Number(node.flex)
    if (!Number.isNaN(f) && f > 0) {
      style.flex = String(f)
      style.minWidth = '0'
    }
  }
  if (node.width !== undefined && node.width !== null && node.width !== '') {
    style.width = toCssSize(node.width)
  }
  if (node.type === 'row' && !style.width) {
    style.width = '100%'
  }
  return style
}
