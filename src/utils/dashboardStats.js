/**
 * 控制台图表：将后端按日 count 对齐到连续日期（缺失补 0）
 * @param {string[]} days YYYY-MM-DD
 * @param {Array<{date?: string, day?: string, name?: string, count?: number, value?: number}>} rows
 */
export function mergeDailyCounts(days, rows) {
  const map = {}
  ;(rows || []).forEach((r) => {
    const key = r.date || r.day || r.name
    if (!key) return
    const cnt = r.count != null ? r.count : r.value
    map[String(key).slice(0, 10)] = Number(cnt) || 0
  })
  return days.map((d) => map[d] || 0)
}

/** 近 n 天日期序列（含今天） */
export function lastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const m = `${d.getMonth() + 1}`.padStart(2, '0')
    const day = `${d.getDate()}`.padStart(2, '0')
    days.push(`${d.getFullYear()}-${m}-${day}`)
  }
  return days
}

/** 兼容 Result.success(list) 与裸数组 */
export function parseStatsList(res) {
  const payload = res && res.data !== undefined ? res.data : res
  return Array.isArray(payload) ? payload : []
}
