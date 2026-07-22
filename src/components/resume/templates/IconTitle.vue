<template>
  <div class="flex items-center gap-2.5 mb-3 pb-2 border-b border-gray-100">
    <span class="w-8 h-8 rounded-full bg-[#2563eb] text-white text-sm flex items-center justify-center shrink-0 shadow-sm">{{ icon }}</span>
    <h2 class="text-base font-bold text-gray-900">{{ title }}</h2>
  </div>
</template>

<script>
export default {
  name: 'IconTitle',
  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
