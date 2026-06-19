(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            var open = mainNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var searchForms = document.querySelectorAll('form[action$="search.html"]');
    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var keyword = input.value.trim();
            if (!keyword) {
                event.preventDefault();
                window.location.href = form.getAttribute('action') || 'search.html';
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    function scheduleHero() {
        if (heroTimer) {
            clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = setInterval(function () {
                showHero(heroIndex + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showHero(0);
        scheduleHero();
        if (prev) {
            prev.addEventListener('click', function () {
                showHero(heroIndex - 1);
                scheduleHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showHero(heroIndex + 1);
                scheduleHero();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showHero(dotIndex);
                scheduleHero();
            });
        });
    }

    var filterGrid = document.querySelector('.filter-grid');
    var searchInput = document.querySelector('.card-search');
    var sortSelect = document.querySelector('.card-sort');
    var resultText = document.querySelector('.search-result-text');

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function applyFilters() {
        if (!filterGrid) {
            return;
        }
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var query = normalize(searchInput ? searchInput.value.trim() : '');
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || ''));
            var visible = !query || haystack.indexOf(query) !== -1;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (sortSelect) {
            var sortValue = sortSelect.value;
            cards.sort(function (a, b) {
                if (sortValue === 'rating') {
                    return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
                }
                if (sortValue === 'views') {
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                }
                if (sortValue === 'year') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                return 0;
            });
            cards.forEach(function (card) {
                filterGrid.appendChild(card);
            });
        }

        if (resultText) {
            resultText.textContent = query ? '找到 ' + visibleCount + ' 部相关影片' : '';
        }
    }

    if (searchInput || sortSelect) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }
        applyFilters();
    }
})();
