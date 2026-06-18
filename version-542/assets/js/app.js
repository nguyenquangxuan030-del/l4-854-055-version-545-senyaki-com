(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function bindMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
            toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
        });
    }

    function bindGlobalSearch() {
        qsa('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = 'search.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function bindFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var root = panel.parentElement;
            var cards = qsa('[data-movie-card]', root);
            var keyword = qs('[data-filter-keyword]', panel);
            var year = qs('[data-filter-year]', panel);
            var region = qs('[data-filter-region]', panel);
            var count = qs('[data-filter-count]', panel);

            function apply() {
                var kw = normalize(keyword && keyword.value);
                var yr = normalize(year && year.value);
                var rg = normalize(region && region.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.category
                    ].join(' '));
                    var matchKeyword = !kw || haystack.indexOf(kw) !== -1;
                    var matchYear = !yr || normalize(card.dataset.year).indexOf(yr) !== -1;
                    var matchRegion = !rg || normalize(card.dataset.region).indexOf(rg) !== -1;
                    var show = matchKeyword && matchYear && matchRegion;
                    card.classList.toggle('is-filter-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible;
                }
            }

            [keyword, year, region].forEach(function (input) {
                if (input) {
                    input.addEventListener('input', apply);
                }
            });
        });
    }

    function bindHero() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('[data-hero-slide]', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var prev = qs('[data-hero-prev]', carousel);
        var next = qs('[data-hero-next]', carousel);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindMenu();
        bindGlobalSearch();
        bindFilters();
        bindHero();
    });
}());
