import GrowImage from './components/GrowImage.js';
import Header from './components/Header.js';
import ScrollAnimations from './components/ScrollAnimations.js';
import AudioPlayer from './components/AudioPlayer.js';
import Youtube from './components/Youtube.js';
import CustomCursor from './components/CustomCursor.js';
import Hologram3D from './components/Hologram3D.js';
import Background from './components/Background.js';
import BackgroundNetwork from './components/BackgroundNetwork.js';

export default class ComponentFactory {
  constructor() {
    this.componentList = {
      GrowImage,
      Header,
      ScrollAnimations,
      AudioPlayer,
      Youtube,
      CustomCursor,
      Hologram3D,
      Background,
      BackgroundNetwork,
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

//hello
