(function (global) {
  'use strict';

  var UIS = global.UIS = global.UIS || {};
  var config = UIS.config;

  function forEachNode(nodes, callback) {
    Array.prototype.forEach.call(nodes, callback);
  }

  function setActiveYearUI(year) {
    forEachNode(document.querySelectorAll('#timeline .year-btn'), function (btn) {
      var active = btn.dataset.year === year;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    UIS.stats.setActiveYear(year);
  }

  function initTimeline(mapView) {
    forEachNode(document.querySelectorAll('#timeline .year-btn'), function (btn) {
      btn.addEventListener('click', function () {
        mapView.setYear(btn.dataset.year);
        setActiveYearUI(btn.dataset.year);
      });
    });
  }

  function initMaskPanel(mapView) {
    var maskBtn = document.getElementById('btnMask');
    var opacitySlider = document.getElementById('opSlider');
    var opacityValue = document.getElementById('opVal');
    var modelButtons = document.querySelectorAll('#modelBtns .model-btn');
    var swatches = document.querySelectorAll('#swatches .swatch');

    function updateMaskButton() {
      var visible = mapView.isMaskVisible();
      maskBtn.textContent = visible ? 'Máscara: activada' : 'Máscara: desactivada';
      maskBtn.classList.toggle('off', !visible);
      maskBtn.setAttribute('aria-pressed', String(visible));
    }

    function updateOpacity() {
      var value = Number(opacitySlider.value) / 100;
      opacityValue.textContent = Math.round(value * 100) + '%';
      mapView.setMaskOpacity(value);
    }

    function updateModelButtons() {
      forEachNode(modelButtons, function (btn) {
        btn.classList.toggle('active', btn.dataset.model === mapView.getModel());
        btn.setAttribute('aria-pressed', String(btn.dataset.model === mapView.getModel()));
      });
    }

    maskBtn.addEventListener('click', function () {
      mapView.toggleMask();
      updateMaskButton();
    });

    opacitySlider.value = String(Math.round(config.DEFAULT_OPACITY * 100));
    opacitySlider.addEventListener('input', updateOpacity);

    forEachNode(modelButtons, function (btn) {
      btn.addEventListener('click', function () {
        mapView.setModel(btn.dataset.model);
        updateModelButtons();
        UIS.stats.render(mapView.getModel(), mapView.getYear());
      });
    });

    forEachNode(swatches, function (swatch) {
      swatch.addEventListener('click', function () {
        forEachNode(swatches, function (other) {
          var active = other === swatch;
          other.classList.toggle('active', active);
          other.setAttribute('aria-pressed', String(active));
        });
        mapView.setMaskColor(swatch.dataset.filter);
      });
    });

    updateMaskButton();
    updateModelButtons();
    updateOpacity();
  }

  function initDrawer() {
    var media = global.matchMedia(config.MOBILE_QUERY);
    var body = document.body;
    var toggle = document.getElementById('panelToggle');
    var sheet = document.getElementById('topPanels');
    var closeButton = document.getElementById('sheetClose');
    var backdrop = document.getElementById('sheetBackdrop');

    function isOpen() {
      return body.classList.contains('panel-open');
    }

    function setOpen(open) {
      var next = Boolean(open) && media.matches;
      var hadFocus = sheet.contains(document.activeElement);

      body.classList.toggle('panel-open', next);
      toggle.setAttribute('aria-expanded', String(next));

      if (next) {
        global.requestAnimationFrame(function () {
          closeButton.focus({ preventScroll: true });
        });
      } else if (hadFocus) {
        toggle.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    closeButton.addEventListener('click', function () {
      setOpen(false);
    });

    backdrop.addEventListener('click', function () {
      setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) setOpen(false);
    });

    function onMediaChange(event) {
      if (!event.matches) setOpen(false);
    }

    if (media.addEventListener) {
      media.addEventListener('change', onMediaChange);
    } else if (media.addListener) {
      media.addListener(onMediaChange);
    }
  }

  function initControls(mapView) {
    initTimeline(mapView);
    initMaskPanel(mapView);
    initDrawer();

    setActiveYearUI(mapView.getYear());
    UIS.stats.render(mapView.getModel(), mapView.getYear());
  }

  UIS.initControls = initControls;
})(window);
