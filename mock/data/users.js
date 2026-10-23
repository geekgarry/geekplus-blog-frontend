/**
 * 用户列表行 —— 对齐 sys_user 种子（不含真实密码哈希）
 */

const { ACCOUNTS } = require('./accounts')
const { ROLES } = require('./roles')

const USERS = ACCOUNTS.map((a) => ({
  userId: a.userId,
  deptId: a.deptId,
  username: a.username,
  userName: a.username,
  nickname: a.nickname,
  nickName: a.nickname,
  userType: a.userType,
  email: a.email,
  phonenumber: a.phonenumber,
  sex: a.sex,
  avatar: a.avatar || '',
  status: '0',
  delFlag: '0',
  loginIp: '127.0.0.1',
  loginDate: '2026-09-01 10:00:00',
  createTime: '2022-04-26 22:12:10',
  remark: a.remark,
  roleIds: [a.roleId],
  roles: ROLES.filter((r) => r.roleId === a.roleId),
}))

module.exports = { USERS }
