import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class ModelViewer {
  constructor(element) {
    this.element = element;
    this.canvas = element.querySelector('.model-canvas');
    this.modelPath = element.dataset.model;

    if (!this.canvas || !this.modelPath) {
      console.error('ModelViewer : canvas ou modèle manquant.');
      return;
    }

    // Rotation automatique
    this.inactivityDelay = 3000;
    this.inactivityTimer = null;
    this.isInteracting = false;

    // Flottement vertical
    this.floatTime = 0;
    this.floatAmplitude = 0;
    this.floatSpeed = 0.8;
    this.modelBaseY = 0;

    // Horloge Three.js
    this.clock = new THREE.Clock();

    // Scène transparente
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Caméra
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.setClearColor(0x000000, 0);

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Contrôles de la caméra
    this.controls = new OrbitControls(this.camera, this.canvas);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;

    // Empêcher de voir sous la ville
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(15);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(85);

    // Rotation automatique lente
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;

    // Fonctions liées à la classe
    this.stopAutoRotate = this.stopAutoRotate.bind(this);
    this.resumeAutoRotate = this.resumeAutoRotate.bind(this);
    this.animate = this.animate.bind(this);
    this.resize = this.resize.bind(this);

    this.init();
  }

  /* ==========================================================================
       INITIALISATION
       ========================================================================== */

  init() {
    this.createLights();
    this.loadModel();
    this.resize();

    // Arrêter la rotation pendant l'interaction
    this.controls.addEventListener('start', this.stopAutoRotate);

    // Reprendre après l'interaction
    this.controls.addEventListener('end', this.resumeAutoRotate);

    // Reprendre après un zoom
    this.canvas.addEventListener('wheel', this.resumeAutoRotate, {
      passive: true,
    });

    // Adapter le canvas à son conteneur
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.element);

    // Démarrer l'animation
    this.animate();
  }

  /* ==========================================================================
       ÉCLAIRAGE
       ========================================================================== */

  createLights() {
    // Lumière générale douce
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x607080, 1.2);

    this.scene.add(hemisphereLight);

    // Lumière principale
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);

    mainLight.position.set(10, 20, 15);
    this.scene.add(mainLight);

    // Lumière secondaire
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);

    fillLight.position.set(-15, 10, -10);
    this.scene.add(fillLight);

    // Léger accent cyan
    const accentLight = new THREE.DirectionalLight(0x9befff, 0.2);

    accentLight.position.set(-10, 8, 12);
    this.scene.add(accentLight);
  }

  /* ==========================================================================
       CHARGEMENT DU MODÈLE
       ========================================================================== */

  loadModel() {
    const loader = new GLTFLoader();

    loader.load(
      this.modelPath,

      (gltf) => {
        const model = gltf.scene;
        this.model = model;

        // Conserver les matériaux et textures du GLB
        model.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = false;
          }
        });

        this.scene.add(model);

        // Calculer les dimensions
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Centrer la ville
        model.position.sub(center);

        // Enregistrer sa position verticale
        this.modelBaseY = model.position.y;

        // Définir une faible amplitude de flottement
        const maxDimension = Math.max(size.x, size.y, size.z);

        this.floatAmplitude = maxDimension * 0.012;

        // Calculer la distance de la caméra
        const fov = THREE.MathUtils.degToRad(this.camera.fov);

        const distance = maxDimension / 2 / Math.tan(fov / 2);

        // Vue légèrement surélevée
        this.camera.position.set(
          distance * 0.8,
          distance * 0.7,
          distance * 1.5,
        );

        // Adapter les plans de la caméra
        this.camera.near = Math.max(distance / 1000, 0.001);

        this.camera.far = Math.max(distance * 100, 1000);

        this.camera.updateProjectionMatrix();

        // Point de rotation central
        this.controls.target.set(0, 0, 0);

        // Limites du zoom
        this.controls.minDistance = distance * 0.3;
        this.controls.maxDistance = distance * 5;

        this.controls.update();

        console.log('Modèle GLB chargé :', model);
      },

      undefined,

      (error) => {
        console.error('Erreur de chargement du modèle GLB :', error);
      },
    );
  }

  /* ==========================================================================
       ROTATION AUTOMATIQUE
       ========================================================================== */

  stopAutoRotate() {
    this.isInteracting = true;
    this.controls.autoRotate = false;

    clearTimeout(this.inactivityTimer);
  }

  resumeAutoRotate() {
    this.isInteracting = false;

    clearTimeout(this.inactivityTimer);

    this.inactivityTimer = setTimeout(() => {
      if (!this.isInteracting) {
        this.controls.autoRotate = true;
      }
    }, this.inactivityDelay);
  }

  /* ==========================================================================
       REDIMENSIONNEMENT
       ========================================================================== */

  resize() {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  /* ==========================================================================
       ANIMATION
       ========================================================================== */

  animate() {
    this.animationFrame = requestAnimationFrame(this.animate);

    // Temps écoulé depuis la dernière image
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.floatTime += delta;

    // Animation de flottement vertical
    if (this.model) {
      this.model.position.y =
        this.modelBaseY +
        Math.sin(this.floatTime * this.floatSpeed) * this.floatAmplitude;
    }

    // Rotation automatique et interactions
    this.controls.update();

    // Afficher la scène
    this.renderer.render(this.scene, this.camera);
  }

  /* ==========================================================================
       NETTOYAGE
       ========================================================================== */

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    clearTimeout(this.inactivityTimer);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.controls.removeEventListener('start', this.stopAutoRotate);

    this.controls.removeEventListener('end', this.resumeAutoRotate);

    this.canvas.removeEventListener('wheel', this.resumeAutoRotate);

    this.controls.dispose();

    // Libérer les ressources du modèle
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();

          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach((material) => {
            if (!material) return;

            material.dispose();
          });
        }
      });
    }

    this.renderer.dispose();
  }
}
