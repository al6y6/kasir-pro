// Kasir Pro - Service Worker sederhana untuk caching shell aplikasi.
// Data (produk/transaksi) TIDAK di-cache di sini — selalu diambil live dari
// Google Spreadsheet lewat fetch() di index.html. Ini hanya meng-cache file
// aplikasi (HTML/CSS/JS) agar bisa dibuka walau koneksi lemah.

var CACHE_NAME = 'kasirpro-shell-v3';
var SHELL_FILES = ['./index.html', './manifest.json'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = event.request.url;
  // Jangan cache panggilan API ke Google Apps Script — harus selalu live.
  if (url.indexOf('script.google.com') > -1) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
