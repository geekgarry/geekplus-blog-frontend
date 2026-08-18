const flags = require("./flags");

/**
 * @typedef {object} Ie11VueOptions
 * @property {string} [cacheNamePrefix='vue-ie11'] filesystem cache 名前缀
 * @property {string} [configFile] 传入 webpack cache.buildDependencies.config
 * @property {boolean} [injectPolyfills=true] 是否自动 prepend 入口 polyfills
 * @property {boolean} [syntaxFix=true] 是否挂载 SCRIPT1015 语法修复 loader
 * @property {import('terser-webpack-plugin')|null} [TerserPlugin] 传入则配置 legacy Terser ecma5
 * @property {boolean} [dropConsole=true]
 */

/**
 * 在 configureWebpack 回调末尾调用
 * @param {import('webpack').Configuration} config
 * @param {Ie11VueOptions} [options]
 */
function applyConfigureWebpack(config, options) {
  options = options || {};
  if (!flags.isEnabled()) return;

  const legacy = flags.isLegacyBundle();
  const modern = flags.isModernBundle();
  const prefix = options.cacheNamePrefix || "vue-ie11";

  config.cache = {
    type: "filesystem",
    name: legacy ? prefix + "-legacy" : modern ? prefix + "-modern" : prefix + "-default",
    buildDependencies: {
      config: options.configFile ? [options.configFile] : [],
    },
  };

  if (legacy) {
    config.target = ["web", "es5"];
    config.output = Object.assign({}, config.output, {
      environment: flags.es5Environment,
    });
  }
}

/**
 * 在 chainWebpack 回调末尾调用（建议放在项目自己的 chain 逻辑之后）
 * @param {import('webpack-chain')} config
 * @param {Ie11VueOptions} [options]
 */
function applyChainWebpack(config, options) {
  options = options || {};
  if (!flags.isEnabled()) return;

  flags.warnIfBrowserslistMissingIe();

  const legacy = flags.isLegacyBundle();

  if (options.injectPolyfills !== false) {
    try {
      config.entry("app").prepend(flags.polyfillsPath);
    } catch (e) {
      console.warn("[ie11-compat] 无法 prepend app entry polyfills:", e.message);
    }
  }

  if (legacy && options.syntaxFix !== false) {
    config.module
      .rule("ie11-syntax-fix")
      .test(/\.m?js$/)
      .enforce("pre")
      .use("ie11-syntax-fix-loader")
      .loader(flags.syntaxFixLoaderPath)
      .end();
  }

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod") {
    if (legacy) {
      config.target(["web", "es5"]);
      config.output.set("environment", flags.es5Environment);
    }

    const TerserPlugin = options.TerserPlugin;
    if (TerserPlugin && config.optimization.minimizers.has("terser")) {
      const terserEcma = legacy ? 5 : 2019;
      const dropConsole = options.dropConsole !== false;
      config.optimization.minimizer("terser").use(TerserPlugin, [
        {
          parallel: true,
          terserOptions: {
            ecma: terserEcma,
            compress: {
              ecma: terserEcma,
              drop_console: dropConsole,
            },
            output: {
              ecma: terserEcma,
              safari10: legacy,
            },
          },
        },
      ]);
    }
  }
}

/**
 * 包装整份 vue.config，自动合并 IE 钩子（方便拷贝到其他项目）
 * @param {object} vueConfig
 * @param {Ie11VueOptions} [options]
 */
function wrap(vueConfig, options) {
  options = options || {};
  if (!flags.isEnabled()) return vueConfig;

  const fallbackTd = vueConfig.transpileDependencies;
  vueConfig.transpileDependencies = flags.transpileDependencies(
    fallbackTd == null ? true : fallbackTd
  );

  const prevConfigure = vueConfig.configureWebpack;
  vueConfig.configureWebpack = function (config) {
    if (typeof prevConfigure === "function") {
      prevConfigure(config);
    } else if (prevConfigure && typeof prevConfigure === "object") {
      const { merge } = require("webpack-merge");
      const merged = merge(config, prevConfigure);
      Object.keys(merged).forEach(function (k) {
        config[k] = merged[k];
      });
    }
    applyConfigureWebpack(config, options);
  };

  const prevChain = vueConfig.chainWebpack;
  vueConfig.chainWebpack = function (config) {
    if (typeof prevChain === "function") prevChain(config);
    applyChainWebpack(config, options);
  };

  return vueConfig;
}

module.exports = {
  applyConfigureWebpack,
  applyChainWebpack,
  wrap,
};
