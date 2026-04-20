<template>
  <div class="error404Content">
    <div class="other_error404_page">
      <div class="error404Page">
        <img src="../../assets/images/error/404.png" />
      </div>
      <div class="errorWords">
        <div class="errorWords_display">
          <p>由于天气原因，这个页面已经去南极避暑了</p>
          <p>
            返回首页，请点击<router-link to="/"><u>首页</u></router-link>
          </p>
          <!-- <div class=""><b id="num">4</b>秒后跳转到首页</div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      intervalId: null, //定时器
    };
  },
  computed: {
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.$router.push({ path: '/' });
      // window.location.href = "/";
    }, 4000);
    // const _this = this;
    // setTimeout(function () {}, 4000);
  },
  methods: {
    //5秒刷新数据
    // countDown(secs) {
    //     if(--secs>0) {
    //         document.getElementById("num").innerText=secs;
    //         setTimeout(() => {countDown(secs)},1000);
    //     }
    //     else{
    //         window.location.href='/';
    //     }
    // },
  },
  deactivated() {
    if(this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
};
</script>

<style lang="scss" scoped>
/******************404,403等Error错误页面样式***********************/

.error404Content {
  width: 100%;
  min-height: calc(100vh - 60px);
  display: table;
}

.other_error404_page {
  width: 100%;
  padding: 10px 10px;
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.error404Page {
  text-align: center;
}

.error404Page img {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.errorWords {
  text-align: center;
  color: var(--fontColor, #333535);
}

.errorWords a {
  text-decoration: none;
}

.errorWords_display {
  font-size: 18px;
  font-family: 华文仿宋;
}
</style>
