const CACHE_NAME = "e-commerce-kit-v4-v3";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./v4/domain/rules.js",
  "./v4/domain/diagnostics.js",
  "./v4/state/store.js",
  "./v4/engines/landed-cost-engine.js",
  "./v4/engines/profitability-engine.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
