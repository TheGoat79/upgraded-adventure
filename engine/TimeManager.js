export class TimeManager {
  constructor() {
    this.timeScale = 1.0;
    this.deltaTime = 0;
    this.unscaledDeltaTime = 0;
    this.elapsedTime = 0;
    this.unscaledElapsedTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTimer = 0;
    this.fpsFrameCount = 0;
  }

  setTimeScale(scale) {
    this.timeScale = Math.max(0, Math.min(10, scale));
  }

  getTimeScale() {
    return this.timeScale;
  }

  update(dt) {
    this.unscaledDeltaTime = dt;
    this.deltaTime = dt * this.timeScale;
    this.elapsedTime += this.deltaTime;
    this.unscaledElapsedTime += dt;
    this.frameCount++;

    // FPS calculation
    this.fpsFrameCount++;
    this.fpsUpdateTimer += dt;
    if (this.fpsUpdateTimer >= 1.0) {
      this.fps = this.fpsFrameCount;
      this.fpsFrameCount = 0;
      this.fpsUpdateTimer = 0;
    }
  }

  getFPS() {
    return this.fps;
  }

  getDeltaTime() {
    return this.deltaTime;
  }

  getUnscaledDeltaTime() {
    return this.unscaledDeltaTime;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  getFrameCount() {
    return this.frameCount;
  }

  reset() {
    this.timeScale = 1.0;
    this.deltaTime = 0;
    this.unscaledDeltaTime = 0;
    this.elapsedTime = 0;
    this.unscaledElapsedTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTimer = 0;
    this.fpsFrameCount = 0;
  }
}
