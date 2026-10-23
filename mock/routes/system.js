const { ok, okRows, mount, pageSlice, readQuery, requireAuth } = require('../_util')
const { ROLES } = require('../data/roles')
const { DEPTS, buildDeptTree } = require('../data/depts')
const { MENU_FLAT, buildMenuTree } = require('../data/menus')
const { NOTICES } = require('../data/notices')

module.exports = mount({
  'GET /sys/role/list': (req, res) => {
    if (!requireAuth(req, res)) return
    const page = pageSlice(ROLES, readQuery(req))
    res.send(okRows(page.rows, page.total))
  },

  'GET /sys/role/listAll': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(ROLES.slice()))
  },

  'GET /sys/role/detail': (req, res) => {
    if (!requireAuth(req, res)) return
    const q = readQuery(req)
    const role = ROLES.find((r) => String(r.roleId) === String(q.roleId))
    res.send(ok(role || null))
  },

  'GET /sys/dept/listAll': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(DEPTS.map((d) => Object.assign({}, d))))
  },

  'GET /sys/dept/getSysDeptTree': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(buildDeptTree(DEPTS, 0)))
  },

  'GET /sys/dept/detail': (req, res) => {
    if (!requireAuth(req, res)) return
    const q = readQuery(req)
    const dept = DEPTS.find((d) => String(d.deptId) === String(q.deptId))
    res.send(ok(dept || null))
  },

  'GET /sys/menu/listAll': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(MENU_FLAT.map((m) => Object.assign({}, m))))
  },

  'GET /sys/menu/list': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(MENU_FLAT.map((m) => Object.assign({}, m))))
  },

  'GET /sys/menu/getMenu': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(buildMenuTree(MENU_FLAT, 0, true)))
  },

  'GET /sys/menu/getMenuTreeList': (req, res) => {
    if (!requireAuth(req, res)) return
    res.send(ok(buildMenuTree(MENU_FLAT, 0, true)))
  },

  'GET /sys/notice/list': (req, res) => {
    if (!requireAuth(req, res)) return
    const q = readQuery(req)
    let list = NOTICES.slice()
    if (q.status != null && q.status !== '') {
      list = list.filter((n) => String(n.status) === String(q.status))
    }
    const page = pageSlice(list, q)
    res.send(okRows(page.rows, page.total))
  },

  'GET /sys/notice/detail': (req, res) => {
    if (!requireAuth(req, res)) return
    const q = readQuery(req)
    const row = NOTICES.find((n) => String(n.noticeId) === String(q.noticeId || q.id))
    res.send(ok(row || null))
  },
})
