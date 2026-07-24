/**
 * Audio.js - Audio Manager
 * Handles music and sound effects with volume control
 */

export class AudioManager {
    constructor() {
        // Audio context
        this.audioContext = null;
        
        // Volume settings
        this.masterVolume = 1.0;
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.isMuted = false;
        
        // Audio cache
        this.musicCache = new Map();
        this.sfxCache = new Map();
        
        // Currently playing music
        this.currentMusic = null;
        this.currentMusicSource = null;
        this.currentMusicGain = null;
        this.musicLoop = true;
        
        // Initialize audio context on first user interaction
        this.isInitialized = false;
    }
    
    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            console.error('Web Audio API not supported:', error);
        }
    }
    
    /**
     * Ensure audio context is initialized
     */
    _ensureInitialized() {
        if (!this.isInitialized) {
            this.init();
        }
        
        // Resume audio context if suspended (browser policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    /**
     * Load audio file
     */
    async loadAudio(url, type = 'sfx') {
        this._ensureInitialized();
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (type === 'music') {
                this.musicCache.set(url, audioBuffer);
            } else {
                this.sfxCache.set(url, audioBuffer);
            }
            
            return audioBuffer;
        } catch (error) {
            console.error(`Failed to load audio: ${url}`, error);
            return null;
        }
    }
    
    /**
     * Play sound effect
     */
    playSFX(url, volume = 1.0, pitch = 1.0) {
        this._ensureInitialized();
        
        const audioBuffer = this.sfxCache.get(url);
        if (!audioBuffer) {
            console.warn(`SFX not loaded: ${url}`);
            return null;
        }
        
        if (this.isMuted) return null;
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            source.playbackRate.value = pitch;
            
            // Calculate final volume
            const finalVolume = this.masterVolume * this.sfxVolume * volume;
            gainNode.gain.value = finalVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            
            return source;
        } catch (error) {
            console.error('Failed to play SFX:', error);
            return null;
        }
    }
    
    /**
     * Play music
     */
    playMusic(url, loop = true, volume = 1.0) {
        this._ensureInitialized();
        
        // Stop current music
        this.stopMusic();
        
        const audioBuffer = this.musicCache.get(url);
        if (!audioBuffer) {
            console.warn(`Music not loaded: ${url}`);
            return;
        }
        
        if (this.isMuted) return;
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            source.loop = loop;
            
            // Calculate final volume
            const finalVolume = this.masterVolume * this.musicVolume * volume;
            gainNode.gain.value = finalVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            
            this.currentMusic = url;
            this.currentMusicSource = source;
            this.currentMusicGain = gainNode;
            this.musicLoop = loop;
        } catch (error) {
            console.error('Failed to play music:', error);
        }
    }
    
    /**
     * Stop current music
     */
    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.stop();
            } catch (error) {
                // Ignore if already stopped
            }
            this.currentMusicSource = null;
        }
        
        this.currentMusic = null;
        this.currentMusicGain = null;
    }
    
    /**
     * Pause current music
     */
    pauseMusic() {
        if (this.audioContext) {
            this.audioContext.suspend();
        }
    }
    
    /**
     * Resume music
     */
    resumeMusic() {
        if (this.audioContext) {
            this.audioContext.resume();
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this._updateMusicVolume();
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this._updateMusicVolume();
    }
    
    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Update current music volume
     */
    _updateMusicVolume() {
        if (this.currentMusicGain) {
            const finalVolume = this.masterVolume * this.musicVolume;
            this.currentMusicGain.gain.value = this.isMuted ? 0 : finalVolume;
        }
    }
    
    /**
     * Mute all audio
     */
    mute() {
        this.isMuted = true;
        this._updateMusicVolume();
    }
    
    /**
     * Unmute all audio
     */
    unmute() {
        this.isMuted = false;
        this._updateMusicVolume();
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
        return !this.isMuted;
    }
    
    /**
     * Check if music is playing
     */
    isMusicPlaying() {
        return this.currentMusic !== null;
    }
    
    /**
     * Get current music URL
     */
    getCurrentMusic() {
        return this.currentMusic;
    }
    
    /**
     * Fade music volume
     */
    fadeMusicVolume(targetVolume, duration = 1.0) {
        if (!this.currentMusicGain) return;
        
        const currentTime = this.audioContext.currentTime;
        const finalVolume = this.masterVolume * this.musicVolume * targetVolume;
        
        this.currentMusicGain.gain.cancelScheduledValues(currentTime);
        this.currentMusicGain.gain.setValueAtTime(this.currentMusicGain.gain.value, currentTime);
        this.currentMusicGain.gain.linearRampToValueAtTime(
            this.isMuted ? 0 : finalVolume,
            currentTime + duration
        );
    }
    
    /**
     * Fade out and stop music
     */
    fadeOutMusic(duration = 1.0) {
        if (!this.currentMusicGain) return;
        
        const currentTime = this.audioContext.currentTime;
        
        this.currentMusicGain.gain.cancelScheduledValues(currentTime);
        this.currentMusicGain.gain.setValueAtTime(this.currentMusicGain.gain.value, currentTime);
        this.currentMusicGain.gain.linearRampToValueAtTime(0, currentTime + duration);
        
        setTimeout(() => {
            this.stopMusic();
        }, duration * 1000);
    }
    
    /**
     * Get volume settings
     */
    getVolumeSettings() {
        return {
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            muted: this.isMuted
        };
    }
    
    /**
     * Clear audio cache
     */
    clearCache() {
        this.stopMusic();
        this.musicCache.clear();
        this.sfxCache.clear();
    }
    
    /**
     * Destroy audio manager
     */
    destroy() {
        this.stopMusic();
        this.clearCache();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isInitialized = false;
    }
}
