const CACHE_VERSION = '0.1.175';
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// these are the routes we are going to cache for offline support
const cacheFiles = [
  './',
  '',
  'data/civilization.json',
  'data/entertainment.json',
  'data/fall.json',
  'data/nouns.json',
  'data/prehistory.json',
  'data/science.json',
  'data/spring.json',
  'data/summer.json',
  'data/verbs.json',
  'data/winter.json',
  'fonts/Abel-Regular.ttf',
  'fonts/Bungee-Regular.ttf',
  'fonts/Federant-Regular.ttf',
  'helpers/vue.min.js',
  'helpers/console-enhancer-min.js',
  'images/civilization-alt2.jpg',
  'images/common-alt2.jpg',
  'images/diamond-back.svg',
  'images/diamond.svg',
  'images/entertainment-alt2.jpg',
  'images/icon-bmc.svg',
  'images/icon-download.svg',
  'images/icon-gradcap.svg',
  'images/icon-rotatearrow.svg',
  'images/icon-settings.svg',
  'images/icon-share.svg',
  'images/icon-spinner.svg',
  'images/nouns-alt2.jpg',
  'images/prehistory-alt2.jpg',
  'images/rotator-icon.svg',
  'images/science-alt2.jpg',
  'images/seasons-alt2.jpg',
  'images/tut-1.svg',
  'images/tut-2.svg',
  'images/tut-3.svg',
  'images/tut-4.svg',
  'images/tut-5.svg',
  'images/tut-6.svg',
  'images/tut-7.svg',
  'images/verbs-alt2.jpg',
  'models/TutorialStepObject.js',
  'models/CardObject-min.js',
  'models/PlayerObject-min.js',
  'models/WordObject-min.js',
  'models/WordSetObject-min.js',
  'styles/checkbox-min.css',
  'styles/main.css',
  'styles/main-min.css',
  'styles/normalize.css',
  'scripts/facets.js',
  'scripts/facets-min.js',
  'index.html',
];

// on activation we clean up the previously registered service workers
self.addEventListener('activate', (evt) =>
  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  ),
);

// on install we download the routes we want to cache for offline
self.addEventListener('install', (evt) =>
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then((cache) => {
      return cache.addAll(cacheFiles);
    }),
  ),
);

// update app if new service worker version has been loaded but is waiting
self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// fetch cache first, but use network if cache fails
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.txt')) {
    // Bypass the service worker and always fetch from the network
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.open(CURRENT_CACHE).then((cache) => {
        // Go to the cache first
        return cache.match(event.request.url).then((cachedResponse) => {
          // Return a cached response if we have one
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, hit the network
          return fetch(event.request).then((fetchedResponse) => {
            // Add the network response to the cache for later visits
            cache.put(event.request.url, fetchedResponse.clone());

            // Return the network response
            return fetchedResponse;
          });
        });
      }),
    );
  }
});
