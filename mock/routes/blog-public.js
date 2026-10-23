/**
 * 博客前台匿名接口占位 —— 避免 Mock 离线打开首页时大量 404
 * 数据为空即可；管理端登录不依赖这些接口。
 */
const { ok, okRows, mount } = require('../_util')

module.exports = mount({
  'GET /geekplusapp/listSubParentCategory': (req, res) => {
    res.send(ok([]))
  },
  'GET /geekplusapp/getCarousel': (req, res) => {
    res.send(ok([]))
  },
  'GET /geekplusapp/getArticleList': (req, res) => {
    res.send(okRows([], 0))
  },
  'GET /geekplusapp/visitInfo': (req, res) => {
    res.send(ok({ todayVisit: 0, totalVisit: 0 }))
  },
  'GET /geekplusapp/getClickTextWords': (req, res) => {
    res.send(ok('时间一天比一天少，我们一天比一天老'))
  },
})
