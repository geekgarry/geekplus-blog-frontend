module.exports = {
  presets: [
    ["@vue/cli-plugin-babel/preset", {
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: true },
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
