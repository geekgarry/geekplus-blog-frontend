<template>
  <div class="main-search-engine">
    <!-- <img :src="items[now].src" @click="toggleFlag" /> -->
    <div class="search-engine-content">
      <span @click="toggleFlag" class="search-engine-item">{{ items[now].name }}</span>
      <!-- <span @click="toggleFlag" class="search-engine-arrow"></span> -->
      <i @click="toggleFlag" class="el-icon-arrow-down" style="font-size: 20px; height: 100%; padding: 5px;"></i>
    </div>
    <transition-group tag="ul" v-show="flagShow" class="search-engine-list">
      <template v-for="(item, index) in items">
        <li :key="index" @click="changeFlag(index)" @mouseover="flagHover(index)" :class="{ selectback: index == hoverIndex }">
          <!-- <img :src="item.src" /> -->
          <span>{{ item.name }}</span>
        </li>
      </template>
    </transition-group>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LogoName",
  components: {},
  props: {},
  data() {
    return {
      // items: [{ src: require('@/assets/images/360_logo.png') }, { src: require('@/assets/images/baidu_logo.png') }, { src: require('@/assets/images/sougou_logo.png') }],
      items: [{ name: "360" }, { name: "百度" }, { name: "搜狗" }, { name: "必应" }],
      now: 0,
      flagShow: false,
      hoverIndex: -1
    }
  },
  methods: {
    //显示隐藏图片列表
    toggleFlag() {
      this.flagShow = !this.flagShow;
    },
    //改变搜索引擎
    changeFlag(index) {
      this.now = index;
      this.flagShow = false;
      // 触发父组件的自定义事件，向父组件传参数,selectNow是选择了哪个搜索引擎的索引，父组件得到了之后就可以指定搜索时跳转到哪个搜索引擎
      this.$emit('getIndex', this.now);
    },
    //li hover
    flagHover(index) {
      this.hoverIndex = index;
    }
  }
});
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0
}

/* 搜索引擎样式 */
.main-search-engine {
  width: 130px;
  height: fit-content;
  padding: 5px;
  position: relative;
  margin: 0 auto;
}

.search-engine-content {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
}

.search-engine-item {
  padding: 0 5px;
  flex: 1;
}

.main-logo img {
  display: block;
  margin: 0 auto;
  user-select: none;
  cursor: pointer;
}

.search-engine-arrow {
  width: 0;
  height: 0;
  border: 8px solid;
  border-color: #000 transparent transparent transparent;
  cursor: pointer;
  margin: 5px;
}

.search-engine-list {
  position: absolute;
  top: 100%;
  width: inherit;
  left: 0;
  z-index: 999999;
}

.search-engine-list li {
  width: 100%;
  height: 35px;
  background-color: var(--background-origin, #FEFEFE);
  /*少个封号报错*/
  line-height: 35px;
  padding-top: 1px;
}

.search-engine-list li img {
  width: 100%;
  margin-top: 10px;
}

.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all .5s;
}

.logo-fade-enter,
.logo-fade-leave-active {
  opacity: 0;
  transform: translateY(20px);
}

.selectback {
  background-color: var(--hover-background, #eee) !important;
  cursor: pointer
}
</style>
