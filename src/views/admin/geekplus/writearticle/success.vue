<template>
  <div class="success_container">
    <div class="success_container_main">
      <section class="row">
        <div class="container">
          <div class="success_main_img">
            <img src="@/assets/images/bg1.jpeg" />
          </div>
          <div class="success_main_words">
            <div class="success_main_words_display">
              <p>恭喜你！发布成功！</p>
              <p>
                  <a :href="'https://'+ windowHost +'/article/'+articleId" target="_blank" >
                    <u>跳转到文章页</u>
                  </a>
              </p>
              <p><router-link to="/admin/geekplus/articles">返回所有文章</router-link></p>
              <!-- <div class=""><b id="num">4</b>秒后跳转到首页</div> -->
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "PublishSuccess",
  props: {
    articleId: {
      type: Number,
      default: 1,
    }
  },
  data() {
    return {
      // timerOut: null,
      windowHost: window.location.host
    };
  },
  created() {
    // 获取URL中的查询字符串部分
    //var queryString = window.location.search;
    // 创建URLSearchParams对象
    //var params = new URLSearchParams(queryString);
    // 获取顶部导航栏中的值
    //var value = params.get('articleId');
    //this.intiTimer();
    // this.timerOut = window.setInterval(() => {
    //   setTimeout(this.getTableUp(), 0);
    // }, 3000);
    //setTimeout(this.goToIndex(), 2000);
  },
  mounted() {
    // this.getTableUp();
    // this.timerOut = window.setInterval(() => {
    //   setTimeout(this.getTableUp(), 0);
    // }, 3000);
    // setTimeout(function () {
    //   window.location.href = "/";
    // }, 4000);
  },
  methods: {
    // intiTimer: () => {
    //   setInterval(() => {
    //     window.location.href = "/";
    //   }, 5000);
    // },
    // goToIndex() {
    //   window.location.href = "/";
    // }
  },
  beforeDestroy() {
    //clearInterval(this.intiTimer);
    //this.timerOut = null;
  },
};
</script>

<style scoped>
.success_container {
    width: 100%;
    /* min-height: calc(100vh); */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .success_container_main {
    width: 100%;
    padding: 10px 10px;
    /* vertical-align: middle;
    text-align: center; */
  }
  .success_main_img {
    text-align: center;
  }

  .success_main_img img {
    width: 70%;
    margin: 0 auto;
  }
  .success_main_words {
    text-align: center;
    color: var(--color-main-container-text-1, #333535);
  }

  .success_main_words a {
    color: var(--color-link-text, #333535);
  }

  .success_main_words_display {
    margin-top: 10px;
    font-size: 1rem;
    font-family: 华文仿宋;
  }
</style>
