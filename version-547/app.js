(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function lower(value) {
    return String(value || '').toLowerCase();
  }

  function applyFilters(panel) {
    var root = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var category = panel.querySelector('[data-filter-category]');
    var empty = panel.querySelector('[data-empty-state]');
    var query = lower(input ? input.value : '');
    var yearValue = year ? year.value : '';
    var typeValue = type ? type.value : '';
    var categoryValue = category ? category.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = lower([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category
      ].join(' '));
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }

      if (yearValue && card.dataset.year !== yearValue) {
        matched = false;
      }

      if (typeValue && lower(card.dataset.type).indexOf(lower(typeValue)) === -1) {
        matched = false;
      }

      if (categoryValue && card.dataset.category !== categoryValue) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = panel.querySelector('[data-search-input]');

    if (q && input) {
      input.value = q;
    }

    Array.prototype.slice.call(panel.querySelectorAll('input, select')).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(panel);
      });
      control.addEventListener('change', function () {
        applyFilters(panel);
      });
    });

    applyFilters(panel);
  });

  function startVideo(box) {
    if (!box || box.dataset.ready === '1') {
      var readyVideo = box ? box.querySelector('video') : null;
      if (readyVideo) {
        readyVideo.play().catch(function () {});
      }
      return;
    }

    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var stream = box.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      box._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      video.src = stream;
    }

    box.dataset.ready = '1';

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-video-box]')).forEach(function (box) {
    var trigger = box.querySelector('[data-play-trigger]');
    var overlay = box.querySelector('[data-player-overlay]');

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        startVideo(box);
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        startVideo(box);
      });
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-detail-play]')).forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var box = document.querySelector('[data-video-box]');
      if (box) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        startVideo(box);
      }
    });
  });
})();
