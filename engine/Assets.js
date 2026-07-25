export class AssetManager {
  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.loaded = false;
    this.toLoad = 0;
    this.loadedCount = 0;
  }

  loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(name, img);
        this.loadedCount++;
        if (this.loadedCount >= this.toLoad) {
          this.loaded = true;
        }
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  loadImages(imageList) {
    this.toLoad += imageList.length;
    const promises = imageList.map(({ name, src }) => this.loadImage(name, src));
    return Promise.all(promises);
  }

  getImage(name) {
    return this.images.get(name);
  }

  isLoaded() {
    return this.loaded;
  }

  getProgress() {
    if (this.toLoad === 0) return 1;
    return this.loadedCount / this.toLoad;
  }
}
