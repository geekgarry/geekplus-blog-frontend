import request from '@/utils/request'

/** 运营看板：近 N 日 Redis/DB 统计 */
export function getDashboardStats(days = 30) {
  return request({
    url: '/geekplus/stats/dashboard',
    method: 'get',
    params: { days }
  })
}
