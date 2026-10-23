(function (global) {
  'use strict';

  var UIS = global.UIS;

  document.addEventListener('DOMContentLoaded', function () {
    var mapView = UIS.createMapView();
    UIS.initControls(mapView);
  });
})(window);
