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

    // Menu mobile
    this.button = this.element.querySelector('.menu-toggle');
    this.menu = this.element.querySelector('.nav');
    this.links = this.element.querySelectorAll('.nav-link');

    this.init();
  }

  // Initialise le header
  init() {
    this.setOptions();

    window.addEventListener('scroll', this.onScroll.bind(this));

    if (this.button) {
      this.button.addEventListener('click', this.toggleMenu.bind(this));
    }

    // Ferme le menu lorsqu'on clique sur un lien
    this.links.forEach((link) => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    // Ferme le menu avec la touche Échap
    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        this.element.classList.contains('menu-open')
      ) {
        this.closeMenu();
        this.button.focus();
      }
    });

    // Ferme le menu si on revient en mode ordinateur
    window.addEventListener('resize', () => {
      if (window.matchMedia(`(min-width: 1025px)`).matches) {
        this.closeMenu();
      }
    });

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
    // Garde le header visible si le menu est ouvert
    if (this.element.classList.contains('menu-open')) {
      this.element.dataset.state = 'visible';
      return;
    }

    if (this.options.alwaysShow) {
      this.element.dataset.state = 'visible';
      return;
    }

    const scrollHeight =
      document.scrollingElement.scrollHeight - window.innerHeight;

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
    if (this.element.classList.contains('menu-open')) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  // Ouvre le menu
  openMenu() {
    this.element.classList.add('menu-open');
    this.element.dataset.state = 'visible';

    this.button.setAttribute('aria-expanded', 'true');
    this.button.setAttribute('aria-label', 'Fermer le menu');

    document.body.classList.add('menu-mobile-open');
  }

  // Ferme le menu
  closeMenu() {
    this.element.classList.remove('menu-open');

    if (this.button) {
      this.button.setAttribute('aria-expanded', 'false');
      this.button.setAttribute('aria-label', 'Ouvrir le menu');
    }

    document.body.classList.remove('menu-mobile-open');

    this.setHeaderState();
  }
}
