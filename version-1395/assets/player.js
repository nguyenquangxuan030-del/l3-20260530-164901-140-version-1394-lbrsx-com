import { H as Hls } from "./hls-dru42stk.js";

function setStatus(root, message) {
    const status = root.querySelector("[data-player-status]");
    if (status) {
        status.textContent = message;
    }
}

function initPlayer(root) {
    const video = root.querySelector("video[data-src]");
    const button = root.querySelector("[data-player-button]");

    if (!video || !button) {
        return;
    }

    const source = video.getAttribute("data-src");
    let hls = null;
    let attached = false;

    function attachSource() {
        if (attached) {
            return Promise.resolve();
        }

        attached = true;
        setStatus(root, "正在加载播放源");

        return new Promise(function (resolve, reject) {
            if (!source) {
                reject(new Error("未找到播放源"));
                return;
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    setStatus(root, "播放源已就绪");
                    resolve();
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus(root, "播放加载失败");
                        reject(new Error("播放加载失败"));
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus(root, "播放源已就绪");
                    resolve();
                }, { once: true });
                video.addEventListener("error", function () {
                    setStatus(root, "播放加载失败");
                    reject(new Error("播放加载失败"));
                }, { once: true });
            } else {
                setStatus(root, "当前浏览器不支持 HLS 播放");
                reject(new Error("当前浏览器不支持 HLS 播放"));
            }
        });
    }

    async function playVideo() {
        try {
            await attachSource();
            await video.play();
            button.classList.add("is-hidden");
            setStatus(root, "正在播放");
        } catch (error) {
            button.classList.remove("is-hidden");
        }
    }

    button.addEventListener("click", playVideo);

    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
        setStatus(root, "正在播放");
    });

    video.addEventListener("pause", function () {
        if (!video.ended) {
            button.classList.remove("is-hidden");
            setStatus(root, "已暂停");
        }
    });

    video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
        setStatus(root, "播放结束");
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

document.querySelectorAll("[data-player]").forEach(initPlayer);
