<template>
  <!--
    Element UI 原版轮播封装：保留历史 el-carousel 用法，便于其它页面继续复用。
    首页已改用 PlusCarousel；需要官方箭头/指示器行为时请用本组件。
  -->
  <div class="el-carousel-banner" :class="{ 'is-loading': loading }" :style="wrapStyle">
    <el-carousel
      ref="carousel"
      :height="normalizedHeight"
      :interval="interval"
      :arrow="arrow"
      :indicator-position="indicatorPosition"
      :autoplay="autoplay"
      :loop="loop"
      :type="type"
      :direction="direction"
      @change="onChange"
    >
      <el-carousel-item v-for="(item, index) in slides" :key="index">
        <a
          class="el-carousel-banner__link"
          :href="item.link || 'javascript:void(0);'"
          @click.prevent="onItemClick(item)"
        >
          <img
            class="el-carousel-banner__img"
            :src="item.img"
            :alt="item.title || ''"
          >
          <div v-if="item.title" class="el-carousel-banner__caption">
            <span>{{ item.title }}</span>
          </div>
        </a>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
/**
 * ElCarouselBanner — 基于 Element UI el-carousel 的轮播封装
 *
 * 用途：保留项目早期首页轮播实现，方便日后其它模块按需引用。
 * 数据兼容：carouselImg / img / image；carouselTitle / title；carouselLink / link / href
 *
 * 示例：
 *   <el-carousel-banner :items="carouselList" height="280" :interval="3000" />
 */
export default {
  name: 'ElCarouselBanner',
  props: {
    /** 轮播数据列表 */
    items: {
      type: Array,
      default: () => []
    },
    /** 高度，数字按 px 处理 */
    height: {
      type: [String, Number],
      default: '280px'
    },
    /** 自动切换间隔（毫秒） */
    interval: {
      type: Number,
      default: 3000
    },
    /** 是否自动播放 */
    autoplay: {
      type: Boolean,
      default: true
    },
    /** 切换箭头：always / hover / never */
    arrow: {
      type: String,
      default: 'always'
    },
    /** 指示器位置：outside / none / ''(内部) */
    indicatorPosition: {
      type: String,
      default: ''
    },
    /** 是否循环 */
    loop: {
      type: Boolean,
      default: true
    },
    /** card 卡片模式等，透传 el-carousel */
    type: {
      type: String,
      default: ''
    },
    /** horizontal / vertical */
    direction: {
      type: String,
      default: 'horizontal'
    },
    /** 外层 loading 态（骨架样式由父级控制时可忽略） */
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** 统一成 el-carousel 需要的 height 字符串 */
    normalizedHeight() {
      if (typeof this.height === 'number') return this.height + 'px'
      return this.height || '280px'
    },
    wrapStyle() {
      return { minHeight: this.normalizedHeight }
    },
    /** 字段兼容旧首页 carouselList 结构 */
    slides() {
      return (this.items || []).map((it) => ({
        img: it.carouselImg || it.img || it.image || '',
        title: it.carouselTitle || it.title || '',
        link: it.carouselLink || it.link || it.href || ''
      })).filter((s) => s.img)
    }
  },
  mounted() {
    this.slideBanner();
  },
  methods: {
    /** 透传切换事件 */
    onChange(index) {
      this.$emit('change', index)
    },
    /** 点击幻灯片：外链新开，站内路由跳转 */
    onItemClick(item) {
      this.$emit('item-click', item)
      if (!item.link || item.link === 'javascript:void(0);') return
      if (/^https?:\/\//i.test(item.link)) {
        window.open(item.link, '_blank')
      } else if (this.$router) {
        this.$router.push(item.link)
      }
    },
    /** 暴露给父组件：上一张 / 下一张 / 跳转 */
    prev() {
      this.$refs.carousel && this.$refs.carousel.prev()
    },
    next() {
      this.$refs.carousel && this.$refs.carousel.next()
    },
    setActiveItem(index) {
      this.$refs.carousel && this.$refs.carousel.setActiveItem(index)
    },
    slideBanner() {
      var box = document.querySelector(".el-carousel__container");
      box.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
      });
      var startPointX = 0;
      var stopPointX = 0;
      var resetPoint = function () {
        startPointX = 0;
        stopPointX = 0;
      };
      box.addEventListener("mousedown", function (e) {
        startPointX = e.clientX;
      });
      box.addEventListener("mouseup", function (e) {
        const mouseEndX = e.clientX;
        const deltaX = mouseEndX - startPointX;

        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            resetPoint();
            that.$refs.slideCarousel.prev();
          } else {
            resetPoint();
            that.$refs.slideCarousel.next();
          }
        }
      });
      box.addEventListener("touchstart", function (e) {
        startPointX = e.changedTouches[0].pageX;
      }, { passive: true });
      box.addEventListener("touchmove", function (e) {
        stopPointX = e.changedTouches[0].pageX;
      }, { passive: true });
      let that = this;
      box.addEventListener("touchend", function (e) {
        if (stopPointX == 0 || startPointX - stopPointX == 0) {
          resetPoint();
          return;
        }
        if (startPointX - stopPointX > 0) {
          resetPoint();
          that.$refs.slideCarousel.next();
          return;
        }
        if (startPointX - stopPointX < 0) {
          resetPoint();
          that.$refs.slideCarousel.prev();
          return;
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.el-carousel-banner {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #e8ecf1;
}

.el-carousel-banner__link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  color: inherit;
}

.el-carousel-banner__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.el-carousel-banner__caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px 14px 12px;
  background: linear-gradient(180deg, transparent, rgba(20, 24, 32, 0.62));
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  pointer-events: none;

  span {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
