// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Activate event
self.addEventListener('activate', (event) => {
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
  console.log('Service Worker activated');
});

// Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showDailyReminder());
  }
});

// Helper function to calculate delay until next 8:00 am
function getDelayUntilNext8AM() {
  const now = new Date();
  const next8AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);

  if (now.getTime() >= next8AM.getTime()) {
    next8AM.setDate(next8AM.getDate() + 1);
  }

  return next8AM.getTime() - now.getTime();
}

// Function to show daily reminder notification
function showDailyReminder() {
  console.log('showDailyReminder() called');

  const userWantsDailyReminder = true;

  self.clients.matchAll().then((clients) => {
    if (clients.length > 0 && userWantsDailyReminder) {
      const options = {
        body: "Today's Daily Facets puzzle is ready!",
        icon: '/images/icon192.png',
        badge: '/images/icon96.png',
        silent: false,
      };

      self.registration
        .showNotification('Daily Reminder', options)
        .then(() => console.log('Notification displayed successfully'))
        .catch((error) => console.error('Failed to display notification:', error));

      const delay = getDelayUntilNext8AM();
      setTimeout(() => {
        self.registration.sync
          .register('daily-reminder')
          .then(() => console.log('Sync event registered for the next notification'))
          .catch((error) => console.error('Sync registration failed:', error));
      }, delay + 86400000); // Add 24 hours (86400000 milliseconds) to the delay
    } else {
      console.log('Daily reminder notification not shown: User preference is disabled or no clients');
    }
  });
}
