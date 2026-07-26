export class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = new Map();
    this.music = null;
    this.nextMusic = null;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.masterVolume = 1.0;
    this.initialized = false;
    this.crossfadeDuration = 1.0;
    this.crossfadeTimer = 0;
    this.crossfading = false;
    this.channels = {
      sfx: [],
      music: [],
      ambient: []
    };
    this.maxChannels = {
      sfx: 8,
      music: 2,
      ambient: 4
    };
    this.volumePersistence = true;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      this.loadVolumeSettings();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  loadVolumeSettings() {
    if (this.volumePersistence && typeof window !== 'undefined' && window.save) {
      const settings = window.save.getSettings();
      if (settings) {
        this.musicVolume = settings.musicVolume ?? 0.5;
        this.sfxVolume = settings.sfxVolume ?? 0.7;
        this.masterVolume = settings.masterVolume ?? 1.0;
      }
    }
  }

  saveVolumeSettings() {
    if (this.volumePersistence && typeof window !== 'undefined' && window.save) {
      window.save.setSetting('musicVolume', this.musicVolume);
      window.save.setSetting('sfxVolume', this.sfxVolume);
      window.save.setSetting('masterVolume', this.masterVolume);
    }
  }

  createGainNode() {
    if (!this.context) return null;
    return this.context.createGain();
  }

  playSound(frequency, duration, type = 'square', volume = 1.0, channel = 'sfx') {
    if (!this.initialized) this.init();
    if (!this.context) return;

    // Check channel limit
    if (this.channels[channel].length >= this.maxChannels[channel]) {
      const oldest = this.channels[channel].shift();
      if (oscillator) {
        try {
          oldest.stop();
        } catch (e) {}
      }
    }

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    
    const finalVolume = volume * this.sfxVolume * this.masterVolume;
    gainNode.gain.setValueAtTime(finalVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);

    // Track in channel
    this.channels[channel].push(oscillator);
    
    // Clean up after sound finishes
    setTimeout(() => {
      const index = this.channels[channel].indexOf(oscillator);
      if (index > -1) {
        this.channels[channel].splice(index, 1);
      }
    }, duration * 1000 + 100);

    return oscillator;
  }

  playBeep(frequency = 440, duration = 0.1) {
    this.playSound(frequency, duration, 'square');
  }

  playJump() {
    this.playSound(400, 0.1, 'square');
    setTimeout(() => this.playSound(600, 0.1, 'square'), 50);
  }

  playCollect() {
    this.playSound(800, 0.1, 'sine');
    setTimeout(() => this.playSound(1200, 0.15, 'sine'), 50);
  }

  playExplosion() {
    this.playSound(100, 0.3, 'sawtooth', 0.8);
    setTimeout(() => this.playSound(50, 0.2, 'sawtooth', 0.6), 100);
  }

  playHit() {
    this.playSound(200, 0.1, 'square', 0.7);
  }

  playScore() {
    this.playSound(523.25, 0.1, 'sine');
    setTimeout(() => this.playSound(659.25, 0.1, 'sine'), 100);
    setTimeout(() => this.playSound(783.99, 0.15, 'sine'), 200);
  }

  playSelect() {
    this.playSound(440, 0.05, 'square');
  }

  playBack() {
    this.playSound(300, 0.1, 'square');
  }

  playMenuMusic() {
    this.playMusic('menu');
  }

  playGameMusic() {
    this.playMusic('game');
  }

  playMusic(type, loopPoints = null) {
    if (!this.initialized) this.init();
    if (!this.context) return;

    const musicData = this.createMusicData(type, loopPoints);
    
    if (this.crossfading && this.music) {
      this.crossfadeTo(musicData);
    } else {
      if (this.music) {
        this.music.stop();
      }
      this.music = musicData;
      this.music.play();
    }
  }

  createMusicData(type, loopPoints) {
    const playNote = (freq, time, duration, volume = 0.3) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = type === 'menu' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      
      const vol = this.musicVolume * this.masterVolume * volume;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.start(time);
      osc.stop(time + duration);
      
      return osc;
    };

    let notes = [];
    let noteDuration = 0.3;
    let volume = 0.3;

    if (type === 'menu') {
      notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    } else if (type === 'game') {
      notes = [65.41, 65.41, 73.42, 73.42, 82.41, 82.41, 73.42, 73.42];
      noteDuration = 0.25;
      volume = 0.2;
    }

    const oscillators = [];
    let time = this.context.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = playNote(freq, time, noteDuration, volume);
      oscillators.push(osc);
      time += noteDuration;
    });

    // Handle loop points
    let loopStart = 0;
    let loopEnd = notes.length * noteDuration;
    
    if (loopPoints) {
      loopStart = loopPoints.start || 0;
      loopEnd = loopPoints.end || loopEnd;
    }

    return {
      type,
      oscillators,
      loopPoints: { start: loopStart, end: loopEnd },
      play: () => {
        // Notes are already scheduled
      },
      stop: () => {
        oscillators.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {}
        });
      },
      setVolume: (vol) => {
        // Volume changes would need to be tracked differently for true support
      }
    };
  }

  crossfadeTo(newMusic) {
    if (!this.music) {
      this.music = newMusic;
      this.music.play();
      return;
    }

    this.crossfading = true;
    this.crossfadeTimer = 0;
    this.nextMusic = newMusic;

    // Start next music
    this.nextMusic.play();

    // Fade out current music (simplified - would need proper gain node control)
    setTimeout(() => {
      if (this.music) {
        this.music.stop();
      }
      this.music = this.nextMusic;
      this.nextMusic = null;
      this.crossfading = false;
    }, this.crossfadeDuration * 1000);
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
    if (this.nextMusic) {
      this.nextMusic.stop();
      this.nextMusic = null;
    }
    this.crossfading = false;
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveVolumeSettings();
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveVolumeSettings();
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveVolumeSettings();
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getSfxVolume() {
    return this.sfxVolume;
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  setCrossfadeDuration(duration) {
    this.crossfadeDuration = Math.max(0.1, Math.min(5, duration));
  }

  setVolumePersistence(enabled) {
    this.volumePersistence = enabled;
  }

  update(dt) {
    if (this.crossfading) {
      this.crossfadeTimer += dt;
      if (this.crossfadeTimer >= this.crossfadeDuration) {
        this.crossfading = false;
      }
    }
  }

  getChannelCount(channel) {
    return this.channels[channel] ? this.channels[channel].length : 0;
  }

  stopAll(channel = null) {
    if (channel) {
      this.channels[channel].forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      this.channels[channel] = [];
    } else {
      Object.keys(this.channels).forEach(ch => {
        this.channels[ch].forEach(osc => {
          try {
            osc.stop();
          } catch (e) {}
        });
        this.channels[ch] = [];
      });
    }
  }
}
