const CACHE = "links-v1";
const SCOPE = new URL(self.registration.scope);
const SHELL = [SCOPE.href, new URL("manifest.webmanifest", SCOPE).href, new URL("icons/icon-192.png", SCOPE).href];
const PRIVATE = /\/(studio|api)(\/|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("links-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const keep = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

const fresh = (request, key = request) =>
  fetch(request)
    .then((response) => keep(key, response))
    .catch(() => caches.match(key));

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== SCOPE.origin || PRIVATE.test(url.pathname)) return;
  if (request.mode === "navigate") return event.respondWith(fresh(request, SCOPE.href));
  if (!url.pathname.includes("/_astro/")) return event.respondWith(fresh(request));
  event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((response) => keep(request, response))));
});
