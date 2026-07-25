export class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = new Map();
    this.music = null;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.masterVolume = 1.0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  playSound(frequency, duration, type = 'square', volume = 1.0) {
    if (!this.initialized) this.init();
    if (!this.context) return;

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
    if (this.music) {
      this.music.stop();
    }
    
    if (!this.initialized) this.init();
    if (!this.context) return;

    const playNote = (freq, time, duration) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      const vol = this.musicVolume * this.masterVolume * 0.3;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    const noteDuration = 0.3;
    
    let time = this.context.currentTime;
    melody.forEach((freq, i) => {
      playNote(freq, time, noteDuration);
      time += noteDuration;
    });

    this.music = {
      stop: () => {},
      play: () => this.playMenuMusic()
    };
  }

  playGameMusic() {
    if (this.music) {
      this.music.stop();
    }
    
    if (!this.initialized) this.init();
    if (!this.context) return;

    const playNote = (freq, time, duration) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      
      const vol = this.musicVolume * this.masterVolume * 0.2;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    const bassline = [65.41, 65.41, 73.42, 73.42, 82.41, 82.41, 73.42, 73.42];
    const noteDuration = 0.25;
    
    let time = this.context.currentTime;
    bassline.forEach((freq, i) => {
      playNote(freq, time, noteDuration);
      time += noteDuration;
    });

    this.music = {
      stop: () => {},
      play: () => this.playGameMusic()
    };
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}
