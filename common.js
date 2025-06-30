// Validate meta tags for application name and author
const applicationNameMeta = document.querySelector('meta[name="application-name"]');
const authorMeta = document.querySelector('meta[name="author"]');
const isValid = applicationNameMeta &&
    authorMeta &&
    applicationNameMeta.content === 'iWedding' &&
    authorMeta.content === 'Biihappy.com';

if (!isValid) {
    alert('This website is using Biihappy.com’s copyrighted content without permission!');
}

// Polyfill for Date.now if not available
if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    };
}

// Polyfill for requestAnimationFrame and cancelAnimationFrame
(function () {
    'use strict';
    const prefixes = ['webkit', 'moz'];
    for (let i = 0; i < prefixes.length && !window.requestAnimationFrame; ++i) {
        const prefix = prefixes[i];
        window.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[prefix + 'CancelAnimationFrame'] ||
            window[prefix + 'CancelRequestAnimationFrame'];
    }

    // Fallback for older iOS devices or if requestAnimationFrame is unavailable
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
        !window.requestAnimationFrame ||
        !window.cancelAnimationFrame) {
        let lastTime = 0;
        window.requestAnimationFrame = function (callback) {
            const now = Date.now();
            const nextTime = Math.max(lastTime + 16, now);
            return setTimeout(() => {
                callback(lastTime = nextTime);
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
})();

// Snowfall animation module
const snowFall = (function () {
    function SnowFall() {
        // Default configuration for snowflakes
        const config = {
            flakeCount: 35,
            flakeColor: '#ffffff',
            flakeIndex: 999999,
            minSize: 1,
            maxSize: 2,
            minSpeed: 1,
            maxSpeed: 5,
            round: false,
            shadow: false,
            collection: false,
            image: false,
            collectionHeight: 40
        };

        let flakes = [];
        let container = {};
        let height = 0;
        let width = 0;
        let leftOffset = 0;
        let animationFrameId = 0;

        // Utility to merge options
        function mergeOptions(target, source) {
            for (const key in source) {
                if (target.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }

        // Generate random number in range
        function randomRange(min, max) {
            return Math.round(min + Math.random() * (max - min));
        }

        // Apply styles to an element
        function applyStyles(element, styles) {
            for (const property in styles) {
                element.style[property] = styles[property] + (property === 'width' || property === 'height' ? 'px' : '');
            }
        }

        // Snowflake class
        function Snowflake(parent, size, speed) {
            this.x = randomRange(leftOffset, width - leftOffset);
            this.y = randomRange(0, height);
            this.size = size;
            this.speed = speed;
            this.step = 0;
            this.stepSize = randomRange(1, 10) / 100;

            if (config.collection) {
                this.target = canvasCollection[randomRange(0, canvasCollection.length - 1)];
            }

            let element = null;
            if (config.image) {
                element = new Image();
                element.src = config.image;
            } else {
                element = document.createElement('div');
                applyStyles(element, { background: config.flakeColor });
            }

            element.className = 'snowfall-flakes';
            applyStyles(element, {
                width: this.size,
                height: this.size,
                position: 'absolute',
                top: this.y,
                left: this.x,
                fontSize: 0,
                zIndex: config.flakeIndex
            });

            if (config.round) {
                applyStyles(element, {
                    '-moz-border-radius': ~~config.maxSize + 'px',
                    '-webkit-border-radius': ~~config.maxSize + 'px',
                    borderRadius: ~~config.maxSize + 'px'
                });
            }

            if (config.shadow) {
                applyStyles(element, {
                    '-moz-box-shadow': '1px 1px 1px #555',
                    '-webkit-box-shadow': '1px 1px 1px #555',
                    boxShadow: '1px 1px 1px #555'
                });
            }

            if (parent.tagName.toLowerCase() === 'body') {
                document.body.appendChild(element);
            } else {
                parent.appendChild(element);
            }

            this.element = element;

            this.update = function () {
                this.y += this.speed;
                if (this.y > height - (this.size + 6)) {
                    this.reset();
                }
                this.element.style.top = this.y + 'px';
                this.element.style.left = this.x + 'px';
                this.step += this.stepSize;
                this.x += Math.cos(this.step);

                if (this.x + this.size > width - leftOffset || this.x < leftOffset) {
                    this.reset();
                }
            };

            this.reset = function () {
                this.y = 0;
                this.x = randomRange(leftOffset, width - leftOffset);
                this.stepSize = randomRange(1, 10) / 100;
                this.size = randomRange(100 * config.minSize, 100 * config.maxSize) / 100;
                this.element.style.width = this.size + 'px';
                this.element.style.height = this.size + 'px';
                this.speed = randomRange(config.minSpeed, config.maxSpeed);
            };
        }

        // Animation loop
        function animate() {
            for (let i = 0; i < flakes.length; i++) {
                flakes[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        }

        return {
            snow: function (element, options) {
                mergeOptions(config, options);
                container = element;
                height = container.clientHeight;
                width = container.offsetWidth;
                container.snow = this;

                if (container.tagName.toLowerCase() === 'body') {
                    leftOffset = 25;
                }

                window.addEventListener('resize', () => {
                    height = container.clientHeight;
                    width = container.offsetWidth;
                }, false);

                for (let i = 0; i < config.flakeCount; i++) {
                    flakes.push(new Snowflake(
                        container,
                        randomRange(100 * config.minSize, 100 * config.maxSize) / 100,
                        randomRange(config.minSpeed, config.maxSpeed)
                    ));
                }

                animate();
            },

            clear: function () {
                let elements = container.querySelector ?
                    container.querySelector('.snowfall-flakes') :
                    container.querySelectorAll('.snowfall-flakes');
                for (let i = elements.length - 1; i >= 0; i--) {
                    if (elements[i].parentNode === container) {
                        container.removeChild(elements[i]);
                    }
                }
                cancelAnimationFrame(animationFrameId);
            }
        };
    }

    return {
        snow: function (elements, options) {
            if (typeof options === 'string') {
                if (elements.length > 0) {
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].snow) {
                            elements[i].snow.clear();
                        }
                    }
                } else {
                    elements.snow.clear();
                }
            } else {
                if (elements.length > 0) {
                    for (let i = 0; i < elements.length; i++) {
                        new SnowFall().snow(elements[i], options);
                    }
                } else {
                    new SnowFall().snow(elements, options);
                }
            }
        }
    };
})();

// Snowfall effect initialization
const SNOW_PICTURE = biicore.webroot + '/common/imgs/heart.png';
const SPECIAL_CUSTOM = ['646f6e3d778825e6f306667f', '64a04f6beb89a210fc07656a'];

window.onload = () => {
    if (biicore.effect.type === 'none') return false;

    setTimeout(() => {
        if (biicore.effect.type === 'heart') {
            let flakeCount = 30;
            if (typeof biicore.template_id !== 'undefined' && SPECIAL_CUSTOM.includes(biicore.template_id)) {
                flakeCount = 5;
                if (window.innerWidth <= 650) {
                    flakeCount = 3;
                }
            }
            snowFall.snow(document.getElementsByTagName('body')[0], {
                image: SNOW_PICTURE,
                minSize: 15,
                maxSize: 32,
                flakeCount: flakeCount,
                maxSpeed: 3,
                minSpeed: 1
            });
        } else if (biicore.effect.type === 'snow') {
            let flakeCount = 250;
            if (typeof biicore.template_id !== 'undefined' && SPECIAL_CUSTOM.includes(biicore.template_id)) {
                flakeCount = 50;
                if (window.innerWidth <= 1200) {
                    flakeCount = 30;
                }
                if (window.innerWidth <= 650) {
                    flakeCount = 25;
                }
            }
            snowFall.snow(document.getElementsByTagName('body')[0], {
                round: true,
                shadow: true,
                flakeCount: flakeCount,
                minSize: 1,
                maxSize: 8
            });
        } else if (biicore.effect.type === 'custom') {
            const settings = biicore.effect.options;
            let minSpeed = parseInt(settings.speed) - 3;
            if (minSpeed <= 0) minSpeed = 1;
            snowFall.snow(document.getElementsByTagName('body')[0], {
                image: settings.icon,
                minSize: settings.minSize,
                maxSize: settings.maxSize,
                flakeCount: settings.number,
                maxSpeed: settings.speed,
                minSpeed: minSpeed
            });
        }
    }, 300);

    // Show scroll indicator on mobile if content is taller than viewport
    if (document.getElementsByTagName('body')[0].offsetHeight > window.innerHeight) {
        setTimeout(() => {
            document.querySelector('.mouse-scroll-on-mobile').style.visibility = 'visible';
        }, 800);
    }

    // Handle wish suggestions click
    document.querySelectorAll('.showContent').forEach(element => {
        element.addEventListener('click', function (event) {
            event.preventDefault();
            const text = this.textContent || this.innerText;
            document.getElementById('content').value = text;
        });
    });

    // Prevent context menu
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    // Prevent F12 key
    document.addEventListener('keydown', event => {
        if (event.keyCode === 123) {
            event.preventDefault();
        }
    });

    // Prevent image drag
    function preventImageDrag() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', event => {
                event.preventDefault();
            });
        });
    }
    preventImageDrag();

    // Re-apply image drag prevention on button click
    document.querySelectorAll('.btn-see-more-gallery').forEach(button => {
        button.addEventListener('click', () => {
            setTimeout(preventImageDrag, 200);
        });
    });

    // Hide touch callout
    document.body.style.webkitTouchCallout = 'none';
};

// Hide scroll indicator on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        document.querySelector('.mouse-scroll-on-mobile').style.visibility = 'hidden';
    }
});

// Scroll down text
const scrollDownText = biicore.scroll_down_text && biicore.scroll_down_text !== ''
    ? biicore.scroll_down_text
    : 'Kéo xuống';

// Inject scroll indicator styles and HTML
document.write(`
    <style type="text/css">
        .mouse-scroll-on-mobile { display: none; }
        @media screen and (max-width: 576px) {
            .mouse-scroll-on-mobile {
                width: 95px;
                height: 30px;
                margin: 0 0 0 -30px;
                position: fixed;
                right: calc(50% - 52px);
                bottom: 80px;
                -webkit-animation: arrow .5s 1s infinite ease-in-out alternate;
                z-index: 999;
                display: block !important;
                visibility: hidden;
            }
            .mouse-scroll-on-mobile:hover {
                -webkit-animation-play-state: paused;
            }
            .mouse-scroll-on-mobile .mouse-scroll-on-mobile-text {
                text-align: center;
                bottom: 120px;
                position: absolute;
                left: 1px;
                background: #fff;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 15px;
                color: #000;
            }
            .mouse-scroll-on-mobile .mouse-scroll-on-mobile-left {
                position: absolute;
                height: 5px;
                width: 30px;
                background: #de4659;
                -webkit-transform: rotate(240deg);
                bottom: 80px;
                left: 42px;
                -webkit-border-radius: 4px;
                -webkit-transform-origin: 5px 50%;
                -webkit-animation: leftArrow .5s 1s infinite ease-out alternate;
            }
            .mouse-scroll-on-mobile .mouse-scroll-on-mobile-right {
                position: absolute;
                height: 5px;
                width: 30px;
                background: #de4659;
                -webkit-transform: rotate(-60deg);
                bottom: 80px;
                left: 46px;
                -webkit-border-radius: 4px;
                -webkit-transform-origin: 5px 50%;
                -webkit-animation: rightArrow .5s 1s infinite ease-out alternate;
            }
        }
        @-webkit-keyframes arrow {
            0% { bottom: 0; }
            100% { bottom: 40px; }
        }
        @-webkit-keyframes leftArrow {
            100% { -webkit-transform: rotate(225deg); }
        }
        @-webkit-keyframes rightArrow {
            100% { -webkit-transform: rotate(-45deg); }
        }
    </style>
    <div class="mouse-scroll-on-mobile">
        <div class="mouse-scroll-on-mobile-text">${scrollDownText}</div>
        <div class="mouse-scroll-on-mobile-left"></div>
        <div class="mouse-scroll-on-mobile-right"></div>
    </div>
`);

// Display alert if configured
if (biicore.alert && Object.keys(biicore.alert).length > 0 && biicore.alert.status === 1) {
    biicore.alert.content = biicore.alert.content.replace(
        /(https?:\/\/([-\w\.]+[-\w])+(:\d+)?(\/([\w\/_.#-]*(\?\S+)?[^\.\s])?)?)/g,
        '<a href="$1" target="_blank">$1</a>'
    );
    setTimeout(() => {
        Swal.fire({
            title: biicore.alert.title,
            html: biicore.alert.content,
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: true,
            focusCancel: true,
            cancelButtonText: biicore.alert.cancel_button_text && biicore.alert.cancel_button_text !== ''
                ? biicore.alert.cancel_button_text
                : 'Tắt thông báo'
        });
    }, biicore.alert.timeout);
}

// Background music player
if (biicore.bgMusic) {
    const audioPlayer = document.createElement('AUDIO');
    audioPlayer.style.display = 'none';

    setTimeout(() => {
        if (audioPlayer.canPlayType('audio/mpeg')) {
            audioPlayer.setAttribute('src', biicore.bgMusic);
            document.getElementsByClassName('bii-player')[0].style.display = 'block';
        }
        audioPlayer.volume = 0.3;
        audioPlayer.setAttribute('controls', 'controls');
        audioPlayer.loop = true;
        if (biicore.isAutoPlay) {
            audioPlayer.setAttribute('autoplay', 'autoplay');
        }
        document.body.appendChild(audioPlayer);
    }, 1000);

    const interval = setInterval(() => {
        if (document.querySelector('.bii-player')) {
            setTimeout(() => {
                document.getElementsByClassName('bii-player')[0].classList.add('show-sec');
            }, 2000);
            setTimeout(() => {
                document.getElementsByClassName('bii-player')[0].classList.remove('show-sec');
            }, 7000);
            clearInterval(interval);
        }
    }, 200);

    function playPause() {
        const player = document.getElementsByClassName('bii-player')[0];
        player.classList.remove('show-sec');
        if (audioPlayer.paused) {
            audioPlayer.play();
            document.getElementById('playerVolumeOff').style.display = 'none';
            document.getElementById('playerVolumeOn').style.display = 'inline';
        } else {
            audioPlayer.pause();
            document.getElementById('playerVolumeOff').style.display = 'inline';
            document.getElementById('playerVolumeOn').style.display = 'none';
        }
    }

    if (biicore.isAutoPlay) {
        function handleClickAutoPlay(event) {
            const playerIcons = document.querySelectorAll('.bii-player-secondary, .playerIcon');
            if (!Array.from(playerIcons).some(icon => icon.contains(event.target))) {
                if (audioPlayer.paused) {
                    document.body.removeEventListener('click', handleClickAutoPlay, true);
                    playPause();
                }
            } else {
                document.body.addEventListener('click', handleClickAutoPlay, true);
            }
        }
        document.body.addEventListener('click', handleClickAutoPlay, true);
    }

    // Inject music player styles and HTML
    document.write(`
        <style type="text/css">
            @-webkit-keyframes biilogo-pulse {
                from {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
                50% {
                    -webkit-transform: scale3d(0.95, 0.95, 0.95);
                    transform: scale3d(0.95, 0.95, 0.95);
                }
                to {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
            }
            @keyframes biilogo-pulse {
                from {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
                50% {
                    -webkit-transform: scale3d(0.95, 0.95, 0.95);
                    transform: scale3d(0.95, 0.95, 0.95);
                }
                to {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
            }
            .bii-player {
                position: fixed;
                bottom: 70px;
                left: 50px;
                width: 40px;
                height: 40px;
                z-index: 99999;
                display: none;
            }
            .bii-player .playerIcon {
                cursor: pointer;
                display: block;
                width: 40px;
                height: 40px;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                -o-border-radius: 50%;
                -ms-border-radius: 50%;
                border-radius: 50%;
                background-color: #df4758;
                padding-top: 7px;
                padding-left: 9px;
                position: absolute;
                z-index: 2;
            }
            .bii-player:after {
                content: "";
                position: absolute;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                -o-border-radius: 50%;
                -ms-border-radius: 50%;
                border-radius: 50%;
                z-index: -1;
                background-color: rgba(242, 59, 67, 0.3);
                width: 120%;
                height: 120%;
                left: -10%;
                top: -10%;
                -webkit-animation: biilogo-pulse 1s infinite;
                animation: biilogo-pulse 1s infinite;
                z-index: 1;
            }
            .bii-player img {
                width: 100%;
                z-index: 99999;
                position: absolute;
                cursor: pointer;
            }
            .bii-player.show-sec .bii-player-secondary {
                visibility: visible;
            }
            .bii-player.show-sec .bii-player-secondary-content {
                transform: translate3d(0, 0, 0);
            }
            .bii-player-secondary {
                position: absolute;
                width: 310px;
                left: 25px;
                height: 50px;
                overflow: hidden;
                visibility: hidden;
            }
            .bii-player-secondary-content {
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
                position: absolute;
                width: 310px;
                left: -25px;
                background: #fff;
                height: 40px;
                padding: 8px 11px 8px 50px;
                border: 1px solid #df4759;
                border-radius: 30px;
                z-index: 1;
                font-size: 14px;
                transform: translate3d(-100%, 0, 0);
                transition: transform 175ms ease;
                font-family: arial;
                font-weight: 200;
                color: #000;
            }
            @media (max-width: 799px) {
                .bii-player {
                    bottom: 30px;
                    left: 20px;
                }
            }
        </style>
        <div class="bii-player">
            <div onclick="playPause();" class="bii-player-secondary">
                <div class="bii-player-secondary-content">Click vào đây nếu bạn muốn phát nhạc!</div>
            </div>
            <div onclick="playPause();" class="playerIcon">
                <span id="playerVolumeOff">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" fill="#fff" class="bi bi-volume-mute-fill" viewBox="0 0 16 16">
                        <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                </span>
                <span style="display:none;" id="playerVolumeOn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" fill="#fff" class="bi bi-volume-up-fill" viewBox="0 0 16 16">
                        <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                        <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                        <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                    </svg>
                </span>
            </div>
        </div>
    `);
}

// Biihappy logo and footer
if (!biicore.isPremium && !biicore.templatePremium) {
    setTimeout(() => {
        document.getElementsByClassName('bii-logo')[0].classList.add('show-sec');
    }, 8000);
    setTimeout(() => {
        document.getElementsByClassName('bii-logo')[0].classList.remove('show-sec');
    }, 11000);
    setTimeout(() => {
        document.getElementsByClassName('bii-logo')[0].classList.add('show-sec');
    }, 25000);
    setTimeout(() => {
        document.getElementsByClassName('bii-logo')[0].classList.remove('show-sec');
    }, 28000);

    const biiLogo = biicore.logo;
    const currentYear = new Date().getFullYear();

    document.write(`
        <style type="text/css">
            @-webkit-keyframes biilogo-pulse {
                from {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
                50% {
                    -webkit-transform: scale3d(0.95, 0.95, 0.95);
                    transform: scale3d(0.95, 0.95, 0.95);
                }
                to {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
            }
            @keyframes biilogo-pulse {
                from {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
                50% {
                    -webkit-transform: scale3d(0.95, 0.95, 0.95);
                    transform: scale3d(0.95, 0.95, 0.95);
                }
                to {
                    -webkit-transform: scale3d(1, 1, 1);
                    transform: scale3d(1, 1, 1);
                }
            }
            .bii-logo {
                position: fixed;
                bottom: 70px;
                right: 50px;
                width: 40px;
                height: 40px;
                z-index: 99998;
            }
            .bii-logo a {
                display: block;
            }
            .bii-logo:before {
                content: "";
                position: absolute;
                -webkit-border-radius: 50%;
                -moz-border-radius: 50%;
                -o-border-radius: 50%;
                -ms-border-radius: 50%;
                border-radius: 50%;
                z-index: -1;
                background-color: rgba(242, 59, 67, 0.3);
                width: 120%;
                height: 120%;
                left: -10%;
                top: -10%;
                -webkit-animation: biilogo-pulse 1s infinite;
                animation: biilogo-pulse 1s infinite;
                z-index: 1;
            }
            .bii-logo img {
                width: 100%;
                z-index: 99999;
                position: absolute;
                cursor: pointer;
                border-radius: 50%;
            }
            .bii-logo:hover .bii-logo-secondary {
                visibility: visible;
            }
            .bii-logo:hover .bii-logo-secondary-content {
                transform: translate3d(0, 0, 0);
            }
            .bii-logo.show-sec .bii-logo-secondary {
                visibility: visible;
            }
            .bii-logo.show-sec .bii-logo-secondary-content {
                transform: translate3d(0, 0, 0);
            }
            .bii-logo-secondary {
                position: absolute;
                width: 320px;
                right: 25px;
                height: 40px;
                overflow: hidden;
                visibility: hidden;
            }
            .bii-logo-secondary-content {
                display: flex;
                align-items: center;
                position: absolute;
                width: 320px;
                right: -25px;
                background: #fff;
                height: 40px;
                padding: 8px 40px 8px 11px;
                border: 1px solid #df4759;
                border-radius: 30px;
                z-index: 9999;
                font-size: 14px;
                transform: translate3d(100%, 0, 0);
                transition: transform 175ms ease;
                font-family: arial;
                font-weight: 200;
                color: #000;
                justify-content: center !important;
            }
            .bii-footer .show-desktop {
                display: inline-block;
            }
            .bii-footer .show-mobile {
                display: none;
            }
            @media (max-width: 799px) {
                .bii-logo {
                    bottom: 30px;
                    right: 20px;
                }
                .bii-footer .show-desktop {
                    display: none;
                }
                .bii-footer .show-mobile {
                    display: inline-block;
                }
            }
        </style>
        <div class="bii-logo">
            <div class="bii-logo-secondary">
                <div class="bii-logo-secondary-content">${biicore.footer_title}</div>
            </div>
            <a href="${biicore.url_landing_page}" target="_blank">
                <img src="${biiLogo}" style="border: 1px solid #fff; border-radius: 50%; width: 30px !important; margin-right: 5px;" />
                <span class="show-desktop" style="margin-left: 5px;">${biicore.footer_title}</span>
                <span class="show-mobile"></span>
            </a>
        </div>
        <div class="bii-footer" style="z-index: 9999; background-color: #000; border-top: 1px solid #df4759; color: #fff; text-align: center; letter-spacing: 1px; bottom: 0; width: 100%; font-size: 15px;">
            <div class="container">
                <a style="color: #fff; padding: 10px 0 13px; display: flex; align-items: center; justify-content: center;" href="${biicore.url_landing_page}?utm_source=${biiLogo}&utm_medium=footer&utm_campaign=${biicore.footer_title_mobile}">${biicore.footer_title}</a>
            </div>
        </div>
    `);
}

// Wish suggestions toggle
const showButtonWishSuggestions = document.querySelector('.show-autocomplete');
const hideButtonWishSuggestions = document.querySelector('.hide-autocomplete');
const showContentWishSuggestions = document.querySelectorAll('.showContent');

function toggleDisplayWishesAutocomplete(forceClick = false) {
    const autocomplete = document.querySelector('.wishes-autocomplete-content');
    const isHidden = showButtonWishSuggestions.style.display === 'none';
    if (forceClick && !isHidden) return;
    autocomplete.style.display = isHidden ? 'none' : '';
    showButtonWishSuggestions.style.display = isHidden ? '' : 'none';
    hideButtonWishSuggestions.style.display = isHidden ? 'none' : '';
}

if (showButtonWishSuggestions && hideButtonWishSuggestions) {
    showButtonWishSuggestions.addEventListener('click', () => {
        toggleDisplayWishesAutocomplete(false);
    });
    hideButtonWishSuggestions.addEventListener('click', () => {
        toggleDisplayWishesAutocomplete(false);
    });
    document.body.addEventListener('click', event => {
        if (event.target === document.body ||
            !showButtonWishSuggestions.contains(event.target) &&
            !hideButtonWishSuggestions.contains(event.target) &&
            !document.getElementById('searchWishSuggestions').contains(event.target) &&
            !Array.from(showContentWishSuggestions).some(content => content.contains(event.target))) {
            toggleDisplayWishesAutocomplete(true);
        }
    });
}

// Search wish suggestions
function searchWishSuggestionsFunction() {
    const input = document.getElementById('searchWishSuggestions');
    const searchText = removeVietnameseTones(input.value.toUpperCase());
    const list = document.getElementById('wishSuggestions');
    const items = list.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        const link = items[i].getElementsByTagName('a')[0];
        const text = link.textContent || link.innerText;
        items[i].style.display = removeVietnameseTones(text.toUpperCase()).indexOf(searchText) > -1 ? '' : 'none';
    }
}

// Remove Vietnamese tones for search
function removeVietnameseTones(str) {
    str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'A');
    str = str.replace(/[èéẹẻẽêềếệểễ]/g, 'E');
    str = str.replace(/[ìíịỉĩ]/g, 'I');
    str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'O');
    str = str.replace(/[ùúụủũưừứựửữ]/g, 'U');
    str = str.replace(/[ỳýỵỷỹ]/g, 'Y');
    str = str.replace(/[đ]/g, 'D');
    str = str.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A');
    str = str.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E');
    str = str.replace(/[ÌÍỊỈĨ]/g, 'I');
    str = str.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O');
    str = str.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U');
    str = str.replace(/[ỲÝỴỶỸ]/g, 'Y');
    str = str.replace(/[Đ]/g, 'D');
    str = str.replace(/[^a-zA-Z0-9 ]/g, '');
    return str;
}

// Toast messages for wishes
function toastMessageWishes(messages = null, scrollToId = null) {
    if (Array.isArray(messages) && messages.length > 0) {
        $(document).on('click', '.toast-success', () => {
            if (scrollToId) {
                $('html, body').animate({
                    scrollTop: $('#' + scrollToId).offset().top
                }, 'slow');
            }
        });

        toastr.options = {
            closeButton: true,
            debug: false,
            newestOnTop: true,
            progressBar: false,
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            showDuration: '1000',
            hideDuration: '1000',
            timeOut: '5000',
            extendedTimeOut: '1000',
            showEasing: 'swing',
            hideEasing: 'linear',
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut'
        };

        let index = 0;
        const interval = setInterval(() => {
            const message = messages[index];
            index++;
            toastr.options.closeHtml = '<button class="closebtn"></button>';
            toastr.success(message.content, message.name);
            if (index >= messages.length) {
                clearInterval(interval);
            }
        }, 5000);
    }
}

// Toast messages for wishes
function toastMessageCoppy() {
    alert("Đã copy!");
}
