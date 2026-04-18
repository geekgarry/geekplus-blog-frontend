// download-service-worker.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // 拦截特定的下载请求
  if (url.searchParams.has('sw_download')) {
    event.respondWith(handleDownloadStream(event));
  }
});

async function handleDownloadStream(event) {
  const request = event.request;
  const targetUrl = request.url.replace('&sw_download=true', '').replace('?sw_download=true', '');

  const response = await fetch(targetUrl);
  const contentLength = response.headers.get('content-length');
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        loaded += value.length;
        // 计算并广播进度给所有打开的页面 (Clients)
        if (total) {
          const percent = Math.floor((loaded / total) * 100);
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({
              type: 'sw_progress', url: targetUrl, percent, loaded, total
            }));
          });
        }
        controller.enqueue(value);
      }
      controller.close();

      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'sw_success', url: targetUrl }));
      });
    }
  });

  return new Response(stream, {
    headers: response.headers
  });
}
