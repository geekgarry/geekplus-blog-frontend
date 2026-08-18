<template>
  <div v-if="enabled" class="gp-admin-watermark" aria-hidden="true">
    <div
      v-for="n in 24"
      :key="n"
      class="gp-admin-watermark__item"
    >{{ text }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AdminWatermark',
  computed: {
    ...mapGetters(['username', 'nickname']),
    enabled() {
      const v = this.$store.state.settings && this.$store.state.settings.adminWatermark
      return v === true || v === 'true' || v === '1'
    },
    text() {
      const who = this.nickname || this.username || 'GeekPlus'
      const d = new Date()
      const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return `${who} · ${day}`
    }
  }
}
</script>

<style scoped>
.gp-admin-watermark {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
  justify-content: space-around;
  opacity: 0.12;
}
.gp-admin-watermark__item {
  width: 33%;
  padding: 48px 0;
  text-align: center;
  font-size: 14px;
  color: var(--text-color-2, #344449);
  transform: rotate(-22deg);
  user-select: none;
  white-space: nowrap;
}
</style>
