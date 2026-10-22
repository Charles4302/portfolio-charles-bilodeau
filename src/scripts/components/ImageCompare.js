export default class ImageCompare {
  constructor(element) {
    this.element = element;
    this.slider = this.element.querySelector('.image-compare__slider');

    this.init();
  }

  init() {
    if (!this.slider) return;

    this.updatePosition(this.slider.value);

    this.slider.addEventListener('input', () => {
      this.updatePosition(this.slider.value);
    });
  }

  updatePosition(value) {
    this.element.style.setProperty('--compare-position', `${value}%`);
  }
}
