(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
      button.textContent = opened ? "×" : "☰";
    });
  }

  function initImages() {
    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      function blank() {
        image.classList.add("is-blank");
      }
      image.addEventListener("error", blank);
      if (image.complete && image.naturalWidth === 0) {
        blank();
      }
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 6500);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function visibleText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initInlineFilters() {
    document.querySelectorAll(".inline-filter").forEach(function (form) {
      var scope = document.querySelector(form.getAttribute("data-target"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var keyword = form.querySelector("[data-filter-keyword]");
      var year = form.querySelector("[data-filter-year]");
      var genre = form.querySelector("[data-filter-genre]");
      var empty = document.querySelector(form.getAttribute("data-empty"));

      function apply() {
        var q = visibleText(keyword && keyword.value);
        var y = visibleText(year && year.value);
        var g = visibleText(genre && genre.value);
        var shown = 0;
        cards.forEach(function (card) {
          var hay = visibleText([card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year].join(" "));
          var ok = true;
          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (y && visibleText(card.dataset.year) !== y) {
            ok = false;
          }
          if (g && visibleText(card.dataset.genre).indexOf(g) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      [keyword, year, genre].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var panel = document.querySelector(".search-panel");
    var mount = document.querySelector("#search-results");
    if (!panel || !mount || !window.SITE_CATALOG) {
      return;
    }
    var keyword = panel.querySelector("[name='q']");
    var genre = panel.querySelector("[name='genre']");
    var year = panel.querySelector("[name='year']");
    var region = panel.querySelector("[name='region']");
    var empty = document.querySelector("#search-empty");
    var params = new URLSearchParams(window.location.search);
    if (params.get("q") && keyword) {
      keyword.value = params.get("q");
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + tag + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\" data-title=\"" + movie.title + "\" data-genre=\"" + movie.genre + "\" data-year=\"" + movie.year + "\" data-region=\"" + movie.region + "\">",
        "  <a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"" + movie.title + "\">",
        "    <img src=\"" + movie.cover + "\" alt=\"" + movie.title + "\" loading=\"lazy\" data-cover>",
        "    <span class=\"poster-glow\"></span>",
        "    <span class=\"play-mark\">▶</span>",
        "    <span class=\"score-badge\">" + movie.rating + "</span>",
        "  </a>",
        "  <div class=\"movie-info\">",
        "    <a class=\"movie-title\" href=\"" + movie.url + "\">" + movie.title + "</a>",
        "    <div class=\"movie-meta\"><span>" + movie.year + "</span><span>" + movie.region + "</span><span>" + movie.type + "</span></div>",
        "    <p>" + movie.oneLine + "</p>",
        "    <div class=\"tag-row\">" + tags + "</div>",
        "  </div>",
        "</article>"
      ].join("\n");
    }

    function apply() {
      var q = visibleText(keyword && keyword.value);
      var g = visibleText(genre && genre.value);
      var y = visibleText(year && year.value);
      var r = visibleText(region && region.value);
      var result = window.SITE_CATALOG.filter(function (movie) {
        var hay = visibleText([movie.title, movie.genre, movie.region, movie.year, movie.oneLine, movie.tags.join(" ")].join(" "));
        if (q && hay.indexOf(q) === -1) {
          return false;
        }
        if (g && visibleText(movie.genre).indexOf(g) === -1) {
          return false;
        }
        if (y && visibleText(movie.year) !== y) {
          return false;
        }
        if (r && visibleText(movie.region).indexOf(r) === -1) {
          return false;
        }
        return true;
      }).slice(0, 240);
      mount.innerHTML = result.map(card).join("\n");
      initImages();
      if (empty) {
        empty.classList.toggle("show", result.length === 0);
      }
    }

    [keyword, genre, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayers() {
    document.querySelectorAll(".site-player").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var stream = shell.getAttribute("data-stream");
      var hls = null;

      function play() {
        if (!video || !stream) {
          return;
        }
        shell.classList.add("playing");
        if (!video.dataset.ready) {
          video.dataset.ready = "true";
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("playing");
        });
        video.addEventListener("pause", function () {
          shell.classList.remove("playing");
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initInlineFilters();
    initSearchPage();
    initPlayers();
  });
})();
