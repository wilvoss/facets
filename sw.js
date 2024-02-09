const CACHE_VERSION = '1.0.043';
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// these are the routes we are going to cache for offline support
const cacheFiles = [
  './',
  '',
  'data/cities.json',
  'data/civilization.json',
  'data/common-emoji.json',
  'data/entertainment.json',
  'data/fall.json',
  'data/nouns.json',
  'data/prehistory.json',
  'data/science.json',
  'data/sports.json',
  'data/spring.json',
  'data/summer.json',
  'data/verbs.json',
  'data/winter.json',
  'game/index.html',
  'fonts/Abel-Regular.ttf',
  'fonts/Bungee-Regular.ttf',
  'fonts/Federant-Regular.ttf',
  'helpers/vue.min.js',
  'helpers/console-enhancer-min.js',
  'images/wallpapers/civilization.jpg',
  'images/wallpapers/common.jpg',
  'images/wallpapers/emoji.jpg',
  'images/wallpapers/entertainment.jpg',
  'images/wallpapers/nouns.jpg',
  'images/wallpapers/prehistory.jpg',
  'images/wallpapers/science.jpg',
  'images/wallpapers/seasons.jpg',
  'images/wallpapers/sports.jpg',
  'images/wallpapers/verbs.jpg',
  'images/diamond-back.svg',
  'images/diamond.svg',
  'images/facets_og.png',
  'images/icon-alert.svg',
  'images/icon-download.svg',
  'images/icon-rotatearrow.svg',
  'images/icon-share.svg',
  'images/icon-spinner.svg',
  'images/rotator-icon.svg',
  'images/tut-1.svg',
  'images/tut-2.svg',
  'images/tut-3.svg',
  'images/tut-4.svg',
  'images/tut-5.svg',
  'images/tut-6.svg',
  'images/tut-7.svg',
  'models/CardObject-min.js',
  'models/PlayerObject-min.js',
  'models/WordObject-min.js',
  'models/WordSetObject-min.js',
  'scripts/facets.js',
  'scripts/facets-min.js',
  'scripts/fetch-game.js',
  'scripts/fetch-game-min.js',
  'styles/checkbox-min.css',
  'styles/main.css',
  'styles/main-min.css',
  'styles/normalize.css',
  'index.html',
];

// on activation we clean up the previously registered service workers
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
          // Return a resolved promise to ensure all caches are checked
          return Promise.resolve();
        }),
      );
    }),
  );
});

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

self.addEventListener('fetch', (event) => {
  // Check if the request is for a new file (e.g., CSS, JS, or HTML)
  const isFileRequest = event.request.url.includes('.css') || event.request.url.includes('.js') || event.request.url.includes('.html');

  if (isFileRequest) {
    // Fetch from the network and update the cache
    event.respondWith(
      fetch(event.request)
        .then((fetchedResponse) => {
          // Clone the response to use it in both cache and client
          const clonedResponse = fetchedResponse.clone();

          // Update the cache with the new response
          caches.open(CURRENT_CACHE).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          return fetchedResponse;
        })
        .catch(() => {
          // If network fetch fails, serve from cache
          return caches.match(event.request);
        }),
    );
  } else {
    // For API calls, fetch directly from the network
    if (event.request.url.includes('bigtentgames.workers.dev')) {
      event.respondWith(
        fetch(event.request)
          .then((apiResponse) => {
            // Clone the response to use it in both cache and client
            const clonedApiResponse = apiResponse.clone();

            // Update the cache with the new API response
            caches.open(CURRENT_CACHE).then((cache) => {
              cache.put(event.request, clonedApiResponse);
            });

            return apiResponse;
          })
          .catch(() => {
            // If API fetch fails, serve from cache
            return caches.match(event.request);
          }),
      );
    } else {
      // Serve other requests from the cache
      event.respondWith(caches.match(event.request));
    }
  }
});
