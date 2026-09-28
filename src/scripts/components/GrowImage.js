export default class GrowImage {
  constructor(element) {
    this.element = element;

    this.imageButton = this.element.querySelector('.apropos-image');
    this.modal = this.element.querySelector('.image-modal');
    this.closeButton = this.element.querySelector('.modal-close');

    this.init();
  }

  init() {
    this.imageButton.addEventListener('click', this.open.bind(this));
    this.closeButton.addEventListener('click', this.close.bind(this));
    this.modal.addEventListener('click', this.handleModalClick.bind(this));
  }

  open() {
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
  }

  handleModalClick(event) {
    if (event.target === this.modal) {
      this.close();
    }
  }
}
