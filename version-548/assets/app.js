(function () {
  function each(selector, root, handler) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), handler);
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroFeatures() {
    var features = Array.prototype.slice.call(document.querySelectorAll('[data-hero-feature]'));
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.hero-tile'));
    if (!features.length || !tiles.length) {
      return;
    }
    var index = 0;
    function activate(next) {
      index = next % features.length;
      features.forEach(function (item, pos) {
        item.classList.toggle('active', pos === index);
      });
      tiles.forEach(function (item, pos) {
        item.classList.toggle('active', pos === index);
      });
    }
    features.forEach(function (item, pos) {
      item.addEventListener('mouseenter', function () {
        activate(pos);
      });
      item.addEventListener('focus', function () {
        activate(pos);
      });
    });
    window.setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupCardFilters() {
    each('[data-filter-bar]', document, function (bar) {
      var root = bar.parentNode;
      var input = bar.querySelector('[data-card-search]');
      var year = bar.querySelector('[data-year-filter]');
      var type = bar.querySelector('[data-type-filter]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-list] .movie-card'));
      function apply() {
        var query = normalizeText(input && input.value);
        var selectedYear = normalizeText(year && year.value);
        var selectedType = normalizeText(type && type.value);
        cards.forEach(function (card) {
          var haystack = normalizeText(card.getAttribute('data-search'));
          var cardYear = normalizeText(card.getAttribute('data-year'));
          var cardType = normalizeText(card.getAttribute('data-type'));
          var visible = true;
          if (query && haystack.indexOf(query) === -1) {
            visible = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            visible = false;
          }
          if (selectedType && cardType !== selectedType) {
            visible = false;
          }
          card.style.display = visible ? '' : 'none';
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
    });
  }

  function createSearchCard(item) {
    var link = document.createElement('a');
    link.className = 'search-result-card';
    link.href = './' + item.url;
    var image = document.createElement('img');
    image.src = item.cover;
    image.alt = item.title;
    image.loading = 'lazy';
    var copy = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = item.title;
    var meta = document.createElement('span');
    meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
    copy.appendChild(title);
    copy.appendChild(meta);
    link.appendChild(image);
    link.appendChild(copy);
    return link;
  }

  function setupSiteSearch() {
    var input = document.getElementById('siteSearchInput');
    var results = document.getElementById('siteSearchResults');
    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get('q');
    if (incoming) {
      input.value = incoming;
    }
    function render() {
      var query = normalizeText(input.value);
      var source = window.MOVIE_SEARCH_INDEX;
      var matches = source.filter(function (item) {
        if (!query) {
          return item.hot;
        }
        return normalizeText(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).indexOf(query) !== -1;
      }).slice(0, 96);
      results.innerHTML = '';
      if (!matches.length) {
        var empty = document.createElement('p');
        empty.className = 'content-box full-width';
        empty.textContent = '没有找到匹配影片';
        results.appendChild(empty);
        return;
      }
      matches.forEach(function (item) {
        results.appendChild(createSearchCard(item));
      });
    }
    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHeroFeatures();
    setupCardFilters();
    setupSiteSearch();
  });
})();

function initializeMoviePlayer(videoId, sourceUrl, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !sourceUrl) {
    return;
  }
  var hlsInstance = null;
  var ready = false;

  function markReady() {
    ready = true;
  }

  function prepare() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      markReady();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, markReady);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          video.src = sourceUrl;
          markReady();
        }
      });
      return;
    }
    video.src = sourceUrl;
    markReady();
  }

  function play() {
    prepare();
    overlay.classList.add('player-overlay-hidden');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        overlay.classList.remove('player-overlay-hidden');
      });
    }
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      play();
    }
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('player-overlay-hidden');
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('player-overlay-hidden');
  });
}
