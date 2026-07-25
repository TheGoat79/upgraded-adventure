import { TransitionManager } from './effects.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 1000 / 60;
    this.currentScene = null;
    this.scenes = new Map();
    this.transitions = new TransitionManager();
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  loop() {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }

    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    this.transitions.update(dt);
    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const shakeOffset = this.transitions.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shakeOffset.x, shakeOffset.y);
    
    if (this.currentScene) {
      this.currentScene.render(this.ctx);
    }
    
    this.ctx.restore();
    
    this.transitions.render(this.ctx, this.width, this.height);
  }

  addScene(name, scene) {
    this.scenes.set(name, scene);
  }

  switchScene(name) {
    if (this.scenes.has(name)) {
      if (this.currentScene) {
        this.currentScene.onExit();
      }
      this.currentScene = this.scenes.get(name);
      this.currentScene.onEnter();
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
