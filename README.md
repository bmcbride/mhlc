# Mohawk Hudson Maps

Your favorite [Mohawk Hudson Land Conservancy](http://mohawkhudson.org/) preserve maps saved to your mobile device for offline viewing and navigation!

## About the app

This is a Progressive Web App (PWA) built with the following open source components:

- User Interface: [Framework7](https://framework7.io/)
- Mapping Library: [OpenLayers](http://openlayers.org/)
- Geographic Coordinate Transformation: [Proj4js](http://proj4js.org/)

## How it works

When you visit the site at [https://mohawkhudsonmaps.org/](https://mohawkhudsonmaps.org/), a service worker precaches all the necessary files to your device's Cache Storage for offline functionality. This 12 MB of cached files includes the app shell (Framework7), mapping library (OpenLayers), all the preserve map images (~7MB), and other miscellaneous resources (images, fonts, CSS, etc.).

The maps have been converted from GeoPDF (ArcGIS exports) to JPG in their native coordinate systems (EPSG:2260 - NAD83 / New York East (ftUS)) and are loaded as static image layer overlays. The information associated with each map is stored in the `maps.json` config file, which is parsed when the app loads to create the map list.