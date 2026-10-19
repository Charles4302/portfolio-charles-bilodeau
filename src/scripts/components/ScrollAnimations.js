import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default class ScrollAnimations {
  constructor(element) {
    this.element = element;

    this.init();
  }

  // Initialise les animations de la section
  init() {
    this.createRevealAnimations();
    this.createFrameAnimations();
    this.createPanelAnimations();
    this.createSkillAnimations();
    this.createScaleAnimations();
    this.createScrollEffects();
  }

  // Fait apparaître les textes
  createRevealAnimations() {
    const elements = this.element.querySelectorAll('[data-animate="reveal"]');

    elements.forEach((element) => {
      const animation = gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 30,
          filter: 'blur(6px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power2.out',
          paused: true,
        },
      );

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 5%',

        onEnter: () => {
          animation.play();
        },

        onLeave: () => {
          animation.reverse();
        },

        onEnterBack: () => {
          animation.play();
        },

        onLeaveBack: () => {
          animation.reverse();
        },
      });
    });
  }

  // Déploie les cadres, médias et boutons
  createFrameAnimations() {
    const elements = this.element.querySelectorAll('[data-animate="frame"]');

    elements.forEach((element) => {
      const animation = gsap.timeline({
        paused: true,
      });

      // Déploiement du frame
      animation.fromTo(
        element,
        {
          opacity: 0,
          scaleX: 0,
          transformOrigin: 'center',
        },
        {
          opacity: 1,
          scaleX: 1,
          duration: 1.3,
          ease: 'power4.out',
        },
      );

      // Dissolve du texte uniquement pour les boutons
      if (element.classList.contains('btn')) {
        animation.fromTo(
          element,
          {
            color: 'transparent',
          },
          {
            color: '',
            duration: 0.7,
            ease: 'power2.out',
          },
          0.5,
        );
      }

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 5%',

        onEnter: () => {
          animation.play();
        },

        onLeave: () => {
          animation.reverse();
        },

        onEnterBack: () => {
          animation.play();
        },

        onLeaveBack: () => {
          animation.reverse();
        },
      });
    });
  }

  // Déploie les panneaux d'interface
  createPanelAnimations() {
    const elements = this.element.querySelectorAll('[data-animate="panel"]');

    elements.forEach((element) => {
      const animation = gsap.fromTo(
        element,
        {
          opacity: 0,
          scaleY: 0.85,
          filter: 'brightness(1.8)',
          transformOrigin: 'center',
        },
        {
          opacity: 1,
          scaleY: 1,
          filter: 'brightness(1)',
          duration: 1.2,
          ease: 'power3.out',
          paused: true,
        },
      );

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 5%',

        onEnter: () => {
          animation.play();
        },

        onLeave: () => {
          animation.reverse();
        },

        onEnterBack: () => {
          animation.play();
        },

        onLeaveBack: () => {
          animation.reverse();
        },
      });
    });
  }

  // Remplit progressivement les barres de compétences
  createSkillAnimations() {
    const elements = this.element.querySelectorAll('[data-animate="skill"]');

    elements.forEach((element) => {
      const level = getComputedStyle(element)
        .getPropertyValue('--level')
        .trim();

      const animation = gsap.fromTo(
        element,
        {
          '--level': '0%',
        },
        {
          '--level': level,
          duration: 1.4,
          ease: 'power2.out',
          paused: true,
        },
      );

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 5%',

        onEnter: () => {
          animation.play();
        },

        onLeave: () => {
          animation.reverse();
        },

        onEnterBack: () => {
          animation.play();
        },

        onLeaveBack: () => {
          animation.reverse();
        },
      });
    });
  }

  // Fait apparaître les petits éléments d'interface
  createScaleAnimations() {
    const elements = this.element.querySelectorAll('[data-animate="scale"]');

    elements.forEach((element) => {
      const animation = gsap.fromTo(
        element,
        {
          opacity: 0,
          scale: 0.6,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          paused: true,
        },
      );

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 5%',

        onEnter: () => {
          animation.play();
        },

        onLeave: () => {
          animation.reverse();
        },

        onEnterBack: () => {
          animation.play();
        },

        onLeaveBack: () => {
          animation.reverse();
        },
      });
    });
  }

  // Ajoute une profondeur 3D liée au scroll
  createScrollEffects() {
    const elements = this.element.querySelectorAll(
      '[data-animate="scroll-3d"]',
    );

    elements.forEach((element) => {
      gsap.fromTo(
        element,
        {
          y: 0,
          rotateX: 0,
          rotateY: 0,
          z: 0,
        },
        {
          y: -35,
          rotateX: 4,
          rotateY: -2,
          z: 30,
          ease: 'none',

          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      );
    });
  }
}
