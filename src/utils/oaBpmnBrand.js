/**
 * OA BPMN 画布右下角 bpmn.io 品牌显隐
 * 偏好存在 localStorage，设计器开关与详情 Viewer 共用 body.hide-bpmn-brand
 * 默认隐藏；仅当值为 '1' 时显示
 */
const STORAGE_KEY = 'oa-bpmn-show-brand'

export function isOaBpmnBrandVisible() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch (e) {
    return false
  }
}

/** 写入偏好并同步到 document.body */
export function applyOaBpmnBrand(visible) {
  const show = !!visible
  try {
    localStorage.setItem(STORAGE_KEY, show ? '1' : '0')
  } catch (e) { /* 隐私模式等忽略 */ }
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('hide-bpmn-brand', !show)
  }
  return show
}

/** 仅按本地偏好同步 body class（进入带 Viewer 的页面时调用） */
export function syncOaBpmnBrandFromStorage() {
  return applyOaBpmnBrand(isOaBpmnBrandVisible())
}
