(function() {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener("click", function() {
            navLinks.classList.toggle("is-open");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startSlider() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                showSlide(dotIndex);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                startSlider();
            });
        });

        showSlide(0);
        startSlider();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    filterPanels.forEach(function(panel) {
        var input = panel.querySelector("[data-search-input]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matches(card) {
            var query = normalize(input ? input.value : "");
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }

            if (region && card.getAttribute("data-region") !== region) {
                return false;
            }

            if (type && card.getAttribute("data-type") !== type) {
                return false;
            }

            if (year && card.getAttribute("data-year") !== year) {
                return false;
            }

            return true;
        }

        function applyFilters() {
            var visible = 0;

            cards.forEach(function(card) {
                var ok = matches(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, regionSelect, typeSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function(player) {
        var video = player.querySelector("video[data-stream]");
        var button = player.querySelector("[data-play-trigger]");
        var hlsInstance = null;
        var loaded = false;

        if (!video) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return;
            }

            var source = video.getAttribute("data-stream");

            if (!source) {
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

            loaded = true;
        }

        function startPlayback() {
            attachSource();
            player.classList.add("is-playing");

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {
                    player.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function() {
            player.classList.add("is-playing");
        });

        video.addEventListener("ended", function() {
            player.classList.remove("is-playing");
        });

        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
