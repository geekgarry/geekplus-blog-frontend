<template>
  <!-- 可嵌套拖拽编辑项：row/stack 内再建一层 draggable -->
  <div
    class="skel-tree-item"
    :class="{
      'is-active': activeId === node.id,
      'is-container': isContainer,
      'is-row': node.type === 'row',
      'is-stack': node.type === 'stack',
    }"
    @click.stop="$emit('select', node)"
  >
    <div class="skel-tree-item__bar">
      <span class="skel-tree-item__type">{{ typeLabel }}</span>
      <span class="skel-tree-item__acts">
        <i class="el-icon-copy-document" title="复制" @click.stop="$emit('copy', node)" />
        <i class="el-icon-delete" title="删除" @click.stop="$emit('remove', node)" />
      </span>
    </div>

    <!-- 叶子预览 -->
    <div v-if="!isContainer" class="skel-tree-item__body">
      <div
        v-if="node.type === 'circle'"
        class="gp-skel gp-skel--circle"
        :style="{ width: cssSize(node.size), height: cssSize(node.size) }"
      />
      <div v-else-if="node.type === 'line'" class="gp-skel gp-skel--line" :style="lineInline" />
      <div
        v-else-if="node.type === 'lines'"
        class="gp-skel-lines"
        :style="{ gap: cssSize(node.gap, '8px') }"
      >
        <div
          v-for="i in lineCount"
          :key="node.id + '-' + i"
          class="gp-skel gp-skel--line"
          :style="linesInline(i === lineCount)"
        />
      </div>
      <div v-else-if="node.type === 'block'" class="gp-skel gp-skel--block" :style="blockInline" />
      <div
        v-else-if="node.type === 'field' || node.type === 'textarea'"
        class="gp-skel"
        :class="node.type === 'textarea' ? 'gp-skel--textarea' : 'gp-skel--field'"
        :style="fieldInline"
      />
      <div
        v-else-if="node.type === 'gap'"
        class="gp-skel-gap skel-gap-edit"
        :style="{ height: cssSize(node.height, '16px') }"
      />
    </div>

    <!-- 容器：横向/纵向嵌套列表，可继续拖入子节点 -->
    <draggable
      v-else
      class="skel-tree-item__children"
      :class="{ 'is-row-dir': node.type === 'row' }"
      :list="node.children"
      :group="{ name: 'skelGroup' }"
      :options="{ filter: '.skel-drop-hint' }"
      animation="180"
      @change="$emit('change')"
    >
      <SkeletonTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :active-id="activeId"
        @select="$emit('select', $event)"
        @copy="$emit('copy', $event)"
        @remove="$emit('remove', $event)"
        @change="$emit('change')"
      />
      <p v-if="!(node.children && node.children.length)" class="skel-drop-hint">
        {{ node.type === 'row' ? '拖入组件组成左右布局' : '拖入组件组成纵向组' }}
      </p>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { isContainerType, toCssSize, SKELETON_PALETTE } from './skeletonSchema'

export default {
  name: 'SkeletonTreeItem',
  components: { draggable },
  props: {
    node: { type: Object, required: true },
    activeId: { type: String, default: '' },
  },
  computed: {
    isContainer() {
      return isContainerType(this.node.type)
    },
    typeLabel() {
      const hit = SKELETON_PALETTE.find((p) => p.type === this.node.type)
      return (hit && hit.label) || this.node.type
    },
    lineCount() {
      return Math.max(1, Number(this.node.count) || 1)
    },
    lineInline() {
      const n = this.node
      return {
        width: toCssSize(n.width, '70%'),
        height: toCssSize(n.height, '14px'),
        borderRadius: toCssSize(n.radius, '4px'),
      }
    },
    blockInline() {
      const n = this.node
      return {
        width: toCssSize(n.width, '100%'),
        height: toCssSize(n.height, '120px'),
        borderRadius: toCssSize(n.radius, '8px'),
      }
    },
    fieldInline() {
      const n = this.node
      return {
        width: toCssSize(n.width, '100%'),
        height: toCssSize(n.height, n.type === 'textarea' ? '88px' : '36px'),
        borderRadius: toCssSize(n.radius, '6px'),
      }
    },
  },
  methods: {
    cssSize: toCssSize,
    linesInline(isLast) {
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

<style scoped>
.skel-tree-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--background-origin);
  padding: 6px;
  min-width: 0;
}
.skel-tree-item.is-active {
  border-color: var(--theme-color);
  box-shadow: 0 0 0 1px var(--theme-color-muted);
}
.skel-tree-item.is-container {
  background: var(--background-2);
}
.skel-tree-item__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--muted-1-color);
}
.skel-tree-item__type {
  font-weight: 600;
  color: var(--theme-color);
}
.skel-tree-item__acts {
  display: flex;
  gap: 8px;
  cursor: pointer;
  color: var(--theme-color);
}
.skel-tree-item__body {
  min-height: 8px;
}
.skel-tree-item__children {
  min-height: 48px;
  padding: 6px;
  border: 1px dashed var(--border-color-2);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skel-tree-item__children.is-row-dir {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
}
.skel-tree-item__children.is-row-dir > .skel-tree-item {
  flex: 1 1 120px;
  max-width: 100%;
}
.skel-drop-hint {
  margin: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: var(--muted-1-color);
  padding: 10px 4px;
}
.skel-gap-edit {
  border: 1px dashed var(--border-color-2);
  background: transparent;
}
</style>
