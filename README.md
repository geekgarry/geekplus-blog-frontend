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

---

## 变更记录（重点优化）

> **约定**：以后每一次**重点优化 / 架构改动 / 体验向修复**，必须在本小节**置顶追加**一条（日期 + 摘要 + 关键路径）。日常文案微调可不记。

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
