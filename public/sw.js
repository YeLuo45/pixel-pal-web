// PixelPal PWA Service Worker v2 - Enhanced with workbox-like strategies
const CACHE_VERSION = 'pixelpal-v2';
const BASE = '/pixel-pal-web/';
const OFFLINE_URL = BASE + 'index.html';

// Cache names for different resource types
const STATIC_CACHE = CACHE_VERSION + '-static';
const FONT_CACHE = CACHE_VERSION + '-fonts';
const IMAGE_CACHE = CACHE_VERSION + '-images';
const API_CACHE = CACHE_VERSION + '-api';

// Assets to precache on install
const PRECACHE_ASSETS = [
  BASE,
  BASE + 'index.html',
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete caches that don't match current version
            return ![
              STATIC_CACHE,
              FONT_CACHE,
              IMAGE_CACHE,
              API_CACHE,
            ].includes(name);
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Determine which cache strategy to use based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);

  // Fonts - CacheFirst with long expiry
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    return { cache: FONT_CACHE, strategy: 'cacheFirst', maxAge: 365 * 24 * 60 * 60 };
  }

  // Images - CacheFirst with medium expiry
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif|woff2?)$/i.test(url.pathname)) {
    return { cache: IMAGE_CACHE, strategy: 'cacheFirst', maxAge: 30 * 24 * 60 * 60 };
  }

  // API requests - NetworkFirst with timeout
  if (url.pathname.startsWith('/api/') || url.hostname.includes('googleapis.com')) {
    return { cache: API_CACHE, strategy: 'networkFirst', maxAge: 5 * 60 };
  }

  // Static assets (JS, CSS, HTML) - StaleWhileRevalidate
  return { cache: STATIC_CACHE, strategy: 'staleWhileRevalidate', maxAge: 7 * 24 * 60 * 60 };
}

// CacheFirst strategy
async function cacheFirst(request, cacheName, maxAge) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Check if cached response is too old
    const dateHeader = cachedResponse.headers.get('date');
    if (dateHeader) {
      const age = (Date.now() - new Date(dateHeader).getTime()) / 1000;
      if (age < maxAge) return cachedResponse;
    } else {
      return cachedResponse; // No date header, trust the cache
    }
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// NetworkFirst strategy
async function networkFirst(request, cacheName, maxAge, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timeoutId);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Return offline fallback for navigation
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    return new Response('Offline', { status: 503 });
  }
}

// StaleWhileRevalidate strategy
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Fetch in background regardless
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  if (cachedResponse) {
    const dateHeader = cachedResponse.headers.get('date');
    if (dateHeader) {
      const age = (Date.now() - new Date(dateHeader).getTime()) / 1000;
      if (age < maxAge) return cachedResponse;
    } else {
      return cachedResponse;
    }
  }

  // No fresh cache, wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  // Return cached or offline fallback
  return cachedResponse || new Response('Offline', { status: 503 });
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and non-http(s)
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Skip self (don't recache the service worker itself)
  if (url.pathname === '/sw.js' || url.pathname.endsWith('/sw.js')) return;

  const { cache, strategy, maxAge } = getCacheStrategy(request);

  event.respondWith(
    (async () => {
      switch (strategy) {
        case 'cacheFirst':
          return cacheFirst(request, cache, maxAge);
        case 'networkFirst':
          return networkFirst(request, cache, maxAge);
        case 'staleWhileRevalidate':
          return staleWhileRevalidate(request, cache, maxAge);
        default:
          return fetch(request);
      }
    })()
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
