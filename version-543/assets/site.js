(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        form.action = "./search.html";
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("is-active", idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("is-active", idx === current);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          show(idx);
          play();
        });
      });

      if (slides.length > 1) {
        play();
      }
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
      var yearSelect = filterRoot.querySelector("[data-filter-year]");
      var regionSelect = filterRoot.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
      var empty = filterRoot.querySelector("[data-empty-state]");

      function filterCards() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var hay = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = true;
          if (keyword && hay.indexOf(keyword) === -1) ok = false;
          if (year && normalize(card.getAttribute("data-year")) !== year) ok = false;
          if (region && normalize(card.getAttribute("data-region")) !== region) ok = false;
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keywordInput, yearSelect, regionSelect].forEach(function (item) {
        if (item) item.addEventListener("input", filterCards);
        if (item) item.addEventListener("change", filterCards);
      });
    }

    var results = document.querySelector("[data-search-results]");
    if (results && window.SITE_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = normalize(params.get("q"));
      var matched = window.SITE_MOVIES.filter(function (movie) {
        if (!query) return true;
        return normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 120);

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state is-visible">没有找到匹配内容</div>';
      } else {
        results.innerHTML = matched.map(function (movie) {
          return '<article class="movie-card medium">' +
            '<a class="movie-cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
            '<span class="cover-gradient"></span>' +
            '<span class="play-dot">▶</span>' +
            '<span class="score-badge">' + movie.score + '分</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="meta-line"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
            '</div>' +
            '</article>';
        }).join("");
      }
    }
  });

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var playerStore = new WeakMap();

  window.initializeMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var cover = document.querySelector("[data-player-cover]");
      if (!video || !streamUrl) return;

      function attach() {
        if (playerStore.has(video)) return;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          playerStore.set(video, hls);
        } else {
          video.src = streamUrl;
          playerStore.set(video, true);
        }
      }

      function start() {
        attach();
        if (cover) cover.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (cover) cover.classList.remove("is-hidden");
          });
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) start();
      });
    });
  };
})();
