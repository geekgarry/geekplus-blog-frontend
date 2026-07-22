<template>
  <div class="flex items-center gap-2 mb-3">
    <span class="text-[#3b82f6] font-black tracking-tighter text-lg">//</span>
    <h2 class="text-base font-bold text-gray-900 whitespace-nowrap">{{ title }}</h2>
    <div class="flex-1 h-px bg-[#93c5fd]" />
  </div>
</template>

<script>
export default {
  name: 'SectionSlash',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
