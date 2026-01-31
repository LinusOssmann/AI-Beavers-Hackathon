// Service Worker for TripMatch PWA
const CACHE_NAME = 'tripmatch-v1'

// Install event - cache essential files
self.addEventListener('install', function (event) {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([
        '/',
        '/manifest.json',
      ])
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Push notification event
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
      const options = {
      body: data.body,
      icon: data.icon || '/android/android-launchericon-192-192.png',
      badge: '/android/android-launchericon-192-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click event
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
