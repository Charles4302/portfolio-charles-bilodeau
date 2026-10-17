import * as THREE from 'three';

export default class Background {
  constructor(element) {
    this.element = element;
    this.animationFrame = null;

    this.init();
  }

  init() {
    // Scène
    this.scene = new THREE.Scene();

    // Caméra perspective
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 500);
    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer transparent
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.element.appendChild(this.renderer.domElement);

    // Grille
    this.createGrid();

    // Méthodes
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.element);

    this.resize();
    this.animate();
  }

  createGrid() {
    const size = 500;
    const divisions = 250;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const half = size / 2;
    const step = size / divisions;

    for (let i = 0; i <= divisions; i++) {
      const position = -half + i * step;

      // Lignes horizontales
      vertices.push(-half, position, 0, half, position, 0);

      // Lignes verticales
      vertices.push(position, -half, 0, position, half, 0);
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );

    const material = new THREE.LineBasicMaterial({
      color: '#36daff',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });

    this.grid = new THREE.LineSegments(geometry, material);

    // Inclinaison pour l'effet de profondeur
    this.grid.rotation.x = -Math.PI / 4;

    this.scene.add(this.grid);
  }

  resize() {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  animate(time = 0) {
    this.animationFrame = requestAnimationFrame(this.animate);

    // Animation automatique légèrement plus rapide
    this.grid.position.y = (time * 0.00012) % 2;

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);

    this.resizeObserver.disconnect();

    this.grid.geometry.dispose();
    this.grid.material.dispose();

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
