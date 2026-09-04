# styles/

| 文件 | 职责 |
|------|------|
| `element-overrides.css` | **Element UI 唯一全局覆盖**：深浅色 Token、圆角（组合框贴合、表格直角）、输入 padding、Tooltip dark/light、表单/按钮/弹层等 |
| `element-ui.scss` | Element 布局/已知 bug（无颜色） |
| `admin.scss` / `sidebar.scss` | 管理端布局工具类（非 Element 主题） |
| `index.scss` | 全站基础 reset |
| `gp-border-radius.css` / `element-input-overrides.css` | **已弃用空壳**，请改引 `element-overrides.css` |

博客布局 / `gp-*` 表面样式放在 `src/assets/css/`（`color.css`、`gp-blog-ui.css`、`index.css`），不要再往那里堆全局 `.el-*`。

`assets/css` 里残留的 `.el-*` 均挂在业务作用域下（如 `.gp-page` / `.gp-tool-page` / `.article-copy` / 轮播），**不必再合并**进本目录；管理端主题只维护 `element-overrides.css`。
