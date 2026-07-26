export class Animation {
  constructor(options = {}) {
    this.duration = options.duration || 1.0;
    this.easing = options.easing || 'linear';
    this.delay = options.delay || 0;
    this.loop = options.loop || false;
    this.reverse = options.reverse || false;
    this.yoyo = options.yoyo || false;
    this.onUpdate = options.onUpdate || null;
    this.onComplete = options.onComplete || null;
    this.onStart = options.onStart || null;
    
    this.elapsed = 0;
    this.delayElapsed = 0;
    this.playing = false;
    this.completed = false;
    this.reversed = false;
    this.started = false;
  }

  play() {
    this.playing = true;
    this.completed = false;
    this.started = false;
    this.elapsed = 0;
    this.delayElapsed = 0;
  }

  pause() {
    this.playing = false;
  }

  stop() {
    this.playing = false;
    this.elapsed = 0;
    this.delayElapsed = 0;
    this.completed = false;
    this.started = false;
  }

  reset() {
    this.elapsed = 0;
    this.delayElapsed = 0;
    this.completed = false;
    this.started = false;
    this.reversed = false;
  }

  update(dt) {
    if (!this.playing || this.completed) return;

    // Handle delay
    if (this.delayElapsed < this.delay) {
      this.delayElapsed += dt;
      if (this.delayElapsed >= this.delay) {
        this.started = true;
        if (this.onStart) this.onStart();
      }
      return;
    }

    this.elapsed += dt;

    // Check if animation is complete
    if (this.elapsed >= this.duration) {
      if (this.loop) {
        if (this.yoyo) {
          this.reversed = !this.reversed;
        }
        this.elapsed = 0;
      } else {
        this.elapsed = this.duration;
        this.completed = true;
        this.playing = false;
        if (this.onComplete) this.onComplete();
      }
    }

    // Calculate progress
    let progress = this.elapsed / this.duration;
    if (this.reversed) {
      progress = 1 - progress;
    }

    // Apply easing
    const easedProgress = this.applyEasing(progress);

    if (this.onUpdate) {
      this.onUpdate(easedProgress);
    }
  }

  applyEasing(progress) {
    switch (this.easing) {
      case 'linear':
        return progress;
      case 'easeInQuad':
        return progress * progress;
      case 'easeOutQuad':
        return progress * (2 - progress);
      case 'easeInOutQuad':
        return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      case 'easeInCubic':
        return progress * progress * progress;
      case 'easeOutCubic':
        return (--progress) * progress * progress + 1;
      case 'easeInOutCubic':
        return progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
      case 'easeInElastic':
        return this.easeInElastic(progress);
      case 'easeOutElastic':
        return this.easeOutElastic(progress);
      case 'easeInOutElastic':
        return progress < 0.5 ? this.easeInElastic(progress * 2) / 2 : this.easeOutElastic(progress * 2 - 1) / 2 + 0.5;
      case 'easeInBounce':
        return this.easeInBounce(progress);
      case 'easeOutBounce':
        return this.easeOutBounce(progress);
      case 'easeInOutBounce':
        return progress < 0.5 ? this.easeInBounce(progress * 2) / 2 : this.easeOutBounce(progress * 2 - 1) / 2 + 0.5;
      default:
        return progress;
    }
  }

  easeInElastic(progress) {
    const c4 = (2 * Math.PI) / 3;
    return progress === 0 ? 0 : progress === 1 ? 1 : -Math.pow(2, 10 * progress - 10) * Math.sin((progress * 10 - 10.75) * c4);
  }

  easeOutElastic(progress) {
    const c4 = (2 * Math.PI) / 3;
    return progress === 0 ? 0 : progress === 1 ? 1 : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
  }

  easeInBounce(progress) {
    return 1 - this.easeOutBounce(1 - progress);
  }

  easeOutBounce(progress) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (progress < 1 / d1) {
      return n1 * progress * progress;
    } else if (progress < 2 / d1) {
      return n1 * (progress -= 1.5 / d1) * progress + 0.75;
    } else if (progress < 2.5 / d1) {
      return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
    } else {
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
    }
  }

  isPlaying() {
    return this.playing;
  }

  isCompleted() {
    return this.completed;
  }
}

export class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.animationIdCounter = 0;
  }

  create(options) {
    const animation = new Animation(options);
    const id = this.animationIdCounter++;
    this.animations.set(id, animation);
    return { animation, id };
  }

  play(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.play();
    }
  }

  pause(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.pause();
    }
  }

  stop(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.stop();
    }
  }

  remove(id) {
    this.animations.delete(id);
  }

  update(dt) {
    this.animations.forEach((animation, id) => {
      animation.update(dt);
      if (animation.isCompleted() && !animation.loop) {
        this.remove(id);
      }
    });
  }

  clear() {
    this.animations.clear();
  }

  getCount() {
    return this.animations.size;
  }
}
