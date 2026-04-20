import request from '@/utils/request'
import { downloadByServiceWorker, downloadFile } from '@/utils/downloadZip'

export function getMetrics() {
  return request({
    url: '/monitor/jvm/metrics',
    method: 'get'
  })
}

export function systemGC() {
  return request({
    url: '/monitor/jvm/gc',
    method: 'post'
  })
}

export function getThreadDump() {
  return request({
    url: '/monitor/jvm/thread-dump',
    method: 'get'
  })
}

export function submitTune(req) {
  return request({
    url: '/monitor/jvm/tune',
    method: 'post',
    data: req
  })
}

export function submitLinuxTune(req) {
  return request({
    url: '/monitor/jvm/linux-tune',
    method: 'post',
    data: req
  })
}

export function jvmGCPid(req) {
  return request({
    url: '/monitor/jvm/gc-by-pid',
    method: 'get',
    params: req
  })
}

export function getGCLog(req) {
  return request({
    url: '/monitor/jvm/gc-log/view',
    method: 'get',
    params: req
  })
}

export function getHeapDump() {
  return request({
    url: '/monitor/jvm/heap-dump/list',
    method: 'get'
  })
}

export function generateHeapDump() {
  return request({
    url: '/monitor/jvm/heap-dump/generate',
    method: 'post'
  })
}

// 文件下载
export function dlGCLogFile() {
  downloadFile('/monitor/jvm/gc-log/download');
}

export function dlHeapDumpFile(fileName, swRegistered) {
  if(swRegistered) {
    downloadByServiceWorker(`/monitor/jvm/heap-dump/download?fileName=${fileName}`, fileName);
  } else {
    downloadFile(`/monitor/jvm/heap-dump/download?fileName=${fileName}`);
  }
}
