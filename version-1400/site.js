(function () {
    var mobileButton = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('open');
            mobileButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function restartHero() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            restartHero();
        });
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            restartHero();
        });
    });

    startHero();

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var select = scope.querySelector('[data-filter-select]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = select ? select.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-meta') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || ''
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                card.hidden = !(matchedKeyword && matchedYear);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var cover = document.getElementById('player-cover');
        var ready = false;
        var hlsInstance = null;

        if (!video || !cover || !source) {
            return;
        }

        function attachSource() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                ready = true;
                return;
            }

            video.src = source;
            ready = true;
        }

        function playVideo() {
            attachSource();
            cover.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    video.focus();
                });
            }
        }

        cover.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (!ready) {
                playVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
