import GrowImage from './components/GrowImage.js';
import Header from './components/Header.js';
import ScrollAnimations from './components/ScrollAnimations.js';

export default class ComponentFactory {
  constructor() {
    this.componentList = {
      GrowImage,
      Header,
      ScrollAnimations,
    };

    this.init();
  }

  init() {
    const components = document.querySelectorAll('[data-component]');

    for (let i = 0; i < components.length; i++) {
      const element = components[i];
      const componentName = element.dataset.component;

      if (this.componentList[componentName]) {
        new this.componentList[componentName](element);
      } else {
        console.log(`La composante ${componentName} n'existe pas!`);
      }
    }
  }
}
