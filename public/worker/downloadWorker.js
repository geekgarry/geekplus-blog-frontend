// downloadWorker.js — 后台线程拉 Blob，避免阻塞主线程 UI
// 支持 GET/POST、自定义 headers（如文件中转密码）
self.onmessage = function (e) {
  var data = e.data || {};
  var url = data.url;
  var filename = data.filename || 'download.bin';
  var method = (data.method || 'GET').toUpperCase();
  var headers = data.headers || {};
  var body = data.body;

  if (!url) {
    self.postMessage({ type: 'error', error: 'Missing download url' });
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.responseType = 'blob';

  try {
    Object.keys(headers).forEach(function (key) {
      if (headers[key] != null && headers[key] !== '') {
        xhr.setRequestHeader(key, headers[key]);
      }
    });
  } catch (err) {
    // ignore invalid header names
  }

  xhr.onprogress = function (event) {
    if (event.lengthComputable) {
      var percent = Math.floor((event.loaded / event.total) * 100);
      self.postMessage({
        type: 'progress',
        percent: percent,
        loaded: event.loaded,
        total: event.total
      });
    } else if (event.loaded) {
      self.postMessage({
        type: 'progress',
        percent: -1,
        loaded: event.loaded,
        total: 0
      });
    }
  };

  xhr.onload = function () {
    var ct = (xhr.getResponseHeader('content-type') || '').toLowerCase();
    if (this.status >= 200 && this.status < 300) {
      // 业务错误常以 JSON blob 返回
      if (ct.indexOf('application/json') !== -1) {
        var reader = new FileReader();
        reader.onload = function () {
          var msg = 'Download failed';
          try {
            var json = JSON.parse(reader.result);
            msg = json.msg || json.message || msg;
          } catch (parseErr) { /* keep default */ }
          self.postMessage({ type: 'error', error: msg });
        };
        reader.onerror = function () {
          self.postMessage({ type: 'error', error: 'Download failed (json)' });
        };
        reader.readAsText(this.response);
        return;
      }
      var disposition = xhr.getResponseHeader('content-disposition') || '';
      self.postMessage({
        type: 'success',
        blob: this.response,
        filename: filename,
        disposition: disposition
      });
    } else {
      self.postMessage({
        type: 'error',
        error: 'Download failed with status: ' + this.status
      });
    }
  };

  xhr.onerror = function () {
    self.postMessage({ type: 'error', error: 'Network error occurred' });
  };

  xhr.ontimeout = function () {
    self.postMessage({ type: 'error', error: 'Download timeout' });
  };

  if (typeof data.timeout === 'number' && data.timeout > 0) {
    xhr.timeout = data.timeout;
  }

  if (method === 'POST' || method === 'PUT') {
    if (typeof body === 'string') {
      xhr.send(body);
    } else if (body && typeof body === 'object') {
      if (!headers['Content-Type'] && !headers['content-type']) {
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      }
      xhr.send(JSON.stringify(body));
    } else {
      xhr.send(null);
    }
  } else {
    xhr.send();
  }
};
