(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                var active = i === index;
                slide.classList.toggle("active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var input = document.querySelector("[data-movie-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var pills = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        if (!input && !pills.length) {
            return;
        }
        var activeFilter = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input ? normalize(input.value) : "";
            cards.forEach(function (card) {
                var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || card.getAttribute("data-category") === activeFilter;
                card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        pills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                activeFilter = pill.getAttribute("data-filter") || "all";
                pills.forEach(function (item) {
                    item.classList.toggle("active", item === pill);
                });
                apply();
            });
        });
        apply();
    }

    function initPlayer() {
        var frame = document.querySelector("[data-player]");
        var video = frame ? frame.querySelector("video") : null;
        var button = frame ? frame.querySelector("[data-play-button]") : null;
        var layer = frame ? frame.querySelector("[data-play-layer]") : null;
        var configNode = document.getElementById("player-config");
        if (!frame || !video || !button || !layer || !configNode) {
            return;
        }
        var source = "";
        try {
            source = JSON.parse(configNode.textContent || "{}").source || "";
        } catch (error) {
            source = "";
        }
        if (!source) {
            return;
        }
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }
            video.src = source;
            return Promise.resolve();
        }

        function play(event) {
            if (event) {
                event.preventDefault();
            }
            frame.classList.add("is-loading");
            prepare()
                .then(function () {
                    return video.play();
                })
                .then(function () {
                    layer.hidden = true;
                    frame.classList.add("is-playing");
                    frame.classList.remove("is-loading");
                })
                .catch(function () {
                    frame.classList.remove("is-loading");
                });
        }

        button.addEventListener("click", play);
        layer.addEventListener("click", play);
        video.addEventListener("play", function () {
            layer.hidden = true;
            frame.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                frame.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
