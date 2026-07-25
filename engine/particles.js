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

    for (let i = 0; i < count; i++) {
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
    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => !p.isDead());
  }

  render(ctx) {
    this.particles.forEach(p => p.render(ctx));
  }

  clear() {
    this.particles = [];
  }

  getCount() {
    return this.particles.length;
  }
}
