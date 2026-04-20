// downloadWorker.js
self.onmessage = function (e) {
  const { url, filename } = e.data;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob'; // 关键：指定返回 Blob 类型

  xhr.onprogress = function (event) {
    if (event.lengthComputable) {
      const percent = Math.floor((event.loaded / event.total) * 100);
      // 向主线程汇报进度
      self.postMessage({ type: 'progress', percent: percent, loaded: event.loaded, total: event.total });
    }
  };

  xhr.onload = function () {
    if (this.status === 200) {
      self.postMessage({ type: 'success', blob: this.response, filename: filename });
    } else {
      self.postMessage({ type: 'error', error: 'Download failed with status: ' + this.status });
    }
  };

  xhr.onerror = function () {
    self.postMessage({ type: 'error', error: 'Network error occurred' });
  };

  xhr.send();
};
