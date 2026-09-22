const CACHE_NAME = 'coco-app-shell-v2';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  );
  self.clients.claim();
});

// Network-first for the app shell: every load tries to fetch the latest
// index.html (and icons/manifest) from GitHub first, only falling back to
// the cached copy if there's no internet. This is what makes uploading a
// new index.html show up automatically, without needing to manually close
// and reopen the app.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isAppShellFile = APP_SHELL.some(f => url.pathname.endsWith(f.replace('./', '')));
  if (isAppShellFile) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
