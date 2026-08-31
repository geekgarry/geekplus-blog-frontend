# GeekPlus Blog UI · 极客普拉斯博客前端

个人 / 团队博客一体站前端：**访客可读的博客前台** + **运营可配的管理后台**。

技术栈以 **Vue 2 + Vue Router + Vuex + Element UI（管理端）** 为主，前台逐步用自研 `gp-*` 组件与主题 Token 减轻对 Element 的依赖。

---

## 目录

- [项目简介](#项目简介)
- [功能一览](#功能一览)
- [技术架构](#技术架构)
- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [环境变量与代理](#环境变量与代理)
- [核心机制说明](#核心机制说明)
- [文档与实践文章](#文档与实践文章)
- [变更记录（重点优化）](#变更记录重点优化)
- [脚本与构建](#脚本与构建)
- [贡献约定](#贡献约定)

---

## 项目简介

| 维度 | 说明 |
|------|------|
| 产品名 | 极客普拉斯 / GeekPlus Blog |
| 仓库角色 | 博客前台 + 管理后台 SPA（本仓库） |
| 后端 | 独立 API（开发代理至 `后端服务地址` 等） |
| 典型用户 | 访客逛站、作者投稿、管理员配置栏目/文章/站点 |

业务上可以粗分成三条线：

1. **内容消费**：首页轮播与文章流、栏目、标签、搜索、文章详情、留言、文件中转等  
2. **内容生产**：投稿、简历工具、AI 助手入口等  
3. **站点运营**：后台菜单权限、文章/评论/轮播/站点信息、文件中转管理等  

---

## 功能一览

### 前台博客

- 双布局切换：顶部导航（Vertical）/ 侧栏导航（Horizontal），`BlogShell` 共用一路由树  
- 动态栏目菜单（运营可配 path），直链可打开  
- 桌面顶栏溢出折入「更多」；移动端抽屉与桌面共用 `BlogNavMenu`  
- 自研轮播 `PlusCarousel`、文章 Canvas 分享卡、搜索与分类标签浏览  
- 文件中转、留言板、关于、个人中心等  

### 管理后台

- 登录鉴权 + 动态权限路由（与前台栏目路由分离）  
- 顶栏模式菜单同样支持溢出「更多」  
- 文章 / 评论 / 轮播 / 站点信息 / 文件中转等业务模块（见 `src/views/admin`）  

---

## 技术架构

```text
browser
  └─ Vue 2 SPA
       ├─ BlogShell ──┬─ vertical（顶栏）── router-view
       │              └─ horizontal（侧栏）── router-view
       ├─ Admin Layout（Element）── 动态权限路由
       ├─ permission.js 守卫
       │     ├─ navMenu → 前台栏目 addRoute('webApp')
       │     └─ user/permission → 后台菜单 addRoute
       └─ utils/request + deferRequest + pageVisibility
             └─ /dev-api|/pro-api → API
```

| 层 | 关键路径 |
|----|----------|
| 路由 | `src/router/index.js`、`src/permission.js` |
| 状态 | `src/store/modules/*`（`navMenu` / `user` / `permission` / `settings`） |
| 请求 | `src/utils/request.js`、`deferRequest.js`、`pageVisibility.js` |
| 博客壳 | `src/layout/blog/*` |
| 管理壳 | `src/layout/*` |
| 业务页 | `src/views/**` |
| 实践文档 | `docs/v2/*` |

---

## 目录结构

```text
├── docs/                 # 技术实践文（含 v2 分篇）
├── public/
├── src/
│   ├── api/              # 接口定义
│   ├── assets/           # 静态资源与博客样式
│   ├── components/       # 通用与博客组件（PlusCarousel、BlogNavMenu…）
│   ├── layout/           # 管理端布局 + blog 双布局
│   ├── router/
│   ├── store/
│   ├── utils/            # request、权限、调度等
│   └── views/            # 前台页 + admin 页
├── vue.config.js
└── README.md
```

---

## 快速开始

```bash
# 依赖
npm install

# 本地开发（默认读取 .env.development）
npm run serve
# 或
npm run dev

# 生产构建
npm run build

# Lint
npm run lint
```

Node 版本建议与团队现网一致（Vue CLI 5 / webpack 体系）。首次启动前确认 API 代理目标可达。

---

## 环境变量与代理

常用变量（以仓库内 `.env.*` 为准）：

| 变量 | 含义 |
|------|------|
| `VUE_APP_BASE_API` | axios `baseURL`，开发多为 `/dev-api`，生产多为 `/pro-api` |

`vue.config.js` 将 `VUE_APP_BASE_API` 代理到后端（如 `https://api.xxx.xxx:8443`），并去掉前缀。`/profile` 等静态上传路径可另配代理。

---

## 核心机制说明

1. **双重动态路由**：前台栏目（`navMenu`）与后台权限菜单（`user`/`permission`）分模块；守卫先挂前台再按需挂后台；`addRoute` 后必须 `replace` 重匹配，否则直链白屏。详见 [docs/v2/00](./docs/v2/00-双重动态路由与守卫.md)。  
2. **BlogShell**：`settings.blogLayout = top|side`，localStorage 持久化。  
3. **请求层**：鉴权头、错误去重、401 单例、可选 retry；**GET 默认「切标签/切 App 回来静默续传」**（`resumeOnVisible`）。  
4. **调度层**：首屏关键立即请求，侧栏 idle/错峰；后台时延后任务等回前台再跑。  
5. **主题色（可移植模块 `@/theme`）**：用户改色 `ThemePicker → commitUserThemeColor → applyThemeColor`；冷启动 `initSiteTheme`；博客/管理端维护见 `src/theme/README.md`（拆 SPA 仍可用同一链路）。  

---

## 文档与实践文章

推荐阅读入口：[docs/v2/README.md](./docs/v2/README.md)

| 篇 | 主题 |
|----|------|
| 0 | 双重动态路由与守卫 |
| 1 | BlogShell 双布局 |
| 2 | 菜单溢出折叠到「更多」 |
| 3 | request 与网络调度（含切后台续传） |
| 4 | Canvas 分享卡 |
| 5 | PlusCarousel |
| 6 | BlogNavMenu 桌面/抽屉 |
| 7 | 前后台一体与脚手架拆分 |

后端鉴权 / 缓存 / 全栈契约文档在兄弟仓库：[`GeekPlus-Blog-API/docs`](../GeekPlus-Blog-API/docs/README.md)。

低代码演进与开发手册：[docs/lowcode/README.md](./docs/lowcode/README.md)

---

## 变更记录（重点优化）

> **约定**：以后每一次**重点优化 / 架构改动 / 体验向修复**，必须在本小节**置顶追加**一条（日期 + 摘要 + 关键路径）。日常文案微调可不记。

### 2026-08-31

- **AI 聊天输入框**：微信式随内容增高、删字收回（scrollHeight）；侧栏底部账号区背景/按钮样式优化。
  - 代码：`src/views/chatbot/index.vue`
- **AI 聊天页桌面平铺布局**：≥900px 左侧会话导航 + 右侧对话区；窄屏保留抽屉 + 遮罩；侧栏 UI 对齐常见 AI 产品（新对话 / 历史 / 偏好 / 账号）。
  - 代码：`src/views/chatbot/index.vue`
- **博客圆角 sm 覆盖主值修复**：`applyBlogSurfaceRadius` / FOUC 误把 sm 写进同名 `--gp-surface-radius`，设置「博客圆角=14」实际变成 10；现拆成 `--gp-surface-radius` + `--gp-surface-radius-sm`。
  - 代码：`theme/borderRadius.js`、`public/index.html`、`styles/gp-border-radius.css`、`assets/css/color.css`
- **设置抽屉体验**：RightPanel 常驻挂载 + 点击监听/滚动锁收口；去掉与「菜单形式」冲突的旧「左侧菜单」开关。
  - 代码：`components/RightPanel`、`layout/index.vue`、`layout/components/Settings`
- **管理端菜单懒加载走 loadView**：`generaMenu` 不再用动态 `require([...])`。
  - 代码：`store/modules/permission.js`

### 2026-08-30

- **设置抽屉可滚动**：RightPanel 内容超出视口时允许纵向滚动。
  - 代码：`components/RightPanel/index.vue`
- **navMenu / permission 消除 Critical dependency**：动态视图改 `require.context(..., 'lazy')`（前台排除 admin，后台限定 admin）。
  - 代码：`store/modules/navMenu.js`、`store/modules/permission.js`
- **设置抽屉菜单形式不溢出**：三项 radio 改为标签上置 + 均分宽度，适配 RightPanel ~260px。
  - 代码：`layout/components/Settings/index.vue`
- **管理端圆角契约收口**：`--gp-border-radius-base` 编译默认对齐 `$base-border-radius`（4px）；AI 助手 / RealtimeChat 工具钮与面板改读该变量。
  - 代码：`styles/variables.scss`、`gp-border-radius.css`、`views/admin/tool/chatbot`、`components/RealtimeChat/`
- **恢复顶栏栏目导航**：废弃 `blogLayout=workbench`（顶栏被换成「应用工作台」）；布局切换仅 top↔side，旧值自动迁回 top；工作台仍走 `/workbench` / 个人中心。
  - 代码：`blogLayoutMixin.js`、`layout/blog/vertical`、`store/modules/settings.js`
- **圆角双轨**：设置抽屉「控件圆角」与「博客圆角」独立；前者写 `--gp-border-radius-base`，后者写前台 `--gp-surface-radius*`（sm = surface−4），互不派生覆盖。
  - 代码：`src/theme/borderRadius.js`、`layout/components/Settings`、`store/modules/settings.js`
  - 文档：`src/theme/README.md`
- **整站控件圆角**：管理端设置抽屉新增「控件圆角」（0/2/4/6/8/12px），写入 `--gp-border-radius-base`；Element 官方控件经 `gp-border-radius.css` 覆盖。
  - 代码：`src/theme/borderRadius.js`、`styles/gp-border-radius.css`、`layout/components/Settings`、`store/modules/settings.js`
  - 文档：`src/theme/README.md`
- **代码演练场 keep-alive**：切 TagsView 其它页再回来保留编辑（`noCache: false` + 路由/组件名 `AdminCodePlayground`）；关标签销毁，不做 localStorage。
  - 代码：`src/router/local-routes.js`、`views/admin/tool/codePlayground/`、`CodePlayground` 的 `activated` 重算 Ace
  - 文档：`docs/代码演练场-CodePlayground.md`
- **Ace 光标错位修复**：逻辑光标在字上、画面漂到字右侧（可删 `>` 但竖线偏右）。根因是全局 `* { font-family: Helvetica/PingFang… }` 作用到每个 Ace token `<span>`，文字变比例字体，而 FontMetrics 仍按等宽量宽 → `characterWidth` 偏大。同步加固半像素行高（`ace_content` 的 `margin-top: -x.5px`）、演练场改传整数像素高度、禁止对 Ace 设 CSS `line-height`。
  - 代码：`src/components/AceEditor/index.vue`（`.ace_editor *` 强制等宽 + `syncEditorMetrics`）、`src/components/CodePlayground/index.vue`（`acePixelHeight`）
  - 文档：`docs/代码演练场-CodePlayground.md`（「Ace 光标错位」节）
- **代码演练场**：可复用 `CodePlayground`（左 Ace / 右 iframe），支持 HTML、Vue 2 CDN、React 18 + Babel；后台系统工具页引用。Quill/TinyMCE 仅适合富文本，源码编辑改用 Ace（新增 `brace` / `vue2-ace-editor`）。
  - 代码：`src/components/CodePlayground/`、`src/components/AceEditor/`、`src/views/admin/tool/codePlayground/`
  - 文档：`docs/代码演练场-CodePlayground.md`

### 2026-08-30

- **代码生成预览**：补齐前端 Vue/API/HTML（后端单模板失败不再中断）；文件名改为真实路径；预览 UI 适配黑白主题。
  - 后端：`CodeGenerateByTemplate.genPreviewCodeByTemplate`
  - 前端：`views/admin/tool/generator/index.vue`、`styles/admin.scss`

### 2026-08-29

- **动态条件查询方案 A + 代码生成四模板**：列表改 POST（body 传 `conditionsJson`/扁平字段，分页走 query）；`DynamicQueryForm` 按 `valueType` 适配输入（空值条件禁用值框）；生成器支持 `uiType`×`queryMode`（动态/扁平 × Element/Ant）。
  - 前端：`DynamicQueryForm/`、`api/system/user.js`、`api/tool/generatorTable.js`、`views/admin/tool/generator/index.vue`
  - 文档：`docs/动态条件查询-用户管理.md`；后端模板见 API 仓 `docs/16` / `docs/17`

### 2026-08-26

- **管理端控制台改版**：首页改为「数据概览 + 系统介绍」双 Tab；KPI/近 7 日登录操作图表、模块分布、地域地图、服务器指标与最近日志；介绍 Tab 对齐 README 架构/技术选型/变更摘要。
  - 代码：`src/views/admin/dashboard/index.vue`、`DashboardIntro.vue`、`dashboardMeta.js`、`src/utils/dashboardStats.js`
  - API：`loginlog.js` / `operlog.js` 补 `countByDay` / `countByTitle`
- **标签栏快捷菜单**：TagsView 右侧下拉支持刷新页面、关闭当前/其它/全部标签（与右键菜单一致）。
  - 代码：`src/layout/components/TagsView/index.vue`

### 2026-08-24

- **OA 工作台（非默认首页）**：`/` 恢复文章流；`/workbench` 为图标菜单页，个人中心添加入口；`blogLayout` 支持 top/side/workbench 三态切换（顶栏按钮循环）。
  - 代码：`WorkbenchHome`、`blogNavItems.js`、`blogLayoutMixin.js`、`menus.blog.js`
- **管理端三种菜单形式**：`adminMenuLayout` = sidebar / topbar / workbench；workbench 模式在 dashboard 复用 `WorkbenchHome`（后台 permission 菜单）。
  - 代码：`settings.js`、`Layout/index.vue`、`Navbar.vue`、`Settings/index.vue`、`dashboard/index_v1.vue`
- **深色模式主题色被覆盖**：`color.css` 暗色块不再写死 `--theme-color`；`applyElementTheme` 同步写到 `html/body` inline；切换 dark/light 后 `reassertElementTheme`。
  - 代码：`src/assets/css/color.css`、`src/utils/elementTheme.js`、`App.vue`、`Settings/index.vue`
- **主题模块 `@/theme`**：公共 API 与 `utils/elementTheme` 引擎分离；一体/仅博客/仅管理端均可 `initSiteTheme` + `commitUserThemeColor`；文档 `src/theme/README.md`。
  - 代码：`src/theme/*`、`App.vue`、`store/modules/settings.js`
- **主题色单链路梳理**：用户改色 `ThemePicker → commitUserThemeColor → applyThemeColor`；维护 `refreshAfterModeChange` / `refreshAfterElementCss`。
- **主题色与菜单对比度**：修复 `mutedFrom` 透明度；`--gp-menu-active-*` 菜单对比；本地 localStorage，非全站远程。
  - 代码：`elementTheme.js`、`BlogNavMenu`、`layout/blog/horizontal`
- **代码生成预览 UI**：预览弹窗 border-card 标签、文件工具栏、代码区支持横向/纵向滚动；Tab 名兼容 `.java/.vue` 等非 `.ftl`。
  - 代码：`src/views/admin/tool/generator/index.vue`、`src/styles/admin.scss`
- **代码生成：ZIP 与发布菜单解耦**：保留 ZIP 下载；新增 `publishMenuPreview` / `publishMenus`（幂等 component、事务写菜单+按钮、@Log 审计）；不做服务端读盘校验。
  - 前端：`GenPublishDialog.vue`、`generator/index.vue`、`api/tool/generatorTable.js`
  - 后端：`GenMenuPublishService`、`GeekPlus-Blog-API/docs/15-代码生成发布菜单.md`
- **低代码文档目录**：演进架构、自建应用、扩展包与实施路径。
  - 文档：`docs/lowcode/README.md`

### 2026-08-22

- **骨架工作室排布**：工具栏分组 + 导出下拉；组件库分「布局/占位」双列；结构编辑与实时预览并排；侧栏 sticky。
  - 代码：`SkeletonStudio.vue`
- **骨架识别 P1→P2→P3**：工作室「识别导入」——粘贴/文件 HTML·JSON·Vue；URL 经 `/api/skeleton/fetch-url`；截图经 `/api/skeleton/from-image`。
  - 代码：`src/components/skeleton/skeletonImport.js`、`SkeletonStudio.vue`、`src/api/skeleton.js`
  - 后端文档：`GeekPlus-Blog-API/docs/14-骨架屏识别API.md`
- **帖子内容列表模板 + 输入占位节点**：版块「帖子内容列表」；组件面板新增 `field`/`textarea`（外形占位，非真实表单控件）。
  - 代码：`skeletonPresets.js`、`skeletonSchema.js`、导出/渲染同步

### 2026-08-21

- **文件管理大文本卡顿**：文本预览弃用 `el-input`+`v-model`，改原生 textarea（正文不进 Vue 响应式）；悬停摘要 `maxChars`；后端 &gt;5MB 拒绝全文读。
  - 前端：`views/admin/system/file/index.vue`、`api/system/file-manager.js`
  - 后端/文档：`FileService#readTextFile`、`docs/13-文件管理大文本读取优化.md`
- **骨架屏 Schema 工作室（P0）**：独立路由 `/tool/skeletonStudio`；拖拽编辑 circle/line/lines/block/gap；CSS shimmer 预览；支持复制布局/样式/合并片段、导出 HTML+CSS 或 `.vue`。零新增 npm（复用 `vuedraggable`）。
  - 代码：`components/skeleton/*`、`views/tool/SkeletonStudio.vue`
  - 样式：`src/assets/css/index.css`（`.gp-skel` / `@keyframes gp-skel-shimmer`）
- **骨架布局增强**：新增「横向行 / 纵向组」嵌套容器；支持左右布局、对齐/间距/flex 占比；一键插入「头像|文案」；导出 HTML/CSS 同步含 `.gp-skel-row` / `.gp-skel-stack`。
- **骨架常用版块模板**：顶栏内容、侧栏主区、文章详情、双列卡片、商品三列、数据看板、评论列表、登录卡等；工具栏「套用版块模板」可替换/追加。
- **后台系统工具入口**：菜单「表单构建」「骨架屏工作室」（SQL：`GeekPlus-Blog-API/.../migration_tool_build_skeleton_menu.sql`）；后台页 `views/admin/tool/skeleton/index.vue`。
- **表单构建优化**：配色对齐后台 Token；布局组件新增「数据表格」；「整页模板 → 查询列表页」生成查询表单+表格+分页方法骨架（`pageMode=list`）。
- **PPT 设置面板 + 工具页 UI 统一**：右侧设置（主题风格 / 色板 / 字体 / 切换动画 / 自动播放 / 显示选项）；简历与 PPT 共用 `gp-tool-*` 样式，输入框对齐站点 Token。
  - 代码：`components/ppt/PptSettingsPanel.vue`、`pptThemes.js`、`PptStudio.vue`
  - 样式：`src/assets/css/index.css`（`.gp-tool-page` / `.gp-settings-panel`）
- **PPT 独立工作室**：从简历模块移出为 `/tool/pptStudio`；支持手输 / 上传文档 / 简历生成；主题动画、大纲脑图、激光笔、导出 HTML/MD；配色对齐 `color.css`。
  - 前端：`components/ppt/PptStudio.vue`、`views/tool/PptStudio.vue`
  - API：`POST /api/ppt/generate`（`tool/ppt`）
- **岗位爬虫加深**：新增 RemoteOK、Arbeitnow 公开源；Worker 按源策略拉取。  
- **后端分域 + 岗位爬虫**：`tool/resume`（CRUD/AI）与 `tool/job`（搜索/深链/Worker）拆分；`AiJsonParser` 统一 JSON 解析。  
  - API：`/api/job/search`、`/api/job/crawl/run`；SQL：`db/job_posting.sql`  
  - 文档：`GeekPlus-Blog-API/docs/12-模块拆分与岗位爬虫.md`
- **前端消重**：`resumeAiPayload.js` / `constants.js`；废弃仓内 `backend/resume-service` stub 说明。
- **简历上传空结果修复**：PDF/DOC 上传后 `code:200` 却返回空 basics/work——根因是 `mediaData` 传了 `File`，JSON 序列化丢附件。改为本地抽字（pdfjs/mammoth）+ base64 附件，并拦截空结构化结果。  
  - 代码：`src/utils/resumeFileParse.js`、`src/components/resume/ResumeFormEditor.vue`  
  - 后端：`Result.success((Object) text)`，避免正文进 `msg`  
- **对齐 即刻简历 并扩展**：新增「岗位分析 / 岗位搜索」工作区；PPT 已独立成工作室。  
  - 前端：`ResumeAnalysis.vue`、`ResumeJobSearch.vue`、`ResumeEditor.vue`  
  - 文档：`GeekPlus-Blog-API/docs/11-简历工具AI扩展-解析分析岗位搜索PPT.md`

### 2026-08-04（登录 / 打包 / SSO / 会话）

- **登录慢根因**：生产 `addressEnabled=true` 时登录会同步请求太平洋 IP 归属（超时原 20s）；已改为登录才查、超时 1.5s，Token 刷新不再查 IP。登录顺序改为先校验账号密码再写库。  
- **SSO**：`sys.account.ssoEnabled`（SQL：`migration_sys_account_sso.sql`）+ `token.ssoEnabled`；开启后 PC/移动端各 1 会话，关闭则不互踢。  
- **长期登录**：后端 `token.expireTime=30d` 滑动续期；前端 Cookie 与「记住我」对齐 30 天。  
- **打包偏大**：`dist≈32MB` 含 legacy+modern 双产物 + TinyMCE 静态；已收紧 browserslist、开启 webpack filesystem cache。重型库仍异步分包。  
- **Redis 会话设计说明**：见下方「会话与 Redis」。

#### 会话与 Redis（博客改造建议）

| 现状 | 问题 | 更稳妥方向 |
|------|------|------------|
| `user:login:{username}` 存完整 LoginUser（含权限集） | 用户多、权限大时 Redis 膨胀；多端共享同一份对象 | 会话瘦身：`jti → {userId, roles, device}`；权限 `perm:{userId}` 短 TTL，变更时失效 |
| 在线 JTI 列表 | 已支持 SSO 分端 | 保持列表；踢下线只删 JTI |
| Cookie 90d / Redis 7d 曾不一致 | 前端以为登录、后端已失效 | 已统一 30d + 滑动刷新 |
| 管理端与博客同一套 Token | 管理端宜短、博客宜长 | 后续可拆 `token.adminExpire` / `token.blogExpire` 或双 Token |

### 2026-08-03

- **留言管理 UI + 本人数据范围**：管理端留言分「网站留言 / 文章留言」信息流；非管理员仅看自己的留言与文章；文章留言卡片带文章 ID/标题并可跳转定位；网站留言可跳转 `/leave-word?commentId=`。  
  - 前端：`views/admin/geekplus/comment/index.vue`、`CommentReply`、`leave-word`、`article/index.vue`、`utils/blogAdmin.js`  
  - 后端：`ContentDataScopeUtils`、评论/文章 list 本人过滤、文章留言联表标题  
- **文章详情 UI 改版**：参考设计稿增加绿色 Hero 标题区、作者 Meta、侧栏目录 TOC、作者卡与底部相关推荐，仍走 `gp-page` 栅格。  
  - 代码：`src/views/article/index.vue`  
- **博客运营看板（权限）**：管理端首页改为深色运营看板（KPI / 趋势图 / 类型占比 / 最近文章）；仅博客/网站/系统管理员（或文章管理权限）可看。  
  - 代码：`src/views/admin/dashboard/index_v1.vue`、`src/utils/blogAdmin.js`、`src/router/index.js`  
  - 权限：`src/store/modules/user.js`、`src/store/getters.js`；后端 `getMenu` 补充 `userType` / `roleNames`  
- **后台直链被 404 通配误伤**：前台挂 `*` 后立刻 rematch，后台路由尚未注入导致 `/admin/...` 进 404；改为后台待加载时推迟 `*` 与 rematch，管理端路由加完后再挂通配。  
  - 代码：`src/permission.js`、`src/store/modules/permission.js`  
  - 文档：`docs/v2/07-前后台一体架构与脚手架拆分.md`  
- **404 通配未生效**：`has404` 误用静态页 `name:'404'` 判断，导致 `*` 永不注册；改为 `CatchAll404`。  
  - 代码：`src/permission.js`、`src/store/modules/permission.js`  
- **文章详情回归 gp 框架**：`index.vue` 恢复为与 `mobile.vue` 相同的 `gp-page/gp-row/gp-col` 布局。  
  - 代码：`src/views/article/index.vue`  
- **用户按部门含下级 + 角色数据权限**：后端 `deptIds`/`includeChildren`、`sys_role_dept`、`DataScopeAspect`；前端菜单/数据权限拆分。  
  - 后端：`GeekPlus-Blog-API`（需执行 `migration_sys_role_dept.sql`）  
  - 前端：`role/index.vue`、`api/system/role.js`、`user/index.vue`  

### 2026-07-31

- **简历模板构建器移动端投放**：HTML5 DnD 在触屏不可用；补触摸跟手投放（`elementFromPoint` 识别主栏/侧栏）与双栏点击选区弹窗。  
  - 代码：`src/views/admin/tool/resume/ResumeTemplateBuilder.vue`  
- **动态模板精细样式**：表头样式（圆点/边条/下划线/胶囊/色块/斜切）、模块主体色/边框/圆角/内边距；背景支持纯色/渐变/对角/不规则色块。  
  - 代码：`ResumeTemplateBuilder.vue`、`DynamicTemplate.vue`、`DynamicTemplateBlock.vue`、`types.js`  
- **简历编辑区始终全显**：`ResumeFormEditor` 不再按模板 `layoutData` 隐藏求职意向/获奖/证书/作品集等折叠项。  
  - 代码：`src/components/resume/ResumeFormEditor.vue`

### 2026-07-30

- **PlusCarousel 布局变宽不跟随**：侧栏收起/展开等只改容器宽、不触发 `window.resize` 时，`trackWidth` 仍用旧值导致位移错位；改为 `ResizeObserver` 监听根节点，宽度变化时瞬时对齐。  
  - 代码：`src/components/PlusCarousel/index.vue`  
- **PlusCarousel 回前台空白**：keep-alive / 切标签时 `clientWidth` 为 0 被写入 `trackWidth`，transform 错位且自动播停住；改为忽略 0 宽、`activated`/`visibilitychange` 时重测并 `recoverAfterHide`。  
  - 代码：`src/components/PlusCarousel/index.vue`  
- **侧栏布局隐藏页面侧栏**：仅 `min-width: 992px`（md+）隐藏 `.blog-side-container`，小屏仍显示。  
  - 代码：`src/assets/css/gp-blog-ui.css`  
- **请求层可移植拆分**：核心抽至 `src/utils/http/createRequest.js`（无 Element 硬依赖）；Element 走 `ui.element.js`；本站 `request.js` 仅接线。其它 Element 项目可整夹复制 `utils/http`；非 Element 换 UI 适配器即可。说明见 `src/utils/http/README.md`。  
- **请求切后台续传**：桌面切标签、手机切 App 导致页面 `hidden` 时，GET/HEAD 网络超时/中断不立刻判失败弹错；回前台后静默重试（`resumeOnVisible`）。  
  - 代码：`src/utils/http/*`、`src/utils/request.js`、`deferRequest.js`  
  - 文档：`docs/v2/03-request与网络请求调度.md`  
- **README 规范化**：按开源/团队项目常见结构重写本文件，并增加「变更记录」强制约定与 Cursor 规则 `.cursor/rules/changelog-readme.mdc`。  
- **架构注释**：为核心路由守卫、BlogShell、请求调度等补充意图注释（保留原有注释）。

### 更早（摘要，详见 docs/v2）

- BlogShell 合并 webApp/sideApp；菜单溢出折叠与 scrollWidth 误判修复  
- 前台/后台双重动态路由与直链 rematch  
- 分享卡 Canvas、PlusCarousel、request 去重与 idle 错峰等  

---

## 脚本与构建

| 命令 | 说明 |
|------|------|
| `npm run serve` / `dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint |

---

## 贡献约定

1. 改动遵循：**重要逻辑必须写清意图注释**。  
2. **重点优化必须更新本 README「变更记录」**。  
3. 较大专题可同步补 `docs/v2/` 对应文章。  
4. 前台优先 `gp-*` 与主题 CSS 变量；管理端可继续 Element。  

---

## License

Private / 以团队约定为准。
