# 可移植 HTTP 层（createRequest）

与 UI 框架解耦的 axios 封装，本博客项目通过根目录 `src/utils/request.js` 接线使用。

## 目录

| 文件 | 说明 |
|------|------|
| `createRequest.js` | 核心工厂：重试、续传、去重、鉴权、业务码 |
| `pageVisibility.js` | 切标签 / 切 App 可见性 |
| `ui.element.js` | Element UI 适配 |
| `ui.console.js` | 无 UI / 其它框架改写示例 |

## 复制到其它 Element UI 项目

1. 复制整个 `src/utils/http/` 目录  
2. 新建 `utils/request.js`（可参考本仓库同名文件）：

```js
import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { createRequest } from '@/utils/http/createRequest'
import { createElementUiAdapter } from '@/utils/http/ui.element'
import { getToken } from '@/utils/auth' // 按你的项目改

export default createRequest({
  axios,
  baseURL: process.env.VUE_APP_BASE_API,
  getToken,
  tokenHeader: 'Authorization', // 或 Plus-Token
  formatToken: (t) => 'Bearer ' + t,
  ui: createElementUiAdapter({ Message, MessageBox }),
  onRelogin: () => {
    // store.dispatch('user/Logout'); location.href = '/login'
  },
  // 可选：用户点取消时清本地登录态，避免后续请求继续带坏 token
  // onReloginCancel: () => store.dispatch('user/FedLogOut')
})
```

3. API 层继续 `import request from '@/utils/request'`，行为与本文档博客站一致。

## 非 Element 项目

实现两个函数即可：

```js
{
  showError(msg, duration),
  confirmRelogin({ title, message, confirmText, cancelText }) // 返回 Promise
}
```

见 `ui.console.js` 内 Ant Design Vue 示例注释。

## 常用 config

| 字段 | 默认 | 说明 |
|------|------|------|
| `retry` | `0` | GET/HEAD 网络错误额外重试次数 |
| `resumeOnVisible` | GET/HEAD 为 `true` | 切后台失败后回前台静默续传 |
| `resumeBudget` | `3` | 续传次数上限 |
| `deduplicate` | `true` | 同 key 进行中请求合并 |
| `headers.isToken` | — | 设为 `false` 不带鉴权头 |

无缝能力不依赖 Vue / Element，只依赖 **axios + 浏览器 document.visibilityState**。

## 归档：未拆分旧版

拆分前的单体 `request.js`（含 Element / store 硬编码）已归档：

- [`docs/archive/request.unsplit.legacy.js`](../../../docs/archive/request.unsplit.legacy.js)

仅作对照与回滚参考，**不要**在业务中 `import` 该文件。
