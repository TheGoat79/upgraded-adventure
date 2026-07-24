/**
 * Save.js - Save Manager
 * Handles persistent data storage using LocalStorage
 */

export class SaveManager {
    constructor(saveKey = 'miniArcade') {
        this.saveKey = saveKey;
        
        // Default save data structure
        this.defaultData = {
            // Settings
            settings: {
                masterVolume: 1.0,
                musicVolume: 0.7,
                sfxVolume: 0.8,
                muted: false,
                difficulty: 'normal',
                fullscreen: false,
                pixelScaling: false
            },
            
            // High scores (gameName: score)
            highScores: {},
            
            // Last played game
            lastPlayed: null,
            
            // Statistics
            statistics: {
                totalGamesPlayed: 0,
                totalPlayTime: 0,
                gamesStarted: {},
                gamesCompleted: {}
            },
            
            // Achievements (for future use)
            achievements: [],
            
            // Version for migration
            version: '1.0'
        };
        
        this.data = null;
    }
    
    /**
     * Load save data from LocalStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = this._mergeWithDefaults(parsed);
            } else {
                this.data = JSON.parse(JSON.stringify(this.defaultData));
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load save data:', error);
            this.data = JSON.parse(JSON.stringify(this.defaultData));
            return false;
        }
    }
    
    /**
     * Save data to LocalStorage
     */
    save() {
        try {
            const serialized = JSON.stringify(this.data);
            localStorage.setItem(this.saveKey, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    /**
     * Merge loaded data with defaults to handle version changes
     */
    _mergeWithDefaults(loaded) {
        const merged = JSON.parse(JSON.stringify(this.defaultData));
        
        // Deep merge
        this._deepMerge(merged, loaded);
        
        return merged;
    }
    
    /**
     * Deep merge helper
     */
    _deepMerge(target, source) {
        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                this._deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    /**
     * Get all settings
     */
    getSettings() {
        return { ...this.data.settings };
    }
    
    /**
     * Set all settings
     */
    setSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
    }
    
    /**
     * Get specific setting
     */
    getSetting(key) {
        return this.data.settings[key];
    }
    
    /**
     * Set specific setting
     */
    setSetting(key, value) {
        this.data.settings[key] = value;
    }
    
    /**
     * Get high score for a game
     */
    getHighScore(gameName) {
        return this.data.highScores[gameName] || 0;
    }
    
    /**
     * Set high score for a game (only if higher)
     */
    setHighScore(gameName, score) {
        const current = this.data.highScores[gameName] || 0;
        
        if (score > current) {
            this.data.highScores[gameName] = score;
            return true; // New high score
        }
        
        return false;
    }
    
    /**
     * Get all high scores
     */
    getAllHighScores() {
        return { ...this.data.highScores };
    }
    
    /**
     * Set last played game
     */
    setLastPlayed(gameName) {
        this.data.lastPlayed = gameName;
    }
    
    /**
     * Get last played game
     */
    getLastPlayed() {
        return this.data.lastPlayed;
    }
    
    /**
     * Record game started
     */
    recordGameStarted(gameName) {
        this.data.statistics.totalGamesPlayed++;
        this.data.statistics.gamesStarted[gameName] = (this.data.statistics.gamesStarted[gameName] || 0) + 1;
    }
    
    /**
     * Record game completed
     */
    recordGameCompleted(gameName, playTime) {
        this.data.statistics.totalPlayTime += playTime;
        this.data.statistics.gamesCompleted[gameName] = (this.data.statistics.gamesCompleted[gameName] || 0) + 1;
    }
    
    /**
     * Get statistics
     */
    getStatistics() {
        return { ...this.data.statistics };
    }
    
    /**
     * Get game-specific statistics
     */
    getGameStatistics(gameName) {
        return {
            started: this.data.statistics.gamesStarted[gameName] || 0,
            completed: this.data.statistics.gamesCompleted[gameName] || 0,
            highScore: this.data.highScores[gameName] || 0
        };
    }
    
    /**
     * Unlock achievement
     */
    unlockAchievement(achievementId) {
        if (!this.data.achievements.includes(achievementId)) {
            this.data.achievements.push(achievementId);
            return true;
        }
        return false;
    }
    
    /**
     * Check if achievement is unlocked
     */
    hasAchievement(achievementId) {
        return this.data.achievements.includes(achievementId);
    }
    
    /**
     * Get all achievements
     */
    getAchievements() {
        return [...this.data.achievements];
    }
    
    /**
     * Reset all data to defaults
     */
    reset() {
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.save();
    }
    
    /**
     * Reset specific category
     */
    resetCategory(category) {
        if (this.defaultData[category]) {
            this.data[category] = JSON.parse(JSON.stringify(this.defaultData[category]));
            this.save();
        }
    }
    
    /**
     * Export save data as JSON string
     */
    export() {
        return JSON.stringify(this.data);
    }
    
    /**
     * Import save data from JSON string
     */
    import(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            this.data = this._mergeWithDefaults(parsed);
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to import save data:', error);
            return false;
        }
    }
    
    /**
     * Clear all save data
     */
    clear() {
        localStorage.removeItem(this.saveKey);
        this.data = JSON.parse(JSON.stringify(this.defaultData));
    }
    
    /**
     * Get raw data object
     */
    getData() {
        return JSON.parse(JSON.stringify(this.data));
    }
    
    /**
     * Set raw data object
     */
    setData(data) {
        this.data = this._mergeWithDefaults(data);
    }
}
