self.addEventListener("install", () => {
  console.log("Service worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push notification received", event);
  
  const data = event.data?.json() || {};
  const title = data.title || "WHOOF";
  const options = {
    body: data.body || "New notification",
    icon: "/placeholder.svg",
    badge: "/placeholder.svg",
    data: data.url || "/",
    tag: data.tag || undefined,
    renotify: false,
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || "/")
  );
});
