/**
 * Assets.js - Asset Manager
 * Handles loading and caching of images, sounds, and fonts
 */

export class AssetManager {
    constructor() {
        // Asset caches
        this.images = new Map();
        this.sounds = new Map();
        this.fonts = new Map();
        
        // Loading state
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.isLoading = false;
        
        // Load queue
        this.loadQueue = [];
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
    }
    
    /**
     * Load an image
     */
    loadImage(url, id = null) {
        const assetId = id || url;
        
        // Return cached image if already loaded
        if (this.images.has(assetId)) {
            return Promise.resolve(this.images.get(assetId));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.images.set(assetId, img);
                this._onAssetLoaded();
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                this._onAssetLoaded();
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }
    
    /**
     * Load multiple images
     */
    loadImages(imageList) {
        const promises = imageList.map(({ url, id }) => this.loadImage(url, id));
        return Promise.all(promises);
    }
    
    /**
     * Get loaded image
     */
    getImage(id) {
        return this.images.get(id);
    }
    
    /**
     * Check if image is loaded
     */
    hasImage(id) {
        return this.images.has(id);
    }
    
    /**
     * Load a sound
     */
    loadSound(url, id = null) {
        const assetId = id || url;
        
        // Return cached sound if already loaded
        if (this.sounds.has(assetId)) {
            return Promise.resolve(this.sounds.get(assetId));
        }
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            
            audio.oncanplaythrough = () => {
                this.sounds.set(assetId, audio);
                this._onAssetLoaded();
                resolve(audio);
            };
            
            audio.onerror = () => {
                console.error(`Failed to load sound: ${url}`);
                this._onAssetLoaded();
                reject(new Error(`Failed to load sound: ${url}`));
            };
            
            audio.src = url;
            audio.load();
        });
    }
    
    /**
     * Load multiple sounds
     */
    loadSounds(soundList) {
        const promises = soundList.map(({ url, id }) => this.loadSound(url, id));
        return Promise.all(promises);
    }
    
    /**
     * Get loaded sound
     */
    getSound(id) {
        return this.sounds.get(id);
    }
    
    /**
     * Check if sound is loaded
     */
    hasSound(id) {
        return this.sounds.has(id);
    }
    
    /**
     * Load a font
     */
    loadFont(fontFamily, url) {
        // Return cached font if already loaded
        if (this.fonts.has(fontFamily)) {
            return Promise.resolve(this.fonts.get(fontFamily));
        }
        
        return new Promise((resolve, reject) => {
            const fontFace = new FontFace(fontFamily, `url(${url})`);
            
            fontFace.load().then((loadedFont) => {
                document.fonts.add(loadedFont);
                this.fonts.set(fontFamily, loadedFont);
                this._onAssetLoaded();
                resolve(loadedFont);
            }).catch((error) => {
                console.error(`Failed to load font: ${fontFamily}`, error);
                this._onAssetLoaded();
                reject(error);
            });
        });
    }
    
    /**
     * Load multiple fonts
     */
    loadFonts(fontList) {
        const promises = fontList.map(({ family, url }) => this.loadFont(family, url));
        return Promise.all(promises);
    }
    
    /**
     * Get loaded font
     */
    getFont(family) {
        return this.fonts.get(family);
    }
    
    /**
     * Check if font is loaded
     */
    hasFont(family) {
        return this.fonts.has(family);
    }
    
    /**
     * Load all assets from a manifest
     */
    async loadManifest(manifest) {
        this.isLoading = true;
        this.loadedAssets = 0;
        this.totalAssets = 0;
        
        // Count total assets
        if (manifest.images) this.totalAssets += manifest.images.length;
        if (manifest.sounds) this.totalAssets += manifest.sounds.length;
        if (manifest.fonts) this.totalAssets += manifest.fonts.length;
        
        // Load all assets
        const promises = [];
        
        if (manifest.images) {
            promises.push(this.loadImages(manifest.images));
        }
        
        if (manifest.sounds) {
            promises.push(this.loadSounds(manifest.sounds));
        }
        
        if (manifest.fonts) {
            promises.push(this.loadFonts(manifest.fonts));
        }
        
        try {
            await Promise.all(promises);
            this.isLoading = false;
            
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
        } catch (error) {
            console.error('Failed to load manifest:', error);
            this.isLoading = false;
            throw error;
        }
    }
    
    /**
     * Called when an asset is loaded
     */
    _onAssetLoaded() {
        this.loadedAssets++;
        
        if (this.onProgressCallback) {
            this.onProgressCallback(this.loadedAssets, this.totalAssets);
        }
    }
    
    /**
     * Get load progress (0-1)
     */
    getLoadProgress() {
        if (this.totalAssets === 0) return 1;
        return this.loadedAssets / this.totalAssets;
    }
    
    /**
     * Set progress callback
     */
    onProgress(callback) {
        this.onProgressCallback = callback;
    }
    
    /**
     * Set complete callback
     */
    onComplete(callback) {
        this.onCompleteCallback = callback;
    }
    
    /**
     * Create a sprite sheet from an image
     */
    createSpriteSheet(imageId, frameWidth, frameHeight) {
        const image = this.getImage(imageId);
        if (!image) {
            throw new Error(`Image not found: ${imageId}`);
        }
        
        const frames = [];
        const columns = Math.floor(image.width / frameWidth);
        const rows = Math.floor(image.height / frameHeight);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                frames.push({
                    x: col * frameWidth,
                    y: row * frameHeight,
                    width: frameWidth,
                    height: frameHeight
                });
            }
        }
        
        return {
            image,
            frameWidth,
            frameHeight,
            frames,
            columns,
            rows
        };
    }
    
    /**
     * Get a frame from a sprite sheet
     */
    getSpriteFrame(spriteSheet, frameIndex) {
        if (frameIndex < 0 || frameIndex >= spriteSheet.frames.length) {
            return null;
        }
        
        return spriteSheet.frames[frameIndex];
    }
    
    /**
     * Preload assets for a game
     */
    async preloadGameAssets(gameAssets) {
        return this.loadManifest(gameAssets);
    }
    
    /**
     * Clear all cached assets
     */
    clearCache() {
        this.images.clear();
        this.sounds.clear();
        this.fonts.clear();
        this.loadedAssets = 0;
        this.totalAssets = 0;
    }
    
    /**
     * Clear specific asset type
     */
    clearImages() {
        this.images.clear();
    }
    
    clearSounds() {
        this.sounds.clear();
    }
    
    clearFonts() {
        this.fonts.clear();
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            images: this.images.size,
            sounds: this.sounds.size,
            fonts: this.fonts.size,
            total: this.images.size + this.sounds.size + this.fonts.size
        };
    }
    
    /**
     * Check if currently loading
     */
    getIsLoading() {
        return this.isLoading;
    }
}
