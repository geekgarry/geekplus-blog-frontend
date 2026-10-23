"use strict";
// const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const webpack = require("webpack");
const defaultSettings = require("./src/settings.js");
const Version = new Date().getTime()

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
// 预渲染插件，把vue转为静态网页
// const PrerenderSPAPlugin = require('prerender-spa-plugin-next')
// const PrerendererWebpackPlugin = require("@prerenderer/webpack-plugin");
// const renderer = PrerenderSPAPlugin.PuppeteerRenderer;//这个和下面一样，任选一个
// 可选
// const renderer = require("@prerenderer/renderer-puppeteer");
// 需要分析包体积时再解开：npm i -D webpack-bundle-analyzer
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = /\.(js|css|txt|html|ico|svg)(\?.*)?$/i;
const TerserPlugin = require('terser-webpack-plugin');

/** IE11 适配：总开关见 ie11-compat/enabled.js；不需要时可改 false 或注释本 require和使用的的代码 */
const ie11 = require("./ie11-compat");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = "极客普拉斯" || defaultSettings.title; // page title
const port = process.env.port || process.env.npm_config_port || 8080; // dev port

/** 开发环境 */
const DEV = process.env.NODE_ENV !== "production";

/** 离线 Mock：须显式开启（非 none）；见 npm run dev:mock、docs/mock-offline.md */
const useMock =
  process.env.MOCK != null &&
  process.env.MOCK !== '' &&
  process.env.MOCK !== 'none' &&
  process.env.HTTP_MOCK != null &&
  process.env.HTTP_MOCK !== '' &&
  process.env.HTTP_MOCK !== 'none'

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false, //process.env.NODE_ENV === 'development',//取消语法检测保存
  productionSourceMap: false, // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
  // filenameHashing: true,
  // IE 开启时转译全部依赖；关闭时仅转译下列包（jodit 已 alias 预编译包）
  transpileDependencies: ie11.transpileDependencies([
    "element-ui",
    "jspdf",
    "pdfjs-dist",
    "pdf-lib",
    "canvg",
    "@babel/runtime",
  ]),
  devServer: {
    port: port,
    open: false,
    allowedHosts: "all",
    // Mock 离线：挂载 mock/ 中间件；开启时不代理真实后端
    // webpack-dev-server v4+ 已移除 before，改用 setupMiddlewares
    setupMiddlewares: (middlewares, devServer) => {
      if (useMock && devServer && devServer.app) {
        const app = devServer.app;
        try {
          const express = require("express");
          app.use(express.json({ limit: "2mb" }));
          app.use(express.urlencoded({ extended: true }));
        } catch (e) {
          /* express 随 webpack-dev-server 提供 */
        }
        app.use(require("./mock/createMiddleware")());
      }
      return middlewares;
    },
    proxy: useMock
      ? {}
      : {
          // 本地联调：VUE_APP_PROXY_TARGET 指向本机 API（见 .env.development）。
          // secure:false 允许代理到 https://127.0.0.1 自签证书。
          [process.env.VUE_APP_BASE_API]: {
            target: process.env.VUE_APP_PROXY_TARGET || `https://127.0.0.1:8443`,
            changeOrigin: true,
            secure: false,
            ws: true,
            pathRewrite: {
              ["^" + process.env.VUE_APP_BASE_API]: "",
            },
          },
          "/profile": {
            target: process.env.VUE_APP_PROXY_TARGET || `https://127.0.0.1:8443`,
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              "^/profile": "/profile",
            },
          },
        },
    client: {
      // webSocketURL: 'ws://0.0.0.0:8898/ws',
      progress: true,
      overlay: false,
    },
    // overlay: {
    //   warnings: false,
    //   errors: true
    // },
  },
  css: {
    sourceMap: false,
    extract: process.env.NODE_ENV === 'production', // 生产环境提取 CSS 到独立文件，加速首屏渲染
    loaderOptions: {
      sass: {
        sassOptions: {
          outputStyle: "expanded",
        },
      },
    },
  },
  configureWebpack: (config) => {
    config.name = name;
    config.resolve = config.resolve || {};
    config.resolve.alias = Object.assign({}, config.resolve.alias, {
      '@': path.resolve(__dirname, 'src'),
      // Exact match only ($); 用预编译 jodit.min，避免 Babel 转译整包 ES 源码拖慢构建/增大产物
      jodit$: path.resolve(__dirname, 'node_modules/jodit/es2021/jodit.min.js'),
    });
    // 未开 IE 时的默认缓存；开启 IE 时由 ie11-compat 覆盖为 modern/legacy 分缓存
    if (!ie11.isEnabled()) {
      config.cache = {
        type: 'filesystem',
        name: 'gp-default',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    config.performance = {
      hints: 'warning',
      // 入口起点的最大体积
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积
      maxAssetSize: 30000000,
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      },
    };
    config.plugins = (config.plugins || []).concat([
      new NodePolyfillPlugin(),
      // new BundleAnalyzerPlugin(),
      /* *******************************************
      *
      * 开启GZIP压缩
      * 压缩前：4.4MB
      * 压缩后：1.7MB
      *
      ********************************************/
      new CompressionPlugin({
        filename: '[path][base].gz[query]',
        algorithm: "gzip",
        test: /\.(js|css|html)?$/i,
        threshold: 102400,
        minRatio: 0.8,
        deleteOriginalAssets: false,
      }),
    ]);

    // IE11：ES5 runtime / 分缓存（ie11-compat/enabled.js=false 时为 no-op）
    ie11.applyConfigureWebpack(config, {
      cacheNamePrefix: "gp",
      configFile: __filename,
    });
  },
  chainWebpack(config) {
    // Vue CLI 5 默认已不再注册 preload/prefetch 插件；对其 .tap() 会直接报错。
    // FOUC 靠 index.html gp-booting + bootLoader.waitForStylesheets 处理即可。
    if (config.plugins.has("preload")) {
      config.plugin("preload").tap(() => [
        {
          rel: "preload",
          fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
          include: "initial",
        },
      ]);
    }
    if (config.plugins.has("prefetch")) {
      config.plugins.delete("prefetch");
    }

    // pdfjs-dist@4 含私有字段/方法且不支持 IE；勿走 babel（见下方 chainWebpack 末尾 exclude 重写）
    config.module
      .rule("mjs")
      .test(/\.mjs$/)
      .type("javascript/auto")
      .include.add(/node_modules/)
      .end();

    // 忽略 CSS 引入顺序冲突警告（异步 chunk 交叉引用时常见，不影响功能）
    if (config.plugins.has("extract-css")) {
      config.plugin("extract-css").tap((args) => {
        args[0] = Object.assign({}, args[0] || {}, { ignoreOrder: true });
        return args;
      });
    }

    // Element 图标字体已在 plugins/element 引入；此处不再单独处理 chunk-elementUI CSS
    config.plugin("html").tap((args) => {
      args[0].title = name;
      args[0].minify = {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      };
      return args;
    });
    // webpack.config.js 规则典型配置
    // 确保没有错误地设置资源类型
    // config.module
    //   .rule('html')
    //   .test(/\.html$/)
    //   .use('html-loader')
    //   .loader('html-loader')
    //   .tap(options => {
    //     // 确保没有错误的 MIME 类型设置
    //     return options;
    //   });
    // set svg-sprite-loader
    config.module.rule("svg").exclude.add(resolve("src/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();

    config.when(process.env.NODE_ENV !== "development", (config) => {
      // config.plugin('ScriptExtHtmlWebpackPlugin')
      //   .after('html')
      //   .use('script-ext-html-webpack-plugin', [{
      //     // `runtime` must same as runtimeChunk name. default is `runtime`
      //     inline: /runtime\..*\.js$/
      //   }])
      //   .end();
      // 分包：首屏仅 libs/elementUI；编辑器/PDF/播放器等走 async，减小首包下载
      // 生产勿设 VUE_CLI_BABEL_TRANSPILE_MODULES，否则 import() 会变成同步 require
      config.optimization.splitChunks(
        {
          chunks: "all",
          maxInitialRequests: 8, // HTTP/2 下多并行首屏 chunk
          maxAsyncRequests: 12,
          cacheGroups: {
            // 首屏 node_modules（排除重型库，避免被打进 chunk-libs）
            libs: {
              name: "chunk-libs",
              test(module) {
                const r = module.resource || "";
                if (!/[\\/]node_modules[\\/]/.test(r)) return false;
                return !/[\\/]node_modules[\\/](echarts|jodit|tinymce|@tinymce|html2canvas|html-to-image|jspdf|canvg|pdfjs-dist|pdf-lib|quill|quill-resize-module|v-viewer|viewerjs|aplayer|video\.js|vue-video-player|highlight\.js)[\\/]/.test(r);
              },
              priority: 10,
              chunks: "initial",
            },
            elementUI: {
              name: "chunk-elementUI",
              priority: 20,
              test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
              // 仅打包进首屏依赖的 Element；管理端重型留在 async chunk，避免 Table 等打进首页
              chunks: "initial",
            },
            elementUIAsync: {
              name: "chunk-elementUI-async",
              priority: 25,
              test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
              chunks: "async",
              reuseExistingChunk: true,
            },
            commons: {
              name: "chunk-commons",
              test: resolve("src/components"),
              minChunks: 3,
              priority: 5,
              reuseExistingChunk: true,
            },
            echarts: {
              name: "chunk-echarts",
              test: /[\\/]node_modules[\\/]echarts[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            jodit: {
              name: "chunk-jodit",
              test: /[\\/]node_modules[\\/]jodit[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            tinymce: {
              name: "chunk-tinymce",
              test: /[\\/]node_modules[\\/](tinymce|@tinymce)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            html2canvas: {
              name: "chunk-html2canvas",
              test: /[\\/]node_modules[\\/](html2canvas|html-to-image)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            jspdf: {
              name: "chunk-jspdf",
              test: /[\\/]node_modules[\\/](jspdf|canvg)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            pdf: {
              name: "chunk-pdf",
              test: /[\\/]node_modules[\\/](pdfjs-dist|pdf-lib)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            quill: {
              name: "chunk-quill",
              test: /[\\/]node_modules[\\/](quill|quill-resize-module)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            viewer: {
              name: "chunk-viewer",
              test: /[\\/]node_modules[\\/](v-viewer|viewerjs)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            aplayer: {
              name: "chunk-aplayer",
              test: /[\\/]node_modules[\\/]aplayer[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            videojs: {
              name: "chunk-video",
              test: /[\\/]node_modules[\\/](video\.js|vue-video-player)[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
            highlight: {
              name: "chunk-highlight",
              test: /[\\/]node_modules[\\/]highlight\.js[\\/]/,
              priority: 30,
              chunks: "async",
              reuseExistingChunk: true,
            },
          },
        });
      // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
      config.optimization.runtimeChunk("single"),
      {
        from: path.resolve(__dirname, "./public/robots.txt"), //防爬虫文件
        to: "./", //到根目录下
      };
      // 默认 Terser；开启 IE 时由下方 ie11.applyChainWebpack 覆盖 legacy 为 ecma5
      config.optimization.minimizer('terser').use(TerserPlugin, [{
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }]);
    });

    // IE11：polyfill 入口 / 语法修复 / legacy Terser（放最后；关闭 enabled.js 后为 no-op）
    ie11.applyChainWebpack(config, {
      TerserPlugin,
      dropConsole: true,
      injectPolyfills: true,
      syntaxFix: true,
    });

    // 必须放在 chainWebpack 末尾：覆盖 Vue CLI 的 exclude 函数。
    // transpileDependencies===true 时原逻辑会对全部 node_modules 走 babel，
    // 而 pdfjs-dist@4 的 class private methods 无法在「开发 browserslist」下安全转译。
    config.module
      .rule("js")
      .exclude.clear()
      .add((filepath) => {
        const SKIP = true; // 不经 babel
        const RUN = false; // 走 babel
        if (!filepath) return SKIP;
        // 电子签 PDF 引擎：现代浏览器直接跑 ESM，IE 本就不支持
        if (/[\\/]node_modules[\\/]pdfjs-dist[\\/]/.test(filepath)) return SKIP;
        if (/\.vue\.jsx?$/.test(filepath)) return RUN;
        if (/[\\/]node_modules[\\/]@babel[\\/]runtime[\\/]/.test(filepath)) {
          return process.env.VUE_CLI_TRANSPILE_BABEL_RUNTIME ? RUN : SKIP;
        }
        if (ie11.isEnabled()) {
          const nonTranspile =
            /[\\/]node_modules[\\/](core-js|webpack|webpack-4|css-loader|mini-css-extract-plugin|promise-polyfill|html-webpack-plugin|whatwg-fetch)([\\/]|$)/;
          if (nonTranspile.test(filepath)) return SKIP;
          return RUN; // 其余含 node_modules 一律转译（IE 模式）
        }
        // 非 IE：仅转译配置的依赖列表
        if (/[\\/]node_modules[\\/]/.test(filepath)) {
          const allow =
            /[\\/]node_modules[\\/](element-ui|jspdf|canvg|@babel[\\/]runtime)([\\/]|$)/;
          return allow.test(filepath) ? RUN : SKIP;
        }
        return RUN;
      });
  },
  // pwa网站应用配置
  pwa: {
    name: "极客普拉斯",
    // 应用程序的主题颜色，通常会影响到地址栏的颜色和启动画面的颜色，青绿色：#4DBA87
    themeColor: "#5f7d80",
    // 针对 Windows 设备上显示的图标的背景颜色
    msTileColor: "#000000",
    // 指示是否将 PWA 作为全屏应用在 iOS 上运行
    appleMobileWebAppCapable: "yes",
    // 设置 iOS 设备上状态栏的样式
    appleMobileWebAppStatusBarStyle: "black",
    assetsVersion: "1.2",
    iconPaths: {
      favicon32: "./favicon.ico",
      favicon16: "./favicon.ico",
      appleTouchIcon: "./favicon.ico",
      maskIcon: "./favicon.ico",
      msTileImage: "./favicon.ico",
    },
    manifestOptions: {
      icons: [
        {
          src: "./wheat.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "./wheat.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "./wheat.png",
          sizes: "256x256",
          type: "image/png",
        },
        {
          src: "./wheat.png",
          sizes: "120x120",
          type: "image/png",
        },
      ],
    },
    // Workbox 插件的模式，可以是 'GenerateSW' 或 'InjectManifest'
    // 'InjectManifest' 模式允许自定义 Service Worker 文件
    // workboxPluginMode: "InjectManifest",
    // Workbox 插件的选项配置对象
    workboxOptions: {
      // skipWaiting: true,
      // clientsClaim: true,
      // importWorkboxFrom: 'local',
      // importsDirectory: 'js',
      // navigateFallback: '/',
      // navigateFallbackBlacklist: [/\/api\//],
      // 引入外部脚本，这里引入了 Workbox 的 CDN 脚本
      // importScripts: [
      //   "https://storage.googleapis.com/workbox-cdn/releases/5.1.4/workbox-sw.js",
      // ],
      // // 排除特定文件类型不进行缓存，这是一个正则表达式数组，用来匹配需要排除的文件
      // // 这里排除了 .html 文件
      // exclude: [/\.html$/],
      swDest: "./service-worker.js",
      // 添加此项配置，增加需要缓存的最大文件大小（chunk-libs 约 5MB+）
      maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
    },
  },
};
