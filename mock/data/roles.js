/**
 * 角色 —— 摘自 geekplus.sql sys_role + OA 试用角色
 */

const ROLES = [
  { roleId: 1, roleName: '系统管理员', roleKey: 'admin', roleSort: 1, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: '系统管理员，最高级角色，可以控制所有权限' },
  { roleId: 2, roleName: '普通用户', roleKey: 'common', roleSort: 2, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: '普通用户，没有系统管理的权限' },
  { roleId: 3, roleName: '网站管理员', roleKey: 'webManage', roleSort: 3, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: '网站管理员，负责管理网站信息' },
  { roleId: 4, roleName: '开发者', roleKey: 'development', roleSort: 4, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: '开发者，为网站系统提供功能开发服务' },
  { roleId: 5, roleName: '部门经理', roleKey: 'oa_dept_leader', roleSort: 5, dataScope: '3', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: 'OA 试用：部门负责人审批' },
  { roleId: 6, roleName: '人事专员', roleKey: 'oa_hr', roleSort: 6, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: 'OA 试用：人事审批' },
  { roleId: 7, roleName: '财务专员', roleKey: 'oa_finance', roleSort: 7, dataScope: '1', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: 'OA 试用：财务审批' },
  { roleId: 8, roleName: '普通员工', roleKey: 'oa_staff', roleSort: 8, dataScope: '5', menuCheckStrictly: true, deptCheckStrictly: true, status: '0', delFlag: '0', remark: 'OA 试用：发起人/员工' },
]

module.exports = { ROLES }
