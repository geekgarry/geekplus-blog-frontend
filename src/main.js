// import 'babel-polyfill';
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import common from "./utils/common";
// import constant from "./utils/constant";

// import Cookies from 'js-cookie'
import { _getCookie, _setCookie, _removeCookie, _setSessionStore, _getSessionStore, _removeSessionStore } from '@/utils/storage'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import '@/utils/background'

import "@/icons"; // icon
import '@/permission' // permission control
import Pagination from "@/components/Pagination";
//自定义表格工具扩展
import RightToolbar from "@/components/RightToolbar"

import i18n from './lang/index' // Internationalization

// import 'default-passive-events'

//引入一些通用工具js类
import { parseTime, dateFormat, resetForm, addDateRange, selectDictLabel, selectDictLabels, download, handleTree, firstUpperCase } from "@/utils/gputil";

// import hljs from 'highlight.js';
// import 'highlight.js/styles/monokai-sublime.css';
// // import 'highlight.js/styles/vs2015.css';
// // import 'highlight.js/styles/github.css'; // 你可以选择任何你喜欢的样式

// // 导入语言模块
// import javascript from "highlight.js/lib/languages/javascript";
// import java from "highlight.js/lib/languages/java";
// import sql from "highlight.js/lib/languages/sql";
// import xml from "highlight.js/lib/languages/xml";
// import html from "highlight.js/lib/languages/vbscript-html";
// import json from "highlight.js/lib/languages/json";
// import yaml from "highlight.js/lib/languages/json";
// // 注册语言
// hljs.registerLanguage("javascript", javascript);
// hljs.registerLanguage("java", java);
// hljs.registerLanguage("yaml", yaml);
// hljs.registerLanguage("json", json);
// hljs.registerLanguage("sql", sql);
// hljs.registerLanguage("xml", xml);
// hljs.registerLanguage("html", html);

// hljs.initHighlightingOnLoad()

// function highlightCodeAndShowLineNumbers(el, binding) {
//   // 获取代码块内容
//   let blocks = el.querySelectorAll("pre");
//   if (blocks) {
//     blocks.forEach(block => {
//       if (block.querySelector("code") && !block.querySelector("code ol")) {
//         if (block.classList) {
//           block.classList.add("hljs"); // 现代浏览器
//         } else {
//           // 兼容 IE9 及以下
//           block.className += ' ' + "hljs";
//         }
//         var tempBlock = block.querySelector("code");
//         // 高亮代码块
//         hljs.highlightBlock(tempBlock);
//         // 检查是否需要显示行号
//         if (binding) {
//           // block.textContent = binding;
//           // 从这开始是设置行号
//           tempBlock.innerHTML = `<ol><li class="line">${tempBlock.innerHTML.replace(
//             /\n/g,
//             `</li><li class="line">`
//           )}</li></ol>`;
//         }
//       } else if (!block.querySelector("ol")) {
//         // 高亮代码块
//         hljs.highlightBlock(block);
//         // 检查是否需要显示行号
//         if (binding) {
//           // block.textContent = binding;
//           // 从这开始是设置行号
//           block.innerHTML = `<ol><li class="line">${block.innerHTML.replace(
//             /\n/g,
//             `</li><li class="line">`
//           )}</li></ol>`;
//         }
//       }
//     });
//   }
// }

// Vue.directive("highlight", {
//   // deep: true,
//   inserted(el, binding){
//     highlightCodeAndShowLineNumbers(el, binding)
//   },
//   bind(el, binding){
//     highlightCodeAndShowLineNumbers(el, binding)
//   },
//   update(el, binding){
//     highlightCodeAndShowLineNumbers(el, binding)
//   },
//   componentUpdated(el, binding){
//     highlightCodeAndShowLineNumbers(el, binding)
//   }
// });
// Vue.use(hljs)
// Vue.prototype.hljs = hljs;

import Print from 'vue-print-nb'
Vue.use(Print);  //注册

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "./styles/index.scss";
import './styles/geekplusadmin.scss' // geekplusadmin css

// import pdfjs from 'pdfjs'
// Vue.use(pdfjs)
// Vue.use(getChildrenPath);

// import 'animate.css'
//引入css
import "./assets/css/color.css";
import "./assets/css/animation.css";
import "./assets/css/index.css";
import "./assets/css/tocbot.css";
import "./assets/css/markdown-highlight.css";
// import './assets/css/font-awesome.min.css'
// import "mavon-editor/dist/css/index.css";

// register the plugin on vue
// import MetaInfo from 'vue-meta-info'
// Vue.use(MetaInfo)
import VueViewer, { directive as viewerDirective } from 'v-viewer';
import 'viewerjs/dist/viewer.css'; // 图片预览器的样式
Vue.use(VueViewer, {
  defaultOptions: {
    /**
     *数字含义:
     *0 or false: hide the navbar
    1 or true: show the navbar
    2: show the navbar only when the screen width is greater than 768 pixels
    3: show the navbar only when the screen width is greater than 992 pixels
    4: show the navbar only when the screen width is greater than 1200 pixels
     */
    toolbar: {
      zoomIn: 0,
      zoomOut: 0,
      oneToOne: 1,
      reset: 1,
      prev: {
        show: 1,
        //size: 'large',
      },
      play: 1,
      next: {
        show: 1,
        //size: 'large',
      },
      rotateLeft: 0,
      rotateRight: 0,
      flipHorizontal: 0,
      flipVertical: 0,
    },
    zoomRatio: 0.3 // 缩放比率 默认是0.1
  }
});
//图片预览器
//用于图片预览的指令方式调用 在元素上加上会处理元素下所有的图片,为图片添加点击事件,点击即可预览
Vue.directive('viewer', viewerDirective({
  //debug: true
}));
Vue.use(require('vue-script2'));
import Ads from 'vue-google-adsense';
// // Vue.use(Ads.AutoAdsense, { adClient: 'ca-pub-7291512442295477', isNewAdsCode: true })
Vue.use(Ads.Adsense);
// Vue.use(Ads.InArticleAdsense);
// Vue.use(Ads.InFeedAdsense);

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
Vue.prototype.someNumberCount = someNumberCount; //返回一个整数的随机数
Vue.prototype.backToTop = backToTop;
Vue.prototype.isLightDay = isLightDay;
Vue.prototype.loadXMLString = loadXMLString;
Vue.prototype.copyCode = copyCode;

Vue.use(ElementUI, {
  size: _getCookie('size') || 'medium', // set element-ui default size
  // locale,//这里是简单快速设置国际化语言，使用的是element UI的语言包，如果使用更多喜定义语言包，则新建i18n文件编写语言包
  i18n: (key, value) => i18n.t(key, value)
});

Vue.prototype.$common = common;

Vue.config.productionTip = false;

/* 管理端 */
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
  this.$message({message: msg, iconClass: " ", type: "info", customClass: "el-message--info"});
}
// 自定义下拉树形选择器
Vue.component('Treeselect', () => import("@riophae/vue-treeselect").then((m) => {
  import("@riophae/vue-treeselect/dist/vue-treeselect.css");
  return m.default || m;
}))

// 动态加载指令和组件的混入
// Vue.component('QuillEditor', () => import("@/components/QuillEditor"));

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
new Vue({
  router,
  store,
  i18n,// 不要忘记
  render: (h) => h(App),
  // mounted() {
  //   document.dispatchEvent(new Event('render-event'))
  // },
}).$mount("#app");
