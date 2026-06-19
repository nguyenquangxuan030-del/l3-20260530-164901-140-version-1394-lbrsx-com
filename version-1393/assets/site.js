(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupNavigation() {
        var button = document.querySelector(".mobile-menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        restart();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector(".movie-search");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll(".filter-button"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-state");
            var activeFilter = "all";

            function matches(card, query, filter) {
                var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                var year = (card.getAttribute("data-year") || "").toLowerCase();
                var type = (card.getAttribute("data-type") || "").toLowerCase();
                var queryMatch = !query || searchText.indexOf(query) !== -1;
                var filterMatch = filter === "all" || searchText.indexOf(filter) !== -1 || year.indexOf(filter) !== -1 || type.indexOf(filter) !== -1;
                return queryMatch && filterMatch;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var shown = matches(card, query, activeFilter.toLowerCase());
                    card.hidden = !shown;
                    if (shown) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    activeFilter = button.getAttribute("data-filter") || "all";
                    apply();
                });
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".stream-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var startButton = player.querySelector(".player-start");
            var stream = player.getAttribute("data-stream");
            var hlsInstance = null;
            if (!video || !stream) {
                return;
            }

            function attachStream() {
                if (player.getAttribute("data-ready") === "true") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                player.setAttribute("data-ready", "true");
            }

            function play() {
                attachStream();
                player.classList.add("is-playing");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            if (startButton) {
                startButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
