export default class Header {
  constructor(element) {
    this.element = element;

    // Options du header
    this.options = {
      threshold: 0.1,
      alwaysShow: false,
    };

    // Positions du scroll
    this.scrollPosition = 0;
    this.lastScrollPosition = 0;

    // Bouton du menu mobile
    this.button = this.element.querySelector('.menu-toggle');

    this.init();
  }

  // Initialise le header
  init() {
    this.setOptions();

    window.addEventListener('scroll', this.onScroll.bind(this));

    if (this.button) {
      this.button.addEventListener('click', this.toggleMenu.bind(this));
    }

    this.setHeaderState();
  }

  // Récupère les options dans le HTML
  setOptions() {
    if (this.element.dataset.threshold !== undefined) {
      const value = parseFloat(this.element.dataset.threshold);

      if (!Number.isNaN(value)) {
        this.options.threshold = value;
      }
    }

    if (this.element.dataset.alwaysShow !== undefined) {
      this.options.alwaysShow = true;
    }
  }

  // Détecte le scroll
  onScroll() {
    this.lastScrollPosition = this.scrollPosition;
    this.scrollPosition = document.scrollingElement.scrollTop;

    this.setHeaderState();
    this.setDirection();
  }

  // Affiche ou cache le header
  setHeaderState() {
    if (this.options.alwaysShow) {
      this.element.dataset.state = 'visible';
      return;
    }

    // Calcule la hauteur totale disponible pour le scroll
    const scrollHeight =
      document.scrollingElement.scrollHeight - window.innerHeight;

    // Calcule le seuil à partir du pourcentage choisi
    const threshold = scrollHeight * this.options.threshold;

    if (
      this.scrollPosition > threshold &&
      this.scrollPosition > this.lastScrollPosition
    ) {
      this.element.dataset.state = 'hidden';
    } else {
      this.element.dataset.state = 'visible';
    }
  }

  // Détermine la direction du scroll
  setDirection() {
    if (this.scrollPosition > this.lastScrollPosition) {
      this.element.dataset.direction = 'down';
    }

    if (this.scrollPosition < this.lastScrollPosition) {
      this.element.dataset.direction = 'up';
    }
  }

  // Ouvre ou ferme le menu mobile
  toggleMenu() {
    const isOpen = this.element.classList.toggle('menu-open');

    // Met à jour l'accessibilité du bouton
    this.button.setAttribute('aria-expanded', isOpen);

    this.button.setAttribute(
      'aria-label',
      isOpen ? 'Fermer le menu' : 'Ouvrir le menu',
    );

    // Garde le header visible lorsque le menu est ouvert
    if (isOpen) {
      this.element.dataset.state = 'visible';
    }
  }
}
