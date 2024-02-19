importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

const {registerRoute, setDefaultHandler} = workbox.routing;
const {CacheableResponsePlugin} = workbox.cacheableResponse;
const {ExpirationPlugin} = workbox.expiration;
const {precacheAndRoute} = workbox.precaching;
const {offlineFallback} = workbox.recipes;

const {
    NetworkFirst,
    StaleWhileRevalidate,
    CacheFirst,
    NetworkOnly,
} = workbox.strategies;
const cacheName = 'install-cache';
setDefaultHandler(new NetworkOnly());
offlineFallback();


// Precache the indicator/goal pages.
self.addEventListener('install', (event) => {
  const populateCache = async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(["/dns-indicators/1/","/dns-indicators/2/","/dns-indicators/3/","/dns-indicators/4/","/dns-indicators/5/","/dns-indicators/6/","/dns-indicators/7/","/dns-indicators/8/","/dns-indicators/9/","/dns-indicators/10/","/dns-indicators/11/","/dns-indicators/12/","/dns-indicators/13/","/dns-indicators/14/","/dns-indicators/15/","/dns-indicators/16/","/dns-indicators/17/"]);
    await cache.addAll(["/dns-indicators/6-2-ab/","/dns-indicators/12-1-b/","/dns-indicators/3-1-a/","/dns-indicators/13-1-a/","/dns-indicators/14-1-a/","/dns-indicators/8-3/","/dns-indicators/11-2-b/","/dns-indicators/12-1-a/","/dns-indicators/16-2/","/dns-indicators/16-1/","/dns-indicators/5-1-d/","/dns-indicators/7-2-a/","/dns-indicators/1-1-ab/","/dns-indicators/4-1-d/","/dns-indicators/11-1-b/","/dns-indicators/7-1-ab/","/dns-indicators/5-1-bc/","/dns-indicators/12-2/","/dns-indicators/4-2-ab/","/dns-indicators/15-3-ab/","/dns-indicators/8-2-c/","/dns-indicators/6-1-b/","/dns-indicators/10-1/","/dns-indicators/17-1/","/dns-indicators/9-1-b/","/dns-indicators/5-1-a/","/dns-indicators/4-1-b/","/dns-indicators/7-2-b/","/dns-indicators/8-2-ab/","/dns-indicators/13-1-b/","/dns-indicators/3-2-b/","/dns-indicators/12-3-ab/","/dns-indicators/5-1-e/","/dns-indicators/10-2/","/dns-indicators/14-1-b/","/dns-indicators/11-2-a/","/dns-indicators/15-2/","/dns-indicators/8-6/","/dns-indicators/17-2/","/dns-indicators/3-2-a/","/dns-indicators/9-1-a/","/dns-indicators/11-2-c/","/dns-indicators/6-1-a/","/dns-indicators/8-4/","/dns-indicators/5-1-f/","/dns-indicators/2-1-b/","/dns-indicators/17-3/","/dns-indicators/8-5-ab/","/dns-indicators/4-1-c/","/dns-indicators/11-4/","/dns-indicators/3-3/","/dns-indicators/8-1/","/dns-indicators/15-1/","/dns-indicators/11-3/","/dns-indicators/2-2/","/dns-indicators/11-1-c/","/dns-indicators/16-3-ab/","/dns-indicators/4-1-a/","/dns-indicators/11-1-a/","/dns-indicators/2-1-a/","/dns-indicators/1-1-c/"]);
    await cache.addAll(["https://dialogfassungdns.github.io/data/de/comb/6-2-ab.json","https://dialogfassungdns.github.io/data/de/comb/12-1-b.json","https://dialogfassungdns.github.io/data/de/comb/3-1-a.json","https://dialogfassungdns.github.io/data/de/comb/13-1-a.json","https://dialogfassungdns.github.io/data/de/comb/14-1-a.json","https://dialogfassungdns.github.io/data/de/comb/8-3.json","https://dialogfassungdns.github.io/data/de/comb/11-2-b.json","https://dialogfassungdns.github.io/data/de/comb/12-1-a.json","https://dialogfassungdns.github.io/data/de/comb/16-2.json","https://dialogfassungdns.github.io/data/de/comb/16-1.json","https://dialogfassungdns.github.io/data/de/comb/5-1-d.json","https://dialogfassungdns.github.io/data/de/comb/7-2-a.json","https://dialogfassungdns.github.io/data/de/comb/1-1-ab.json","https://dialogfassungdns.github.io/data/de/comb/4-1-d.json","https://dialogfassungdns.github.io/data/de/comb/11-1-b.json","https://dialogfassungdns.github.io/data/de/comb/7-1-ab.json","https://dialogfassungdns.github.io/data/de/comb/5-1-bc.json","https://dialogfassungdns.github.io/data/de/comb/12-2.json","https://dialogfassungdns.github.io/data/de/comb/4-2-ab.json","https://dialogfassungdns.github.io/data/de/comb/15-3-ab.json","https://dialogfassungdns.github.io/data/de/comb/8-2-c.json","https://dialogfassungdns.github.io/data/de/comb/6-1-b.json","https://dialogfassungdns.github.io/data/de/comb/10-1.json","https://dialogfassungdns.github.io/data/de/comb/17-1.json","https://dialogfassungdns.github.io/data/de/comb/9-1-b.json","https://dialogfassungdns.github.io/data/de/comb/5-1-a.json","https://dialogfassungdns.github.io/data/de/comb/4-1-b.json","https://dialogfassungdns.github.io/data/de/comb/7-2-b.json","https://dialogfassungdns.github.io/data/de/comb/8-2-ab.json","https://dialogfassungdns.github.io/data/de/comb/13-1-b.json","https://dialogfassungdns.github.io/data/de/comb/3-2-b.json","https://dialogfassungdns.github.io/data/de/comb/12-3-ab.json","https://dialogfassungdns.github.io/data/de/comb/5-1-e.json","https://dialogfassungdns.github.io/data/de/comb/10-2.json","https://dialogfassungdns.github.io/data/de/comb/14-1-b.json","https://dialogfassungdns.github.io/data/de/comb/11-2-a.json","https://dialogfassungdns.github.io/data/de/comb/15-2.json","https://dialogfassungdns.github.io/data/de/comb/8-6.json","https://dialogfassungdns.github.io/data/de/comb/17-2.json","https://dialogfassungdns.github.io/data/de/comb/3-2-a.json","https://dialogfassungdns.github.io/data/de/comb/9-1-a.json","https://dialogfassungdns.github.io/data/de/comb/11-2-c.json","https://dialogfassungdns.github.io/data/de/comb/6-1-a.json","https://dialogfassungdns.github.io/data/de/comb/8-4.json","https://dialogfassungdns.github.io/data/de/comb/5-1-f.json","https://dialogfassungdns.github.io/data/de/comb/2-1-b.json","https://dialogfassungdns.github.io/data/de/comb/17-3.json","https://dialogfassungdns.github.io/data/de/comb/8-5-ab.json","https://dialogfassungdns.github.io/data/de/comb/4-1-c.json","https://dialogfassungdns.github.io/data/de/comb/11-4.json","https://dialogfassungdns.github.io/data/de/comb/3-3.json","https://dialogfassungdns.github.io/data/de/comb/8-1.json","https://dialogfassungdns.github.io/data/de/comb/15-1.json","https://dialogfassungdns.github.io/data/de/comb/11-3.json","https://dialogfassungdns.github.io/data/de/comb/2-2.json","https://dialogfassungdns.github.io/data/de/comb/11-1-c.json","https://dialogfassungdns.github.io/data/de/comb/16-3-ab.json","https://dialogfassungdns.github.io/data/de/comb/4-1-a.json","https://dialogfassungdns.github.io/data/de/comb/11-1-a.json","https://dialogfassungdns.github.io/data/de/comb/2-1-a.json","https://dialogfassungdns.github.io/data/de/comb/1-1-c.json"]);
  };

  event.waitUntil(populateCache());
});


// Cache page navigations (html) with a Network First strategy
registerRoute(
  // Check to see if the request is a navigation to a new page
  ({ request }) => request.mode === 'navigate',
  // Use a Network First caching strategy
  new NetworkFirst({
    cacheName: cacheName,
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
  // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  // Use a Stale While Revalidate caching strategy
  new StaleWhileRevalidate({
    cacheName: cacheName,
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

// Cache images/fonts with a Cache First strategy
registerRoute(
  // Check to see if the request's destination is style for an image
  ({ request }) => ['image', 'font'].includes(request.destination),
  // Use a Cache First caching strategy
  new CacheFirst({
    cacheName: cacheName,
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      // Don't cache more than 50 items, and expire them after 30 days
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  }),
);

// Cache json with a Network First strategy.
registerRoute(
  /.*\.(json|geojson|zip|csv)$/,
  new NetworkFirst({
    cacheName: cacheName,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ]
  }),
);
