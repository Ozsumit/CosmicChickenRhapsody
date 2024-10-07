define(["./workbox-e43f5367"], function (workbox) {
  "use strict";

  // Precache and skip waiting
  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  // Cache the start page (HTML)
  workbox.registerRoute(
    "/",
    new workbox.NetworkFirst({
      cacheName: "start-url",
      plugins: [
        {
          cacheWillUpdate: async ({  response }) => {
            if (response && response.type === "opaqueredirect") {
              return new Response(response.body, {
                status: 200,
                statusText: "OK",
                headers: response.headers,
              });
            }
            return response;
          },
        },
      ],
    }),
    "GET"
  );

  // Cache JavaScript and CSS with StaleWhileRevalidate strategy
  workbox.registerRoute(
    /\.(?:js|css)$/, // Regex to match JS and CSS files
    new workbox.StaleWhileRevalidate({
      cacheName: "static-resources",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 200, // Limit the number of items in the cache
          maxAgeSeconds: 90 * 24 * 60 * 60, // Cache for 30 days
        }),
      ],
    })
  );

  // Cache images
  workbox.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif)$/, // Regex for images
    new workbox.CacheFirst({
      cacheName: "image-cache",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 90 * 24 * 60 * 60, // Cache images for 30 days
        }),
      ],
    })
  );

  // Fallback to network-only for other requests
  workbox.registerRoute(
    /.*/i,
    new workbox.NetworkOnly({
      cacheName: "dev",
      plugins: [],
    }),
    "GET"
  );
});
