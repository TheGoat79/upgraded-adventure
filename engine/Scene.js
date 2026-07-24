/**
 * Scene.js - Reusable Scene System
 * Base scene class and common scene implementations
 */

/**
 * Base Scene class
 * All scenes should extend this class
 */
export class Scene {
    constructor() {
        this.engine = null;
        this.isActive = false;
    }
    
    /**
     * Called when scene is entered
     */
    onEnter(data = null) {
        this.isActive = true;
    }
    
    /**
     * Called when scene is exited
     */
    onExit() {
        this.isActive = false;
    }
    
    /**
     * Called when game is paused
     */
    onPause() {
        // Override in subclass
    }
    
    /**
     * Called when game is resumed
     */
    onResume() {
        // Override in subclass
    }
    
    /**
     * Called when canvas is resized
     */
    onResize(width, height) {
        // Override in subclass
    }
    
    /**
     * Fixed update (called at fixed time step)
     */
    fixedUpdate(dt) {
        // Override in subclass
    }
    
    /**
     * Variable update (called every frame)
     */
    update(dt) {
        // Override in subclass
    }
    
    /**
     * Render the scene
     */
    render(ctx) {
        // Override in subclass
    }
}

/**
 * Loading Scene
 * Shows loading progress while assets load
 */
export class LoadingScene extends Scene {
    constructor() {
        super();
        this.progress = 0;
        this.message = 'Loading...';
        this.onComplete = null;
    }
    
    onEnter(data) {
        super.onEnter(data);
        this.progress = 0;
        
        if (data && data.onComplete) {
            this.onComplete = data.onComplete;
        }
    }
    
    update(dt) {
        // Update progress based on asset manager
        if (this.engine && this.engine.assets) {
            this.progress = this.engine.assets.getLoadProgress();
            
            if (this.progress >= 1 && this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Clear with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        // Draw loading text
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.message, width / 2, height / 2 - 20);
        
        // Draw progress bar
        const barWidth = 300;
        const barHeight = 20;
        const barX = (width - barWidth) / 2;
        const barY = height / 2 + 20;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(barX, barY, barWidth * this.progress, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Percentage
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(`${Math.floor(this.progress * 100)}%`, width / 2, barY + 40);
    }
}

/**
 * Main Menu Scene
 * Displays game selection and options
 */
export class MainMenuScene extends Scene {
    constructor() {
        super();
        this.games = [];
        this.selectedIndex = 0;
        this.onGameSelected = null;
        this.onSettingsSelected = null;
        this.title = 'MINI ARCADE';
    }
    
    onEnter(data) {
        super.onEnter(data);
        
        if (data && data.games) {
            this.games = data.games;
        }
        
        if (data && data.onGameSelected) {
            this.onGameSelected = data.onGameSelected;
        }
        
        if (data && data.onSettingsSelected) {
            this.onSettingsSelected = data.onSettingsSelected;
        }
        
        if (data && data.title) {
            this.title = data.title;
        }
    }
    
    update(dt) {
        const input = this.engine.input;
        
        // Navigate game list
        if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        
        if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
            this.selectedIndex = Math.min(this.games.length - 1, this.selectedIndex + 1);
        }
        
        // Select game
        if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
            if (this.selectedIndex < this.games.length && this.onGameSelected) {
                this.onGameSelected(this.games[this.selectedIndex].name);
            }
        }
        
        // Settings (Escape or Tab)
        if (input.isKeyPressed('Escape') || input.isKeyPressed('Tab')) {
            if (this.onSettingsSelected) {
                this.onSettingsSelected();
            }
        }
    }
    
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Clear with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw title
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.title, width / 2, 80);
        
        // Draw game list
        const startY = 150;
        const itemHeight = 50;
        
        this.games.forEach((game, index) => {
            const y = startY + index * itemHeight;
            const isSelected = index === this.selectedIndex;
            
            // Highlight selected item
            if (isSelected) {
                ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
                ctx.fillRect(width / 2 - 200, y - 25, 400, 40);
            }
            
            // Game name
            ctx.fillStyle = isSelected ? '#e94560' : '#ffffff';
            ctx.font = isSelected ? 'bold 24px Arial' : '20px Arial';
            ctx.fillText(game.title || game.name, width / 2, y);
            
            // High score
            if (game.highScore !== undefined) {
                ctx.fillStyle = '#888888';
                ctx.font = '16px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(`Best: ${game.highScore}`, width / 2 + 200, y);
                ctx.textAlign = 'center';
            }
        });
        
        // Draw instructions
        ctx.fillStyle = '#888888';
        ctx.font = '14px Arial';
        ctx.fillText('Arrow Keys/WASD to navigate, Enter to play, Escape for settings', width / 2, height - 30);
    }
}

/**
 * Game Scene
 * Base class for actual game scenes
 */
export class GameScene extends Scene {
    constructor() {
        super();
        this.score = 0;
        this.isGameOver = false;
        this.onGameOver = null;
        this.onPauseRequested = null;
    }
    
    onEnter(data) {
        super.onEnter(data);
        this.score = 0;
        this.isGameOver = false;
        
        if (data && data.onGameOver) {
            this.onGameOver = data.onGameOver;
        }
        
        if (data && data.onPauseRequested) {
            this.onPauseRequested = data.onPauseRequested;
        }
    }
    
    update(dt) {
        // Check for pause
        if (this.engine.input.isKeyPressed('Escape') && this.onPauseRequested) {
            this.onPauseRequested();
        }
    }
    
    endGame(finalScore) {
        this.isGameOver = true;
        if (this.onGameOver) {
            this.onGameOver(finalScore);
        }
    }
}

/**
 * Pause Scene
 * Shows pause menu
 */
export class PauseScene extends Scene {
    constructor() {
        super();
        this.options = ['Resume', 'Settings', 'Quit to Menu'];
        this.selectedIndex = 0;
        this.onResume = null;
        this.onSettings = null;
        this.onQuit = null;
    }
    
    onEnter(data) {
        super.onEnter(data);
        this.selectedIndex = 0;
        
        if (data && data.onResume) {
            this.onResume = data.onResume;
        }
        
        if (data && data.onSettings) {
            this.onSettings = data.onSettings;
        }
        
        if (data && data.onQuit) {
            this.onQuit = data.onQuit;
        }
    }
    
    update(dt) {
        const input = this.engine.input;
        
        if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        
        if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
            this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
        }
        
        if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
            switch (this.selectedIndex) {
                case 0:
                    if (this.onResume) this.onResume();
                    break;
                case 1:
                    if (this.onSettings) this.onSettings();
                    break;
                case 2:
                    if (this.onQuit) this.onQuit();
                    break;
            }
        }
        
        // Resume on Escape
        if (input.isKeyPressed('Escape') && this.onResume) {
            this.onResume();
        }
    }
    
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', width / 2, height / 2 - 100);
        
        // Options
        const startY = height / 2 - 20;
        const itemHeight = 40;
        
        this.options.forEach((option, index) => {
            const y = startY + index * itemHeight;
            const isSelected = index === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? '#e94560' : '#ffffff';
            ctx.font = isSelected ? 'bold 24px Arial' : '20px Arial';
            ctx.fillText(option, width / 2, y);
        });
        
        // Instructions
        ctx.fillStyle = '#888888';
        ctx.font = '14px Arial';
        ctx.fillText('Arrow Keys to navigate, Enter to select', width / 2, height - 30);
    }
}

/**
 * Game Over Scene
 * Shows final score and options
 */
export class GameOverScene extends Scene {
    constructor() {
        super();
        this.score = 0;
        this.highScore = 0;
        this.newHighScore = false;
        this.options = ['Play Again', 'Main Menu'];
        this.selectedIndex = 0;
        this.onPlayAgain = null;
        this.onMainMenu = null;
    }
    
    onEnter(data) {
        super.onEnter(data);
        this.selectedIndex = 0;
        
        if (data && data.score !== undefined) {
            this.score = data.score;
        }
        
        if (data && data.highScore !== undefined) {
            this.highScore = data.highScore;
            this.newHighScore = data.newHighScore || false;
        }
        
        if (data && data.onPlayAgain) {
            this.onPlayAgain = data.onPlayAgain;
        }
        
        if (data && data.onMainMenu) {
            this.onMainMenu = data.onMainMenu;
        }
    }
    
    update(dt) {
        const input = this.engine.input;
        
        if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        
        if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
            this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
        }
        
        if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
            switch (this.selectedIndex) {
                case 0:
                    if (this.onPlayAgain) this.onPlayAgain();
                    break;
                case 1:
                    if (this.onMainMenu) this.onMainMenu();
                    break;
            }
        }
    }
    
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Clear with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        // Title
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 80);
        
        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${this.score}`, width / 2, height / 2 - 20);
        
        // High score
        ctx.fillStyle = this.newHighScore ? '#4CAF50' : '#888888';
        ctx.font = this.newHighScore ? 'bold 24px Arial' : '20px Arial';
        const highScoreText = this.newHighScore ? 'NEW HIGH SCORE!' : `High Score: ${this.highScore}`;
        ctx.fillText(highScoreText, width / 2, height / 2 + 20);
        
        // Options
        const startY = height / 2 + 80;
        const itemHeight = 40;
        
        this.options.forEach((option, index) => {
            const y = startY + index * itemHeight;
            const isSelected = index === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? '#e94560' : '#ffffff';
            ctx.font = isSelected ? 'bold 24px Arial' : '20px Arial';
            ctx.fillText(option, width / 2, y);
        });
    }
}

/**
 * Settings Scene
 * Allows changing game settings
 */
export class SettingsScene extends Scene {
    constructor() {
        super();
        this.settings = {
            masterVolume: 1.0,
            musicVolume: 0.7,
            sfxVolume: 0.8,
            muted: false,
            difficulty: 'normal',
            fullscreen: false
        };
        this.categories = ['Master Volume', 'Music Volume', 'SFX Volume', 'Mute', 'Difficulty', 'Fullscreen', 'Back'];
        this.selectedIndex = 0;
        this.onBack = null;
    }
    
    onEnter(data) {
        super.onEnter(data);
        
        // Load current settings
        if (this.engine && this.engine.save) {
            const saved = this.engine.save.getSettings();
            this.settings = { ...this.settings, ...saved };
        }
        
        if (data && data.onBack) {
            this.onBack = data.onBack;
        }
    }
    
    update(dt) {
        const input = this.engine.input;
        
        if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        
        if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
            this.selectedIndex = Math.min(this.categories.length - 1, this.selectedIndex + 1);
        }
        
        if (input.isKeyPressed('ArrowLeft') || input.isKeyPressed('KeyA')) {
            this._adjustSetting(-1);
        }
        
        if (input.isKeyPressed('ArrowRight') || input.isKeyPressed('KeyD')) {
            this._adjustSetting(1);
        }
        
        if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
            if (this.selectedIndex === this.categories.length - 1 && this.onBack) {
                this._saveSettings();
                this.onBack();
            }
        }
        
        if (input.isKeyPressed('Escape') && this.onBack) {
            this._saveSettings();
            this.onBack();
        }
    }
    
    _adjustSetting(direction) {
        switch (this.selectedIndex) {
            case 0: // Master Volume
                this.settings.masterVolume = Math.max(0, Math.min(1, this.settings.masterVolume + direction * 0.1));
                this._applyVolume();
                break;
            case 1: // Music Volume
                this.settings.musicVolume = Math.max(0, Math.min(1, this.settings.musicVolume + direction * 0.1));
                this._applyVolume();
                break;
            case 2: // SFX Volume
                this.settings.sfxVolume = Math.max(0, Math.min(1, this.settings.sfxVolume + direction * 0.1));
                this._applyVolume();
                break;
            case 3: // Mute
                this.settings.muted = !this.settings.muted;
                this._applyVolume();
                break;
            case 4: // Difficulty
                const difficulties = ['easy', 'normal', 'hard'];
                const currentIndex = difficulties.indexOf(this.settings.difficulty);
                const newIndex = (currentIndex + direction + difficulties.length) % difficulties.length;
                this.settings.difficulty = difficulties[newIndex];
                break;
            case 5: // Fullscreen
                this.settings.fullscreen = !this.settings.fullscreen;
                this._applyFullscreen();
                break;
        }
    }
    
    _applyVolume() {
        if (this.engine && this.engine.audio) {
            this.engine.audio.setMasterVolume(this.settings.masterVolume);
            this.engine.audio.setMusicVolume(this.settings.musicVolume);
            this.engine.audio.setSFXVolume(this.settings.sfxVolume);
            if (this.settings.muted) {
                this.engine.audio.mute();
            } else {
                this.engine.audio.unmute();
            }
        }
    }
    
    _applyFullscreen() {
        if (this.settings.fullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
                this.settings.fullscreen = false;
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log('Exit fullscreen failed');
            });
        }
    }
    
    _saveSettings() {
        if (this.engine && this.engine.save) {
            this.engine.save.setSettings(this.settings);
            this.engine.save.save();
        }
    }
    
    render(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Clear with dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        // Title
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SETTINGS', width / 2, 60);
        
        // Settings
        const startY = 120;
        const itemHeight = 50;
        
        this.categories.forEach((category, index) => {
            const y = startY + index * itemHeight;
            const isSelected = index === this.selectedIndex;
            
            // Highlight selected
            if (isSelected) {
                ctx.fillStyle = 'rgba(233, 69, 96, 0.2)';
                ctx.fillRect(width / 2 - 250, y - 25, 500, 40);
            }
            
            // Category name
            ctx.fillStyle = isSelected ? '#e94560' : '#ffffff';
            ctx.font = isSelected ? 'bold 20px Arial' : '18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(category, width / 2 - 200, y);
            
            // Value
            ctx.textAlign = 'right';
            let value = '';
            switch (index) {
                case 0:
                    value = Math.round(this.settings.masterVolume * 100) + '%';
                    break;
                case 1:
                    value = Math.round(this.settings.musicVolume * 100) + '%';
                    break;
                case 2:
                    value = Math.round(this.settings.sfxVolume * 100) + '%';
                    break;
                case 3:
                    value = this.settings.muted ? 'On' : 'Off';
                    break;
                case 4:
                    value = this.settings.difficulty.charAt(0).toUpperCase() + this.settings.difficulty.slice(1);
                    break;
                case 5:
                    value = this.settings.fullscreen ? 'On' : 'Off';
                    break;
                case 6:
                    value = '';
                    break;
            }
            ctx.fillText(value, width / 2 + 200, y);
            ctx.textAlign = 'center';
        });
        
        // Instructions
        ctx.fillStyle = '#888888';
        ctx.font = '14px Arial';
        ctx.fillText('Arrow Keys to adjust, Enter/Escape to save and exit', width / 2, height - 30);
    }
}
