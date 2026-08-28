<template>
  <!-- <transition :name="transitionName"
      enter-active-class="animate__bounceIn"
      leave-active-class="animate__bounceOut"> -->
  <notification-msg
    :operation-log="operationLog"
    :system-notice="systemNotice"
    :online-user="onlineUser"
    class="page-component-up"
    @clear="onPushClear"
  />
  <!-- </transition> -->
</template>

  <script>
import NotificationMsg from "@/layout/components/NotificationMsg"
import { applyRealtimePushDetail } from '@/utils/pushNotify'

export default {
  components: {
    NotificationMsg
  },
  name: 'FloatGroup',
  props: {
    transitionName: {
      type: String,
      default: 'floatGroup'
    },
    customStyle: {
      type: Object
    }
  },
  data() {
    return {
      visible: false,
      interval: null,
      operationLog: undefined,
      systemNotice: undefined,
      /** 与 Navbar 一致：仅他人 type=online 时点亮 */
      onlineUser: undefined,
    }
  },
  mounted() {
    //window.addEventListener('scroll', this.handleScroll)
    // 添加socket通知监听
    window.addEventListener('onmessageWS', this.getSocketData)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('onmessageWS', this.getSocketData)
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    handleScroll() {
      this.visible = window.pageYOffset > this.visibilityHeight
    },
    // 与 Navbar 相同：pushNotify 适配 v1/v2 推送体
    getSocketData(res) {
      console.log(res);
      const detail = res.detail || {}
      applyRealtimePushDetail(detail, this, {
        currentUserId: this.$store.getters.userId
      })
    },
    onPushClear(channel) {
      if (channel && Object.prototype.hasOwnProperty.call(this, channel)) {
        this[channel] = undefined
      }
    },
    /*
      缓动公式（Tween算法）
       t: 动画已经执行的时间（实际上时执行多少次/帧数）
       b: 起始位置
       c: 终止位置
       d: 从起始位置到终止位置的经过时间（实际上时执行多少次/帧数）

      http://www.cnblogs.com/mrsunny/archive/2011/06/21/2086080.html
    */
    easeInOutQuad(t, b, c, d) {
      // 判断当前时间是否总在总时间的一半以内，是的话执行缓入函数，否则的话执行缓出函数
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b
      } else {
        // 将总长度设置为一半，并且时间从当前开始递减，对图像进行垂直向上平移
        return -c / 2 * (--t * (t - 2) - 1) + b
      }
    }
  }
}
  </script>

  <style lang="scss" scoped>
/* 类名要对应回 name 的属性值 */
.plusBack-enter-active {
  animation: move 1s;
}
.plusBack-leave-active {
  animation: move 1s reverse;
}
@keyframes move {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translate(0);
  }
}
.page-component-up {
  width: 30px;
  height: 30px;
  position: fixed;
  cursor: pointer;
  text-align: center;
  transition: 0.3s;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  z-index: 99;
  i {
    color: #409eff;
    display: block;
    line-height: inherit;
    text-align: center;
    font-size: 18px;
  }
}
</style>
