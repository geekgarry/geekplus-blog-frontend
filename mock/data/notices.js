/**
 * 系统通知 —— 摘自 geekplus.sql sys_notice（字段名对齐前端 NoticeIcon / 通知页）
 */

const NOTICES = [
  {
    noticeId: 1,
    noticeTitle: '这是第一条公告',
    noticeContent: '<h3>你好，我是 geekplus admin 系统，这是一个基于 springboot+vue 的开源管理系统</h3>',
    noticeType: '1',
    status: '0',
    createBy: 'admin',
    createTime: '2022-05-08 23:44:17',
  },
  {
    noticeId: 2,
    noticeTitle: 'Hello World！',
    noticeContent: '你好，世界！',
    noticeType: '1',
    status: '0',
    createBy: 'admin',
    createTime: '2022-05-11 09:24:18',
  },
  {
    noticeId: 3,
    noticeTitle: '离线 Mock 模式说明',
    noticeContent: '当前为前端 Mock：无后端也可登录浏览。验证码任意填写；账号见 docs/mock-offline.md。',
    noticeType: '2',
    status: '0',
    createBy: 'system',
    createTime: '2026-09-06 00:00:00',
  },
]

module.exports = { NOTICES }
