self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("push", (e) => {
  if (!e.data) return;
  try {
    const d = e.data.json();
    const title = d.title || "AN.BR";
    const options = {
      body: d.body || "",
      icon: d.icon || "/icon-192.png",
      badge: "/icon-192.png",
      data: d.data || {},
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };
    e.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const title = e.data.text() || "AN.BR";
    e.waitUntil(self.registration.showNotification(title, { body: "Você tem uma nova notificação." }));
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((cls) => {
    for (const c of cls) { if (c.url === url && "focus" in c) return c.focus(); }
    return clients.openWindow(url);
  }));
});
