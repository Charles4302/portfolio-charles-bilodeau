export default class AiModal {
  constructor(element) {
    this.element = element;

    this.openButtons = document.querySelectorAll('[data-modal-open]');
    this.closeButtons = this.element.querySelectorAll('[data-modal-close]');
    this.content = this.element.querySelector('.modal-content');

    this.lastFocus = null;

    this.init();
  }

  init() {
    if (!this.content) return;

    // Ouverture de la modale correspondante
    this.openButtons.forEach((button) => {
      const target = button.dataset.modalOpen || 'modal-ia';

      if (target === this.element.id) {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          this.open();
        });
      }
    });

    // Fermeture avec le bouton ou l'overlay
    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.close();
      });
    });

    // Gestion du clavier
    document.addEventListener('keydown', (event) => {
      if (!this.element.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        this.close();
      }

      if (event.key === 'Tab') {
        this.trapFocus(event);
      }
    });
  }

  // ==========================================================================
  // OUVERTURE
  // ==========================================================================

  open() {
    this.lastFocus = document.activeElement;

    this.element.classList.add('is-open');
    document.body.classList.add('modal-open');

    this.content.setAttribute('tabindex', '-1');
    this.content.focus();
  }

  // ==========================================================================
  // FERMETURE
  // ==========================================================================

  close() {
    this.element.classList.remove('is-open');

    // Conserver le blocage si une autre modale est ouverte
    if (
      !document.querySelector('.modal.is-open, .image-modal[data-state="open"]')
    ) {
      document.body.classList.remove('modal-open');
    }

    // Redonner le focus au bouton d'ouverture
    if (this.lastFocus && this.lastFocus.isConnected) {
      this.lastFocus.focus();
    }
  }

  // ==========================================================================
  // GESTION DU FOCUS
  // ==========================================================================

  trapFocus(event) {
    const elements = [
      ...this.element.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => element.getClientRects().length);

    if (!elements.length) {
      event.preventDefault();
      this.content.focus();
      return;
    }

    const first = elements[0];
    const last = elements[elements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!elements.includes(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  }
}
