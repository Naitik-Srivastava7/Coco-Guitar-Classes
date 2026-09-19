const CACHE_NAME = 'coco-app-shell-v1';
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

// App shell (the HTML/icons) loads from cache for speed; everything else
// (like your Google Sheet data) always goes to the network, since receipts
// must be live and never stale.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isAppShellFile = APP_SHELL.some(f => url.pathname.endsWith(f.replace('./', '')));
  if (isAppShellFile) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
