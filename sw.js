const CACHE_VERSION = '1.0.092';
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// these are the routes we are going to cache for offline support
const cacheFiles = [
  '/',
  '',
  'favicon-16x16.png',
  'favicon.png',
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
  'images/tut-4.svg',
  'images/tut-4-light.svg',
  'images/tut-6.svg',
  'images/tut-6-light.svg',
  'images/tut-7.svg',
  'images/tut-7-light.svg',
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
  evt.waitUntil(clients.claim());
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

// fetch cache first, but use network if cache fails
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Exclude requests to bigtentgames.workers.dev
  if (requestUrl.hostname.includes('bigtentgames.workers.dev')) {
    return;
  }

  if (requestUrl.searchParams.toString().length > 0) {
    return;
  }

  event.respondWith(
    caches.open(CURRENT_CACHE).then((cache) => {
      return cache.match(event.request.url).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fetch from the network without caching
        return fetch(event.request, { cache: 'no-store' }).then((fetchedResponse) => {
          cache.put(event.request.url, fetchedResponse.clone());
          return fetchedResponse;
        });
      });
    }),
  );
});
