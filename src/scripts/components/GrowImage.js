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

    // Fermer en cliquant sur l'arrière-plan
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });

    // Fermer avec Échap
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.modal.dataset.state === 'open') {
        this.close();
      }
    });

    // Recalculer les dimensions au redimensionnement
    window.addEventListener('resize', () => {
      if (this.modal.dataset.state === 'open') {
        this.resizeImage();
      }
    });
  }

  /* ==========================================================================
     OUVERTURE
     ========================================================================== */

  open(button) {
    const image = button.querySelector('img');

    if (!image) return;

    // Réinitialiser les dimensions
    this.modalImage.style.width = '';
    this.modalImage.style.height = '';

    this.modal.classList.remove('is-panoramic');

    this.modalImage.onload = () => {
      this.resizeImage();
    };

    this.modalImage.src = image.src;
    this.modalImage.alt = image.alt;

    this.modal.dataset.state = 'open';
    document.body.classList.add('modal-open');

    // Si l'image est déjà chargée
    if (this.modalImage.complete && this.modalImage.naturalWidth) {
      this.resizeImage();
    }
  }

  /* ==========================================================================
     DIMENSIONS ADAPTATIVES
     ========================================================================== */

  resizeImage() {
    const image = this.modalImage;

    if (!image.naturalWidth || !image.naturalHeight) return;

    const ratio = image.naturalWidth / image.naturalHeight;

    const isMobile = window.innerWidth <= 768;
    const isPanoramic = ratio > 2;

    // Limites générales
    const maxWidth = Math.min(window.innerWidth * 0.9, 1200);
    const maxHeight = window.innerHeight * 0.8;

    let width = maxWidth;
    let height = width / ratio;

    // Adapter les images verticales à la hauteur disponible
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    // Traitement particulier des images panoramiques
    if (isMobile && isPanoramic) {
      const minHeight = Math.min(220, maxHeight);

      height = Math.max(height, minHeight);
      width = height * ratio;

      this.modal.classList.add('is-panoramic');
    } else {
      this.modal.classList.remove('is-panoramic');
    }

    // Dimensions réelles du cadre
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;

    // Revenir au début pour les images panoramiques
    if (isMobile && isPanoramic) {
      this.modal.scrollLeft = 0;
    }
  }

  /* ==========================================================================
     FERMETURE
     ========================================================================== */

  close() {
    this.modal.dataset.state = 'closed';

    document.body.classList.remove('modal-open');
    this.modal.classList.remove('is-panoramic');
  }
}
