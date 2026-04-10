<template>
  <div id="app">
    <router-view />
    <div class="plus-draggable-component">
      <gp-player @musicPlaying="isMusicPlaying"></gp-player>
    </div>
  </div>
</template>
<script>
import GpPlayer from '@/components/ApMusic/GpPlayer'
const version = require('element-ui/package.json').version // element-ui version from node_modules
const ORIGINAL_THEME = '#0badb6' // default color

export default {
  name: 'App',
  components: {
    GpPlayer
  },
  data() {
    return {
      chalk: '', // content of theme-chalk css
      themeColor: '',
    }
  },
  created() {
    this.preloadLibraries();
    console.log('当前时间：%O', new Date());
    console.log("%c"+window.location.host, "background-image:-webkit-gradient( linear, left top, right top, color-stop(0, #f22), color-stop(0.15, #f2f), color-stop(0.3, #22f), color-stop(0.45, #2ff), color-stop(0.6, #25e),color-stop(0.75, #4f2), color-stop(0.9, #f2f), color-stop(1, #f22) );color:transparent;-webkit-background-clip: text;font-size:2em;")
    // if(this.storageThemeColor) {
    //   this.themeColor = this.storageThemeColor;
      //把更换的颜色设置为全局css变量
      // document.documentElement.style.setProperty('--theme-color', this.storageThemeColor);
    // }
    var key = "theme-mode";
    const themeMode = localStorage.getItem(key);//"light"
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
    // 延后加载拖拽浮层组件，避免其代码进入首屏主包
    import("plus-draggable-element").then(({ default: DraggableComponent }) => {
      new DraggableComponent({
        initialPosition: "right", // 初始位置为右边
        buoyContent: '<svg class="bg-music-buoy" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12854" width="30" height="30"><path d="M682.666667 384 682.666667 298.666667 512 298.666667 512 533.333333C494.08 520.106667 472.32 512 448 512 389.12 512 341.333333 559.786667 341.333333 618.666667 341.333333 677.546667 389.12 725.333333 448 725.333333 506.88 725.333333 554.666667 677.546667 554.666667 618.666667L554.666667 384 682.666667 384M512 85.333333C747.52 85.333333 938.666667 276.48 938.666667 512 938.666667 747.52 747.52 938.666667 512 938.666667 276.48 938.666667 85.333333 747.52 85.333333 512 85.333333 276.48 276.48 85.333333 512 85.333333Z" p-id="12855" fill="currentColor"></path></svg>', // 设置箭头内容为 Font Awesome 图标
        //content: "", // 设置组件内容，文本内容，html或者组件
      });
    });
  },
  computed: {
    isDay() {
      return this.isLightDay();
    },
    storageThemeColor() {
      return localStorage.getItem("themeColor");
    }
  },
  watch: {
    async themeColor(val) {
      const oldVal = this.chalk ? this.themeColor : ORIGINAL_THEME
      if (typeof val !== 'string') return
      const themeCluster = this.getThemeCluster(val.replace('#', ''))
      const originalCluster = this.getThemeCluster(oldVal.replace('#', ''))

      const getHandler = (variable, id) => {
        return () => {
          const originalCluster = this.getThemeCluster(ORIGINAL_THEME.replace('#', ''))
          const newStyle = this.updateStyle(this[variable], originalCluster, themeCluster)

          let styleTag = document.getElementById(id)
          if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.setAttribute('id', id)
            document.head.appendChild(styleTag)
          }
          styleTag.innerText = newStyle
        }
      }

      if (!this.chalk) {
        const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
        await this.getCSSString(url, 'chalk')
      }

      const chalkHandler = getHandler('chalk', 'chalk-style')

      chalkHandler()

      const styles = [].slice.call(document.querySelectorAll('style'))
        .filter(style => {
          const text = style.innerText
          return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text)
        })
      styles.forEach(style => {
        const { innerText } = style
        if (typeof innerText !== 'string') return
        style.innerText = this.updateStyle(innerText, originalCluster, themeCluster)
      })

      //把更换的颜色设置为全局css变量
      document.documentElement.style.setProperty('--theme-color', val);
    }
  },
  methods: {
    async preloadLibraries() {
      // 预加载 vue-google-adsense，避免其代码进入首屏主包
      // try {
      //   const Ads = await import('vue-google-adsense');
      //   const AdsModule = Ads.default;
      //   // 全局注册组件
      //   Vue.component('Adsense', AdsModule.Adsense);
      //   Vue.component('InArticleAdsense', AdsModule.InArticleAdsense);
      //   Vue.component('InFeedAdsense', AdsModule.InFeedAdsense);
      // } catch (error) {
      //   console.error('Failed to preload vue-google-adsense:', error);
      // }
      try {
        const Ads = await import('vue-google-adsense');
        const AdsModule = Ads.default;
        // 注册组件
        this.$options.components.Adsense = AdsModule.Adsense;
        this.$options.components.InArticleAdsense = AdsModule.InArticleAdsense;
        this.$options.components.InFeedAdsense = AdsModule.InFeedAdsense;
      } catch (error) {
        console.error('Failed to load vue-google-adsense:', error);
      }
    },
    isMusicPlaying(playing) {
      // const articlePage = document.getElementsByClassName('plus-blog-article article-container');
      // const audios = document.getElementsByTagName('audio');
      // for (let i = 0; i < audios.length; i++) {
      //   if (audios[i].currentSrc) {
      //     return true;
      //   }
      // }
      // iconRotate
      if (playing && playing === true) {
        document.getElementsByClassName("bg-music-buoy")[0].classList.add("iconRotate");
        this.bgMusicPlaying = true;
      } else {
        document.getElementsByClassName("bg-music-buoy")[0].classList.remove("iconRotate");
        this.bgMusicPlaying = false;
      }
    },
    updateStyle(style, oldCluster, newCluster) {
      let newStyle = style
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
      })
      return newStyle
    },

    getCSSString(url, variable) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
            resolve()
          }
        }
        xhr.open('GET', url)
        xhr.send()
      })
    },

    getThemeCluster(theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) { // when primary color is in its rgb space
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255 - red))
          green += Math.round(tint * (255 - green))
          blue += Math.round(tint * (255 - blue))

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }
      }

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1 - shade) * red)
        green = Math.round((1 - shade) * green)
        blue = Math.round((1 - shade) * blue)

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }

      const clusters = [theme]
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      clusters.push(shadeColor(theme, 0.1))
      return clusters
    }
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
