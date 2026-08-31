<template>
  <div ref="rightPanel" :class="{show:show}" class="rightPanel-container">
    <div class="rightPanel-background" />
    <div class="rightPanel">
      <div class="rightPanel-items">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { addClass, removeClass } from '@/utils'

/**
 * 管理端右侧设置抽屉壳：由 settings.showSettings 控制显隐。
 * 须常驻挂载（layout 勿 v-if），否则打开时 watcher 不触发，body 滚动锁失效。
 */
export default {
  name: 'RightPanel',
  props: {
    clickNotClose: {
      default: false,
      type: Boolean
    },
    buttonTop: {
      default: 250,
      type: Number
    }
  },
  computed: {
    show: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(value) {
        this.syncBodyLock(value)
        if (value && !this.clickNotClose) {
          this.addEventClick()
        } else {
          this.removeEventClick()
        }
      }
    }
  },
  mounted() {
    this.insertToBody()
  },
  beforeDestroy() {
    this.removeEventClick()
    removeClass(document.body, 'showRightPanel')
    const elx = this.$refs.rightPanel
    if (elx && elx.parentNode) {
      elx.parentNode.removeChild(elx)
    }
  },
  methods: {
    syncBodyLock(open) {
      if (open) {
        addClass(document.body, 'showRightPanel')
      } else {
        removeClass(document.body, 'showRightPanel')
      }
    },
    addEventClick() {
      // 先卸再挂，避免重复监听
      this.removeEventClick()
      window.addEventListener('click', this.closeSidebar)
    },
    removeEventClick() {
      window.removeEventListener('click', this.closeSidebar)
    },
    closeSidebar(evt) {
      const parent = evt.target && evt.target.closest
        ? evt.target.closest('.rightPanel')
        : null
      if (!parent) {
        this.show = false
      }
    },
    insertToBody() {
      const elx = this.$refs.rightPanel
      if (!elx) return
      document.body.insertBefore(elx, document.body.firstChild)
    }
  }
}
</script>

<style>
/* 打开设置时锁住背后页面滚动（滚动条占位宽约 15px） */
.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
  background: rgba(0, 0, 0, .2);
  z-index: -1;
}

.rightPanel {
  width: 100%;
  max-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .05);
  transition: all .25s cubic-bezier(.7, .3, .1, 1);
  transform: translate(100%);
  background: var(--background-origin, #fff);
  z-index: 40000;
  /* 配置项增多后需可纵向滚动；勿用 overflow:hidden 裁切 */
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.rightPanel-items {
  min-height: 100%;
  box-sizing: border-box;
}

.show {
  transition: all .3s cubic-bezier(.7, .3, .1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translate(0);
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;
  i {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
