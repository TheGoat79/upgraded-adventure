export class DebugManager {
  constructor() {
    this.enabled = false;
    this.debugDraw = false;
    this.showFPS = false;
    this.showCollisions = false;
    this.showHitboxes = false;
    this.logEvents = false;
    this.timeScale = 1.0;
    this.profiler = {
      enabled: false,
      frameTime: 0,
      updateCount: 0,
      renderCount: 0,
      customMetrics: new Map()
    };
    this.watchList = new Map();
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  setDebugDraw(enabled) {
    this.debugDraw = enabled;
  }

  setShowFPS(enabled) {
    this.showFPS = enabled;
  }

  setShowCollisions(enabled) {
    this.showCollisions = enabled;
  }

  setShowHitboxes(enabled) {
    this.showHitboxes = enabled;
  }

  setLogEvents(enabled) {
    this.logEvents = enabled;
  }

  setTimeScale(scale) {
    this.timeScale = Math.max(0, Math.min(10, scale));
  }

  enableProfiler() {
    this.profiler.enabled = true;
  }

  disableProfiler() {
    this.profiler.enabled = false;
    this.profiler.frameTime = 0;
    this.profiler.updateCount = 0;
    this.profiler.renderCount = 0;
    this.profiler.customMetrics.clear();
  }

  startFrame() {
    if (this.profiler.enabled) {
      this.profiler.frameStart = performance.now();
    }
  }

  endFrame() {
    if (this.profiler.enabled) {
      this.profiler.frameTime = performance.now() - this.profiler.frameStart;
    }
  }

  recordUpdate() {
    if (this.profiler.enabled) {
      this.profiler.updateCount++;
    }
  }

  recordRender() {
    if (this.profiler.enabled) {
      this.profiler.renderCount++;
    }
  }

  addMetric(name, value) {
    if (this.profiler.enabled) {
      this.profiler.customMetrics.set(name, value);
    }
  }

  getMetric(name) {
    return this.profiler.customMetrics.get(name);
  }

  watch(name, value) {
    this.watchList.set(name, value);
  }

  unwatch(name) {
    this.watchList.delete(name);
  }

  getWatchList() {
    return new Map(this.watchList);
  }

  getProfilerData() {
    if (!this.profiler.enabled) return null;
    
    return {
      frameTime: this.profiler.frameTime,
      fps: 1000 / this.profiler.frameTime,
      updateCount: this.profiler.updateCount,
      renderCount: this.profiler.renderCount,
      customMetrics: new Map(this.profiler.customMetrics)
    };
  }

  resetProfiler() {
    this.profiler.frameTime = 0;
    this.profiler.updateCount = 0;
    this.profiler.renderCount = 0;
    this.profiler.customMetrics.clear();
  }

  renderDebugInfo(ctx, width, height, fps, currentScene, assetsInfo) {
    if (!this.enabled) return;

    let y = 10;
    const lineHeight = 20;
    const padding = 10;
    const panelWidth = 300;

    // Draw debug panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(padding, padding, panelWidth, Math.max(150, this.watchList.size * lineHeight + 80));

    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // FPS
    if (this.showFPS) {
      ctx.fillText(`FPS: ${fps.toFixed(1)}`, padding * 2, y);
      y += lineHeight;
    }

    // Current scene
    if (currentScene) {
      ctx.fillText(`Scene: ${currentScene.constructor.name}`, padding * 2, y);
      y += lineHeight;
    }

    // Time scale
    if (this.timeScale !== 1.0) {
      ctx.fillText(`Time Scale: ${this.timeScale.toFixed(2)}x`, padding * 2, y);
      y += lineHeight;
    }

    // Debug flags
    ctx.fillText(`Debug Draw: ${this.debugDraw}`, padding * 2, y);
    y += lineHeight;
    ctx.fillText(`Show Collisions: ${this.showCollisions}`, padding * 2, y);
    y += lineHeight;
    ctx.fillText(`Show Hitboxes: ${this.showHitboxes}`, padding * 2, y);
    y += lineHeight;

    // Assets info
    if (assetsInfo) {
      ctx.fillText(`Assets: ${assetsInfo.totalImages} loaded`, padding * 2, y);
      y += lineHeight;
      if (assetsInfo.failedAssets > 0) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`Failed: ${assetsInfo.failedAssets}`, padding * 2, y);
        ctx.fillStyle = '#00ff00';
        y += lineHeight;
      }
    }

    // Memory info (if available)
    if (performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
      ctx.fillText(`Memory: ${usedMB}MB / ${totalMB}MB`, padding * 2, y);
      y += lineHeight;
    }

    // Watch list
    if (this.watchList.size > 0) {
      y += 10;
      ctx.fillStyle = '#ffff00';
      ctx.fillText('Watch List:', padding * 2, y);
      y += lineHeight;
      ctx.fillStyle = '#00ff00';
      
      this.watchList.forEach((value, name) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        ctx.fillText(`${name}: ${displayValue}`, padding * 2, y);
        y += lineHeight;
      });
    }

    // Profiler data
    if (this.profiler.enabled) {
      y += 10;
      ctx.fillStyle = '#ff00ff';
      ctx.fillText('Profiler:', padding * 2, y);
      y += lineHeight;
      ctx.fillStyle = '#00ff00';
      
      const profilerData = this.getProfilerData();
      if (profilerData) {
        ctx.fillText(`Frame Time: ${profilerData.frameTime.toFixed(2)}ms`, padding * 2, y);
        y += lineHeight;
        ctx.fillText(`FPS: ${profilerData.fps.toFixed(1)}`, padding * 2, y);
        y += lineHeight;
        ctx.fillText(`Updates: ${profilerData.updateCount}`, padding * 2, y);
        y += lineHeight;
        ctx.fillText(`Renders: ${profilerData.renderCount}`, padding * 2, y);
        y += lineHeight;
        
        profilerData.customMetrics.forEach((value, name) => {
          ctx.fillText(`${name}: ${value}`, padding * 2, y);
          y += lineHeight;
        });
      }
    }
  }

  renderCollisionDebug(ctx, objects) {
    if (!this.enabled || !this.showCollisions) return;

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    objects.forEach(obj => {
      if (obj.x !== undefined && obj.y !== undefined) {
        if (obj.width !== undefined && obj.height !== undefined) {
          // Rectangle
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.radius !== undefined) {
          // Circle
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
  }
}
