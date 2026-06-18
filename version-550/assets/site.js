(function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var active = 0;

        var showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
        var root = panel.closest("section") || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (input && q) {
            input.value = q;
        }

        var apply = function () {
            var text = input ? input.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var okText = !text || haystack.indexOf(text) !== -1;
                var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
                var okRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                var okType = !typeValue || card.getAttribute("data-type") === typeValue;
                card.hidden = !(okText && okYear && okRegion && okType);
            });
        };

        [input, year, region, type].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });

        apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-player-button]");
        var playUrl = shell.getAttribute("data-play");
        var started = false;
        var hlsInstance = null;

        var begin = function () {
            if (!video || !playUrl) {
                return;
            }

            shell.classList.add("is-playing");

            if (!started) {
                started = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(playUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = playUrl;
                    video.play().catch(function () {});
                } else {
                    video.src = playUrl;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        };

        if (button) {
            button.addEventListener("click", begin);
        }

        shell.addEventListener("click", function (event) {
            if (event.target === video) {
                return;
            }
            if (!started) {
                begin();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
