/**
 * GeekPlus Mock 入口（geekplus-blog-frontend）
 * 数据来源：GeekPlus-Blog-API/sql/geekplus.sql（用户/角色/部门/系统菜单/通知）
 * + 本仓库已有页面的演示菜单；前台匿名接口见 routes/blog-public.js。
 *
 * 启用：npm run dev:mock
 * 说明：docs/mock-offline.md
 * 兄弟仓 plus-admin-antd 的 mock/ 须保持种子同步（见 .cursor/rules/sync-mock-seed.mdc）
 */

const auth = require('./routes/auth')
const systemUser = require('./routes/system-user')
const system = require('./routes/system')
const blogPublic = require('./routes/blog-public')

module.exports = {
  ...auth,
  ...systemUser,
  ...system,
  ...blogPublic,
}
