/**
 * Dynamic Google Maps JavaScript API Loader
 * Loads the script once and resolves when ready.
 */

let loadPromise = null;

export function loadGoogleMapsAPI() {
  if (loadPromise) return loadPromise;

  // Already loaded (e.g. via <script> tag)
  if (window.google && window.google.maps) {
    loadPromise = Promise.resolve(window.google.maps);
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    // No key — Google Maps basemaps won't work, but app still runs
    console.warn('[GoogleMaps] No API key found (VITE_GOOGLE_MAPS_API_KEY). Google Maps layers disabled.');
    loadPromise = Promise.resolve(null);
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('[GoogleMaps] Script loaded but google.maps not available'));
      }
    };
    script.onerror = () => reject(new Error('[GoogleMaps] Failed to load Google Maps API script'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsAvailable() {
  return !!(window.google && window.google.maps);
}
