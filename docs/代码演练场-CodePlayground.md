# 代码演练场（CodePlayground）

在线运行多类型片段：左编辑、右预览；≥900px 左右分栏，窄屏上下堆叠。

## 为何不用 Quill / TinyMCE

二者是 **富文本（WYSIWYG）**，输出 HTML/Delta，没有源码行号、语法高亮与括号匹配，不适合写可执行源码。本功能使用 **Ace（brace + vue2-ace-editor）**。

## 复用方式

```vue
<template>
  <code-playground v-model="code" default-mode="vue" :compact="true" />
</template>
<script>
import CodePlayground from '@/components/CodePlayground'
export default {
  components: { CodePlayground },
  data: () => ({ code: '' }),
}
</script>
```

类型为**下拉选择**：HTML / JavaScript / HTML+CSS / Vue2 / Vue3 / React / TypeScript / Markdown / JSON。  
移动端（`max-width: 899px` 或 `pointer: coarse`）自动改用 textarea（Ace 触摸体验差）；预览写入 `iframe.srcdoc`，并用 `:key` 强制重建。

仅需代码编辑时也可单独用：

```js
import AceEditor from '@/components/AceEditor'
```

## 后台入口

- 页面：`src/views/admin/tool/codePlayground/index.vue`（`name: AdminCodePlayground`）
- 组件：`src/components/CodePlayground/`、`src/components/AceEditor/`
- **菜单不入库**：`src/router/local-routes.js` → `mergeLocalStaticRoutes` 注入「系统工具」children（`path=codePlayground`）
- 重新登录 / 刷新权限后侧栏可见；直链 `/tool/codePlayground`

### TagsView / keep-alive（不做 localStorage）

- 路由 `meta.noCache: false`，`name` 与页面组件名均为 `AdminCodePlayground`（与 `AppMain` 的 `keep-alive :include="cachedViews"` 对齐）
- **切换其它标签再回来**：保留类型、编辑内容、预览状态（内存缓存）
- **关闭标签**：从 `cachedViews` 移除并销毁实例，编辑丢失（符合预期；未做本地持久化）

## 预览说明

- `iframe` + `sandbox` 含 `allow-scripts allow-same-origin …`（移动端 srcdoc/脚本可执行；演练场本就跑用户代码）
- Vue / React 运行时来自 jsDelivr CDN，需能访问外网
- 组装逻辑：`src/components/CodePlayground/buildPreview.js`
  - 会剥离编辑态 `import` / `export`，并把 `export default {…}` 适配为 CDN 版 `new Vue` / `createApp`
  - 支持简单 SFC：抽取 `<template>` / `<script>` / `<style>`

## Ace 光标错位（重点）

### 现象

- **横向**：竖线漂在字符右侧，但退格仍能删到正确字符（例如视觉上远离 `</style>` 的 `>`，实际删的是 `>`）。
- **纵向**：`ace_content` 出现 `margin-top: -x.5px`，行与光标上下错位。

### 根因

1. **全局 `* { font-family: Helvetica / PingFang… }`**（`src/assets/css/index.css`）会作用到每个 Ace token `<span>`，文字变成**比例字体**；Ace FontMetrics 量的是等宽「X」→ `characterWidth` 偏大 → 光标偏右。
2. CSS 给 Ace 设 **`line-height`**，或 Retina/缩放屏量出**半像素行高**，导致纵向 `margin-top: -4.5px` 一类偏移。
3. `height: 100%` + `position: absolute` 铺满时，容器高度易非整数，加剧度量误差。

### 现行对策（勿回退）

| 项 | 说明 |
| --- | --- |
| `.ace_editor, .ace_editor *` | `font-family` 等宽栈 + `!important`，盖过全局 `*` |
| 禁止 | 对 Ace 容器/层写 CSS `line-height` |
| API | `fontFamily` / `fontSize` 经 Ace API；`syncEditorMetrics` 校正行高与 scroll |
| 度量 | 劫持 `$measureSizes`，字高 `round` 成整数 |
| 演练场 | `updateAceHeight` 实测 `.gp-cp-pane__body` → 整数 `acePixelHeight` 传给 Ace；Ace **不用** `gp-cp-fill` absolute 铺满 |

关键文件：`src/components/AceEditor/index.vue`、`src/components/CodePlayground/index.vue`。

### 自检

硬刷新后：光标应紧贴字符；DevTools 中 `ace_content` 的 `margin-top` 不宜再出现 `.5`；浏览器缩放建议 100%。

## 变更摘要

| 日期 | 内容 |
| --- | --- |
| 2026-08-30 | TagsView keep-alive：切标签保留编辑，关标签销毁（无 localStorage） |
| 2026-08-30 | 接入演练场 + 本地菜单；多模式预览与 ESM 剥离；Ace 光标横向/纵向错位修复（全局 `*` 字体、半像素行高、像素高度） |
| — | 根 README「变更记录」同步置顶条目 |
