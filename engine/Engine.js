import { TransitionManager } from './effects.js';
import { TimeManager } from './TimeManager.js';
import { AnimationManager } from './AnimationManager.js';
import { EventBus } from './EventBus.js';
import { ConfigManager } from './Config.js';
import { DebugManager } from './Debug.js';

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
    
    // New systems
    this.time = new TimeManager();
    this.animations = new AnimationManager();
    this.events = new EventBus();
    this.config = new ConfigManager();
    this.debug = new DebugManager();
    
    // Set default config
    this.config.setDefaults({
      debug: {
        enabled: false,
        showFPS: false,
        showCollisions: false,
        showHitboxes: false
      },
      audio: {
        masterVolume: 1.0,
        musicVolume: 0.5,
        sfxVolume: 0.7
      },
      video: {
        vsync: true,
        targetFPS: 60
      }
    });
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

    // Cap delta time to prevent spiral of death
    const cappedDelta = Math.min(deltaTime, 100);
    this.accumulator += cappedDelta;

    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }

    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    this.debug.startFrame();
    this.time.update(dt);
    this.animations.update(dt);
    this.transitions.update(dt);
    
    if (this.currentScene) {
      this.currentScene.update(dt);
      this.debug.recordUpdate();
    }
    
    this.debug.endFrame();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const shakeOffset = this.transitions.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shakeOffset.x, shakeOffset.y);
    
    if (this.currentScene) {
      this.currentScene.render(this.ctx);
      this.debug.recordRender();
    }
    
    this.ctx.restore();
    
    this.transitions.render(this.ctx, this.width, this.height);
    
    // Render debug info
    if (this.debug.isEnabled()) {
      const assetsInfo = window.assets ? window.assets.getStats() : null;
      this.debug.renderDebugInfo(this.ctx, this.width, this.height, this.time.getFPS(), this.currentScene, assetsInfo);
    }
  }

  addScene(name, scene) {
    this.scenes.set(name, scene);
  }

  switchScene(name, transition = null) {
    if (!this.scenes.has(name)) return;

    const targetScene = this.scenes.get(name);

    if (transition) {
      // Handle scene transition
      this.transitions.fadeOut(transition.duration || 0.5, () => {
        if (this.currentScene) {
          this.currentScene.onExit();
        }
        this.currentScene = targetScene;
        this.currentScene.onEnter();
        this.transitions.fadeIn(transition.duration || 0.5);
      }, transition.color || '#000000');
    } else {
      // Immediate switch
      if (this.currentScene) {
        this.currentScene.onExit();
      }
      this.currentScene = targetScene;
      this.currentScene.onEnter();
    }
    
    this.events.emit('sceneChanged', { from: this.currentScene, to: name });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.events.emit('resize', { width, height });
  }

  toggleDebug() {
    this.debug.toggle();
    this.config.set('debug.enabled', this.debug.isEnabled());
    return this.debug.isEnabled();
  }

  getDebug() {
    return this.debug;
  }

  getTime() {
    return this.time;
  }

  getAnimations() {
    return this.animations;
  }

  getEvents() {
    return this.events;
  }

  getConfig() {
    return this.config;
  }
}
