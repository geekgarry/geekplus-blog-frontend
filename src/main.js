/**
 * 应用入口
 * 性能约定：
 * 1) polyfill 交给 babel useBuiltIns:'usage'，不要再 import 'core-js/stable'
 * 2) 重型插件（广告、v-viewer、html2canvas 等）延后或路由内 import()
 * 3) '@/permission' 会预取前台栏目菜单，保证直链动态路由可注册
 *
 * 请求体验约定（与 utils/request、deferRequest、pageVisibility 配合）：
 * - GET 默认支持切标签/切 App 后回前台静默续传，避免「加载中离开再回来直接失败」
 * - 侧栏类非关键请求用 runWhenIdle / runAfter 错峰，见 docs/v2/03
 */
import Vue from "vue";
// Element 按需注册须尽早完成（在路由守卫 / 业务页之前）
import { setupElement } from "@/plugins/element";
setupElement();

import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import common from "./utils/common";

import { _getCookie, _setCookie, _removeCookie } from '@/utils/storage'
import 'normalize.css/normalize.css'
import '@/utils/background'

import "@/icons";
// 全局路由守卫：注册博客动态栏目路由 + 后台权限路由（见 permission.js 直链白屏说明）
import '@/permission'
import i18n from './lang/index'

import { parseTime, dateFormat, resetForm, addDateRange, selectDictLabel, selectDictLabels, download, handleTree, firstUpperCase } from "@/utils/gputil";

import "./styles/index.scss";
// geekplusadmin.scss / element-admin 仅在管理端 Layout 中加载

// 广告组件同步注册，杜绝首屏 Unknown custom element: <Adsense>
import AdsenseWidget from '@/components/Adsense/index.vue';

import "./assets/css/color.css";
import "./assets/css/index.css";
import "./assets/css/gp-blog-ui.css";
// animation / tocbot 非首屏关键，空闲后再注入，减轻 render-blocking CSS
function loadNonCriticalCss() {
  import("./assets/css/animation.css").catch(() => {});
  import("./assets/css/tocbot.css").catch(() => {});
}
if (typeof window !== 'undefined') {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadNonCriticalCss, { timeout: 2500 });
  } else {
    window.setTimeout(loadNonCriticalCss, 1200);
  }
}
import {
  getNowDate,
  checkHtml,
  randomRGB,
  color16,
  randomMunsellColor,
  numFormatKWM,
  addLink,
  getRandomTulipColor,
  getYMDTime,
  getHtmlPlainText,
  someNumberCount,
  backToTop,
  isLightDay,
  getDateTimeStamp,
  dateTimeAgo,
  checkObjectExists2,
  loadXMLString,
  copyCode,
  getHtmlValue
} from '@/utils/plusTool'

// import PlusToast from 'plus-toast'
// Vue.prototype.$PlusToast = PlusToast;

Vue.prototype.checkObjectExistsJson = checkObjectExists2;
Vue.prototype.getNowDate = getNowDate;
Vue.prototype.checkHtml = checkHtml;
Vue.prototype.randomMunsellColor = randomMunsellColor;
Vue.prototype.numFormatKWM = numFormatKWM;
Vue.prototype.addLink = addLink;
Vue.prototype.randomRGB = randomRGB;
Vue.prototype.color16 = color16;
Vue.prototype.getRandomTulipColor = getRandomTulipColor;
Vue.prototype.getHtmlValue = getHtmlValue;
Vue.prototype.getYMDTime = getYMDTime;
Vue.prototype.getDateTimeStamp = getDateTimeStamp;
Vue.prototype.dateTimeAgo = dateTimeAgo;
Vue.prototype.someNumberCount = someNumberCount;
Vue.prototype.backToTop = backToTop;
Vue.prototype.isLightDay = isLightDay;
Vue.prototype.loadXMLString = loadXMLString;
Vue.prototype.copyCode = copyCode;
Vue.prototype.getHtmlPlainText = getHtmlPlainText;

// 权限检查
import { checkRole, checkPermi } from "@/utils/permission";
Vue.prototype.checkRole = checkRole;
Vue.prototype.checkPermi = checkPermi;

// Element 已在上方 setupElement() 完成按需注册

Vue.prototype.$common = common;
Vue.config.productionTip = false;

Vue.prototype.parseTime = parseTime
Vue.prototype.dateFormat = dateFormat
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.getCookie = _getCookie
Vue.prototype.setCookie = _setCookie
Vue.prototype.removeCookie = _removeCookie
Vue.prototype.firstUpperCase = firstUpperCase

Vue.prototype.msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: "success" });
}
Vue.prototype.msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: "error" });
}
Vue.prototype.msgInfo = function (msg) {
  this.$message({ message: msg, iconClass: " ", type: "info", customClass: "el-message--info" });
}

// 低频组件异步注册，减小首屏同步图
Vue.component('Treeselect', () => import("@riophae/vue-treeselect").then((m) => {
  import("@riophae/vue-treeselect/dist/vue-treeselect.css");
  return m.default || m;
}))
Vue.component('Pagination', () => import("@/components/Pagination"))
Vue.component('RightToolbar', () => import("@/components/RightToolbar"))
// 可复用 AI 弹出对话（任意页 <ai-chat-popup v-model="visible" /> 或 ref.open()）
Vue.component('AiChatPopup', () => import("@/views/admin/tool/chatbot/index.vue"))
Vue.component('Adsense', AdsenseWidget)
Vue.component('InArticleAdsense', AdsenseWidget)
Vue.component('InFeedAdsense', AdsenseWidget)

// 广告脚本由 Adsense 组件自管；此处仅延后加载图片预览等
function loadDeferredPlugins() {
  import('v-viewer').then((mod) => {
    const VueViewer = mod.default;
    const viewerDirective = mod.directive;
    import('viewerjs/dist/viewer.css');
    Vue.use(VueViewer, {
      defaultOptions: {
        toolbar: {
          zoomIn: 0,
          zoomOut: 0,
          oneToOne: 1,
          reset: 1,
          prev: { show: 1 },
          play: 1,
          next: { show: 1 },
          rotateLeft: 0,
          rotateRight: 0,
          flipHorizontal: 0,
          flipVertical: 0,
        },
        zoomRatio: 0.3
      }
    });
    Vue.directive('viewer', viewerDirective({}));
  }).catch(() => {});
}

if (typeof window !== 'undefined') {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadDeferredPlugins, { timeout: 3000 });
  } else {
    window.setTimeout(loadDeferredPlugins, 2000);
  }
}

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
