export class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.alpha = 1;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.alpha = this.life / this.maxLife;
  }

  render(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  isDead() {
    return this.life <= 0;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500; // Limit max particles for performance
  }

  emit(x, y, count, options = {}) {
    const {
      colors = ['#ffffff'],
      minSpeed = 50,
      maxSpeed = 200,
      minLife = 0.5,
      maxLife = 1.5,
      minSize = 2,
      maxSize = 5,
      direction = null,
      spread = Math.PI * 2
    } = options;

    // Don't emit if we're at max capacity
    if (this.particles.length >= this.maxParticles) {
      return;
    }

    // Adjust count to not exceed max
    const adjustedCount = Math.min(count, this.maxParticles - this.particles.length);

    for (let i = 0; i < adjustedCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const life = minLife + Math.random() * (maxLife - minLife);
      const size = minSize + Math.random() * (maxSize - minSize);
      
      let angle;
      if (direction !== null) {
        angle = direction + (Math.random() - 0.5) * spread;
      } else {
        angle = Math.random() * Math.PI * 2;
      }
      
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      this.particles.push(new Particle(x, y, vx, vy, life, color, size));
    }
  }

  update(dt) {
    const aliveParticles = [];
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.update(dt);
      if (!p.isDead()) {
        aliveParticles.push(p);
      }
    }
    this.particles = aliveParticles;
  }

  render(ctx) {
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      this.particles[i].render(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  getCount() {
    return this.particles.length;
  }

  setMaxParticles(max) {
    this.maxParticles = max;
    // Trim if current count exceeds new max
    if (this.particles.length > max) {
      this.particles = this.particles.slice(0, max);
    }
  }
}
