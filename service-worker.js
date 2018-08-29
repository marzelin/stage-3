import localforage from "localforage";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      const addAssets = cache.addAll(assets).catch(error => {
        console.log(error);
      });
      const addRoot = fetch("/index.html").then(response => {
        if (!response.ok) {
          throw new TypeError("bad response status");
        }
        return cache.put("/", response);
      });

      return Promise.all([addAssets, addRoot]).catch(e => {
        console.log(e);
      });
    })
  );
});

self.addEventListener("fetch", event => {
  let eventRequest = event.request;
  let requestUrl = new URL(event.request.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    eventRequest = new Request(cacheURL);
  }
  if (requestUrl.hostname !== "localhost") {
    event.request.mode = "no-cors";
  }

  if (requestUrl.port === "1337") {
    const key = "restaurants";
    event.respondWith(
      localforage.getItem(key).then(restaurants => {
        if (restaurants) {
          return new Response(JSON.stringify(restaurants));
        }

        return fetch(requestUrl).then(response => {
          const responseClone = response.clone();
          response.json().then(data => {
            localforage.setItem(key, data);
          });
          return responseClone;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(eventRequest).then(response => {
        return (
          response ||
          fetch(event.request).then(fetchResponse => {
            return caches.open(cacheName).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
    );
  }
});
