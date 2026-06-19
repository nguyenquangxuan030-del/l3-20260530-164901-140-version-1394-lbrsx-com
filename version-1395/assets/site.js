(function () {
    "use strict";

    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-missing");
        });
    });

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var next = root.querySelector("[data-hero-next]");
        var prev = root.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", play);

        show(0);
        play();
    }

    function initLocalFilter() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var search = document.querySelector("[data-local-search]");
        var year = document.querySelector("[data-year-filter]");
        var type = document.querySelector("[data-type-filter]");
        var empty = document.querySelector("[data-empty-state]");

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    matched = false;
                }

                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [search, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatViews(value) {
        var number = Number(value || 0);
        if (number >= 10000) {
            return (number / 10000).toFixed(1) + "万";
        }
        return String(number);
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            '<article class="movie-card">',
            '    <a class="poster-frame" href="' + escapeHtml(movie.href) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-play">立即播放</span>',
            '        <span class="poster-duration">' + escapeHtml(movie.duration) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-row">',
            '            <a href="category-' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-list">' + tags + '</div>',
            '        <div class="card-stats">',
            '            <span>评分 ' + escapeHtml(movie.rating) + '</span>',
            '            <span>热度 ' + escapeHtml(formatViews(movie.views)) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join("");
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var category = document.querySelector("[data-search-category]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");

        if (!form || !input || !results || !window.MOVIE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function render() {
            var query = input.value.trim().toLowerCase();
            var categoryValue = category ? category.value : "";

            var matched = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.year,
                    movie.type,
                    movie.region,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();

                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }

                if (categoryValue && movie.category !== categoryValue) {
                    return false;
                }

                return query || categoryValue;
            }).slice(0, 120);

            results.innerHTML = matched.map(cardTemplate).join("");

            results.querySelectorAll("img").forEach(function (image) {
                image.addEventListener("error", function () {
                    image.classList.add("image-missing");
                });
            });

            if (empty) {
                if (matched.length) {
                    empty.classList.remove("is-visible");
                } else {
                    empty.classList.add("is-visible");
                    empty.textContent = query || categoryValue ? "没有找到匹配内容。" : "请输入关键词，或直接选择分类浏览。";
                }
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            if (input.value.trim()) {
                url.searchParams.set("q", input.value.trim());
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState({}, "", url.toString());
            render();
        });

        input.addEventListener("input", render);

        if (category) {
            category.addEventListener("change", render);
        }

        render();
    }

    initHero();
    initLocalFilter();
    initSearchPage();
})();
