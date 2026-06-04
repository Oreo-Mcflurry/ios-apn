const CACHE_NAME = "ios-apn-v3";
const PROFILE_CONTENT_TYPE = "application/x-apple-aspen-config";

const ASSETS = [
	"./",
	"./index.html",
	"./manifest.json",
	"./icon.svg",
	"./apple-touch-icon.png",
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

	const requestUrl = new URL(event.request.url);
	const isMobileConfig = requestUrl.pathname.endsWith(".mobileconfig");

	event.respondWith(
		caches.match(event.request).then(function (cachedResponse) {
			if (cachedResponse) {
				return withProfileHeaders(cachedResponse, isMobileConfig, requestUrl);
			}

			return fetch(event.request).then(function (networkResponse) {
				return withProfileHeaders(networkResponse, isMobileConfig, requestUrl);
			});
		})
	);
});

function withProfileHeaders(response, isMobileConfig, requestUrl) {
	if (!isMobileConfig) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set("Content-Type", PROFILE_CONTENT_TYPE);
	headers.set("Content-Disposition", `attachment; filename="${requestUrl.pathname.split("/").pop()}"`);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: headers
	});
}
