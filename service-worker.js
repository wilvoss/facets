// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting(); // Immediately activate the new service worker
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Message event
self.addEventListener('message', async (event) => {
  if (event.data === 'check-sync-support') {
    const support = 'sync' in self.registration ? 'supported' : 'not-supported';
    event.source.postMessage({ type: 'sync-support', status: support });
  }
});

// Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showDailyReminder());
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

// Show the daily reminder notification
function showDailyReminder() {
  console.log('showDailyReminder() called');
  const options = {
    body: "Today's Daily Facets puzzle is ready!",
    icon: '/images/icon192.png',
    badge: '/images/icon96.png',
    silent: false, // Ensure this is set to false to make the notification more noticeable
  };

  self.registration
    .showNotification('Daily Reminder', options)
    .then(() => {
      console.log('Notification displayed successfully');
    })
    .catch((error) => {
      console.error('Failed to display notification:', error);
    });
}
