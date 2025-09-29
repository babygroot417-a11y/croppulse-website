// Minimal no-op Service Worker for CropPulse
self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

// Pass-through fetch (no caching yet)
self.addEventListener('fetch', () => {});


