// downloadServiceWorker.js — 拦截带 sw_download 的请求，流式转发并广播进度
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (!url.searchParams.has('sw_download')) {
    return;
  }
  event.respondWith(handleDownloadStream(event));
});

async function handleDownloadStream(event) {
  var request = event.request;
  var rawUrl = request.url;
  // 去掉 sw_download 标记，保留其余 query（如 password）
  var targetUrl = rawUrl
    .replace(/([?&])sw_download=true&?/, '$1')
    .replace(/[?&]$/, '');

  var headers = new Headers(request.headers);
  // 避免中间层对二进制做无意义压缩
  headers.set('Accept-Encoding', 'identity');

  var init = {
    method: request.method,
    headers: headers,
    mode: 'cors',
    credentials: request.credentials,
    redirect: 'follow'
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      init.body = await request.clone().arrayBuffer();
    } catch (e) { /* no body */ }
  }

  var response = await fetch(targetUrl, init);
  if (!response.ok || !response.body) {
    return response;
  }

  var contentLength = response.headers.get('content-length');
  var total = contentLength ? parseInt(contentLength, 10) : 0;
  var loaded = 0;
  var reader = response.body.getReader();

  var stream = new ReadableStream({
    start: function (controller) {
      function pump() {
        return reader.read().then(function (result) {
          if (result.done) {
            controller.close();
            broadcast({ type: 'sw_success', url: targetUrl });
            return;
          }
          loaded += result.value.length;
          if (total) {
            var percent = Math.floor((loaded / total) * 100);
            broadcast({
              type: 'sw_progress',
              url: targetUrl,
              percent: percent,
              loaded: loaded,
              total: total
            });
          } else {
            broadcast({
              type: 'sw_progress',
              url: targetUrl,
              percent: -1,
              loaded: loaded,
              total: 0
            });
          }
          controller.enqueue(result.value);
          return pump();
        }).catch(function (err) {
          controller.error(err);
          broadcast({ type: 'sw_error', url: targetUrl, error: String(err) });
        });
      }
      return pump();
    }
  });

  var outHeaders = new Headers(response.headers);
  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders
  });
}

function broadcast(msg) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage(msg);
    });
  });
}
