(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
    if (!cards.length) {
      return;
    }
    var keyword = "";
    var active = "全部";

    function apply() {
      var word = keyword.trim().toLowerCase();
      cards.forEach(function (card) {
        var hay = (card.getAttribute("data-search") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var matchedWord = !word || hay.indexOf(word) !== -1;
        var matchedFilter = active === "全部" || hay.indexOf(active.toLowerCase()) !== -1 || type.indexOf(active) !== -1;
        card.classList.toggle("hidden", !(matchedWord && matchedFilter));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        keyword = input.value;
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        apply();
      });
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter") || "全部";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  }

  function setupCovers() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll(".js-cover"));
    imgs.forEach(function (img) {
      function clearBroken() {
        if (img.parentElement) {
          img.parentElement.classList.add("image-empty");
        }
        img.remove();
      }
      img.addEventListener("error", clearBroken, { once: true });
      if (img.complete && img.naturalWidth === 0) {
        clearBroken();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupCovers();
  });
})();

function createMoviePlayer(videoId, url) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }
  var shell = video.closest("[data-player-shell]");
  var button = shell ? shell.querySelector("[data-play-button]") : null;
  var message = shell ? shell.querySelector("[data-player-message]") : null;
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || "";
    }
  }

  function attach() {
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setMessage("播放暂不可用，请稍后再试");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      video.src = url;
    }
  }

  function start() {
    if (button) {
      button.classList.add("hidden");
    }
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove("hidden");
        }
        setMessage("点击播放按钮开始观看");
      });
    }
  }

  attach();
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("hidden");
    }
    setMessage("");
  });
  video.addEventListener("pause", function () {
    if (button) {
      button.classList.remove("hidden");
    }
  });
  video.addEventListener("error", function () {
    setMessage("播放暂不可用，请稍后再试");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
