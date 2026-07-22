<template>
  <div
    class="shadow-2xl mx-auto overflow-hidden print:shadow-none print:mx-0 flex w-full max-w-[800px] min-h-[800px] md:min-h-[1131px]"
    :class="sidebarPosition === 'right' && layoutType === 'two-column' ? 'flex-row-reverse' : 'flex-row'"
    :style="{ backgroundColor, color: fontColor }"
  >
    <div
      v-if="layoutType === 'two-column'"
      class="w-1/3 p-4 md:p-8 break-words"
      :style="{ backgroundColor: sidebarBackgroundColor }"
    >
      <DynamicTemplateBlock
        v-for="block in actualSidebarBlocks"
        :key="block.id"
        :block="block"
        :data="data"
        :theme-color="themeColor"
        :layout-type="layoutType"
        :sidebar-block-ids="sidebarBlockIds"
      />
    </div>
    <div class="p-4 md:p-8 break-words" :class="layoutType === 'two-column' ? 'w-2/3' : 'w-full'">
      <DynamicTemplateBlock
        v-for="block in actualMainBlocks"
        :key="block.id"
        :block="block"
        :data="data"
        :theme-color="themeColor"
        :layout-type="layoutType"
        :sidebar-block-ids="sidebarBlockIds"
      />
    </div>
  </div>
</template>

<script>
import DynamicTemplateBlock from './DynamicTemplateBlock.vue';

export default {
  name: 'DynamicTemplate',
  components: { DynamicTemplateBlock },
  props: {
    data: {
      type: Object,
      required: true,
    },
    layoutData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    themeColor() {
      return this.layoutData.themeColor;
    },
    fontColor() {
      return this.layoutData.fontColor;
    },
    backgroundColor() {
      return this.layoutData.backgroundColor;
    },
    sidebarBackgroundColor() {
      return this.layoutData.sidebarBackgroundColor;
    },
    layoutType() {
      return this.layoutData.layoutType;
    },
    sidebarPosition() {
      return this.layoutData.sidebarPosition;
    },
    actualMainBlocks() {
      return this.layoutData.mainBlocks || this.layoutData.blocks || [];
    },
    actualSidebarBlocks() {
      return this.layoutData.sidebarBlocks || [];
    },
    sidebarBlockIds() {
      return this.actualSidebarBlocks.map((b) => b.id);
    },
  },
};
</script>
