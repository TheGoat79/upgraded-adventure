export class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.timer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  shake(intensity, duration) {
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;
  }

  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      
      if (this.timer > 0) {
        const progress = this.timer / this.duration;
        const currentIntensity = this.intensity * progress;
        
        this.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
        this.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
      } else {
        this.offsetX = 0;
        this.offsetY = 0;
      }
    }
  }

  getOffset() {
    return { x: this.offsetX, y: this.offsetY };
  }

  isShaking() {
    return this.timer > 0;
  }
}

export class FadeTransition {
  constructor() {
    this.fading = false;
    this.fadeIn = false;
    this.alpha = 0;
    this.duration = 0.5;
    this.timer = 0;
    this.callback = null;
    this.color = '#000000';
  }

  fadeInTransition(duration, callback, color = '#000000') {
    this.fading = true;
    this.fadeIn = true;
    this.alpha = 1;
    this.duration = duration;
    this.timer = duration;
    this.callback = callback;
    this.color = color;
  }

  fadeOutTransition(duration, callback, color = '#000000') {
    this.fading = true;
    this.fadeIn = false;
    this.alpha = 0;
    this.duration = duration;
    this.timer = duration;
    this.callback = callback;
    this.color = color;
  }

  update(dt) {
    if (this.fading) {
      this.timer -= dt;
      
      if (this.timer <= 0) {
        this.timer = 0;
        this.fading = false;
        
        if (this.callback) {
          this.callback();
          this.callback = null;
        }
      } else {
        const progress = this.timer / this.duration;
        this.alpha = this.fadeIn ? progress : 1 - progress;
      }
    }
  }

  render(ctx, width, height) {
    if (this.fading || this.alpha > 0) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }
  }

  isFading() {
    return this.fading;
  }
}

export class TransitionManager {
  constructor() {
    this.screenShake = new ScreenShake();
    this.fadeTransition = new FadeTransition();
  }

  shake(intensity, duration) {
    this.screenShake.shake(intensity, duration);
  }

  fadeIn(duration, callback, color) {
    this.fadeTransition.fadeInTransition(duration, callback, color);
  }

  fadeOut(duration, callback, color) {
    this.fadeTransition.fadeOutTransition(duration, callback, color);
  }

  update(dt) {
    this.screenShake.update(dt);
    this.fadeTransition.update(dt);
  }

  render(ctx, width, height) {
    this.fadeTransition.render(ctx, width, height);
  }

  getShakeOffset() {
    return this.screenShake.getOffset();
  }

  isShaking() {
    return this.screenShake.isShaking();
  }

  isFading() {
    return this.fadeTransition.isFading();
  }
}
