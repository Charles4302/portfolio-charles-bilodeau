export default class YouTube {
  constructor(element) {
    this.element = element;

    this.videoContainer = this.element.querySelector('.js-video');
    this.poster = this.element.querySelector('.js-poster');

    this.videoId = this.element.dataset.videoId;
    this.controls = this.element.dataset.noControls === 'true' ? 0 : 1;

    this.player = null;
    this.playerReady = false;

    if (!this.videoId || !this.videoContainer) {
      console.error('YouTube : ID ou conteneur vidéo manquant.');
      return;
    }

    YouTube.instances.push(this);

    this.init();
  }

  init() {
    this.initPlayer = this.initPlayer.bind(this);

    if (this.poster) {
      this.poster.addEventListener('click', this.initPlayer);
    } else {
      this.initPlayer();
    }
  }

  async initPlayer() {
    console.log('Clic sur la vidéo YouTube');
    if (this.player) return;

    if (this.poster) {
      this.poster.removeEventListener('click', this.initPlayer);
    }

    try {
      await YouTube.loadScript();

      this.player = new window.YT.Player(this.videoContainer, {
        height: '100%',
        width: '100%',
        videoId: this.videoId,

        playerVars: {
          autoplay: this.poster ? 1 : 0,
          controls: this.controls,
          rel: 0,
          playsinline: 1,
        },

        events: {
          onReady: (event) => {
            this.playerReady = true;

            this.element.classList.add('is-playing');

            if (this.poster) {
              event.target.playVideo();
            }

            this.observer = new IntersectionObserver(this.watch.bind(this), {
              threshold: 0,
            });

            this.observer.observe(this.element);
          },

          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              YouTube.pauseAll(this);
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              this.player.seekTo(0);
              this.player.pauseVideo();
            }
          },

          onError: (event) => {
            console.error('Erreur YouTube :', event.data);
          },
        },
      });
    } catch (error) {
      console.error('Impossible de charger YouTube :', error);
    }
  }

  watch(entries) {
    if (this.playerReady && !entries[0].isIntersecting) {
      this.player.pauseVideo();
    }
  }

  static loadScript() {
    if (window.YT && window.YT.Player) {
      return Promise.resolve();
    }

    if (YouTube.scriptPromise) {
      return YouTube.scriptPromise;
    }

    YouTube.scriptPromise = new Promise((resolve, reject) => {
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousCallback === 'function') {
          previousCallback();
        }

        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';

      script.onerror = () => {
        YouTube.scriptPromise = null;
        reject(new Error('Chargement de l’API YouTube échoué.'));
      };

      document.body.appendChild(script);
    });

    return YouTube.scriptPromise;
  }

  static pauseAll(currentInstance) {
    YouTube.instances.forEach((instance) => {
      if (instance !== currentInstance && instance.playerReady) {
        instance.player.pauseVideo();
      }
    });
  }
}

YouTube.instances = [];
YouTube.scriptPromise = null;
