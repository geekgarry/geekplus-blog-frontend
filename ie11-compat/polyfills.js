/**
 * IE11 入口 polyfill（由 ie11-compat 在开启时自动 prepend 到 app entry）
 *
 * 依赖：core-js@3、css-vars-ponyfill（样式变量）
 */
import "core-js/features/symbol";
import "core-js/features/symbol/iterator";
import "core-js/features/promise";
import "core-js/features/object/assign";
import "core-js/features/array/from";

import { initCssVarsPonyfill, isIe } from "./css-vars";

if (typeof document !== "undefined" && isIe()) {
  document.documentElement.className +=
    (document.documentElement.className ? " " : "") + "gp-ie11";
  // 布局兜底样式仅 IE 加载
  import(/* webpackChunkName: "ie11-layout-fixes" */ "./ie11-layout-fixes.css");
}

initCssVarsPonyfill();
