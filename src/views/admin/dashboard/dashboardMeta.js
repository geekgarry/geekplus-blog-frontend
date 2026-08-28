/**
 * 控制台「系统介绍」Tab 与 README「变更记录」保持摘要同步
 * 重点版本更新时请同时维护 README.md
 */
export const DASHBOARD_VERSION = '3.0.0'

export const DASHBOARD_UPDATE_LOGS = [
  {
    key: 'v3-2026-08',
    title: 'v3.0.0 · 2026-08 — 一体站 3.0',
    items: [
      'OA 工作台：/workbench 图标菜单；blogLayout / adminMenuLayout 支持 top·side·workbench 三态',
      '主题模块 @/theme：用户改色、深色模式不再覆盖 --theme-color；菜单对比度修复',
      '代码生成：ZIP 与发布菜单解耦，GenPublishDialog 幂等写菜单+按钮',
      '低代码文档目录 docs/lowcode；JVM 监控支持关闭自动刷新 + 手动拉取',
      '管理端控制台双 Tab：数据概览 + 系统介绍（本页）'
    ]
  },
  {
    key: 'v2-tools-2026-08',
    title: 'v2.8 · 2026-08 — 工具与内容',
    items: [
      '骨架屏 Schema 工作室（P0~P3）：识别导入 HTML/JSON/Vue/截图',
      '文件管理大文本预览改原生 textarea，避免 Vue 响应式卡顿',
      'PPT 独立工作室、简历 AI（岗位分析/搜索）、表单构建列表页模板',
      '岗位爬虫 Worker、后端 tool/resume 与 tool/job 分域'
    ]
  },
  {
    key: 'v2-arch-2026-07',
    title: 'v2.0 · 2026-07~08 — 架构与体验',
    items: [
      'BlogShell 双布局、顶栏菜单溢出「更多」、PlusCarousel 切页/ResizeObserver 修复',
      '双重动态路由与 404 通配时序；后台直链不再误进前台 404',
      '请求层 createRequest 可移植拆分；GET 切后台静默续传（resumeOnVisible）',
      '博客运营看板 index_v1、留言管理本人数据范围、文章详情 Hero/TOC 改版'
    ]
  },
  {
    key: 'v1-base',
    title: 'v1.0 · 基础版',
    items: [
      'GeekPlus 前后端分离：Shiro 权限、动态菜单、系统监控与操作/登录日志',
      'Element 管理端 + 博客前台；代码生成、文件中转、站点配置等业务模块'
    ]
  }
]
