const CACHE_NAME = "ios-apn-v1";

const ASSETS = [
	"./",
	"./index.html",
	"./manifest.json",
	"./icon.svg",
	"./apple-touch-icon.png",
	"./kt_3g.mobileconfig",
	"./kt_lte.mobileconfig",
	"./kt_5g.mobileconfig",
	"./sktelecom_3g.mobileconfig",
	"./sktelecom_apple.mobileconfig",
	"./sktelecom_lte.mobileconfig",
	"./sktelecom_5g.mobileconfig",
	"./lguplus.mobileconfig",
	"./lguplus_tethering.mobileconfig"
];

self.addEventListener("install", function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll(ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.map(function (cacheName) {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
					return undefined;
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener("fetch", function (event) {
	if (event.request.method !== "GET") {
		return;
	}

	event.respondWith(
		caches.match(event.request).then(function (cachedResponse) {
			return cachedResponse || fetch(event.request);
		})
	);
});
