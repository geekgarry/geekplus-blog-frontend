<template>
  <div
    class="gp-skel-root"
    :class="{ 'is-preview': preview }"
    :style="rootStyle"
  >
    <SkeletonRendererNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active-id="activeId"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script>
import { toCssSize } from './skeletonSchema'
import SkeletonRendererNode from './SkeletonRendererNode.vue'

export default {
  name: 'SkeletonRenderer',
  components: { SkeletonRendererNode },
  props: {
    schema: { type: Object, required: true },
    activeId: { type: String, default: '' },
    preview: { type: Boolean, default: false },
  },
  computed: {
    nodes() {
      return (this.schema && this.schema.nodes) || []
    },
    rootStyle() {
      const c = (this.schema && this.schema.canvas) || {}
      return {
        width: toCssSize(c.width, 'auto'),
        padding: toCssSize(c.padding, '16px'),
        gap: toCssSize(c.gap, '12px'),
        background: c.background || undefined,
      }
    },
  },
}
</script>
