(function (global) {
  'use strict';

  var UIS = global.UIS = global.UIS || {};

  var YEARS = ['2016', '2021', '2023', '2025'];

  var MODELS = {
    b0: { label: 'SegFormer B0 (Ours)', tiles: 'mask', version: 2 },
    b5: { label: 'SegFormer B5', tiles: 'mask_segformerb5', version: 1 }
  };

  var STATS = {
    b0: {
      '2016': { gsd_cm: 5.55, arbol_m2: 78972, total_m2: 254263, pct: 31.06 },
      '2021': { gsd_cm: 5.13, arbol_m2: 74391, total_m2: 256542, pct: 29.00 },
      '2023': { gsd_cm: 4.89, arbol_m2: 74247, total_m2: 256216, pct: 28.98 },
      '2025': { gsd_cm: 2.71, arbol_m2: 88973, total_m2: 256338, pct: 34.71 }
    },
    b5: {
      '2016': { gsd_cm: 5.55, arbol_m2: 80719, total_m2: 254263, pct: 31.75 },
      '2021': { gsd_cm: 5.13, arbol_m2: 81734, total_m2: 256542, pct: 31.86 },
      '2023': { gsd_cm: 4.89, arbol_m2: 82966, total_m2: 256216, pct: 32.38 },
      '2025': { gsd_cm: 2.71, arbol_m2: 84983, total_m2: 256338, pct: 33.15 }
    }
  };

  var BOUNDS = {
    '2016': [[7.138961, -73.123408], [7.143090, -73.115698]],
    '2021': [[7.138797, -73.123408], [7.143090, -73.115569]],
    '2023': [[7.138774, -73.123408], [7.143089, -73.115715]],
    '2025': [[7.138803, -73.123408], [7.143089, -73.115622]]
  };

  UIS.config = {
    YEARS: YEARS,
    MODELS: MODELS,
    STATS: STATS,
    BOUNDS: BOUNDS,
    DEFAULT_MODEL: 'b0',
    DEFAULT_YEAR: '2025',
    DEFAULT_OPACITY: 0.7,
    DEFAULT_COLOR_FILTER: 'none',
    MOBILE_QUERY: '(max-width: 700px)',
    RGB_TILE_VERSION: 2,
    TRANSPARENT_TILE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  };
})(window);
