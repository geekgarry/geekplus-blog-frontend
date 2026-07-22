# vue-esign · 在线电子签名（Vue2 / 可平滑升 Vue3）

从本仓库 React 版 `ESignModule` / `SignaturePad` 完整移植而来。

## 目录

```
vue-esign/
├── index.js                      # 导出入口
├── README.md
├── components/
│   ├── ESignModule.vue           # 完整页面
│   └── SignaturePad.vue          # 手写板（含移动端强制横屏）
├── utils/
│   └── esignPdf.js               # pdf.js / pdf-lib 工具
└── styles/
    └── esign.css                 # 自包含样式（不依赖 Tailwind）
```

## 安装依赖

```bash
npm i pdf-lib pdfjs-dist@4.10.38
# Vue2 项目确保已有 vue@2.x
```

> 建议锁定 `pdfjs-dist@4.10.38`，与当前实现一致。Worker 默认走 unpkg CDN；也可自行传入本地 worker 地址。

## Vue2 接入

### 1. 复制目录

把整个 `vue-esign` 拷到你的 Vue2 项目，例如 `src/views/vue-esign` 或 `src/components/vue-esign`。

### 2. 路由页面

```js
// router/index.js
import ESignModule from '@/vue-esign'

{
  path: '/esign',
  name: 'ESign',
  component: ESignModule
}
```

或在任意页面中：

```vue
<template>
  <div>
    <ESignModule :pdf-worker-url="workerUrl" />
  </div>
</template>

<script>
import ESignModule from '@/vue-esign'
// webpack 示例（可选，解决生产环境 MIME 问题）：
// import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs'
// 若打包器不支持 .mjs，可直接不传 pdf-worker-url，走 CDN

export default {
  components: { ESignModule },
  data() {
    return {
      workerUrl: '' // 或打包后的 worker 公共路径
    }
  }
}
</script>
```

### 3. 仅使用手写板

```vue
<template>
  <SignaturePad @change="onSign" />
</template>

<script>
import { SignaturePad } from '@/vue-esign'

export default {
  components: { SignaturePad },
  methods: {
    onSign(dataUrl) {
      // dataUrl 为 PNG base64，清空时为 null
      console.log(dataUrl)
    }
  }
}
</script>
```

## 功能说明

| 能力 | 说明 |
|------|------|
| 手写签名 | 粗细 / 颜色 / 撤销 / 清空 |
| 连续多签名 | 「签下一个」可连续签不同名字；记录在刷新前保留 |
| 移动端全屏横屏 | CSS `rotate(90deg)` 强制横屏书写（适配 iOS） |
| 导入文档 | 本地 / 在线 **PDF、PNG、JPG、WEBP、GIF** 等 |
| 签名位识别 | 扫描「签名 / Signature」等关键词，签完后再「应用识别结果」 |
| 手动选点 | 可开启 / **取消选点**；点击预览放置 |
| 拖动与缩放 | 已放置签名可拖动位置，右下角手柄调整大小 |
| 导出 | 下载叠加**多份**签名后的 PDF |

## Vue2 → Vue3 迁移要点

本组件使用 **Options API**，Vue3 可直接使用。若要彻底对齐 Vue3 习惯，只需：

1. `beforeDestroy` 已同时写了 `beforeUnmount`（两边都兼容）
2. 事件同时抛出：
   - Vue2: `@change` / `@input`
   - Vue3: `@update:modelValue`
3. 单根节点已满足 Vue2；升 Vue3 后可按需拆成多根
4. 无 Vuex / 无过滤器 / 无 `$listeners` 等已废弃 API

## Webpack 注意

若 `pdfjs-dist` 的 `.mjs` worker 报 MIME 错误：

1. **推荐**：不传 `pdf-worker-url`，使用内置 CDN  
2. 或自行把 worker 拷到 `public/pdf.worker.min.js`，再：

```vue
<ESignModule pdf-worker-url="/pdf.worker.min.js" />
```

工具函数会把该文件拉成 `Blob(type: text/javascript)` 再注入，规避 Nginx `octet-stream` 问题。

## 浏览器要求

- 建议 iOS 13+ / Android Chrome 较新版本  
- 依赖 `PointerEvent`、`Promise`、`fetch`、`ArrayBuffer`  
- 过旧环境请自行加 polyfill
