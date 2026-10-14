const VERSION = "3229a2ec03a4";
const PRECACHE = ["./","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","_astro/ActionSplit.astro_astro_type_script_index_0_lang.Jmxnh4ok.js","_astro/Base.astro_astro_type_script_index_0_lang.DrkuhRcH.js","_astro/ClientRouter.astro_astro_type_script_index_0_lang.CYDbzu1r.js","_astro/index.astro_astro_type_script_index_0_lang.WW9lgPEx.js","_astro/progress.BZRD95mJ.js","_astro/reversible.U6RcVSOS.js","_astro/worker-BOcT8uPn.js"];
const CACHE = `cv-app-${VERSION}`;
const SCOPE = new URL(self.registration.scope);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((path) => new URL(path, SCOPE).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("cv-app-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then((cache) => cache.put(SCOPE.href, copy));
          }

          return response;
        })
        .catch(() => caches.match(SCOPE.href))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }

          return response;
        })
    )
  );
});
