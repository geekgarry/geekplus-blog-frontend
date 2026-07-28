/* eslint-disable no-console */
import store from "./store";
import { register } from "register-service-worker";

function registerDownloadServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("/worker/downloadServiceWorker.js")
    .then(() => {
      store.commit("app/SET_SW_REGISTERED", true);
    })
    .catch((err) => {
      console.warn(
        "Download Service Worker 注册失败, 将回退到 Web Worker 或普通下载:",
        err
      );
    });
}

// 下载专用 SW：开发/生产都注册，文件中转大文件可走流式下载
registerDownloadServiceWorker();

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
  }
}
