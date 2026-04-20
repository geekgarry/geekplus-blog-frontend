<template>
  <div class="error403Content">
    <div class="other_error403_page">
        <div class="error403Page">
          <img src="../../assets/images/error/403.jpg" />
        </div>
        <div class="errorWords">
          <div class="errorWords_display" style="margin-top: 30px">
            <p>不好意思，您的权限不够，无法访问</p>
            <p><router-link to="/"><u>返回首页</u></router-link><a href="#" style="margin-left: 30px"></a></p>
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
      intervalId: null,
    };
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.$router.push({ path: '/' });
      // window.location.href = "/";
    }, 4000);
    // const _this = this;
    // setTimeout(function () {}, 4000);
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
.error403Content {
  width: 100%;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.other_error403_page {
  width: 100%;
  padding: 10px 10px;
  /* vertical-align: middle;
  text-align: center; */
}

.error403Page {
  text-align: center;
}

.error403Page img {
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
