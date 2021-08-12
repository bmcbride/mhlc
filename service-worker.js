importScripts('assets/vendor/workbox-v5.1.2/workbox-sw.js');

workbox.setConfig({
  debug: false,
  modulePathPrefix: 'assets/vendor/workbox-v5.1.2/'
});

workbox.precaching.precacheAndRoute([
  {url: 'index.html', revision: '08.12.21.1'},
  {url: 'maps.json', revision: '08.12.21.1'},
  {url: 'assets/img/apple-touch-icon.png', revision: '04.08.20.1'},
  {url: 'assets/img/android-chrome-192x192.png', revision: '04.08.20.1'},
  {url: 'assets/img/favicon-32x32.png', revision: '04.08.20.1'},
  {url: 'assets/img/favicon-16x16.png', revision: '04.08.20.1'},
  {url: 'assets/img/mhlc.png', revision: '04.08.20.1'},
  {url: 'assets/img/mhlc-logo.png', revision: '04.08.20.1'},
  {url: 'assets/img/crosshair.svg', revision: '04.08.20.1'},
  {url: 'assets/img/ios-share.png', revision: '04.08.20.1'},
  {url: 'assets/img/geolocation_marker.png', revision: '09.30.20.2'},
  {url: 'assets/img/geolocation_marker_heading.png', revision: '09.30.20.3'},
  {url: 'assets/vendor/framework7-5.7.14/css/framework7.bundle.min.css', revision: '12.14.20.1'},
  {url: 'assets/vendor/framework7-5.7.14/js/framework7.bundle.min.js', revision: '12.14.20.1'},
  {url: 'assets/vendor/openlayers-6.3.1/ol.css', revision: '04.10.20.1'},
  {url: 'assets/vendor/openlayers-6.3.1/ol.js', revision: '04.10.20.1'},
  {url: 'assets/vendor/proj4js-2.5.0/proj4.js', revision: '04.08.20.1'},
  {url: 'assets/vendor/kompas-0.0.1/kompas.js', revision: '04.08.20.1'},
  {url: 'assets/fonts/MaterialIcons-Regular.woff2', revision: '04.08.20.1'},
  {url: 'assets/css/app.css', revision: '04.08.20.1'},
  {url: 'assets/js/app.js', revision: '08.12.21.1'},
  {url: 'maps/AlbCo_RailTrail.jpg', revision: '04.08.20.1'},
  {url: 'maps/Bennett_Hill_Map_2019.jpg', revision: '04.10.20.1'},
  {url: 'maps/Bozenkill_Preserve2.jpg', revision: '04.08.20.1'},
  {url: 'maps/Fox_Preserve-10-3-17.jpg', revision: '04.08.20.1'},
  {url: 'maps/Holt_Trail_Map_2020.jpg', revision: '04.08.20.2'},
  {url: 'maps/Hollyhock_Hollow_2020.jpg', revision: '05.29.20.1'},
  {url: 'maps/MHLC-Keleher-Preserve-Update-2017.jpg', revision: '04.08.20.1'},
  {url: 'maps/Mosher-Marsh-Update-2017.jpg', revision: '04.08.20.1'},
  {url: 'maps/Normanskill_Preserve.jpg', revision: '04.08.20.1'},
  {url: 'maps/Phillipinkill_Preserve.jpg', revision: '04.08.20.1'},
  {url: 'maps/Schiffendecker_Preserve.jpg', revision: '04.08.20.1'},
  {url: 'maps/Schoharie_Creek_Preserve_Map_2019.jpg', revision: '04.10.20.1'},
  {url: 'maps/StrawberryFields_Preserve.jpg', revision: '04.08.20.1'},
  {url: 'maps/Swift_Preserve1.jpg', revision: '04.08.20.1'},
  {url: 'maps/Touhey_Family_Preserve 8_28_2020.jpg', revision: '09.29.20.1'},
  {url: 'maps/VanDyke_Entire_Preserve.jpg', revision: '04.08.20.1'},
  {url: 'maps/Winn_Preserve-2018.jpg', revision: '04.10.20.1'},
  {url: 'maps/2021FINAL_NORTH_WCF_Map.jpg', revision: '08.12.21.1'}
], {
  // Ignore all URL parameters.
  ignoreURLParametersMatching: [/.*/]
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.has('precache-12.15.19.2').then(function(hasCache) {
      if (hasCache) {
        caches.delete('precache-12.15.19.2');
      }
    })
  );
});