export class AssetManager {
  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.cache = new Map();
    this.loaded = false;
    this.toLoad = 0;
    this.loadedCount = 0;
    this.failedAssets = new Map();
    this.loadingPromises = new Map();
    this.progressCallbacks = [];
    this.completionCallbacks = [];
    this.lazyLoadQueue = [];
    this.processingLazyLoad = false;
    this.timeoutMs = 10000; // 10 second timeout per asset
    this.startTime = null;
    this.hasTimeout = false;
  }

  loadImage(name, src, options = {}) {
    // Check if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    // Check cache
    if (this.cache.has(name) && !options.forceReload) {
      return Promise.resolve(this.cache.get(name));
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId = null;
      
      // Set timeout
      if (this.timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          this.hasTimeout = true;
          console.warn(`Asset loading timeout: ${name}`);
          this.failedAssets.set(name, { src, error: 'Loading timeout' });
          this.loadedCount++;
          this.updateProgress();
          
          if (this.loadedCount >= this.toLoad && this.toLoad > 0) {
            this.loaded = true;
            this.notifyCompletion();
          }
          
          this.loadingPromises.delete(name);
          reject(new Error(`Asset loading timeout: ${name}`));
        }, this.timeoutMs);
      }
      
      img.onload = () => {
        if (timeoutId) clearTimeout(timeoutId);
        this.images.set(name, img);
        this.cache.set(name, img);
        this.loadedCount++;
        this.failedAssets.delete(name);
        this.updateProgress();
        
        if (this.loadedCount >= this.toLoad && this.toLoad > 0) {
          this.loaded = true;
          this.notifyCompletion();
        }
        
        this.loadingPromises.delete(name);
        resolve(img);
      };
      
      img.onerror = () => {
        if (timeoutId) clearTimeout(timeoutId);
        this.failedAssets.set(name, { src, error: 'Failed to load image' });
        this.loadedCount++;
        this.updateProgress();
        
        if (this.loadedCount >= this.toLoad && this.toLoad > 0) {
          this.loaded = true;
          this.notifyCompletion();
        }
        
        this.loadingPromises.delete(name);
        reject(new Error(`Failed to load image: ${name}`));
      };
      
      img.src = src;
    });

    this.loadingPromises.set(name, promise);
    return promise;
  }

  loadImages(imageList) {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    
    this.toLoad += imageList.length;
    const promises = imageList.map(({ name, src, options }) => 
      this.loadImage(name, src, options).catch(err => {
        console.warn(`Failed to load ${name}:`, err);
        return null;
      })
    );
    return Promise.all(promises);
  }

  getImage(name) {
    return this.images.get(name);
  }

  getCachedImage(name) {
    return this.cache.get(name);
  }

  isLoaded() {
    return this.loaded;
  }

  getProgress() {
    if (this.toLoad === 0) return 1;
    return this.loadedCount / this.toLoad;
  }

  getElapsedTime() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  setTimeout(ms) {
    this.timeoutMs = ms;
  }

  onProgress(callback) {
    this.progressCallbacks.push(callback);
    callback(this.getProgress(), this.loadedCount, this.toLoad);
    
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  onComplete(callback) {
    this.completionCallbacks.push(callback);
    
    if (this.loaded) {
      callback();
    }
    
    return () => {
      const index = this.completionCallbacks.indexOf(callback);
      if (index > -1) {
        this.completionCallbacks.splice(index, 1);
      }
    };
  }

  updateProgress() {
    const progress = this.getProgress();
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress, this.loadedCount, this.toLoad);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  notifyCompletion() {
    this.completionCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in completion callback:', error);
      }
    });
  }

  queueLazyLoad(name, src, options = {}) {
    this.lazyLoadQueue.push({ name, src, options });
  }

  processLazyLoad() {
    if (this.processingLazyLoad || this.lazyLoadQueue.length === 0) return;
    
    this.processingLazyLoad = true;
    
    const loadNext = () => {
      if (this.lazyLoadQueue.length === 0) {
        this.processingLazyLoad = false;
        return;
      }
      
      const item = this.lazyLoadQueue.shift();
      this.loadImage(item.name, item.src, item.options)
        .then(() => {
          // Small delay between loads to not block main thread
          setTimeout(loadNext, 50);
        })
        .catch(() => {
          setTimeout(loadNext, 50);
        });
    };
    
    loadNext();
  }

  getFailedAssets() {
    return new Map(this.failedAssets);
  }

  clearCache() {
    this.cache.clear();
  }

  clearAsset(name) {
    this.images.delete(name);
    this.cache.delete(name);
    this.failedAssets.delete(name);
  }

  retryFailed(name) {
    const failed = this.failedAssets.get(name);
    if (failed) {
      this.failedAssets.delete(name);
      return this.loadImage(name, failed.src, { forceReload: true });
    }
    return Promise.reject(new Error(`No failed asset found: ${name}`));
  }

  reset() {
    this.images.clear();
    this.sounds.clear();
    this.cache.clear();
    this.loaded = false;
    this.toLoad = 0;
    this.loadedCount = 0;
    this.failedAssets.clear();
    this.loadingPromises.clear();
    this.progressCallbacks = [];
    this.completionCallbacks = [];
    this.lazyLoadQueue = [];
    this.processingLazyLoad = false;
    this.startTime = null;
    this.hasTimeout = false;
  }

  getStats() {
    return {
      totalImages: this.images.size,
      cachedImages: this.cache.size,
      failedAssets: this.failedAssets.size,
      loadingAssets: this.loadingPromises.size,
      queuedLazyLoads: this.lazyLoadQueue.length,
      progress: this.getProgress(),
      loaded: this.loaded,
      elapsedTime: this.getElapsedTime(),
      hasTimeout: this.hasTimeout
    };
  }
}
