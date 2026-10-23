(function (global) {
  'use strict';

  var UIS = global.UIS = global.UIS || {};
  var config = UIS.config;

  function formatInteger(value) {
    return value.toLocaleString('es-CO');
  }

  function formatDecimal(value) {
    return value.toFixed(2).replace('.', ',');
  }

  function setActiveYear(year) {
    var rows = document.querySelectorAll('#statsBody tr');
    Array.prototype.forEach.call(rows, function (row) {
      row.classList.toggle('active', row.dataset.year === year);
    });
  }

  function render(model, activeYear) {
    var stats = config.STATS[model];
    var body = document.getElementById('statsBody');

    body.innerHTML = config.YEARS.map(function (year) {
      var s = stats[year];
      return '' +
        '<tr data-year="' + year + '">' +
          '<td class="year-cell">' + year + ' <small>(' + formatDecimal(s.gsd_cm) + ' cm/px)</small></td>' +
          '<td class="pct-cell">' + formatDecimal(s.pct) + ' %</td>' +
          '<td class="area-cell">' + formatInteger(s.arbol_m2) + ' m² <small>' +
            formatDecimal(s.arbol_m2 / 10000) + ' ha</small></td>' +
        '</tr>';
    }).join('');

    document.getElementById('statsModel').textContent = 'Modelo: ' + config.MODELS[model].label;
    setActiveYear(activeYear);
  }

  UIS.stats = {
    render: render,
    setActiveYear: setActiveYear
  };
})(window);
