export default function registerServiceWorker() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register("../service-worker.js").catch(error => {
      console.log("Service worker registration failed");
      console.log(error);
    });
  }
}
