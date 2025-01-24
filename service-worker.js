let tempUserWantsDailyReminder = false;

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    clients.claim().then(() => {
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
          console.log('NEW_VERSION_AVAILABLE message sent to client:', client);
        });
      });
    }),
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showDailyReminder());
  }
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data.type === 'USER_WANTS_REMINDER') {
    tempUserWantsDailyReminder = event.data.tempUserWantsDailyReminder;
    console.log('Received user preference:', tempUserWantsDailyReminder);
  }
});

function showDailyReminder() {
  console.log('showDailyReminder() called');

  self.clients.matchAll().then((clients) => {
    if (clients.length > 0 && tempUserWantsDailyReminder) {
      const client = clients[0];

      const options = {
        body: "Today's Daily Facets puzzle is ready!",
        icon: '/images/icon192.png',
        badge: '/images/icon96.png',
        silent: false,
      };

      self.registration
        .showNotification('Daily Reminder', options)
        .then(() => {
          console.log('Notification displayed successfully');
        })
        .catch((error) => {
          console.error('Failed to display notification:', error);
        });
    } else {
      console.log('Daily reminder notification not shown: User preference is disabled or no clients');
    }
  });
}
