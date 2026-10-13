import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Hologram3D {
  constructor(element) {
    this.element = element;

    this.clock = new THREE.Clock();

    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2();

    this.robot = null;
    this.robotBaseY = 0;
    this.mixer = null;

    this.init();
  }

  init() {
    // Scène
    this.scene = new THREE.Scene();

    // Caméra
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

    this.camera.position.set(0, 3.5, 7);
    this.camera.lookAt(0, 1, 0);

    // Éclairage
    this.createLights();

    // Groupe de la plateforme holographique
    this.platform = new THREE.Group();
    this.scene.add(this.platform);

    // Éléments holographiques
    this.createRings();
    this.createSegments();
    this.createTicks();

    // Modèle Blender
    this.loadRobot();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.element.appendChild(this.renderer.domElement);

    // Événements
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    window.addEventListener('resize', this.resize);

    this.element.addEventListener('pointermove', this.onMouseMove);

    this.element.addEventListener('pointerleave', this.onMouseLeave);

    this.resize();
    this.animate();
  }

  createLights() {
    // Lumière ambiante
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);

    this.scene.add(ambientLight);

    // Lumière principale cyan
    const directionalLight = new THREE.DirectionalLight('#36daff', 2);

    directionalLight.position.set(3, 5, 4);

    this.scene.add(directionalLight);

    // Lumière secondaire
    const fillLight = new THREE.DirectionalLight('#ffffff', 1);

    fillLight.position.set(-3, 2, -2);

    this.scene.add(fillLight);
  }

  createRings() {
    this.rings = [];

    const radii = [1.15, 1.55, 1.95];

    radii.forEach((radius, index) => {
      const geometry = new THREE.TorusGeometry(radius, 0.008, 8, 128);

      const material = new THREE.MeshBasicMaterial({
        color: '#36daff',
        transparent: true,
        opacity: 0.18 + index * 0.07,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(geometry, material);

      ring.rotation.x = Math.PI / 2;
      ring.position.y = index * 0.015;

      this.platform.add(ring);
      this.rings.push(ring);
    });
  }

  createSegments() {
    this.segments = [];

    const radii = [1.15, 1.55, 1.95];

    radii.forEach((radius, index) => {
      const geometry = new THREE.TorusGeometry(
        radius,
        0.018,
        8,
        128,
        Math.PI * 0.55,
      );

      const material = new THREE.MeshBasicMaterial({
        color: '#36daff',
        transparent: true,
        opacity: 0.85 - index * 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const segment = new THREE.Mesh(geometry, material);

      // Groupe permettant la rotation horizontale
      const segmentGroup = new THREE.Group();

      segment.rotation.x = Math.PI / 2;

      segmentGroup.position.y = index * 0.015 + 0.01;

      segmentGroup.rotation.y = index * 1.7;

      segmentGroup.add(segment);
      this.platform.add(segmentGroup);

      this.segments.push(segmentGroup);
    });
  }

  createTicks() {
    const material = new THREE.LineBasicMaterial({
      color: '#36daff',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });

    const points = [];

    const count = 48;
    const radius = 2.15;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;

      const length = i % 6 === 0 ? 0.12 : 0.05;

      const innerRadius = radius;
      const outerRadius = radius + length;

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * innerRadius,
          0,
          Math.sin(angle) * innerRadius,
        ),
        new THREE.Vector3(
          Math.cos(angle) * outerRadius,
          0,
          Math.sin(angle) * outerRadius,
        ),
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const ticks = new THREE.LineSegments(geometry, material);

    this.platform.add(ticks);
  }

  loadRobot() {
    const loader = new GLTFLoader();

    loader.load(
      'assets/models/robot.glb',

      (gltf) => {
        this.robot = gltf.scene;

        // Dimensions initiales
        const bounds = new THREE.Box3().setFromObject(this.robot);

        const size = bounds.getSize(new THREE.Vector3());

        // Ajustement automatique de la taille
        const targetHeight = 2.5;

        if (size.y > 0) {
          const scale = targetHeight / size.y;

          this.robot.scale.multiplyScalar(scale);
        }

        // Recalcul après redimensionnement
        const finalBounds = new THREE.Box3().setFromObject(this.robot);

        const center = finalBounds.getCenter(new THREE.Vector3());

        // Centrage horizontal
        this.robot.position.x -= center.x;
        this.robot.position.z -= center.z;

        // Positionnement au-dessus de la plateforme
        this.robot.position.y -= finalBounds.min.y;
        this.robot.position.y += 0.25;

        // Position de référence pour le flottement
        this.robotBaseY = this.robot.position.y;

        this.scene.add(this.robot);

        // Animations provenant de Blender
        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.robot);

          gltf.animations.forEach((clip) => {
            this.mixer.clipAction(clip).play();
          });
        }

        console.log('Robot 3D chargé avec succès');
      },

      undefined,

      (error) => {
        console.error('Erreur de chargement du robot :', error);
      },
    );
  }

  onMouseMove(event) {
    const bounds = this.element.getBoundingClientRect();

    this.targetMouse.x =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

    this.targetMouse.y =
      ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  }

  onMouseLeave() {
    this.targetMouse.set(0, 0);
  }

  resize() {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    // Rotation des segments lumineux
    this.segments.forEach((segment, index) => {
      const direction = index % 2 === 0 ? 1 : -1;

      segment.rotation.y = elapsed * 0.12 * direction + index * 1.7;
    });

    // Interaction douce avec la souris
    this.mouse.lerp(this.targetMouse, 0.035);

    this.platform.rotation.z = -this.mouse.x * 0.08;

    this.platform.rotation.x = this.mouse.y * 0.06;

    // Flottement de la plateforme
    this.platform.position.y = Math.sin(elapsed * 0.8) * 0.035;

    // Animations Blender
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Flottement du robot
    if (this.robot) {
      this.robot.position.y = this.robotBaseY + Math.sin(elapsed * 1.2) * 0.05;
    }

    // Rendu
    this.renderer.render(this.scene, this.camera);
  }
}
