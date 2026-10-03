/**
 * Guess the Word — service worker (Phase 4: offline support).
 *
 * Cache-first: on install, precaches every game file, the self-hosted
 * MediaPipe vendor files, and the face model, so the whole game (including
 * AR mode) works fully offline after the first visit. On fetch, a
 * precached/previously-cached response is served immediately with no
 * network round-trip; a request that isn't cached falls back to the
 * network and the successful response is cached for next time.
 *
 * CACHE_VERSION is the one thing to bump when game files change — it
 * changes the cache's name, so the next install precaches fresh copies of
 * everything under a new cache, and activate() deletes every old-named
 * cache this origin is holding. Without that, a returning visitor could be
 * stuck on stale cached files indefinitely, since cache-first never asks
 * the network to check for changes on its own.
 */
const CACHE_VERSION = "v37";
const CACHE_NAME = `guess-the-word-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "./",
  "index.html",
  "styles.css",
  "design-terms.js",
  "game.js",
  "face.js",
  "voice-vosk.js",
  "voice.js",
  "ui.js",
  "manifest.json",
  "icons/favicon-32.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png",
  "vendor/vision_bundle.mjs",
  "vendor/wasm/vision_wasm_internal.js",
  "vendor/wasm/vision_wasm_internal.wasm",
  "vendor/wasm/vision_wasm_nosimd_internal.js",
  "vendor/wasm/vision_wasm_nosimd_internal.wasm",
  "models/blaze_face_short_range.tflite",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // addAll() fails the whole install if any single request fails (e.g.
      // one 404), which is the right behavior here — a half-precached game
      // (say, missing the face model) should surface as an install failure
      // to retry, not silently ship broken AR mode.
      //
      // { cache: "reload" } on every request is deliberate, not default
      // fetch() behavior: without it, a request can be satisfied from the
      // browser's own regular HTTP cache instead of the network, silently
      // precaching a stale file left over from before an update — the
      // CACHE_VERSION bump above exists specifically to guarantee fresh
      // files, and that guarantee is worthless if this step can still pull
      // in something stale.
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })));
      await self.skipWaiting(); // this update applies immediately, not on next full reload
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          // Also clears caches left by the game's earlier name ("design-chain-")
          .filter((name) => (name.startsWith("guess-the-word-") || name.startsWith("design-chain-")) && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim(); // control already-open tabs too, not just future ones
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Only ever handle GET requests for this app's own origin — anything
  // else (a POST, a cross-origin request) is left to the network
  // untouched. There are no cross-origin requests left in normal gameplay
  // now that MediaPipe and the model are self-hosted, but this guard costs
  // nothing and avoids ever trying to cache something that can't be.
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (err) {
        // Truly offline and not in the cache — nothing sensible to return.
        // This only affects a request for something not in PRECACHE_URLS,
        // since everything the game actually needs is precached above.
        throw err;
      }
    })()
  );
});
