(function () {
    function initializeVideo(video) {
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-src') || video.currentSrc || video.src;
        if (!src) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
                return;
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video._hlsInstance = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video._hlsInstance = null;
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var video = document.getElementById('video-player');
        var play = document.querySelector('[data-play-video]');

        initializeVideo(video);

        if (play && video) {
            play.addEventListener('click', function () {
                initializeVideo(video);
                play.classList.add('is-hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            });
        }
    });
}());
