import Icons from './utils/Icons.js';
import ComponentFactory from './ComponentFactory.js';

class Main {
  constructor() {
    this.init();
  }

  init() {
    document.documentElement.classList.add('has-js');

    Icons.load();

    new ComponentFactory();
  }
}

new Main();
