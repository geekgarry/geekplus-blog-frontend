module.exports = {
  presets: [
    ["@vue/cli-plugin-babel/preset", {
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: true },
      // 与 package.json browserslist 对齐：放弃 IE，显著减少 polyfill
      targets: {
        chrome: '64',
        firefox: '67',
        safari: '12',
        edge: '79',
        ios: '12',
        android: '8'
      },
    }, "cli-plugin-babel-preset"]
  ],
  // 切勿启用 babel-plugin-dynamic-import-node（会把 import() 转成同步 require，毁掉按需分包）
  // 当前 main.js 为 Element 全量 Vue.use(ElementUI)；勿再开 component 按需插件，否则会报
  // “both on-demand and importing all”。若日后改为按需引入，再启用并去掉全量 import。
  plugins: [
    '@babel/plugin-transform-runtime',
    // 按需引入 Element UI 组件
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
};
