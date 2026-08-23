<template>
  <!-- Vue2 单根：容器与叶子共用外层，class/style 按 type 切换 -->
  <div
    :class="rootClass"
    :style="rootStyle"
    @click.stop="$emit('select', node)"
  >
    <template v-if="isContainer">
      <SkeletonRendererNode
        v-for="child in node.children || []"
        :key="child.id"
        :node="child"
        :active-id="activeId"
        @select="$emit('select', $event)"
      />
    </template>
    <template v-else-if="node.type === 'lines'">
      <div
        v-for="i in lineCount"
        :key="node.id + '-' + i"
        class="gp-skel gp-skel--line"
        :style="linesItemStyle(i === lineCount)"
      />
    </template>
  </div>
</template>

<script>
import { isContainerType, itemLayoutStyle, toCssSize } from './skeletonSchema'

export default {
  name: 'SkeletonRendererNode',
  props: {
    node: { type: Object, required: true },
    activeId: { type: String, default: '' },
  },
  computed: {
    isContainer() {
      return isContainerType(this.node.type)
    },
    lineCount() {
      return Math.max(1, Number(this.node.count) || 1)
    },
    rootClass() {
      const t = this.node.type
      const active = this.activeId === this.node.id ? 'is-active' : ''
      const map = {
        row: 'gp-skel-row',
        stack: 'gp-skel-stack',
        circle: 'gp-skel gp-skel--circle',
        line: 'gp-skel gp-skel--line',
        lines: 'gp-skel-lines',
        block: 'gp-skel gp-skel--block',
        field: 'gp-skel gp-skel--field',
        textarea: 'gp-skel gp-skel--textarea',
        gap: 'gp-skel-gap',
      }
      return [map[t] || 'gp-skel', active]
    },
    rootStyle() {
      const n = this.node
      const layout = itemLayoutStyle(n)
      if (n.type === 'row') {
        return {
          ...layout,
          gap: toCssSize(n.gap, '12px'),
          alignItems: n.align || 'center',
          justifyContent: n.justify || 'flex-start',
        }
      }
      if (n.type === 'stack') {
        return {
          ...layout,
          gap: toCssSize(n.gap, '8px'),
        }
      }
      if (n.type === 'circle') {
        const s = toCssSize(n.size, '48px')
        return { ...layout, width: s, height: s }
      }
      if (n.type === 'line') {
        return {
          ...layout,
          width: toCssSize(n.width, '70%'),
          height: toCssSize(n.height, '14px'),
          borderRadius: toCssSize(n.radius, '4px'),
        }
      }
      if (n.type === 'lines') {
        return { ...layout, gap: toCssSize(n.gap, '8px') }
      }
      if (n.type === 'block' || n.type === 'field' || n.type === 'textarea') {
        const defH = n.type === 'textarea' ? '88px' : n.type === 'field' ? '36px' : '120px'
        return {
          ...layout,
          width: toCssSize(n.width, '100%'),
          height: toCssSize(n.height, defH),
          borderRadius: toCssSize(n.radius, n.type === 'block' ? '8px' : '6px'),
        }
      }
      if (n.type === 'gap') {
        return { height: toCssSize(n.height, '16px') }
      }
      return layout
    },
  },
  methods: {
    linesItemStyle(isLast) {
      const n = this.node
      return {
        width: isLast ? toCssSize(n.lastWidth, '55%') : toCssSize(n.width, '100%'),
        height: toCssSize(n.height, '12px'),
        borderRadius: toCssSize(n.radius, '4px'),
      }
    },
  },
}
</script>
