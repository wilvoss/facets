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

// Periodic Sync event
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showDailyReminder());
  }
});

// Message event to receive user preference updates
self.addEventListener('message', (event) => {
  if (event.data.type === 'USER_WANTS_REMINDER') {
    self.userWantsDailyReminder = event.data.tempUserWantsDailyReminder;
    console.log('Service Worker received updated user preference:', self.userWantsDailyReminder);
  } else {
    console.warn('Service Worker received unknown message type:', event.data.type);
  }
});

// Helper function to calculate delay until next 8:00 am
function getInternalDelayUntilNext8AM() {
  const now = new Date();
  const next8AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);

  if (now.getTime() >= next8AM.getTime()) {
    next8AM.setDate(next8AM.getDate() + 1);
  }
  const delay = next8AM.getTime() - now.getTime();
  console.log(`Calculated delay until next 8:00 AM: ${delay} milliseconds`);
  return delay;
}

// Function to show daily reminder notification
function showDailyReminder() {
  console.log('showDailyReminder() called');

  const userWantsDailyReminder = self.userWantsDailyReminder !== undefined ? self.userWantsDailyReminder : true;

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

      const delay = getInternalDelayUntilNext8AM() + 10000;
      console.log(`Setting timeout with delay: ${delay} milliseconds`);
      setTimeout(() => {
        self.registration.periodicSync
          .register({
            tag: 'daily-reminder',
            minInterval: 24 * 60 * 60 * 1000, // 24 hours
          })
          .then(() => console.log('Periodic sync registered for 24 hours'))
          .catch((error) => console.error('Periodic sync registration failed:', error));
      }, delay);
    } else {
      console.log('Daily reminder notification not shown: User preference is disabled or no clients');
    }
  });
}
