# 无后端使用手册（Mock 离线模式）

面向：**没有启动 GeekPlus-Blog-API**、只想打开管理端（或勉强打开前台壳）的同学。

种子数据对齐 `GeekPlus-Blog-API/sql/geekplus.sql`（用户、角色、部门、系统菜单、通知），并与兄弟仓 **plus-admin-antd** 的 `mock/data/` **保持同源同步**（规则见 `.cursor/rules/sync-mock-seed.mdc`）。

---

## 1. 怎么启动

```bash
npm install
npm run dev:mock
# 默认 http://localhost:8080 （见 vue.config.js port）
```

等价于 `vue-cli-service serve --mode mock`，加载 [`.env.mock`](../.env.mock)。

| 命令 | 行为 |
|------|------|
| `npm run dev` / `serve` | **真实后端**：`.env.development` 中 `MOCK=none`，`/dev-api` 代理到 API |
| `npm run dev:mock` | **纯前端 Mock**：不挂后端代理，由 `mock/` 应答 |

改完 mock 或 env 后需**重启**开发服务。

---

## 2. 登录账号

验证码：**任意填写**。密码均为 **`123456`**。

| 用户名 | 角色 | 侧栏大致范围 |
|--------|------|----------------|
| `admin` | 系统管理员 | 全部演示菜单 |
| `geekplus` | 网站管理员 | 网站内容 + 工具 + 功能 |
| `developer` | 开发者 | 监控 + 工具 + 功能 |
| `commonuser` | 普通用户 | 功能中心 + 部分工具 + OA |
| `deptmgr` | 部门经理（OA） | 仅 OA；软件开发负责人 |
| `hrmgr` | 人事专员（OA） | 仅 OA |
| `finmgr` | 财务专员（OA） | 仅 OA |
| `staff01` / `staff02` | 普通员工（OA） | OA 工作台/待办/申请 |

管理端路径一般为 `/admin/login`（以本仓路由为准）。Cookie：`Plus-Token=mock-token-<用户名>`。

---

## 3. 推荐操作路径

1. 打开管理端登录页 → `admin` / `123456` + 任意验证码。  
2. 确认侧栏有系统管理 / 网站内容 / 功能中心等。  
3. **用户管理 / 角色 / 部门 / 菜单 / 系统通知**：种子列表可浏览。  
4. **系统工具 → 表单构建 / 骨架屏 / 代码演练场**：偏纯前端，可试用。  
5. **OA办公 → OA工作台 / 流程设计 / 流程管理 / 我的待办 / 我的申请**：页面已挂载；工作台统计、待办加签/转办/回退（含会签 `batchBack`）、详情审批卡与设计器组织选择依赖真实 `/oa/designer/*`、`/oa/org/*`（当前 Mock 仅菜单壳，需 `npm run dev` 联调后端）。  
6. **Swagger / Druid / 真文件上传 / WS 聊天**：Mock 下不可用，属预期。  
7. 前台首页：`/geekplusapp/*` 有空数据占位，避免刷屏 404；**不是**完整博客数据演示。

---

## 4. 模块目录

```
mock/
  createMiddleware.js   # 本仓专用轻量中间件（不依赖 umi-mock）
  index.js              # 路由聚合
  _util.js              # ok / mount / requireAuth
  data/                 # 种子（与 plus-admin-antd 同源）
  routes/               # auth / system / blog-public
```

扩展：在 `data/` 加种子，在 `routes/` 加 handler，用 `_util.mount` 注册。

---

## 5. 与 plus-admin-antd 同步约定

| 变更 | 必须做 |
|------|--------|
| API 仓新增/调整 **sql 种子、migration 初始数据** | **两个前端** `mock/data/`（及必要 `routes/`）一起更新 |
| 只改某一端页面路径 | 可只改该端 `menus.js` 中 component/path |

详见本仓 `.cursor/rules/sync-mock-seed.mdc`。

---

## 6. 常见问题

| 现象 | 处理 |
|------|------|
| 仍打到远端 API | 确认是 `dev:mock`，且 `.env.mock` 中 `MOCK=true` |
| 登录后无菜单 | Network 看 `/dev-api/sys/user/getMenu` 是否被 mock 命中 |
| 改 mock 无效果 | 重启；中间件会清 `require.cache`，但 env/代理变更必须重启 |
