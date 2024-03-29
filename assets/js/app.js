var $$ = Dom7;

var app = new Framework7({
  el: "#app",
  theme: "md",
  init: false,
  view: {
    stackPages: true,
    browserHistory: true,
    browserHistoryOnLoad: true
  },
  routes: [{
    name: "home",
    path: "/",
    url: "index.html",
  }, {
    name: "map",
    path: "/map/",
    popup: {
      el: "#map-popup",
      on: {
        close: function() {
          app.panel.close("right");
          app.toast.close();
          app.measure.clearMeasure();
        },
        closed: function() {
          $$("#map-title").html("");
          app.geolocation.setTracking(false);
          app.layers.image.setVisible(false);
        },
        open: function() {
          app.preloader.show();
        },
        opened: function(e) {
          // $$("#gps-btn").removeClass("disabled");
          app.geolocation.setTracking(true);
          if (app.activeLayer) {
            app.functions.setMap(app.activeLayer);  
          }
        }
      }
    }
  }]
});

app.layers = {
  image: new ol.layer.Image({
    zIndex: 10
  }),
  measure: new ol.layer.Vector({
    updateWhileInteracting: true,
    zIndex: 12,
    source: new ol.source.Vector({}),
    style: function (feature, resolution) {
      if (feature.getGeometry().getType() == "LineString") {
        return new ol.style.Style({
          text: new ol.style.Text({
            text: feature.getGeometry().getLength() ? app.measure.formatLength(feature.getGeometry().getLength()) : "",
            font: "bold 14px 'Open Sans', 'Arial Unicode MS', 'sans-serif'",
            placement: "line",
            offsetY: -10,
            fill: new ol.style.Fill({
              color: "black"
            }),
            stroke: new ol.style.Stroke({
              color: "white",
              width: 3
            })
          }),
          stroke: new ol.style.Stroke({
            color: "#3a84df",
            lineDash: [0, 10, 0, 10],
            width: 6
          })
        });
      } else if (feature.getGeometry().getType() == "Point") {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: "#fff"
            }),
            stroke: new ol.style.Stroke({
              color: "#3a84df",
              width: 1.5
            })
          })
        });
      }
    }
  }),
  position: new ol.layer.Vector({
    zIndex: 15,
    source: new ol.source.Vector({
      features: [new ol.Feature()]
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        rotateWithView: true,
        src: "assets/img/geolocation_marker.png"
      })
    })
  }),
  basemaps: {
    osm: new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        attributions: "© <a href='http://openstreetmap.org' class='external'>OpenStreetMap</a> contributors, © <a href='https://carto.com/attribution' class='external'>CARTO</a>"
      })
    }),
    nysdop: new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: "https://orthos.its.ny.gov/arcgis/services/wms/Latest/MapServer/WmsServer",
        attributions: "<a href='http://orthos.dhses.ny.gov/arcgis/rest/' class='external'>NYS</a>",
        params: {
          "LAYERS": "0,1,2,3",
          "TILED": true
        },
        transition: 0
      })
    }),
    topo: new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
        attributions: "<a href='https://www.doi.gov' class='external'>USDOI</a> | <a href='https://www.usgs.gov' class='external'>USGS</a> | <a href='https://www.usgs.gov/laws/policies_notices.html' class='external'>Policies</a>",
        maxZoom: 16
      })
    })
  }
};

app.kompas = new kompas();
app.kompas.watch();

app.geolocation = new ol.Geolocation({
  trackingOptions: {
    maximumAge: 10000,
    enableHighAccuracy: true,
    timeout: 600000
  }
});

app.measure = {
  measuring: false,
  measurement: 0,
  formatLength: function(length) {
    const meters = length * app.map.getView().getProjection().getMetersPerUnit();
    const feet = meters * 3.2808;
    let output;
    if (feet > 1320) {
      output = (feet * 0.00018939).toFixed(2) + " " + "mi";
    } else {
      output = feet.toFixed(0) + " " + "ft";
    }
    return output;
  },
  measureClickListener: function() {
    if (app.measure.measuring) {
      app.measure.addSegment();
    } else {
      app.measure.startMeasure();
    }
  },
  startMeasure: function() {
    app.measure.measuring = true;
    const center = app.map.getView().getCenter();
    const point = new ol.Feature(new ol.geom.Point(center));
    app.layers.measure.getSource().addFeature(point);

    const origin = center;
    let target = center;
    let coord = [origin, target];
    app.measure.line = new ol.geom.LineString(coord);
    const feature = new ol.Feature(app.measure.line);
    app.layers.measure.getSource().addFeature(feature);

    app.measure.drawLine = function() {
      target = app.map.getView().getCenter();
      coord = [origin, target];
      app.measure.line.setCoordinates(coord);
    };

    app.map.on("postrender", app.measure.drawLine);
  },
  addSegment: function() {
    app.measure.measurement += app.measure.line.getLength();
    app.map.un("postrender", app.measure.drawLine);
    app.measure.startMeasure();
    $$(".toast-text").html("Total length: " + app.measure.formatLength(app.measure.measurement));
  },
  clearMeasure: function() {
    app.measure.measurement = 0;
    app.layers.measure.getSource().clear();
    app.map.un("postrender", app.measure.drawLine);
    app.map.un("click", app.measure.measureClickListener);
    $$(".crosshair").css("visibility", "hidden");
    $$(".toast-text").html("Tap to add measurement segments.");
  }
};

app.map = new ol.Map({
  target: "map",
  logo: null,
  controls: ol.control.defaults({
    zoom : false,
    rotate: false,
    attributionOptions: {
      collapsible: false,
      collapsed: false
    }
  }),
  layers: [
    app.layers.image,
    app.layers.measure,
    app.layers.position
  ]
});

app.functions = {
  launchGmaps: function() {
    const coords = ol.proj.transform(app.map.getView().getCenter(), app.map.getView().getProjection().getCode(), "EPSG:4326");
    const zoom = app.map.getView().getZoom();
    const url = "https://www.google.com/maps/@?api=1&map_action=map&center="+coords[1]+","+coords[0]+"&zoom="+Math.round(zoom);
    window.open(url);
  },

  getDirections: function() {
    if (app.directions) {
      const directions = app.directions;
      if (typeof(directions[0]) == "number") {
        let url = "https://www.google.com/maps/dir/?api=1&destination="+directions[1]+","+directions[0];
        window.open(url);
      } else if (typeof(directions[0]) == "object") {
        const locations = directions.map(function(location) {
          return [{
            text: location.label,
            icon: "<i class='icon material-icons'>directions</i>",
            onClick: function () {
              let url = "https://www.google.com/maps/dir/?api=1&destination="+location.coordinates[1]+","+location.coordinates[0];
              window.open(url);
            }
          }]
        });

        app.actions.create({
          buttons: locations
        }).open();
      }
    } else {
      app.toast.create({
        text: "No directions available.",
        closeTimeout: 3000,
        closeButton: true
      }).open();
    }
  },

  startMeasurement: function(){
    app.toast.create({
      text: "Tap to add measurement segments.",
      closeButton: true,
      closeButtonText: "Clear",
      on: {
        close: function () {
          app.measure.clearMeasure();
        },
        open: function() {
          $$(".crosshair").css("visibility", "visible");
          app.map.on("click", app.measure.measureClickListener);
        }
      }
    }).open();
  },

  increaseOpacity: function() {
    const slider = app.range.get(".range-slider");
    slider.setValue(slider.getValue() + 5);
  },

  decreaseOpacity: function() {
    const slider = app.range.get(".range-slider");
    slider.setValue(slider.getValue() - 5);
  },

  iosChecks() {
    if (app.device.ios) {
      if (parseFloat(app.device.osVersion) < 11.3) {
        app.dialog.alert("This app is not fully supported on devices running iOS < 11.3.", "Warning");
      }
      if (!app.device.standalone) {
        if (!localStorage.getItem("dismissPrompt")) {
          app.toast.create({
            text: "Tap the <img src='assets/img/ios-share.png' height='18px'> button " + (app.device.ipad ? "at the top of the screen" : "below") + " to Add to Home Screen.",
            closeButton: true,
            position: app.device.ipad ? "center" : "bottom",
            on: {
              close: function () {
                localStorage.setItem("dismissPrompt", true);
              }
            }
          }).open();
        } 
      }
    }
  },

  loadMapList() {
    $$("#map-list").empty();
    app.request({
      url: "maps.json",
      method: "GET",
      dataType: "json",
      // cache: false,
      success: function (maps) {
        maps.sort(function(a, b) {
          return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
        });
        
        app.maps = maps;
        
        for (const map of maps) {
          const li = `<li>
            <a href="#" class="item-link item-content" onclick="app.activeLayer = '${map.name}'; app.views.main.router.navigate('/map/');">
              <div class="item-inner">
                <div class="item-title">
                  ${map.name}
                  <div class="item-footer">${map.description}</div>
                </div>
              </div>
            </a>
          </li>`;
          
          $$("#map-list").append(li);
          if (app.utils.parseUrlQuery(document.URL).map && (map.name == app.utils.parseUrlQuery(document.URL).map)) {
            app.activeLayer = map.name;
            app.functions.setMap(app.activeLayer);
            window.history.replaceState(null, null, window.location.pathname);
            app.views.main.router.navigate("/map/");
          }
        }

        if (app.views.current.router.currentRoute.url == "/map/" && !app.activeLayer) {
          if (sessionStorage.getItem("settings")) {
            // $$("#gps-btn").removeClass("disabled");
            app.geolocation.setTracking(true);
            const settings = JSON.parse(sessionStorage.getItem("settings"));
            app.functions.setMap(settings.activeLayer, settings);
            if (settings.basemap) {
              $$("input[type=radio][name=basemap][value='" + settings.basemap + "']").prop("checked", true).trigger("change");
            }
          }
          else {
            app.preloader.hide();
            app.views.current.router.back();
          }
        }
      },
      error: function (xhr, status) {
        app.dialog.alert(xhr.statusText, "Map List Error");
      }
    });
  },

  setMap: function(name, settings) {
    // app.progressbar.show("white");
    $$("#rotate-btn").css("display", "none");

    for (const value of app.maps) {
      if (name == value.name) {
        $$("#map-title").html(value.name);
        $$("#info-link").attr("href", (value.link ? value.link : "#"));
        app.directions = value.directions ? value.directions : null;

        proj4.defs(value.projection[0],value.projection[1]);
        ol.proj.proj4.register(proj4);

        app.layers.image.setSource(
          new ol.source.ImageStatic({
            url: value.url,
            projection: value.projection[0],
            imageExtent: value.extent,
            attributions: value.attribution ? value.attribution.replace("<a", "<a class='external'") : null
          })
        );
  
        app.layers.image.setExtent(value.extent);
  
        app.map.setView(
          new ol.View({
            projection: value.projection[0]/*,
            extent: value.extent*/
          })
        );
  
        app.map.getView().fit(value.extent, {
          constrainResolution: false
        });
  
        app.map.getView().on("change:rotation", function(evt) {
          const radians = evt.target.getRotation();
          const degrees = radians * 180 / Math.PI;
          $$("#rotate-icon").css("transform", "translate(-12px, -12px) rotate("+degrees+"deg)");
          if (radians == 0) {
            $$("#rotate-btn").css("display", "none");
          } else {
            $$("#rotate-btn").css("display", "block");
          }
        });
  
        app.geolocation.setProjection(app.map.getView().getProjection());
  
        if (settings && settings.opacity) {
          app.layers.image.setOpacity(settings.opacity);
        }
  
        if (settings && settings.state) {
          app.map.getView().setCenter(settings.state.center);
          app.map.getView().setZoom(settings.state.zoom);
          app.map.getView().setRotation(settings.state.rotation);
        } else {
          app.map.getView().fit(value.extent, {
            constrainResolution: false
          });
        }
  
        app.layers.image.setVisible(true);
        app.map.updateSize();
        // app.progressbar.hide();
        app.preloader.hide();
  
        sessionStorage.setItem("settings", JSON.stringify({
          activeLayer: value.name,
          basemap: ($$("input[name='basemap']:checked").val() != "none") ? $$("input[name='basemap']:checked").val() : null,
          opacity: app.layers.image.getOpacity(),
          state: app.map.getView().getState()
        }));

        app.range.create({
          el: ".range-slider",
          min: 0,
          max: 100,
          step: 1,
          value: app.layers.image.getOpacity() * 100,
          on: {
            change: function (e) {
              const opacity = e.value / 100;
              app.layers.image.setOpacity(opacity);
              app.map.render();
              const settings = JSON.parse(sessionStorage.getItem("settings"));
              settings.opacity = opacity;
              sessionStorage.setItem("settings", JSON.stringify(settings));
            }
          }
        });
      }
    }
  }
}

app.map.on("moveend", function(evt) {
  const settings = JSON.parse(sessionStorage.getItem("settings"));
  settings.state = app.map.getView().getState(window.devicePixelRatio);
  sessionStorage.setItem("settings", JSON.stringify(settings));
});

app.kompas.on("heading", function(heading) {
  let style = new ol.style.Style({
    image: new ol.style.Icon({
      rotation: 0,
      rotateWithView: true,
      src: "assets/img/geolocation_marker.png"
    })
  });
  if (heading) {
    style = new ol.style.Style({
      image: new ol.style.Icon({
        rotation: (Math.PI / 180 * heading),
        rotateWithView: true,
        src: "assets/img/geolocation_marker_heading.png"
      })
    });
  }
  app.layers.position.setStyle(style);
});

app.geolocation.once("error", function(error) {
  app.dialog.alert(error.message, "Geolocation error");
  $$("#gps-icon").html("gps_not_fixed");
  $$("#gps-btn").addClass("disabled");
});

app.geolocation.on("change:position", function() {
  $$("#gps-btn").removeClass("disabled");
  $$("#gps-icon").html("gps_fixed");
  const coordinates = app.geolocation.getPosition();
  app.layers.position.getSource().getFeatures()[0].setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
});

$$("input[type=radio][name=basemap]").change(function() {
  const settings = JSON.parse(sessionStorage.getItem("settings"));
  for (const key in app.layers.basemaps) {
    if (key == this.value && key != "none") {
      app.map.addLayer(app.layers.basemaps[key]);
      settings.basemap = key;
    } else {
      app.map.removeLayer(app.layers.basemaps[key]);
    }
  }
  if (this.value == "none") {
    settings.basemap = null;
  }
  sessionStorage.setItem("settings", JSON.stringify(settings));
});

app.on("init", function() {
  app.functions.iosChecks();
  app.functions.loadMapList();
})

app.init();