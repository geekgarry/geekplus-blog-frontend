/**
 * 部门 —— 摘自 geekplus.sql sys_dept；leader 对齐 OA 试用用户 nickname
 */

const DEPTS = [
  { deptId: 100, parentId: 0, ancestors: '0', deptName: '麦壳畅想', orderNum: 0, leader: '系统管理员', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 101, parentId: 100, ancestors: '0,100', deptName: '畅想核心', orderNum: 1, leader: '李人事', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 102, parentId: 100, ancestors: '0,100', deptName: '南京分公司', orderNum: 2, leader: '极客普拉斯', phone: '15888888888', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 103, parentId: 101, ancestors: '0,100,101', deptName: '软件开发部门', orderNum: 1, leader: '王经理', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 104, parentId: 101, ancestors: '0,100,101', deptName: '市场部门', orderNum: 2, leader: '李人事', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 105, parentId: 101, ancestors: '0,100,101', deptName: '测试部门', orderNum: 3, leader: '王经理', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 106, parentId: 101, ancestors: '0,100,101', deptName: '财务部门', orderNum: 4, leader: '赵财务', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 107, parentId: 101, ancestors: '0,100,101', deptName: '运维部门', orderNum: 5, leader: '王经理', phone: '13465898832', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 108, parentId: 102, ancestors: '0,100,102', deptName: '市场部门', orderNum: 1, leader: '极客普拉斯', phone: '15888888888', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 109, parentId: 102, ancestors: '0,100,102', deptName: '财务部门', orderNum: 2, leader: '极客普拉斯', phone: '15888888888', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
  { deptId: 110, parentId: 101, ancestors: '0,100,101', deptName: '网络安全部门', orderNum: 6, leader: '极客普拉斯', phone: '13333333333', email: 'xxx@xxx.xxx', status: '0', delFlag: '0' },
]

function buildDeptTree (list, parentId = 0) {
  return list
    .filter((d) => Number(d.parentId) === Number(parentId))
    .map((d) => {
      const children = buildDeptTree(list, d.deptId)
      return children.length ? { ...d, children } : { ...d }
    })
}

module.exports = { DEPTS, buildDeptTree }
