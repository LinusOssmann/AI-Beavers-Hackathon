// Service Worker for TripMatch PWA
const CACHE_NAME = "tripmatch-v1";

// Install: cache essential files; don't fail install if one URL fails
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return Promise.all([
          cache.add("/manifest.json").catch(function () {}),
          cache.add("/").catch(function () {}),
        ]);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// Activate: clean old caches and claim clients so this SW controls the page immediately
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// Push: show notification; handle missing or invalid payload (Chrome/macOS needs showNotification inside waitUntil)
self.addEventListener("push", function (event) {
  var promise = Promise.resolve();
  try {
    var title = "TripMatch";
    var body = "New notification";
    var icon = "/android/android-launchericon-192-192.png";
    var data = { url: "/" };
    if (event.data) {
      try {
        var parsed = event.data.json();
        if (parsed && parsed.title) title = parsed.title;
        if (parsed && parsed.body) body = parsed.body;
        if (parsed && parsed.icon) icon = parsed.icon;
        if (parsed && parsed.data) data = parsed.data;
      } catch (_) {}
    }
    promise = self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: "/android/android-launchericon-192-192.png",
      vibrate: [100, 50, 100],
      data: data,
      requireInteraction: false,
    });
  } catch (e) {
    promise = self.registration.showNotification("TripMatch", {
      body: "New notification",
      icon: "/android/android-launchericon-192-192.png",
      data: { url: "/" },
    });
  }
  event.waitUntil(promise);
});

// Notification click: focus existing window or open new one
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (
            client.url.indexOf(self.registration.scope) === 0 &&
            "focus" in client
          ) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
