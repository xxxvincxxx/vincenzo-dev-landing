/* Antigravity — vanilla Canvas 2D port of react-bits' <Antigravity /> (JS-CSS variant).
   Same particle math as the original (magnet ring, wave, pulse, depth projection),
   without the three.js + react-three-fiber dependency. */

class Antigravity {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.opts = {
      count: 300,
      magnetRadius: 10,
      ringRadius: 10,
      waveSpeed: 0.4,
      waveAmplitude: 1,
      particleSize: 2,
      lerpSpeed: 0.1,
      color: "#FF9FFC",
      autoAnimate: false,
      particleVariance: 1,
      rotationSpeed: 0,
      depthFactor: 1,
      pulseSpeed: 3,
      particleShape: "capsule",
      fieldStrength: 10,
      ...options
    };

    // Same camera as the original: z = 50, fov 35°.
    this.cameraZ = 50;
    this.worldHeight = 2 * this.cameraZ * Math.tan((35 * Math.PI) / 360);

    this.pointer = { x: 0, y: 0 };          // NDC, -1..1
    this.virtualMouse = { x: 0, y: 0 };     // world units
    this.lastMouseMove = 0;
    this.startTime = performance.now();
    this.raf = 0;

    this.resize();
    this.spawnParticles();

    this.onResize = () => this.resize();
    this.onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.lastMouseMove = Date.now();
    };

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove);

    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, rect.width * dpr);
    this.canvas.height = Math.max(1, rect.height * dpr);
    this.dpr = dpr;
    this.pxPerUnit = this.canvas.height / this.worldHeight;
    this.worldWidth = this.canvas.width / this.pxPerUnit;
  }

  spawnParticles() {
    const { count } = this.opts;
    const w = this.worldWidth || 100;
    const h = this.worldHeight || 100;
    this.particles = Array.from({ length: count }, () => ({
      t: Math.random() * 100,
      speed: 0.01 + Math.random() / 200,
      mx: (Math.random() - 0.5) * w,
      my: (Math.random() - 0.5) * h,
      mz: (Math.random() - 0.5) * 20,
      cx: 0, cy: 0, cz: 0,
      randomRadiusOffset: (Math.random() - 0.5) * 2
    }));
    for (const p of this.particles) {
      p.cx = p.mx; p.cy = p.my; p.cz = p.mz;
    }
  }

  loop() {
    const o = this.opts;
    const ctx = this.ctx;
    const elapsed = (performance.now() - this.startTime) / 1000;

    let destX = (this.pointer.x * this.worldWidth) / 2;
    let destY = (this.pointer.y * this.worldHeight) / 2;

    if (o.autoAnimate && Date.now() - this.lastMouseMove > 2000) {
      destX = Math.sin(elapsed * 0.5) * (this.worldWidth / 4);
      destY = Math.cos(elapsed * 1.0) * (this.worldHeight / 4);
    }

    this.virtualMouse.x += (destX - this.virtualMouse.x) * 0.05;
    this.virtualMouse.y += (destY - this.virtualMouse.y) * 0.05;

    const targetX = this.virtualMouse.x;
    const targetY = this.virtualMouse.y;
    const globalRotation = elapsed * o.rotationSpeed;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = o.color;
    ctx.strokeStyle = o.color;
    ctx.lineCap = "round";

    const cx0 = this.canvas.width / 2;
    const cy0 = this.canvas.height / 2;

    for (const p of this.particles) {
      p.t += p.speed / 2;
      const t = p.t;

      // Project the mouse into this particle's depth plane (as the original does).
      const projectionFactor = 1 - p.cz / this.cameraZ;
      const ptx = targetX * projectionFactor;
      const pty = targetY * projectionFactor;

      const dx = p.mx - ptx;
      const dy = p.my - pty;
      const dist = Math.hypot(dx, dy);

      let tx = p.mx, ty = p.my, tz = p.mz * o.depthFactor;

      if (dist < o.magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * o.waveSpeed + angle) * (0.5 * o.waveAmplitude);
        const deviation = p.randomRadiusOffset * (5 / (o.fieldStrength + 0.1));
        const ringR = o.ringRadius + wave + deviation;

        tx = ptx + ringR * Math.cos(angle);
        ty = pty + ringR * Math.sin(angle);
        tz = p.mz * o.depthFactor + Math.sin(t) * (o.waveAmplitude * o.depthFactor);
      }

      p.cx += (tx - p.cx) * o.lerpSpeed;
      p.cy += (ty - p.cy) * o.lerpSpeed;
      p.cz += (tz - p.cz) * o.lerpSpeed;

      // Scale: fade out particles far from the ring, pulse the ones on it.
      const distToMouse = Math.hypot(p.cx - ptx, p.cy - pty);
      const distFromRing = Math.abs(distToMouse - o.ringRadius);
      let scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing / 10));
      const finalScale =
        scaleFactor * (0.8 + Math.sin(t * o.pulseSpeed) * 0.2 * o.particleVariance) * o.particleSize;

      if (finalScale <= 0.01) continue;

      // Perspective projection to screen space.
      const persp = this.cameraZ / (this.cameraZ - p.cz);
      const sx = cx0 + p.cx * persp * this.pxPerUnit;
      const sy = cy0 - p.cy * persp * this.pxPerUnit;
      const s = finalScale * persp * this.pxPerUnit;

      if (o.particleShape === "capsule") {
        // Capsule oriented radially toward the cursor (lookAt + rotateX in the original).
        const a = Math.atan2(p.cy - pty, p.cx - ptx);
        const half = 0.2 * s; // capsule cylinder half-length (0.4 geometry * scale / 2)
        const nx = Math.cos(a), ny = -Math.sin(a);
        ctx.lineWidth = 0.2 * s;
        ctx.beginPath();
        ctx.moveTo(sx - nx * half, sy - ny * half);
        ctx.lineTo(sx + nx * half, sy + ny * half);
        ctx.stroke();
      } else if (o.particleShape === "box") {
        ctx.fillRect(sx - 0.15 * s, sy - 0.15 * s, 0.3 * s, 0.3 * s);
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, 0.2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.raf = requestAnimationFrame(this.loop);
  }
}

window.Antigravity = Antigravity;
