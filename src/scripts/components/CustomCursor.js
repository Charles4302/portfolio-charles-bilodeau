export default class CustomCursor {
  constructor(element) {
    this.element = element;

    this.init();
  }

  init() {
    this.mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    if (!this.mediaQuery.matches) return;

    document.body.classList.add('has-custom-cursor');

    window.addEventListener('pointermove', (event) => {
      this.move(event);
    });

    document.addEventListener('pointerdown', () => {
      this.element.classList.add('is-clicking');
    });

    document.addEventListener('pointerup', () => {
      this.element.classList.remove('is-clicking');
    });

    document.addEventListener('pointercancel', () => {
      this.element.classList.remove('is-clicking');
    });

    document.addEventListener('pointerout', (event) => {
      if (!event.relatedTarget) {
        this.element.classList.remove('is-visible');
        this.element.classList.remove('is-hovering');
        this.element.classList.remove('is-clicking');
      }
    });

    window.addEventListener('blur', () => {
      this.element.classList.remove('is-visible');
      this.element.classList.remove('is-clicking');
    });
  }

  move(event) {
    // Position du curseur
    const x = event.clientX - 5;
    const y = event.clientY - 3;

    this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    this.element.classList.add('is-visible');

    // Détection des éléments interactifs
    const interactive = event.target.closest(
      'a, button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], select, summary, .is-clickable',
    );

    this.element.classList.toggle('is-hovering', Boolean(interactive));

    // Conserver le curseur de texte dans les champs
    const textField = event.target.closest(
      'input:not([type]), input[type="text"], input[type="email"], input[type="search"], input[type="password"], input[type="number"], textarea, [contenteditable="true"]',
    );

    this.element.classList.toggle('is-visible', !textField);
  }
}
