(function () {
  function setupMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-video-player]");
    var mask = document.querySelector("[data-player-mask]");
    var message = document.querySelector("[data-player-message]");
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }
      if (text) {
        message.textContent = text;
        message.hidden = false;
      } else {
        message.textContent = "";
        message.hidden = true;
      }
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放加载失败，请稍后再试");
          }
        });
      } else {
        setMessage("暂时无法播放，请稍后再试");
      }
    }

    function startPlayback() {
      attachStream();
      video.controls = true;
      if (mask) {
        mask.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (mask) {
            mask.classList.remove("hidden");
          }
        });
      }
    }

    if (mask) {
      mask.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("playing", function () {
      setMessage("");
      if (mask) {
        mask.classList.add("hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
