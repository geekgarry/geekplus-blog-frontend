const { ok, okRows, fail, mount, pageSlice, readQuery, readBody, requireAuth } = require('../_util')
const { USERS } = require('../data/users')
const { findAccount } = require('../data/accounts')

let userStore = USERS.map((u) => Object.assign({}, u))

module.exports = mount({
  'GET /sys/user/list': (req, res) => {
    if (!requireAuth(req, res)) return
    const q = readQuery(req)
    let list = userStore.slice()
    if (q.deptId) {
      list = list.filter((u) => String(u.deptId) === String(q.deptId))
    }
    if (q.username || q.userName) {
      const kw = String(q.username || q.userName).toLowerCase()
      list = list.filter((u) => String(u.username).toLowerCase().indexOf(kw) >= 0)
    }
    if (q.nickname || q.nickName) {
      const kw = String(q.nickname || q.nickName).toLowerCase()
      list = list.filter((u) => String(u.nickname).toLowerCase().indexOf(kw) >= 0)
    }
    const page = pageSlice(list, q)
    res.send(okRows(page.rows, page.total))
  },

  'POST /sys/user/list': (req, res) => {
    if (!requireAuth(req, res)) return
    const q = Object.assign({}, readQuery(req), readBody(req))
    let list = userStore.slice()
    if (q.deptId) {
      list = list.filter((u) => String(u.deptId) === String(q.deptId))
    }
    const page = pageSlice(list, q)
    res.send(okRows(page.rows, page.total))
  },

  'GET /sys/user/userProfile': (req, res) => {
    const auth = requireAuth(req, res)
    if (!auth) return
    const account = findAccount(auth.username)
    if (!account) {
      res.send(fail('用户不存在'))
      return
    }
    res.send(ok({
      userId: account.userId,
      username: account.username,
      nickname: account.nickname,
      email: account.email,
      phonenumber: account.phonenumber,
      sex: account.sex,
      avatar: account.avatar || '',
      deptId: account.deptId,
      remark: account.remark,
    }))
  },

  'POST /sys/user/updateUserProfile': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(null, '资料已更新（Mock 内存，刷新后可能还原）'))
  },

  'POST /sys/user/updateUserPwd': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(null, '密码已更新（Mock 不落库）'))
  },
})
