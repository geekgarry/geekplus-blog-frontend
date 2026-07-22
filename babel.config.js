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
