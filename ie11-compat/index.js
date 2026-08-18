/**
 * Vue CLI 项目 IE11 适配套件（可拷贝到任意 Vue CLI 4/5 项目）
 *
 * 开关：编辑 ./enabled.js（true/false）
 *
 * 用法 A（推荐，侵入小）：
 *   const ie11 = require('./ie11-compat');
 *   module.exports = {
 *     transpileDependencies: ie11.transpileDependencies(['element-ui']),
 *     configureWebpack(config) {
 *       // ...项目逻辑
 *       ie11.applyConfigureWebpack(config, { cacheNamePrefix: 'myapp', configFile: __filename });
 *     },
 *     chainWebpack(config) {
 *       // ...项目逻辑（含自己的 terser 时，把 ie11 放最后）
 *       ie11.applyChainWebpack(config, { TerserPlugin: require('terser-webpack-plugin') });
 *     },
 *   };
 *
 * 用法 B（整包包装）：
 *   module.exports = require('./ie11-compat').wrap({ ...你的 vueConfig }, { TerserPlugin });
 *
 * browserslist：开启时在 package.json 加入 "IE 11"，去掉 "not dead"
 * babel：不要写死现代 targets，交给 browserslist（见 README）
 */

const flags = require("./flags");
const vue = require("./vue");

module.exports = {
  /** @type {boolean} 当前是否开启（读 enabled.js） */
  get enabled() {
    return flags.isEnabled();
  },
  isEnabled: flags.isEnabled,
  isLegacyBundle: flags.isLegacyBundle,
  isModernBundle: flags.isModernBundle,
  es5Environment: flags.es5Environment,
  transpileDependencies: flags.transpileDependencies,
  browserslistIe11: flags.browserslistIe11,
  applyConfigureWebpack: vue.applyConfigureWebpack,
  applyChainWebpack: vue.applyChainWebpack,
  wrap: vue.wrap,
  polyfillsPath: flags.polyfillsPath,
  rootDir: flags.rootDir,
};
