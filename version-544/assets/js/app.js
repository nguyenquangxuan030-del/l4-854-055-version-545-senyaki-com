const SitePlayer = {
    mount(videoId, buttonId, source) {
        const video = document.getElementById(videoId);
        const button = document.getElementById(buttonId);
        let hlsInstance = null;

        if (!video || !source) {
            return;
        }

        const attachSource = () => {
            if (video.dataset.ready === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.dataset.ready = "1";
        };

        const start = () => {
            attachSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        };

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
};

(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", () => {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            if (query) {
                window.location.href = `./search.html?q=${encodeURIComponent(query)}`;
            } else {
                window.location.href = "./search.html";
            }
        });
    });

    const slider = document.querySelector("[data-hero-slider]");
    if (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        let active = 0;
        let timer = null;

        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        const start = () => {
            timer = window.setInterval(() => show(active + 1), 5600);
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                restart();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
        const keywordInput = filterPanel.querySelector("[data-card-filter]");
        const typeSelect = filterPanel.querySelector("[data-filter-type]");
        const regionSelect = filterPanel.querySelector("[data-filter-region]");
        const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
        const emptyState = document.querySelector("[data-empty-state]");

        const applyFilters = () => {
            const keyword = (keywordInput ? keywordInput.value : "").trim().toLowerCase();
            const typeValue = typeSelect ? typeSelect.value : "";
            const regionValue = regionSelect ? regionSelect.value : "";
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.tags
                ].join(" ").toLowerCase();
                const typeMatch = !typeValue || (card.dataset.type || "").includes(typeValue);
                const regionMatch = !regionValue || (card.dataset.region || "").includes(regionValue);
                const keywordMatch = !keyword || haystack.includes(keyword);
                const isVisible = typeMatch && regionMatch && keywordMatch;
                card.classList.toggle("is-hidden", !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        };

        [keywordInput, typeSelect, regionSelect].forEach((control) => {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }

    const searchPage = document.querySelector("[data-search-page]");
    if (searchPage && typeof SEARCH_MOVIES !== "undefined") {
        const form = searchPage.querySelector("[data-search-page-form]");
        const input = form ? form.querySelector("input[name='q']") : null;
        const results = searchPage.querySelector("[data-search-results]");
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (input) {
            input.value = initialQuery;
        }

        const renderCard = (movie) => {
            return `
<article class="movie-card" data-movie-card>
    <a class="movie-poster" href="./${movie.url}" aria-label="观看${escapeHtml(movie.title)}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="score-badge">${movie.rating}分</span>
        <span class="type-badge">${escapeHtml(movie.type)}</span>
        <span class="poster-play">▶</span>
    </a>
    <div class="movie-card-body">
        <h3><a href="./${movie.url}">${escapeHtml(movie.title)}</a></h3>
        <p class="movie-line">${escapeHtml(movie.line)}</p>
        <div class="movie-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.genre)}</span>
        </div>
    </div>
</article>`;
        };

        const render = (query) => {
            const term = query.trim().toLowerCase();
            let matches = SEARCH_MOVIES;

            if (term) {
                matches = SEARCH_MOVIES.filter((movie) => {
                    return [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.tags, movie.line]
                        .join(" ")
                        .toLowerCase()
                        .includes(term);
                });
            }

            matches = matches.slice(0, 120);

            if (!results) {
                return;
            }

            if (matches.length === 0) {
                results.innerHTML = '<p class="search-message">没有找到相关影片</p>';
                return;
            }

            results.innerHTML = matches.map(renderCard).join("\n");
        };

        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const query = input ? input.value.trim() : "";
                const nextUrl = query ? `./search.html?q=${encodeURIComponent(query)}` : "./search.html";
                window.history.replaceState(null, "", nextUrl);
                render(query);
            });
        }

        render(initialQuery);
    }
})();

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}
