// Pembersih: SW lama (bgy-media-*) sempat meng-cache data Supabase. Hapus cache-nya lalu copot diri.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("bgy-media-")).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => clients.forEach((c) => c.navigate(c.url)))
  );
});
