<template>
  <el-dialog
    :title="title"
    :visible="visible"
    :width="picker ? '1080px' : '1100px'"
    append-to-body
    :close-on-click-modal="false"
    custom-class="gp-file-pick-dialog"
    @close="$emit('cancel')"
    @update:visible="onVisible"
  >
    <p v-if="picker" class="gp-file-pick-dialog__hint">
      进入目录找到文件后，点击右侧「选择」即可回填，无需勾选后再点底部确认。
    </p>
    <file-manager
      v-if="visible"
      in-modal
      :picker="picker"
      :initial-path="initialPath"
      :accept-kinds="acceptKinds"
      @pick="onPick"
    />
  </el-dialog>
</template>

<script>
import FileManager from "@/views/admin/system/file/index.vue";

export default {
  name: "FilePickModal",
  components: { FileManager },
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "从文件管理选择" },
    /** audio | image | video | all */
    kind: { type: String, default: "all" },
    initialPath: { type: String, default: "/" },
    /** false：完整文件管理（可删改），无选择列 */
    picker: { type: Boolean, default: true },
  },
  computed: {
    acceptKinds() {
      if (this.kind === "audio") return ["audio"];
      if (this.kind === "image") return ["image"];
      if (this.kind === "video") return ["video"];
      return [];
    },
  },
  methods: {
    onPick(row) {
      this.$emit("pick", row);
    },
    onVisible(val) {
      if (!val) this.$emit("cancel");
    },
  },
};
</script>

<style lang="scss">
.gp-file-pick-dialog {
  .el-dialog__body {
    padding: 12px 16px 16px;
    background: var(--background, #fafafa);
  }
  .gp-file-pick-dialog__hint {
    margin: 0 0 12px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-color-2, rgba(0, 0, 0, 0.65));
    background: var(--background-color, #ecf5ff);
    border: 1px solid var(--theme-color, #409eff);
    border-radius: var(--gp-border-radius-base, 4px);
  }
  .file-manager-container {
    background: var(--background, #fff);
    border: 1px solid var(--border-color, #f0f0f0);
    border-radius: var(--gp-border-radius-base, 4px);
    padding: 12px;
  }
}
</style>
