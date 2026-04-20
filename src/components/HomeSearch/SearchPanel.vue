<template>
  <div id="app">
    <logo-name @getIndex="getIndex"></logo-name>
    <div class="search-input-wrapper">
      <div class="search-input ">
        <input class="plus-input__inner no-right-radius" v-model="keyword" @keyup="get($event)"
          @keydown.enter="searchInput()" @keydown.down="selectDown()" @keydown.up.prevent="selectUp()"
          placeholder="输入搜索内容" />
        <span @click="clearInput()" class="search-reset">×</span>
        <div class="search-select" :class="{ showSelectBorder: myData.length > 0 }">
          <transition-group tag="ul" mode="out-in">
            <template v-for="(value, index) in myData">
              <li :key="index" class="search-select-option search-select-list" :class="{ selectback: index == now }" @click="searchThis(index)" @mouseover="selectHover(index)">
                {{ value }}
              </li>
            </template>
          </transition-group>
        </div>
      </div>
      <button @click="searchInput()" class="search-btn">搜索</button>
    </div>
    <div class="home-search-footer">
      <span>
        由<a href="/" target="_blank">GeekPlus</a>提供技术支持
      </span>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import LogoName from "./LogoName.vue";

export default defineComponent({
  name: "SearchPanel",
  components: {
    LogoName
  },
  props: {},
  data() {
    return {
      keyword: '',
      myData: [], // 用来接收ajax得到的数据
      searchIndex: 0,
      now: -1,
      logoData: [{
        'name': "360搜索",
        searchSrc: "https://www.so.com/s?ie=utf-8&shb=1&src=360sou_newhome&q="
      },
      {
        'name': "百度搜索",
        searchSrc: "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd="
      },
      {
        'name': "搜狗搜索",
        searchSrc: "https://www.sogou.com/web?query="
      },
      {
        'name': "必应搜索",
        searchSrc: "https://cn.bing.com/search?q="
      }
      ]
    }
  },
  methods: {
    // &event是实参，表示event对象
    get: function (event) {
      const that = this;
      // 如果按得键是上或者下，就不进行ajax
      if (event.keyCode == 38 || event.keyCode == 40) {
        return;
      }
      that.$http.jsonp('https://sug.so.360.cn/suggest?word=' + that.keyword + '&encodein=utf-8&encodeout=utf-8', null).then(function (res) {
        that.myData = [];
        res.result.forEach(element => {
          that.myData.push(element.word);
        });
      })
    },
    //清除内容
    clearInput: function () {
      const that = this;
      that.keyword = '';
      that.$http.jsonp('https://sug.so.360.cn/suggest?word=' + that.keyword + '&encodein=utf-8&encodeout=utf-8', null).then(function (res) {
        that.myData = [];
        res.result.forEach(element => {
          that.myData.push(element.word);
        });
      })
    },
    //搜索
    searchInput: function () {
      //打开对应的搜索界面
      window.open(this.logoData[this.searchIndex].searchSrc + this.keyword);
    },
    //搜索的内容
    searchThis: function (index) {
      this.keyword = this.myData[index];
      this.searchInput();
    },
    //li hover
    selectHover: function (index) {
      this.keyword = this.myData[index];
      this.now = index;
    },
    //向下
    selectDown: function () {
      this.now++;
      if (this.now == this.myData.length) {
        this.now = 0;
      }
      this.keyword = this.myData[this.now];
    },
    //向上
    selectUp: function () {
      this.now--;
      if (this.now == -1) {
        this.now = this.myData.length - 1;
      }
      this.keyword = this.myData[this.now];
    },
    // 获取选中搜索引擎索引
    getIndex: function (index) {
      this.searchIndex = index;
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

#app {
  color: var(--fontColor, #2c3e50);
  max-width: 800px;
  padding: 80px 10px 0;
  font-family: Source Sans Pro, Helvetica, sans-serif;
  text-align: center;
  margin: 0 auto;
}

.search-input-wrapper {
  height: 45px;
  width: 100%;
  margin: 0 auto;
  margin-top: 10px;
  display: flex;
}

.search-input {
  display: flex;
  position: relative;
  flex: 1;
}

.search-input input {
  box-sizing: border-box;
  width: 100%;
  height: 45px;
  font-size: 18px;
  float: left;
  padding-left: 10px;
  padding-right: 10px;
  overflow: hidden;
  flex: 1;
  border: 1px solid var(--plus-grey-9, #d4d4d4);
}

.search-input input:focus {
  border: 1px solid var(--theme-color, mediumseagreen);
}

.search-btn {
  height: 45px;
  width: 70px;
  border: 1px solid var(--theme-color, mediumseagreen);
  background-color: var(--theme-color, mediumseagreen);
  color: white;
  font-size: 14px;
  font-weight: bold;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  position: relative;
}

.search-select {
  position: absolute;
  top: 50px;
  width: 100%;
  box-sizing: border-box;
  z-index: 999;
  border-radius: 4px;
  overflow: hidden;
}

.search-select.showSelectBorder {
  border: 1px solid var(--theme-color, mediumseagreen);
}

.search-select li {
  border: 1px solid var(--borderColor, #d4d4d4);
  border-top: none;
  border-bottom: none;
  background-color: var(--background-origin, #fff);
  width: 100%
}

.search-select-option {
  box-sizing: border-box;
  padding: 7px 10px;
}

.selectback {
  background-color: var(--hover-background, #eee) !important;
  cursor: pointer
}

input::-ms-clear {
  display: none
}

.search-reset {
  width: 21px;
  height: 21px;
  position: absolute;
  display: block;
  line-height: 21px;
  text-align: center;
  cursor: pointer;
  font-size: 20px;
  right: 10px;
  top: 12px
}

.search-select-list {
  transition: all 0.5s
}

.itemfade-enter,
.itemfade-leave-active {
  opacity: 0;
}

.itemfade-leave-active {
  position: absolute;
}

.selectback {
  background-color: var(--hover-background, #eee) !important;
  cursor: pointer
}

.search-select ul {
  margin: 0;
  text-align: left;
}

.home-search-footer {
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 12px;
  padding: 6px 0;
}
</style>
