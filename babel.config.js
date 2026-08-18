module.exports = {
  compact: false, // 压缩代码，false对所有取消大小限制
  presets: [
    ["@vue/cli-plugin-babel/preset", {
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: true },
      // 交给 package.json browserslist。
      // 需要 IE11 时：browserslist 加 "IE 11" + ie11-compat/enabled.js=true（见 ie11-compat/README.md）
      // 不要在此写死仅现代浏览器的 targets，否则 legacy 差分转译会失效。
    }, "cli-plugin-babel-preset"]
  ],
  // 切勿启用 babel-plugin-dynamic-import-node（会把 import() 转成同步 require，毁掉按需分包）
  // Element 按需：与 src/plugins/element*.js 配合；禁止再全量 import ElementUI
  plugins: [
    '@babel/plugin-transform-runtime',
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
};
