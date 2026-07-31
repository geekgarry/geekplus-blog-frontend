<template>
  <div
    class="dyn-template shadow-2xl mx-auto overflow-hidden print:shadow-none print:mx-0 flex w-full max-w-[800px] min-h-[800px] md:min-h-[1131px]"
    :class="sidebarPosition === 'right' && layoutType === 'two-column' ? 'flex-row-reverse' : 'flex-row'"
    :style="rootStyle"
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
        :style-config="styleConfig"
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
        :style-config="styleConfig"
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
      return this.layoutData.themeColor || '#2563eb';
    },
    fontColor() {
      return this.layoutData.fontColor || '#333333';
    },
    backgroundColor() {
      return this.layoutData.backgroundColor || '#ffffff';
    },
    sidebarBackgroundColor() {
      return this.layoutData.sidebarBackgroundColor || '#f8fafc';
    },
    layoutType() {
      return this.layoutData.layoutType || 'single';
    },
    sidebarPosition() {
      return this.layoutData.sidebarPosition || 'left';
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
    styleConfig() {
      const ld = this.layoutData || {};
      return {
        headerStyle: ld.headerStyle || 'dot',
        sectionHeaderColor: ld.sectionHeaderColor || this.themeColor,
        sectionHeaderBg: ld.sectionHeaderBg || 'transparent',
        sectionBodyBg: ld.sectionBodyBg || 'transparent',
        sectionBorderColor: ld.sectionBorderColor || 'transparent',
        sectionRadius: typeof ld.sectionRadius === 'number' ? ld.sectionRadius : 0,
        sectionPadding: typeof ld.sectionPadding === 'number' ? ld.sectionPadding : 0,
      };
    },
    rootStyle() {
      const ld = this.layoutData || {};
      const bg = this.backgroundColor;
      const a = ld.backgroundAccentA || '#dbeafe';
      const b = ld.backgroundAccentB || '#fef3c7';
      const style = this.layoutData.backgroundStyle || 'solid';
      const base = { color: this.fontColor, backgroundColor: bg };
      if (style === 'gradient') {
        return {
          ...base,
          backgroundImage: `linear-gradient(145deg, ${bg} 0%, ${a} 55%, ${b} 100%)`,
        };
      }
      if (style === 'diagonal') {
        return {
          ...base,
          backgroundImage: `linear-gradient(135deg, ${bg} 0%, ${bg} 46%, ${a} 46%, ${a} 100%)`,
        };
      }
      if (style === 'blobs') {
        return {
          ...base,
          backgroundImage: [
            `radial-gradient(ellipse 55% 40% at 12% 18%, ${a} 0%, transparent 70%)`,
            `radial-gradient(ellipse 45% 35% at 88% 82%, ${b} 0%, transparent 68%)`,
            `radial-gradient(ellipse 30% 28% at 70% 20%, ${this.themeColor}33 0%, transparent 70%)`,
          ].join(','),
        };
      }
      return base;
    },
  },
};
</script>
