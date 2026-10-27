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

    // Rotation interactive
    this.isDragging = false;
    this.activePointerId = null;

    this.previousPointer = new THREE.Vector2();
    this.targetRotation = new THREE.Vector2();
    this.currentRotation = new THREE.Vector2();

    // Groupe permettant de faire tourner le robot
    this.robotGroup = new THREE.Group();

    this.init();
  }

  init() {
    // Scène
    this.scene = new THREE.Scene();

    // Caméra
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

    this.camera.position.set(0, 3.1, 5.7);
    this.camera.lookAt(0, 1.2, 0);

    // Éclairage holographique
    this.createLights();

    // Plateforme holographique
    this.platform = new THREE.Group();
    this.scene.add(this.platform);

    // Groupe du robot
    this.scene.add(this.robotGroup);

    // Éléments holographiques
    this.createRings();
    this.createSegments();
    this.createTicks();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.element.appendChild(this.renderer.domElement);

    // Chargement du modèle Blender
    this.loadRobot();

    // Événements
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    window.addEventListener('resize', this.resize);

    this.element.addEventListener('pointermove', this.onMouseMove);
    this.element.addEventListener('pointerleave', this.onMouseLeave);

    this.element.addEventListener('pointerdown', this.onPointerDown);
    this.element.addEventListener('pointerup', this.onPointerUp);
    this.element.addEventListener('pointercancel', this.onPointerUp);
    this.element.addEventListener('lostpointercapture', this.onPointerUp);

    this.resize();
    this.animate();
  }

  createLights() {
    // Lumière ambiante blanche
    // Conserve la visibilité des matériaux du robot
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    this.scene.add(ambientLight);

    // Lumière principale blanche
    // Préserve les couleurs rouges et métalliques
    const mainLight = new THREE.DirectionalLight('#ffffff', 1.8);
    mainLight.position.set(3, 5, 4);
    this.scene.add(mainLight);

    // Lumière cyan provenant du socle
    this.hologramLight = new THREE.PointLight('#36daff', 12, 6, 2);

    this.hologramLight.position.set(0, 0.4, 0);
    this.scene.add(this.hologramLight);

    // Lumière cyan latérale
    const sideLight = new THREE.DirectionalLight('#36daff', 1.2);
    sideLight.position.set(-4, 2, 1);
    this.scene.add(sideLight);

    // Lumière bleutée à l'arrière du robot
    const backLight = new THREE.DirectionalLight('#247bff', 1.5);
    backLight.position.set(1, 3, -4);
    this.scene.add(backLight);
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

  // Effet Fresnel cyan sur les contours du robot
  createHologramEffect() {
    this.robot.traverse((child) => {
      if (!child.isMesh) return;

      const originalMaterials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      const hologramMaterials = originalMaterials.map((original) => {
        const material = original.clone();

        material.onBeforeCompile = (shader) => {
          shader.uniforms.hologramColor = {
            value: new THREE.Color('#36daff'),
          };

          shader.uniforms.hologramStrength = {
            value: 0.9,
          };

          // Variables pour calculer l'effet Fresnel
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>

            varying vec3 vHologramNormal;
            varying vec3 vHologramViewPosition;
            `,
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
            `
            #include <beginnormal_vertex>

            vHologramNormal = normalize(normalMatrix * objectNormal);
            `,
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `
            #include <project_vertex>

            vHologramViewPosition = -mvPosition.xyz;
            `,
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `
            #include <common>

            varying vec3 vHologramNormal;
            varying vec3 vHologramViewPosition;

            uniform vec3 hologramColor;
            uniform float hologramStrength;
            `,
          );

          // Émission cyan sur les contours
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `
            #include <emissivemap_fragment>

            vec3 hologramNormal = normalize(vHologramNormal);
            vec3 hologramView = normalize(vHologramViewPosition);

            float fresnel = pow(
              1.0 - abs(dot(hologramNormal, hologramView)),
              3.0
            );

            totalEmissiveRadiance +=
              hologramColor * fresnel * hologramStrength;
            `,
          );
        };

        material.customProgramCacheKey = () => 'robot-fresnel-v2';
        material.needsUpdate = true;

        return material;
      });

      child.material = Array.isArray(child.material)
        ? hologramMaterials
        : hologramMaterials[0];
    });
  }

  loadRobot() {
    const loader = new GLTFLoader();

    loader.load(
      'assets/models/robot.glb',

      (gltf) => {
        this.robot = gltf.scene;

        // Ajouter l'effet holographique
        this.createHologramEffect();

        // Dimensions initiales
        const bounds = new THREE.Box3().setFromObject(this.robot);
        const size = bounds.getSize(new THREE.Vector3());

        // Taille du robot
        const targetHeight = 3;

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

        // Positionnement au-dessus du socle
        this.robot.position.y -= finalBounds.min.y;
        this.robot.position.y += 0.25;

        // Position de référence pour le flottement
        this.robotBaseY = this.robot.position.y;

        // Ajouter le robot au groupe interactif
        this.robotGroup.add(this.robot);

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

  onPointerDown(event) {
    // Rotation avec le clic gauche uniquement
    if (event.button !== 0 || this.isDragging) return;

    this.isDragging = true;
    this.activePointerId = event.pointerId;

    this.previousPointer.set(event.clientX, event.clientY);

    this.element.setPointerCapture(event.pointerId);
  }

  onPointerUp(event) {
    if (
      this.activePointerId !== null &&
      event.pointerId !== this.activePointerId
    ) {
      return;
    }

    this.isDragging = false;
    this.activePointerId = null;

    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }
  }

  onMouseMove(event) {
    const bounds = this.element.getBoundingClientRect();

    // Interaction douce avec la souris
    this.targetMouse.x =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

    this.targetMouse.y =
      ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    // Rotation du robot pendant le clic
    if (this.isDragging && event.pointerId === this.activePointerId) {
      const deltaX = event.clientX - this.previousPointer.x;
      const deltaY = event.clientY - this.previousPointer.y;

      // Rotation horizontale complète
      this.targetRotation.x += deltaX * 0.008;

      // Inclinaison verticale limitée
      this.targetRotation.y += deltaY * 0.005;

      this.targetRotation.y = THREE.MathUtils.clamp(
        this.targetRotation.y,
        -0.4,
        0.4,
      );

      this.previousPointer.set(event.clientX, event.clientY);
    }
  }

  onMouseLeave() {
    if (!this.isDragging) {
      this.targetMouse.set(0, 0);
    }
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

    // Pulsation de la lumière cyan du socle
    this.hologramLight.intensity = 10 + Math.sin(elapsed * 1.5) * 2;

    // Rotation interactive fluide
    this.currentRotation.lerp(this.targetRotation, 0.08);

    this.robotGroup.rotation.y = this.currentRotation.x;
    this.robotGroup.rotation.x = this.currentRotation.y;

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
