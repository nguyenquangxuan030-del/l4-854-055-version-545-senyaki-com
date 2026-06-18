(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function textValue(element, name) {
        return (element.getAttribute(name) || '').toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupFilters() {
        var roots = document.querySelectorAll('[data-filter-root]');
        roots.forEach(function (root) {
            var scope = root.parentElement || document;
            var input = root.querySelector('[data-filter-input]');
            var region = root.querySelector('[data-filter-region]');
            var year = root.querySelector('[data-filter-year]');
            var type = root.querySelector('[data-filter-type]');
            var category = root.querySelector('[data-filter-category]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

            function selected(element) {
                return element ? element.value.toLowerCase() : '';
            }

            function apply() {
                var query = selected(input).trim();
                var regionValue = selected(region);
                var yearValue = selected(year);
                var typeValue = selected(type);
                var categoryValue = selected(category);

                cards.forEach(function (card) {
                    var haystack = [
                        textValue(card, 'data-title'),
                        textValue(card, 'data-region'),
                        textValue(card, 'data-year'),
                        textValue(card, 'data-type'),
                        textValue(card, 'data-genre'),
                        textValue(card, 'data-tags'),
                        textValue(card, 'data-category')
                    ].join(' ');

                    var matched = true;
                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (regionValue && textValue(card, 'data-region') !== regionValue) {
                        matched = false;
                    }
                    if (yearValue && textValue(card, 'data-year') !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && textValue(card, 'data-type') !== typeValue) {
                        matched = false;
                    }
                    if (categoryValue && textValue(card, 'data-category') !== categoryValue) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                });
            }

            [input, region, year, type, category].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
                apply();
            }
        });
    }

    window.initPlayer = function (streamUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playOverlay');
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function start() {
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                loaded = true;
            }
            video.controls = true;
            overlay.classList.add('is-hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupFilters();
    });
})();
