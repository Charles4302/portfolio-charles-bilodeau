export default class AudioPlayer {
  constructor(element) {
    this.element = element;

    this.audio = this.element.querySelector('audio');
    this.playButton = this.element.querySelector('.audio-play');
    this.progress = this.element.querySelector('.audio-progress');
    this.currentTime = this.element.querySelector('.audio-current');
    this.duration = this.element.querySelector('.audio-duration');

    this.init();
  }

  init() {
    this.playButton.addEventListener('click', () => {
      if (this.audio.paused) {
        this.audio.play().catch((error) => {
          console.error('Lecture audio impossible :', error);
        });
      } else {
        this.audio.pause();
      }
    });

    this.audio.addEventListener('play', () => {
      this.playButton.classList.add('is-playing');
      this.playButton.setAttribute('aria-label', 'Mettre en pause');
    });

    this.audio.addEventListener('pause', () => {
      this.playButton.classList.remove('is-playing');
      this.playButton.setAttribute('aria-label', 'Lire la piste');
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.textContent = this.formatTime(this.audio.duration);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.textContent = this.formatTime(this.audio.currentTime);

      if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.progress.value =
          (this.audio.currentTime / this.audio.duration) * 100;
      }
    });

    this.progress.addEventListener('input', () => {
      if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.audio.currentTime =
          (this.progress.value / 100) * this.audio.duration;
      }
    });

    this.audio.addEventListener('ended', () => {
      this.progress.value = 0;
    });
  }

  formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${String(remaining).padStart(2, '0')}`;
  }
}
