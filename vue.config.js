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
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
// const BrotliPlugin = require('brotli-webpack-plugin');
// const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const productionGzipExtensions = /\.(js|css|txt|html|ico|svg)(\?.*)?$/i;
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const { EsbuildPlugin } = require('esbuild-loader')
// const { VueLoaderPlugin } = require('vue-loader');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = "极客普拉斯" || defaultSettings.title; // page title
const port = process.env.port || process.env.npm_config_port || 8080; // dev port

/** 开发环境 */
const DEV = process.env.NODE_ENV !== "production";

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false, //process.env.NODE_ENV === 'development',//取消语法检测保存
  productionSourceMap: false, // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
  // filenameHashing: true,
  // 1. 强制转译 jspdf 和相关依赖，确保 Babel 处理其中的 require/import 混合代码
  transpileDependencies: ['jspdf', 'canvg', '@babel/runtime'],
  devServer: {
    port: port,
    open: false,
    allowedHosts: "all",
    proxy: {
      //配置后端的跨域访问，重写API路径
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_BASE_API]: {
        target: `http://127.0.0.1:8443`, //后端URI地址3443
        changeOrigin: true, // 是否改变源地址
        secure: false, //确保使用https，在使用https时可以选择开启
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API]: "",
        }, // 重写路径
      },
      //再配置后端静态资源的跨域访问，/profile为后端配置静态资源映射的虚拟路径
      "/profile": {
        target: `http://127.0.0.1:8443`, //后端URI地址3443
        changeOrigin: true,
        pathRewrite: {
          "^/profile": "/profile",
        },
      },
      //配置多个代理服务器时，要把process.env.VUE_APP_BASE_API设置为 /,
      //再设置不同代理服务器的地址，之后在写接口时，带上服务器的前缀地址，
      //如：/api，在写这个服务器的接口时要带上/api/*，后面匹配上你的服务器的URL
      // "/api": {
      //   target: "api地址",
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/api": ''
      //   }
      // }
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
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 强制使用 umd 版本，避免 esm 转换问题
        // 'jspdf': 'jspdf/dist/jspdf.umd.min.js',
        // 'static': resolve('static') // 增加这一行代码
      // Exact match only ($); 用预编译 jodit.min，避免 Babel 转译整包 ES 源码拖慢构建/增大产物
      jodit$: path.resolve(__dirname, 'node_modules/jodit/es2021/jodit.min.js'),
      },
    },
    cache: {
      type: 'filesystem', // 启用持久化缓存
      buildDependencies: {
        config: [__filename],
      },
    },
    // output: {
    //   path: path.resolve(__dirname, './dist'),
    //   filename: `static/js/[name].[contenthash].js`,
    //   chunkFilename: `static/js/[name].[contenthash].js`,
    //   //配置资产的hash，确保长期缓存
    //   assetModuleFilename: 'static/js/[name].[contenthash][ext][query]',
    // },
    //1.关闭webpack的性能提示
    // performance : {
    //   hints : false
    // },
    //2.通过改变入口和生成文件的大小来解决,这种最好
    performance: {
      hints: 'warning',
      // 入口起点的最大体积
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积
      maxAssetSize: 30000000,
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      }
    },
    plugins: [
      // Quill / resize 由 quill-loader 注册（Quill 2 + quill-resize-module），勿全局 Provide 拖进首包
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
        // filename: "[path][base].gz",
        filename: '[path][base].gz[query]', //  使得多个.gz文件合并成一个文件，这种方式压缩后的文件少，建议使用
        algorithm: "gzip",
        test: /\.(js|css|html)?$/i, // 使用正则给匹配{RegExp}到的文件/资产做压缩,压缩文件格式
        threshold: 102400, // 只处理大于此大小的资产。以字节为单位
        minRatio: 0.8, //只有压缩好这个比率的资产才能被处理
        deleteOriginalAssets: false, //是否删除原资源
      }),
      // new BrotliPlugin({
      //   asset: '[path][base].br[query]',
      //   test: productionGzipExtensions,
      //   threshold: 10240,
      //   minRatio: 0.8
      // })
    ],
    // 不要在这里对全部 .js 套 babel-loader（会转译 node_modules/jodit/esm 并报错）
    // Vue CLI 已对 src 配置 babel；需强制转译的包请用 transpileDependencies
  },
  chainWebpack(config) {
    // config.entry.app=["babel-polyfill","./src/main.js"];
    // it can improve the speed of the first screen, it is recommended to turn on preload
    // config.plugin('preload').tap(() => [
    //   {
    //     rel: 'preload',
    //     // to ignore runtime.js
    //     // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
    //     fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
    //     include: 'initial'
    //   }
    // ])

    config.plugins.delete("preload"); // TODO: need test
    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete("prefetch");

    // pdfjs-dist 等 .mjs 包
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
      config.optimization.minimizer('terser').use(TerserPlugin, [{
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }]);
      //压缩代码配置，和上面的plugins中的配置二选一
      // config.plugin("compression").use();
    });
  },
  // pwa网站应用配置
  pwa: {
    name: "极客普拉斯",
    // 应用程序的主题颜色，通常会影响到地址栏的颜色和启动画面的颜色，青绿色：#4DBA87
    themeColor: "#0badb6",
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
