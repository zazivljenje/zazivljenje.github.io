var CACHE = "zz-images-v2";
var IMAGE_PATH = /^\/images\//;
var IMAGE_FILE = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i;
var MAX_AGE_SEC = 30 * 24 * 60 * 60;
var MAX_AGE_MS = MAX_AGE_SEC * 1000;
var CACHE_CONTROL = "public, max-age=" + MAX_AGE_SEC + ", stale-while-revalidate=86400";

self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf("zz-images-") === 0 && key !== CACHE;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function withImageCache(res) {
  var headers = new Headers(res.headers);
  headers.set("Cache-Control", CACHE_CONTROL);
  headers.set("X-SW-Cached-At", String(Date.now()));
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: headers,
  });
}

function isFresh(res) {
  var at = Number(res.headers.get("X-SW-Cached-At") || 0);
  return at > 0 && Date.now() - at < MAX_AGE_MS;
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url;
  try {
    url = new URL(req.url);
  } catch (err) {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (!IMAGE_PATH.test(url.pathname) && !IMAGE_FILE.test(url.pathname)) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req).then(function (cached) {
        var network = fetch(req)
          .then(function (res) {
            if (res && res.ok) {
              var stamped = withImageCache(res);
              cache.put(req, stamped.clone());
              return stamped;
            }
            return res;
          })
          .catch(function () {
            return cached;
          });
        if (cached && isFresh(cached)) return cached;
        return network;
      });
    })
  );
});
