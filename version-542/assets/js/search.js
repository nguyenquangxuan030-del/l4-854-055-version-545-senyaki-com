(function () {
    function getQuery() {
        return new URLSearchParams(window.location.search).get('q') || '';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function card(movie) {
        return [
            '<article class="movie-card" data-movie-card>',
            '    <a class="poster-link" href="' + escapeHtml(movie.page) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="play-chip">立即观看</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + escapeHtml(movie.page) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.one_line || '') + '</p>',
            '        <div class="meta-row">',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.genre) + '</span>',
            '        </div>',
            '        <div class="score-row">',
            '            <span>★ ' + escapeHtml(movie.rating) + '</span>',
            '            <span>' + escapeHtml(movie.category) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function runSearch(query) {
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var movies = window.MOVIE_INDEX || [];
        var q = String(query || '').trim().toLowerCase();
        var matched = q ? movies.filter(function (movie) {
            return [
                movie.title,
                movie.region,
                movie.year,
                movie.genre,
                movie.tags,
                movie.type,
                movie.category,
                movie.one_line
            ].join(' ').toLowerCase().indexOf(q) !== -1;
        }) : movies.slice(0, 24);

        if (summary) {
            summary.textContent = q ? ('找到 ' + matched.length + ' 条与“' + query + '”相关的结果') : '展示前 24 条内容，输入关键词可检索全部影片。';
        }
        if (results) {
            results.innerHTML = matched.slice(0, 240).map(card).join('\n');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.querySelector('[data-local-search]');
        var input = form ? form.querySelector('input[name="q"]') : null;
        var query = getQuery();
        if (input) {
            input.value = query;
        }
        runSearch(query);
        if (form && input) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var next = input.value.trim();
                var url = next ? ('search.html?q=' + encodeURIComponent(next)) : 'search.html';
                window.history.replaceState(null, '', url);
                runSearch(next);
            });
            input.addEventListener('input', function () {
                runSearch(input.value);
            });
        }
    });
}());
