export default class GrowImage {
  constructor(element) {
    this.element = element;

    this.imageButtons = this.element.querySelectorAll(
      '.apropos-image, .project-image:not(.image-compare)',
    );

    this.modal = this.element.querySelector('.image-modal');
    this.modalImage = this.element.querySelector('.modal-image');
    this.closeButton = this.element.querySelector('.modal-close');

    this.init();
  }

  init() {
    if (!this.modal || !this.modalImage) return;

    // Ouvrir la modale
    this.imageButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.open(button);
      });
    });

    // Fermer avec le bouton X
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    // Fermer en cliquant en dehors de l'image
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.modal.dataset.state === 'open') {
        this.close();
      }
    });
  }

  open(button) {
    const image = button.querySelector('img');

    if (!image) return;

    this.modalImage.src = image.src;
    this.modalImage.alt = image.alt;

    this.modal.dataset.state = 'open';

    document.body.classList.add('modal-open');
  }

  close() {
    this.modal.dataset.state = 'closed';

    document.body.classList.remove('modal-open');
  }
}
