import leaflet from "leaflet";
import markerIcon from "./marker-icon";
import idb from "idb";

import imagesUrls from "../img/*/*.*";
const imageResolutions = Object.keys(imagesUrls);
const smallestResolution = imageResolutions.sort((a, b) => a - b)[0];
import imagePlaceholder from "~/image-placeholder.jpg";

let fetchedCuisines;
let fetchedNeighborhoods;

const dbPromise = idb.open("fm-udacity-restaurant", 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {keyPath: "id"});
    case 1:
      {
        const reviewsStore = upgradeDB.createObjectStore("reviews", {keyPath: "id"});
        reviewsStore.createIndex("restaurant_id", "restaurant_id");
      }
    case 2:
      upgradeDB.createObjectStore("pending", {
        keyPath: "id",
        autoIncrement: true
      });
  }
});

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_REVIEWS_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {
    //let xhr = new XMLHttpRequest();
    let fetchURL;
    if (!id) {
      fetchURL = DBHelper.DATABASE_URL;
    } else {
      fetchURL = DBHelper.DATABASE_URL + "/" + id;
    }
    fetch(fetchURL, {method: "GET"}).then(response => {
      response
        .json()
        .then(restaurants => {
          if (restaurants.length) {
            // Get all neighborhoods from all restaurants
            const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
            // Remove duplicates from neighborhoods
            fetchedNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

            // Get all cuisines from all restaurants
            const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
            // Remove duplicates from cuisines
            fetchedCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
          }

          callback(null, restaurants);
        });
    }).catch(error => {
      callback(`Request failed. Returned ${error}`, null);
    });

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        //const restaurant = restaurants.find(r => r.id == id);
        const restaurant = restaurants;
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    }, id);
  }

  static fetchRestaurantReviewsById(id, callback) {
    // Fetch all reviews for the specific restaurant
    const fetchURL = DBHelper.DATABASE_REVIEWS_URL + "/?restaurant_id=" + id;
    fetch(fetchURL, {method: "GET"}).then(response => {
      if (!response.clone().ok && !response.clone().redirected) {
        throw "No reviews available";
      }
      response
        .json()
        .then(result => {
          callback(null, result);
        })
    }).catch(error => callback(error, null));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type === cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood === neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    if (fetchedNeighborhoods) {
      callback(null, fetchedNeighborhoods);
      return;
    }

    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        fetchedNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

        callback(null, fetchedNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    if (fetchedCuisines) {
      callback(null, fetchedCuisines);
      return;
    }

    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        fetchedCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

        callback(null, fetchedCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (!restaurant.photograph) {
      return [imagePlaceholder, `${imagePlaceholder} 300w`];
    }
    const [name, extension = "webp"] = restaurant.photograph.split(".");
    const srcSet = imageResolutions.map(resolution => {
      const url = imagesUrls[resolution][name][extension];
      return `${url} ${resolution}w`;
    }).join(", ");
    const src = imagesUrls[smallestResolution][name][extension];
    return [src, srcSet];
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new leaflet.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      icon: markerIcon
      })
      marker.addTo(map);
    return marker;
  } 

  static addPendingRequestToQueue(url, method, body) {
    // Open the database ad add the request details to the pending table
    console.log("adding pending request to queue");
    const dbPromise = idb.open("fm-udacity-restaurant");
    dbPromise.then(db => {
      const tx = db.transaction("pending", "readwrite");
      tx
        .objectStore("pending")
        .put({
          data: {
            url,
            method,
            body
          }
        })
        return tx.complete;
    })
      .catch(error => {
        console.log("trasnastion error")
        console.log(error);
      })
      .then(DBHelper.nextPending);
  }

  static nextPending() {
    console.log("next pending")
    return DBHelper.attemptCommitPending(DBHelper.nextPending);
  }

  static attemptCommitPending(callback) {
    // Iterate over the pending items until there is a network failure
    let url;
    let method;
    let body;
    //const dbPromise = idb.open("fm-udacity-restaurant");
    dbPromise.then(db => {
      if (!db.objectStoreNames.length) {
        console.log("DB not available");
        db.close();
        return;
      }

      const tx = db.transaction("pending", "readwrite");
      tx
        .objectStore("pending")
        .openCursor()
        .then(cursor => {
          if (!cursor) {
            console.log("no cursor")
            return;
          }
          const value = cursor.value;
          url = cursor.value.data.url;
          method = cursor.value.data.method;
          body = cursor.value.data.body;

          // If we don't have a parameter then we're on a bad record that should be tossed
          // and then move on
          if ((!url || !method) || (method === "POST" && !body)) {
            cursor
              .delete()
              .then(callback());
            return;
          };

          const properties = {
            body: JSON.stringify(body),
            method: method
          }
          console.log("sending post from queue: ", properties);
          fetch(url, properties)
            .then(response => {
            // If we don't get a good response then assume we're offline
            if (!response.ok && !response.redirected) {
              return;
            }
          })
            .then(() => {
              // Success! Delete the item from the pending queue
              const deltx = db.transaction("pending", "readwrite");
              deltx
                .objectStore("pending")
                .openCursor()
                .then(cursor => {
                  cursor
                    .delete()
                    .then(() => {
                      callback();
                    })
                })
              console.log("deleted pending item from queue");
            })
        })
        .catch(error => {
          console.log("Error reading cursor");
          return;
        })
    })
  }

  static updateCachedRestaurantData(id, updateObj) {
    const dbPromise = idb.open("fm-udacity-restaurant");
    // Update in the data for all restaurants first
    return dbPromise.then(db => {
      console.log("Getting db transaction");
      const tx = db.transaction("restaurants", "readwrite");
      const value = tx
        .objectStore("restaurants")
        .get("-1")
        .then(value => {
          if (!value) {
            console.log("No cached data found");
            return;
          }
          const data = value.data;
          const restaurantArr = data.filter(r => r.id === id);
          const restaurantObj = restaurantArr[0];
          // Update restaurantObj with updateObj details
          if (!restaurantObj)
            return;
          const keys = Object.keys(updateObj);
          keys.forEach(k => {
            restaurantObj[k] = updateObj[k];
          })

          // Put the data back in IDB storage
          dbPromise.then(db => {
            const tx = db.transaction("restaurants", "readwrite");
            tx
              .objectStore("restaurants")
              .put({id: "-1", data: data});
            return tx.complete;
          })
        })
    })

    // Update the restaurant specific data
    dbPromise.then(db => {
      console.log("Getting db transaction");
      const tx = db.transaction("restaurants", "readwrite");
      const value = tx
        .objectStore("restaurants")
        .get(id + "")
        .then(value => {
          if (!value) {
            console.log("No cached data found");
            return;
          }
          const restaurantObj = value.data;
          console.log("Specific restaurant obj: ", restaurantObj);
          // Update restaurantObj with updateObj details
          if (!restaurantObj)
            return;
          const keys = Object.keys(updateObj);
          keys.forEach(k => {
            restaurantObj[k] = updateObj[k];
          })

          // Put the data back in IDB storage
          dbPromise.then(db => {
            const tx = db.transaction("restaurants", "readwrite");
            tx
              .objectStore("restaurants")
              .put({
                id: id + "",
                data: restaurantObj
              });
            return tx.complete;
          })
        })
    })
  }

  static updateFavorite(id, newState, callback) {
    // Push the request into the waiting queue in IDB
    const url = `${DBHelper.DATABASE_URL}/${id}/?is_favorite=${newState}`;
    const method = "PUT";
    DBHelper.updateCachedRestaurantData(id, {"is_favorite": newState})
    .then(() => new Promise(resolve => { setTimeout(resolve, 1)}))
    .then(() => DBHelper.addPendingRequestToQueue(url, method));

    // Update the favorite data on the selected ID in the cached data

    callback(null, {id, value: newState});
  }

  static updateCachedRestaurantReview(id, bodyObj) {
    console.log("updating cache for new review: ", bodyObj);
    // Push the review into the reviews store
    dbPromise.then(db => {
      const tx = db.transaction("reviews", "readwrite");
      const store = tx.objectStore("reviews");
      console.log("putting cached review into store");
      store.put({
        id: Date.now(),
        "restaurant_id": id,
        data: bodyObj
      });
      console.log("successfully put cached review into store");
      return tx.complete;
    })
  }

  static publishReview(id, bodyObj, callback) {
    // Push the request into the waiting queue in IDB
    const url = `${DBHelper.DATABASE_REVIEWS_URL}`;
    const method = "POST";
    DBHelper.updateCachedRestaurantReview(id, bodyObj)
    DBHelper.addPendingRequestToQueue(url, method, bodyObj)
    callback(null, null);
  }
}

window.addEventListener("online", () => {
  DBHelper.nextPending();
})
window.addEventListener("load", () => {
  DBHelper.nextPending();
})

export default DBHelper;
