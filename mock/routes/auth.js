const { ok, fail, mount, readBody, readQuery, requireAuth } = require('../_util')
const { findAccount } = require('../data/accounts')
const { menusForRole } = require('../data/menus')

/** 1x1 GIF，登录页任意验证码即可通过 */
const CAPTCHA_GIF =
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

function authPayload (account) {
  const roleKey = (account.roles && account.roles[0]) || 'common'
  const pack = menusForRole(roleKey)
  return {
    username: account.username,
    nickname: account.nickname,
    userId: account.userId,
    avatar: account.avatar || '',
    userType: account.userType,
    deptId: account.deptId,
    menuList: pack.tree,
    permsSet: pack.permsSet,
    roles: account.roles,
    roleNames: account.roleNames,
    permVer: 1,
    sysUser: {
      userId: account.userId,
      username: account.username,
      nickname: account.nickname,
      avatar: account.avatar || '',
      userType: account.userType,
      deptId: account.deptId,
      email: account.email,
      phonenumber: account.phonenumber,
      sex: account.sex,
      remark: account.remark,
    },
  }
}

module.exports = mount({
  'GET /captchaBase64': (req, res) => {
    res.send(ok({
      base64Code: CAPTCHA_GIF,
      mediaType: 'image/gif',
      validateKey: 'mock-captcha-' + Date.now(),
    }))
  },

  'POST /sys/user/login': (req, res) => {
    const body = readBody(req)
    const username = body.username
    const password = body.password
    // Mock 不校验 validateCode / Redis；任意验证码可过
    const account = findAccount(username)
    if (!account || account.password !== String(password || '')) {
      res.send(fail('用户名或密码错误', 500))
      return
    }
    res.send(ok({
      token: 'mock-token-' + account.username,
    }, '登录成功'))
  },

  'GET /sys/user/getMenu': (req, res) => {
    const auth = requireAuth(req, res)
    if (!auth) return
    const account = findAccount(auth.username)
    if (!account) {
      res.status(401).send(fail('用户不存在', 401))
      return
    }
    res.send(ok(authPayload(account)))
  },

  'GET /sys/user/refreshUserAuth': (req, res) => {
    const auth = requireAuth(req, res)
    if (!auth) return
    const account = findAccount(auth.username)
    if (!account) {
      res.status(401).send(fail('用户不存在', 401))
      return
    }
    res.send(ok(authPayload(account)))
  },

  'POST /sys/user/logout': (req, res) => {
    res.send(ok(null, '退出成功'))
  },

  'GET /sys/user/detail': (req, res) => {
    const auth = requireAuth(req, res)
    if (!auth) return
    const q = readQuery(req)
    const account = findAccount(auth.username)
    const target = q.userId
      ? require('../data/accounts').ACCOUNTS.find((a) => String(a.userId) === String(q.userId))
      : account
    if (!target) {
      res.send(fail('用户不存在'))
      return
    }
    res.send(ok({
      userId: target.userId,
      username: target.username,
      nickname: target.nickname,
      email: target.email,
      phonenumber: target.phonenumber,
      sex: target.sex,
      avatar: target.avatar || '',
      deptId: target.deptId,
      status: '0',
      remark: target.remark,
      roleIds: [target.roleId],
    }))
  },
})
