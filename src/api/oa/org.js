import { listUser } from '@/api/system/user'
import { listDept } from '@/api/system/dept'
import { listAllRole } from '@/api/system/role'

/**
 * OA 组织选项：复用系统管理已有接口（/sys/user|/sys/dept|/sys/role）
 */

function unwrapList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  const data = res.rows != null ? res.rows : res.data
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.rows)) return data.rows
  if (data && Array.isArray(data.data)) return data.data
  return []
}

export function mapUserOption(u) {
  const id = u.userId != null ? u.userId : u.id
  return {
    id,
    userId: id,
    username: u.username || u.userName || '',
    realName: u.nickname || u.nickName || u.realName || u.username || String(id),
    nickname: u.nickname || u.nickName || '',
    deptId: u.deptId
  }
}

export function mapDeptOption(d) {
  const id = d.deptId != null ? d.deptId : d.id
  return {
    id,
    deptId: id,
    name: d.deptName || d.name || String(id),
    deptName: d.deptName || d.name || String(id),
    parentId: d.parentId,
    leader: d.leader || ''
  }
}

export function mapRoleOption(r) {
  return {
    id: r.roleId != null ? r.roleId : r.id,
    code: r.roleKey || r.code,
    name: r.roleName || r.name,
    roleKey: r.roleKey || r.code,
    roleName: r.roleName || r.name
  }
}

export function listOaUsers(deptId) {
  const params = { pageNum: 1, pageSize: 500 }
  if (deptId != null && deptId !== '') params.deptId = deptId
  return listUser(params)
}

export function listOaDepartments() {
  return listDept({})
}

export function listOaRoles() {
  return listAllRole()
}

export async function loadOaUserOptions(deptId) {
  const res = await listOaUsers(deptId)
  return unwrapList(res).map(mapUserOption)
}

export async function loadOaDeptOptions() {
  const res = await listOaDepartments()
  return unwrapList(res).map(mapDeptOption)
}

export async function loadOaRoleOptions() {
  const res = await listOaRoles()
  return unwrapList(res).map(mapRoleOption)
}
