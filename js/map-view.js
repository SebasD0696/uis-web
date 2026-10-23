(function (global) {
  'use strict';

  var UIS = global.UIS = global.UIS || {};
  var config = UIS.config;

  function createMapView() {
    var YEARS = config.YEARS;
    var MODELS = config.MODELS;
    var BOUNDS = config.BOUNDS;
    var mobileQuery = global.matchMedia(config.MOBILE_QUERY);

    var map = L.map('map', { minZoom: 10, maxZoom: 20, zoomControl: false });

    map.createPane('rgbPane');
    map.getPane('rgbPane').style.zIndex = 350;
    map.createPane('maskPane');
    map.getPane('maskPane').style.zIndex = 450;

    var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
    });
    var sinFondo = new L.LayerGroup();

    var rgbLayers = {};
    var maskLayers = { b0: {}, b5: {} };

    YEARS.forEach(function (year) {
      rgbLayers[year] = L.tileLayer(year + '/rgb/{z}/{x}/{y}.png?v=' + config.RGB_TILE_VERSION, {
        minZoom: 10,
        maxZoom: 20,
        tms: true,
        pane: 'rgbPane',
        errorTileUrl: config.TRANSPARENT_TILE
      });

      Object.keys(MODELS).forEach(function (key) {
        var model = MODELS[key];
        maskLayers[key][year] = L.tileLayer(
          year + '/' + model.tiles + '/{z}/{x}/{y}.png?v=' + model.version,
          {
            minZoom: 10,
            maxZoom: 20,
            tms: true,
            pane: 'maskPane',
            opacity: config.DEFAULT_OPACITY,
            errorTileUrl: config.TRANSPARENT_TILE
          }
        );
      });
    });

    var activeYear = config.DEFAULT_YEAR;
    var activeModel = config.DEFAULT_MODEL;
    var maskVisible = true;

    var zoomControl = null;
    var layerControl = null;
    var controlsForMobile = null;

    satellite.addTo(map);

    function syncControls() {
      var isMobile = mobileQuery.matches;
      if (controlsForMobile === isMobile) return;

      if (zoomControl) map.removeControl(zoomControl);
      if (layerControl) map.removeControl(layerControl);

      controlsForMobile = isMobile;

      zoomControl = L.control.zoom({
        position: isMobile ? 'topright' : 'bottomright'
      }).addTo(map);

      layerControl = L.control.layers(
        { 'Satélite': satellite, 'Sin fondo': sinFondo },
        {},
        {
          collapsed: isMobile,
          position: isMobile ? 'topright' : 'bottomleft'
        }
      ).addTo(map);

      map.invalidateSize();
    }

    function handleMobileChange() {
      syncControls();
    }

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', handleMobileChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(handleMobileChange);
    }

    global.addEventListener('orientationchange', function () {
      global.setTimeout(function () { map.invalidateSize(); }, 300);
    });

    syncControls();

    map.addLayer(rgbLayers[activeYear]);
    map.addLayer(maskLayers[activeModel][activeYear]);

    var swLat = Math.min.apply(null, YEARS.map(function (y) { return BOUNDS[y][0][0]; }));
    var swLng = Math.min.apply(null, YEARS.map(function (y) { return BOUNDS[y][0][1]; }));
    var neLat = Math.max.apply(null, YEARS.map(function (y) { return BOUNDS[y][1][0]; }));
    var neLng = Math.max.apply(null, YEARS.map(function (y) { return BOUNDS[y][1][1]; }));

    map.setView([(swLat + neLat) / 2, (swLng + neLng) / 2], 17);
    map.fitBounds([[swLat, swLng], [neLat, neLng]], { padding: [20, 20] });
    map.setMaxBounds(L.latLngBounds([[swLat, swLng], [neLat, neLng]]).pad(0.2));

    function setYear(year) {
      if (year === activeYear || !rgbLayers[year]) return;
      map.removeLayer(rgbLayers[activeYear]);
      if (maskVisible) map.removeLayer(maskLayers[activeModel][activeYear]);
      activeYear = year;
      map.addLayer(rgbLayers[year]);
      if (maskVisible) map.addLayer(maskLayers[activeModel][year]);
    }

    function setModel(model) {
      if (model === activeModel || !maskLayers[model]) return;
      if (maskVisible) {
        if (map.hasLayer(maskLayers[activeModel][activeYear])) {
          map.removeLayer(maskLayers[activeModel][activeYear]);
        }
        if (!map.hasLayer(maskLayers[model][activeYear])) {
          map.addLayer(maskLayers[model][activeYear]);
        }
      }
      activeModel = model;
    }

    function setMaskVisible(visible) {
      maskVisible = visible;
      var layer = maskLayers[activeModel][activeYear];
      if (maskVisible && !map.hasLayer(layer)) map.addLayer(layer);
      if (!maskVisible && map.hasLayer(layer)) map.removeLayer(layer);
    }

    function toggleMask() {
      setMaskVisible(!maskVisible);
      return maskVisible;
    }

    function setMaskOpacity(opacity) {
      YEARS.forEach(function (year) {
        Object.keys(maskLayers).forEach(function (model) {
          maskLayers[model][year].setOpacity(opacity);
        });
      });
    }

    function setMaskColor(filter) {
      map.getPane('maskPane').style.filter = filter;
    }

    return {
      map: map,
      getYear: function () { return activeYear; },
      getModel: function () { return activeModel; },
      isMaskVisible: function () { return maskVisible; },
      setYear: setYear,
      setModel: setModel,
      setMaskVisible: setMaskVisible,
      toggleMask: toggleMask,
      setMaskOpacity: setMaskOpacity,
      setMaskColor: setMaskColor
    };
  }

  UIS.createMapView = createMapView;
})(window);
