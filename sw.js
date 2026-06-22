// Minimal no-op Service Worker for CropPulse
self.addEventListener('install', function (event) {
	event.waitUntil(
		self.skipWaiting().catch(function () {
			// skipWaiting failed; activation will happen on next navigation
		})
	);
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		self.clients.claim().catch(function () {
			// clients.claim failed; pages will use this SW after next navigation
		})
	);
});

// No fetch handler registered — all requests fall through to the network.
// A previous empty fetch listener silently intercepted every request without
// calling event.respondWith(), which could cause unexpected behaviour in some
// browsers. Removing it lets the browser handle fetches normally.
