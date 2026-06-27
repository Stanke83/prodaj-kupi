// ===== SERVICE WORKER — Web Push + PWA =====
var CACHE_NAME = 'prodajkupi-v1';
var CACHE_FILES = ['/', '/index.html', '/css/style.css', '/js/db.js', '/js/supabase.js'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(CACHE_FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network first za API pozive, cache first za assets
  if (e.request.url.includes('supabase.co') || e.request.url.includes('cloudinary.com') || e.request.url.includes('resend.com')) return;
  e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
});

self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data.json(); } catch(err) { data = { title: 'ProdajKupi', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(data.title || 'ProdajKupi', {
    body:    data.body  || '',
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    data:    { url: data.url || '/' },
    actions: [{ action: 'open', title: 'Otvori' }]
  }));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type:'window' }).then(function(clientList) {
    for (var c of clientList) { if (c.url === url && 'focus' in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
