const path = require("path");

/** @returns {boolean} */
function isEnabled() {
  try {
    return !!require("./enabled");
  } catch (e) {
    return false;
  }
}

/** Vue CLI modern 差分：须在 configureWebpack/chainWebpack 回调内调用（勿顶层缓存） */
function isLegacyBundle() {
  return !!(process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD);
}

function isModernBundle() {
  return !!process.env.VUE_CLI_MODERN_BUILD;
}

/** Webpack 5 runtime 默认会生成箭头函数等，IE11 必须关闭 */
const es5Environment = {
  arrowFunction: false,
  bigIntLiteral: false,
  const: false,
  destructuring: false,
  dynamicImport: false,
  forOf: false,
  module: false,
  optionalChaining: false,
  templateLiteral: false,
};

/**
 * transpileDependencies：开启 IE 时建议 true；关闭时回退到项目自己的列表
 * @param {true|string[]|RegExp[]} [fallback]
 */
function transpileDependencies(fallback) {
  if (!isEnabled()) return fallback == null ? false : fallback;
  return true;
}

/**
 * browserslist production 片段（可复制进 package.json）
 * 注意：不要与 "not dead" 同时使用（not dead 会排除 IE11）
 */
const browserslistIe11 = "IE 11";

function warnIfBrowserslistMissingIe() {
  if (!isEnabled()) return;
  try {
    const browserslist = require("browserslist");
    const list = browserslist();
    const hasIe = list.some((b) => /^ie\s/i.test(b));
    if (!hasIe) {
      console.warn(
        "[ie11-compat] enabled.js=true，但当前 browserslist 未包含 IE 11。\n" +
          "  → 请在 package.json browserslist.production 中加入 \"IE 11\"，并去掉 \"not dead\"。\n" +
          "  → 否则 Vue CLI 可能不会产出 nomodule legacy 包。"
      );
    }
  } catch (e) {
    /* browserslist 不可用时忽略 */
  }
}

module.exports = {
  isEnabled,
  isLegacyBundle,
  isModernBundle,
  es5Environment,
  transpileDependencies,
  browserslistIe11,
  warnIfBrowserslistMissingIe,
  rootDir: path.join(__dirname),
  polyfillsPath: path.join(__dirname, "polyfills.js"),
  syntaxFixLoaderPath: path.join(__dirname, "loaders", "syntax-fix-loader.js"),
};
