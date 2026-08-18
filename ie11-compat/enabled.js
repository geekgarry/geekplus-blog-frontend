/**
 * IE11 适配总开关（唯一推荐开关）
 *
 * true  → 开启 Webpack ES5 / Terser ecma5 / 语法修复 / 入口 polyfill
 * false → 全部跳过，项目按现代浏览器构建
 *
 * 同时请配合 package.json browserslist：
 *   开启时加上 "IE 11"，并去掉会排除 IE 的 "not dead"
 *   关闭时删除 "IE 11"
 */
module.exports = true;
