<template>
  <div class="flex items-stretch mb-3">
    <div
      class="bg-[#1a2744] text-white text-sm font-bold px-4 py-1.5"
      :style="{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }"
    >
      {{ title }}
    </div>
    <div class="flex-1 border-b border-gray-200 self-end mb-0.5" />
  </div>
</template>

<script>
export default {
  name: 'CutTab',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
