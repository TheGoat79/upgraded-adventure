/**
 * Engine.js - Core Game Engine
 * Handles game loop, delta time, scene management, and lifecycle
 */

import { InputManager } from './Input.js';
import { AudioManager } from './Audio.js';
import { SaveManager } from './Save.js';
import { AssetManager } from './Assets.js';

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }

        this.ctx = this.canvas.getContext('2d');
        
        // Core systems
        this.input = new InputManager(this.canvas);
        this.audio = new AudioManager();
        this.save = new SaveManager();
        this.assets = new AssetManager();
        
        // Game loop
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDeltaTime = 1 / 60; // 60 FPS fixed update
        
        // Scene management
        this.scenes = new Map();
        this.currentScene = null;
        this.sceneTransition = null;
        
        // Game registration
        this.games = new Map();
        
        // Resize handling
        this.resizeCallback = null;
        
        // Lifecycle callbacks
        this.onInit = null;
        this.onUpdate = null;
        this.onRender = null;
        this.onDestroy = null;
        
        this._setupResize();
    }
    
    /**
     * Initialize the engine
     */
    async init() {
        // Load saved settings
        this.save.load();
        
        // Apply saved audio settings
        const settings = this.save.getSettings();
        this.audio.setMasterVolume(settings.masterVolume);
        this.audio.setMusicVolume(settings.musicVolume);
        this.audio.setSFXVolume(settings.sfxVolume);
        if (settings.muted) {
            this.audio.mute();
        }
        
        // Call custom init callback
        if (this.onInit) {
            await this.onInit();
        }
        
        this.resize();
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this._gameLoop();
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Pause the game
     */
    pause() {
        if (!this.isPaused) {
            this.isPaused = true;
            if (this.currentScene && this.currentScene.onPause) {
                this.currentScene.onPause();
            }
        }
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now();
            this.accumulator = 0;
            if (this.currentScene && this.currentScene.onResume) {
                this.currentScene.onResume();
            }
        }
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * Main game loop
     */
    _gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            // Fixed time step update
            this.accumulator += deltaTime;
            
            while (this.accumulator >= this.fixedDeltaTime) {
                this._fixedUpdate(this.fixedDeltaTime);
                this.accumulator -= this.fixedDeltaTime;
            }
            
            // Variable time step update
            this._update(deltaTime);
        }
        
        // Render
        this._render();
        
        requestAnimationFrame(() => this._gameLoop());
    }
    
    /**
     * Fixed update (physics, game logic)
     */
    _fixedUpdate(dt) {
        if (this.currentScene && this.currentScene.fixedUpdate) {
            this.currentScene.fixedUpdate(dt);
        }
    }
    
    /**
     * Variable update (input, animations)
     */
    _update(dt) {
        this.input.update(dt);
        
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(dt);
        }
        
        if (this.onUpdate) {
            this.onUpdate(dt);
        }
    }
    
    /**
     * Render
     */
    _render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(this.ctx);
        }
        
        if (this.onRender) {
            this.onRender(this.ctx);
        }
    }
    
    /**
     * Register a scene
     */
    registerScene(name, scene) {
        this.scenes.set(name, scene);
        scene.engine = this;
    }
    
    /**
     * Switch to a scene
     */
    switchScene(name, data = null) {
        const scene = this.scenes.get(name);
        if (!scene) {
            console.error(`Scene "${name}" not found`);
            return;
        }
        
        // Exit current scene
        if (this.currentScene && this.currentScene.onExit) {
            this.currentScene.onExit();
        }
        
        // Enter new scene
        this.currentScene = scene;
        if (this.currentScene.onEnter) {
            this.currentScene.onEnter(data);
        }
    }
    
    /**
     * Register a game
     */
    registerGame(name, gameConfig) {
        this.games.set(name, gameConfig);
    }
    
    /**
     * Get registered game
     */
    getGame(name) {
        return this.games.get(name);
    }
    
    /**
     * Get all registered games
     */
    getAllGames() {
        return Array.from(this.games.entries()).map(([name, config]) => ({
            name,
            ...config
        }));
    }
    
    /**
     * Setup resize handling
     */
    _setupResize() {
        window.addEventListener('resize', () => this.resize());
    }
    
    /**
     * Handle canvas resize
     */
    resize() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
        
        if (this.resizeCallback) {
            this.resizeCallback(this.canvas.width, this.canvas.height);
        }
        
        if (this.currentScene && this.currentScene.onResize) {
            this.currentScene.onResize(this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Set resize callback
     */
    onResize(callback) {
        this.resizeCallback = callback;
    }
    
    /**
     * Destroy the engine
     */
    destroy() {
        this.stop();
        
        if (this.currentScene && this.currentScene.onExit) {
            this.currentScene.onExit();
        }
        
        this.input.destroy();
        this.audio.destroy();
        
        if (this.onDestroy) {
            this.onDestroy();
        }
    }
}
