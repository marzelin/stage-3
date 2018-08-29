import leaflet from "leaflet";
import DBHelper from "./dbhelper";
import registerServiceWorker from "./register-service-worker";

let newMap;
let markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  attachListeners();
  initMap(); // added 
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
  registerServiceWorker();
});

function attachListeners() {
  const ids = ["cuisines-select", "neighborhoods-select"];
  ids.forEach(id => {
    document.getElementById(id).addEventListener("change", updateRestaurants);
  })
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      fillNeighborhoodsHTML(neighborhoods);
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = []) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      fillCuisinesHTML(cuisines);
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = []) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  newMap = leaflet.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  leaflet.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibWFyemVsaW4iLCJhIjoiY2prMmc3YjB4MHBxYTNxbXF1dXgzZ3J2MCJ9.qP9LUWOJx6AN9w5_JB6MuA',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants();
      fillRestaurantsHTML(restaurants);
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = () => {
  // Remove all restaurants
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (markers) {
    markers.forEach(marker => marker.remove());
  }
  markers = [];
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = []) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap(restaurants);
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'card';

  const image = document.createElement('img');
  image.className = 'card-image';
  const [src, srcset] = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = src;
  image.srcset = srcset;
  image.sizes = `
    (min-width: 768px) 300px,
    (min-width: 520px) 450px,
    (min-width: 400px) calc(100vw - 2 * 35px),
    calc(100vw - 2 * 10px)`;
  image.alt = restaurant.name;
  li.append(image);

  const textContainer = document.createElement("div");
  textContainer.className = 'card-textcontainer';
  li.append(textContainer);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  name.className = 'card-name';
  textContainer.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.className = 'card-neighborhood';
  textContainer.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.className = 'card-address';
  textContainer.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.className = 'card-link';
  more.href = DBHelper.urlForRestaurant(restaurant);
  textContainer.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = []) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    markers.push(marker);
  });

} 