module.exports = {
  // compact: false,
  presets: [
    ["@vue/cli-plugin-babel/preset", {
      useBuiltIns: 'usage',
      // corejs: 3,
      // targets: {
      //   browsers: ['> 0.2%', 'Android >= 4.4', 'iOS >= 9']
      // }
      corejs: { version: 3, proposals: true },
      targets: {
        chrome: '49',
        android: '6',
        browsers: ['> 0.2%', 'Android >= 4.4', 'iOS >= 9']
      },
      // polyfills: ['es.string.replace-all']
    }, "cli-plugin-babel-preset"]
  ],
  'env': {
    'development': {
      // babel-plugin-dynamic-import-node plugin only does one thing by converting all import() to require().
      // This plugin can significantly increase the speed of hot updates, when you have a large number of pages.
      // 添加一个插件来转换动态导入语法
      'plugins': ['dynamic-import-node']
    }
  },
  plugins: [
    '@babel/plugin-transform-runtime', // 避免污染全局
    // '@babel/plugin-transform-optional-chaining',
    // '@babel/plugin-transform-nullish-coalescing-operator',
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
};
