export default class About {
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
  }

  open() {
    this.modal.dataset.state = 'open';
    document.body.classList.add('modal-open');
  }

  close() {
    this.modal.dataset.state = 'closed';
    document.body.classList.remove('modal-open');
  }
}
