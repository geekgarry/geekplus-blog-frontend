# ie11-compat（Vue CLI IE11 适配套件）

把 IE11 相关构建逻辑收拢到本目录，**一个开关**控制是否启用。可整夹拷贝到其他 Vue CLI 项目复用。

## 开关

编辑 [`enabled.js`](./enabled.js)：

```js
module.exports = true;  // 开启 IE11
module.exports = false; // 关闭（现代浏览器，构建更快、包更小）
```

## 接入（3 步）

### 1. `vue.config.js`

```js
const ie11 = require("./ie11-compat");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  transpileDependencies: ie11.transpileDependencies([/* 关闭 IE 时的默认列表 */]),
  configureWebpack(config) {
    // …项目原有逻辑…
    ie11.applyConfigureWebpack(config, {
      cacheNamePrefix: "myapp",
      configFile: __filename,
    });
  },
  chainWebpack(config) {
    // …项目原有逻辑…（Terser 等放前面）
    ie11.applyChainWebpack(config, { TerserPlugin, dropConsole: true });
  },
};
```

或一行包装：

```js
module.exports = require("./ie11-compat").wrap(
  { /* 原 vueConfig */ },
  { TerserPlugin: require("terser-webpack-plugin"), cacheNamePrefix: "myapp", configFile: __filename }
);
```

### 2. `package.json` → `browserslist.production`

开启 IE 时加入 `"IE 11"`，**不要**写 `"not dead"`（会把 IE 排除掉）：

```json
"production": [
  "Chrome >= 64",
  "Firefox >= 67",
  "Safari >= 12",
  "Edge >= 79",
  "IE 11"
]
```

关闭 IE 时删掉 `"IE 11"` 即可。

### 3. `babel.config.js`

不要写死仅现代浏览器的 `targets`，交给 browserslist，以便 Vue CLI modern/legacy 差分转译。

入口 **不必**再手写 `import 'core-js/...'`：开启时会自动 prepend [`polyfills.js`](./polyfills.js)。

## 本套件做了什么

| 问题 | 处理 |
|------|------|
| Webpack5 runtime 箭头函数 | `target: es5` + `output.environment` |
| Terser 压出 `{i,l:!1}` → SCRIPT1003 | legacy 使用 `ecma: 5` |
| axios/babel `Symbol.asyncIterator` 表达式 → SCRIPT1015 | syntax-fix-loader |
| modern/legacy 缓存串包 | 分离 filesystem cache name |
| Symbol/Promise 缺失 | 自动注入 polyfills 入口 |
| **CSS 变量导致样式错乱** | `css-vars-ponyfill`（仅 IE）+ 首屏实色 fallback |
| **inset 等布局** | `ie11-layout-fixes.css`（仅 IE） |

## 样式说明（重要）

IE11 **不支持** `var(--theme-color)`：写了变量的整条 CSS 会被丢掉，看起来像「样式错乱 / 没主题色 / 背景透明」。

开启本套件后会自动：

1. 用 `css-vars-ponyfill` 把变量编译成 IE 能用的值（并 `watch` 主题切换）
2. 给 `html` 加 `gp-ie11` class，加载布局兜底 CSS

仍可能异常的部分（无法完全自动修）：

- Tailwind 3 / `gap` / 新版 Grid / `aspect-ratio` 等现代布局
- 业务里只写了 `var(...)`、前面没有实色 fallback 的样式

建议业务 CSS 写成：

```css
color: #5f7d80;
color: var(--theme-color, #5f7d80);
```

## 依赖

- `@vue/cli-service` 4/5 + Webpack 5（CLI5）
- `core-js@3`
- `css-vars-ponyfill@2`
- `terser-webpack-plugin`（若要用套件里的 Terser ecma5 配置）

## 关闭时

1. `enabled.js` → `false`
2. browserslist 去掉 `IE 11`
3. （可选）删除对本目录的 `require`，或保留 require（false 时为 no-op）

## 限制

IE11「能打开」≠「全站功能可用」。WebRTC、部分 PDF/编辑器、CSS 变量等仍可能异常，需业务侧降级。
