export default class BackgroundNetwork {
  constructor(element) {
    this.element = element;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.element.appendChild(this.canvas);

    this.circuits = [];
    this.mouse = { x: -1000, y: -1000 };

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.element);

    window.addEventListener('pointermove', this.onMouseMove);
    window.addEventListener('pointerleave', this.onMouseLeave);

    this.resize();
    this.animate();
  }

  resize() {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    if (!width || !height) return;

    this.width = width;
    this.height = height;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.createCircuits();
  }

  createCircuits() {
    this.circuits = [];

    const spacing = 110;
    const columns = Math.ceil(this.width / spacing);
    const rows = Math.ceil(this.height / spacing);

    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= columns; x++) {
        if (Math.random() > 0.4) continue;

        const startX = x * spacing;
        const startY = y * spacing;

        const direction = Math.random() > 0.5 ? 1 : -1;

        const points = [
          { x: startX, y: startY },
          { x: startX + spacing * direction, y: startY },
          {
            x: startX + spacing * direction,
            y: startY + spacing,
          },
        ];

        this.circuits.push({
          points,
          progress: Math.random(),
          speed: 0.00008 + Math.random() * 0.00008,
        });
      }
    }
  }

  onMouseMove(event) {
    const rect = this.element.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      this.onMouseLeave();
      return;
    }

    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  animate(time = 0) {
    this.animationFrame = requestAnimationFrame(this.animate);

    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    this.circuits.forEach((circuit) => {
      const points = circuit.points;

      // Distance entre la souris et le circuit
      const dx = points[1].x - this.mouse.x;
      const dy = points[1].y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const opacity = distance < 160 ? 0.3 : 0.09;

      // Dessiner les lignes du circuit
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      points.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      ctx.strokeStyle = `rgba(54, 218, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Impulsion lumineuse animée
      const progress = (time * circuit.speed + circuit.progress) % 1;

      const segment = progress < 0.5 ? 0 : 1;
      const t = (progress * 2) % 1;

      const a = points[segment];
      const b = points[segment + 1];

      const pulseX = a.x + (b.x - a.x) * t;
      const pulseY = a.y + (b.y - a.y) * t;

      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);

      ctx.fillStyle = 'rgba(54, 218, 255, 0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#36daff';
      ctx.fill();

      ctx.shadowBlur = 0;
    });
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);

    this.resizeObserver.disconnect();

    window.removeEventListener('pointermove', this.onMouseMove);
    window.removeEventListener('pointerleave', this.onMouseLeave);

    this.canvas.remove();
  }
}
