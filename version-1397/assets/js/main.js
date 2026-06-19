(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    play();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterCount = document.querySelector('[data-filter-count]');

  function applyFilter() {
    if (!filterList) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year);
      card.classList.toggle('is-hidden-card', !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (filterCount) {
      filterCount.textContent = visible ? visible + ' 部匹配' : '暂无匹配';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }
  applyFilter();

  var searchResults = document.getElementById('search-results');
  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var title = document.querySelector('[data-search-title]');
    var summary = document.querySelector('[data-search-summary]');
    if (input) {
      input.value = keyword;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    var pool = window.SEARCH_MOVIES;
    var results = keyword ? pool.filter(function (movie) {
      var text = normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine);
      return text.indexOf(normalize(keyword)) !== -1;
    }) : pool.slice(0, 80);

    if (title) {
      title.textContent = keyword ? '关键词“' + keyword + '”' : '精选影片';
    }
    if (summary) {
      summary.textContent = results.length ? '找到 ' + results.length + ' 部相关视频' : '未找到相关视频';
    }

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">未找到相关视频</div>';
    } else {
      searchResults.innerHTML = results.slice(0, 160).map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="./' + movie.file + '">',
          '<img src="./' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
          '<span class="poster-shade"></span>',
          '<span class="play-chip">立即播放</span>',
          '</a>',
          '<div class="card-body">',
          '<a class="card-category" href="./category-' + movie.categorySlug + '.html">' + movie.categoryName + '</a>',
          '<h3><a href="./' + movie.file + '">' + movie.title + '</a></h3>',
          '<p>' + movie.oneLine + '</p>',
          '<div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }
  }
})();
