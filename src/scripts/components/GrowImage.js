export default class GrowImage {
  constructor(element) {
    this.element = element;

    this.imageButtons = this.element.querySelectorAll(
      '.apropos-image, .project-image',
    );

    this.modal = this.element.querySelector('.image-modal');
    this.modalImage = this.element.querySelector('.modal-image');
    this.closeButton = this.element.querySelector('.modal-close');

    this.init();
  }

  init() {
    this.imageButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.open(button);
      });
    });

    this.closeButton.addEventListener('click', this.close.bind(this));
  }

  open(button) {
    const image = button.querySelector('img');

    if (image && this.modalImage) {
      this.modalImage.src = image.src;
      this.modalImage.alt = image.alt;
    }

    this.modal.dataset.state = 'open';
    document.body.classList.add('modal-open');
  }

  close() {
    this.modal.dataset.state = 'closed';
    document.body.classList.remove('modal-open');
  }
}
