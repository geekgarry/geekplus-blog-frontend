import request from '@/utils/request'

export function saveDraft(data) {
  return request({
    url: '/oa/designer/save',
    method: 'post',
    data
  })
}

export function publish(id) {
  return request({
    url: '/oa/designer/publish/' + id,
    method: 'post'
  })
}

export function disable(id) {
  return request({
    url: '/oa/designer/disable/' + id,
    method: 'post'
  })
}

export function listProcesses() {
  return request({
    url: '/oa/designer/list',
    method: 'get'
  })
}

export function listPublished() {
  return request({
    url: '/oa/designer/published',
    method: 'get'
  })
}

export function getDetail(id) {
  return request({
    url: '/oa/designer/detail/' + id,
    method: 'get'
  })
}

export function getBpmn(id) {
  return request({
    url: '/oa/designer/bpmn/' + id,
    method: 'get'
  })
}

export function deleteProcess(id) {
  return request({
    url: '/oa/designer/' + id,
    method: 'delete'
  })
}

export function getTemplates() {
  return request({
    url: '/oa/designer/templates',
    method: 'get'
  })
}

export function createFromTemplate(templateKey, data) {
  return request({
    url: '/oa/designer/template/' + templateKey,
    method: 'post',
    data
  })
}

export function startProcess(data) {
  return request({
    url: '/oa/designer/start',
    method: 'post',
    data
  })
}

export function myTasks(userId) {
  return request({
    url: '/oa/designer/tasks/' + userId,
    method: 'get'
  })
}

export function myHistoryTasks(userId) {
  return request({
    url: '/oa/designer/history-tasks/' + userId,
    method: 'get'
  })
}

export function myProcesses(userId) {
  return request({
    url: '/oa/designer/my-processes/' + userId,
    method: 'get'
  })
}

export function getInstanceDetail(instanceId) {
  return request({
    url: '/oa/designer/instance/' + instanceId,
    method: 'get'
  })
}

export function approve(data) {
  return request({
    url: '/oa/designer/approve',
    method: 'post',
    data
  })
}

export function reject(data) {
  return request({
    url: '/oa/designer/reject',
    method: 'post',
    data
  })
}

export function addSigner(data) {
  return request({
    url: '/oa/designer/add-signer',
    method: 'post',
    data
  })
}

export function delegate(data) {
  return request({
    url: '/oa/designer/delegate',
    method: 'post',
    data
  })
}

export function cancel(processInstanceId, userId) {
  return request({
    url: '/oa/designer/cancel/' + processInstanceId + '/' + userId,
    method: 'delete'
  })
}

export function backToHistory(data) {
  return request({
    url: '/oa/designer/back/history',
    method: 'post',
    data
  })
}

export function backToAny(data) {
  return request({
    url: '/oa/designer/back/any',
    method: 'post',
    data
  })
}

export function backToPrevious(processInstanceId, data) {
  return request({
    url: '/oa/designer/back/previous/' + processInstanceId,
    method: 'post',
    data
  })
}

/** 会签等多实例批量回退到指定节点 */
export function batchBack(data) {
  return request({
    url: '/oa/designer/back/batch',
    method: 'post',
    data
  })
}

export function testServiceTask(data) {
  return request({
    url: '/oa/designer/service-task/test',
    method: 'post',
    data
  })
}
