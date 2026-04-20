/* eslint-disable no-console */
import store from "./store";
import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  if ("serviceWorker" in navigator) {
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready() {
        console.log(
          "App is being served from cache by a service worker.\n" +
            "For more details, visit https://goo.gl/AFskqB"
        );
      },
      registered() {
        console.log("Service worker has been registered.");
      },
      cached() {
        console.log("Content has been cached for offline use.");
      },
      updatefound() {
        console.log("New content is downloading.");
      },
      updated() {
        console.log("New content is available; please refresh.");
      },
      offline() {
        console.log(
          "No internet connection found. App is running in offline mode."
        );
      },
      error(error) {
        console.error("Error during service worker registration:", error);
      },
    });
    navigator.serviceWorker
      .register("/worker/downloadServiceWorker.js")
      .then((registration) => {
        store.commit("app/SET_SW_REGISTERED", true);
        //store.dispatch
        // this.swRegistered = true;
        // 监听来自 SW 的下载进度消息
        // navigator.serviceWorker.addEventListener("message", (event) => {
          // if (event.data.type === "sw_progress") {
            // if (!this.progressVisible) {
            //   this.progressTitle = "后台下载中 (Service Worker)";
            //   this.progressDesc = "基于浏览器底层流进行极速下载中...";
            //   this.progressVisible = true;
            // }
            // this.progressPercent = event.data.percent;
          // } else if (event.data.type === "sw_success") {
            // this.$message.success("下载流已完成传递");
            // setTimeout(() => {
            //   this.progressVisible = false;
            // }, 500);
          // }
        // });
      })
      .catch((err) => {
        console.warn(
          "Service Worker 注册失败, 将回退到 Web Worker 或普通下载:",
          err
        );
      });
  }
}
