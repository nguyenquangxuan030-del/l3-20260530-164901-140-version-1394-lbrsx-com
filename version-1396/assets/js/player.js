(function () {
    var video = document.getElementById('video-player');
    var startButton = document.querySelector('.video-start');
    var streamUrl = window.__videoStreamUrl;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function prepareVideo() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        }
    }

    function startPlayback() {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (startButton) {
                    startButton.classList.remove('is-hidden');
                }
            });
        }
    }

    prepareVideo();

    if (startButton) {
        startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    });
})();
