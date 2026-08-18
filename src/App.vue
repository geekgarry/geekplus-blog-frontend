<template>
  <div id="app">
    <router-view />
    <div class="plus-draggable-component">
      <component v-if="gpPlayerComponent" :is="gpPlayerComponent" @musicPlaying="isMusicPlaying"></component>
    </div>
  </div>
</template>
<script>
import {
  applyElementTheme,
  DEFAULT_THEME,
  resolveStoredThemeColor
} from '@/utils/elementTheme'

export default {
  name: 'App',
  data() {
    return {
      gpPlayerComponent: null,
    }
  },
  created() {
    console.log('当前时间：%O', new Date());
    console.log("%c"+window.location.host, "background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #25e),color-stop(0.75, #4f2), color-stop(0.9, #f2f), color-stop(1, #f22) );color:transparent;-webkit-background-clip: text;font-size:2em;")

    // 旧版默认色迁移
    const storedTheme = localStorage.getItem('themeColor')
    if (!storedTheme || /^#0badb6$/i.test(storedTheme) || /^#13c2c2$/i.test(storedTheme) || /^#6e8b8e$/i.test(storedTheme)) {
      localStorage.setItem('themeColor', DEFAULT_THEME)
      this.$store && this.$store.dispatch('settings/changeSetting', { key: 'themeColor', value: DEFAULT_THEME })
    }

    // 同步 CSS 变量 + 轻量覆盖；chalk 空闲再加载，不挡首屏
    applyElementTheme(resolveStoredThemeColor(), { defer: true })

    var key = "theme-mode";
    const themeMode = localStorage.getItem(key);
    if (themeMode) {
      if(themeMode.includes("dark")) {
        document.body.setAttribute(key, themeMode);
      }else if (themeMode.includes("light")) {
        document.body.removeAttribute(key, "dark");
      }
    } else {
      if (this.isDay) {
        document.body.removeAttribute(key, "dark")
      } else {
        document.body.setAttribute(key, "dark")
      }
    }
  },
  mounted() {
    const bootExtras = () => {
      import("plus-draggable-element").then(({ default: DraggableComponent }) => {
        new DraggableComponent({
          initialPosition: "right",
          buoyContent: '<svg class="bg-music-buoy" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12854" width="30" height="30"><path d="M682.666667 384 682.666667 298.666667 512 298.666667 512 533.333333C494.08 520.106667 472.32 512 448 512 389.12 512 341.333333 559.786667 341.333333 618.666667 341.333333 677.546667 389.12 725.333333 448 725.333333 506.88 725.333333 554.666667 677.546667 554.666667 618.666667L554.666667 384 682.666667 384M512 85.333333C747.52 85.333333 938.666667 276.48 938.666667 512 938.666667 747.52 747.52 938.666667 512 938.666667 276.48 938.666667 85.333333 747.52 85.333333 512 85.333333 276.48 276.48 85.333333 512 85.333333Z" p-id="12855" fill="currentColor"></path></svg>',
        });
      });
      this.loadGpPlayer();
    };
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(bootExtras, { timeout: 8000 });
    } else {
      window.setTimeout(bootExtras, 4000);
    }
  },
  computed: {
    isDay() {
      return this.isLightDay();
    },
  },
  methods: {
    async loadGpPlayer() {
      try {
        const module = await import('@/components/ApMusic/GpPlayer.vue')
        this.gpPlayerComponent = module.default || module
      } catch (error) {
        console.error('加载音乐播放器失败', error)
      }
    },
    isMusicPlaying(playing) {
      if (playing && playing === true) {
        document.getElementsByClassName("bg-music-buoy")[0].classList.add("iconRotate");
        this.bgMusicPlaying = true;
      } else {
        document.getElementsByClassName("bg-music-buoy")[0].classList.remove("iconRotate");
        this.bgMusicPlaying = false;
      }
    },
  }
}
</script>
<style lang="scss">
#app {
  font-family: "Helvetica Neue", Helvetica, Tahoma, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "黑体-简", "Microsoft YaHei", "微软雅黑", "WenQuanYi Micro Hei", "文泉驿微米黑", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
