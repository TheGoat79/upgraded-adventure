export class SaveManager {
  constructor() {
    this.storageKey = 'mini-arcade-save';
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      highScores: {},
      wins: {},
      losses: {},
      gamesPlayed: {},
      timePlayed: {},
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        masterVolume: 1.0,
        fullscreen: false
      },
      lastPlayed: null
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  }

  setHighScore(game, score) {
    if (!this.data.highScores[game] || score > this.data.highScores[game]) {
      this.data.highScores[game] = score;
      this.save();
    }
  }

  getHighScore(game) {
    return this.data.highScores[game] || 0;
  }

  addWin(game) {
    this.data.wins[game] = (this.data.wins[game] || 0) + 1;
    this.save();
  }

  addLoss(game) {
    this.data.losses[game] = (this.data.losses[game] || 0) + 1;
    this.save();
  }

  addGamePlayed(game) {
    this.data.gamesPlayed[game] = (this.data.gamesPlayed[game] || 0) + 1;
    this.save();
  }

  addTimePlayed(game, seconds) {
    this.data.timePlayed[game] = (this.data.timePlayed[game] || 0) + seconds;
    this.save();
  }

  getWins(game) {
    return this.data.wins[game] || 0;
  }

  getLosses(game) {
    return this.data.losses[game] || 0;
  }

  getGamesPlayed(game) {
    return this.data.gamesPlayed[game] || 0;
  }

  getTimePlayed(game) {
    return this.data.timePlayed[game] || 0;
  }

  setLastPlayed(game) {
    this.data.lastPlayed = game;
    this.save();
  }

  getLastPlayed() {
    return this.data.lastPlayed;
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  getSetting(key) {
    return this.data.settings[key];
  }

  getSettings() {
    return { ...this.data.settings };
  }

  reset() {
    this.data = this.getDefaultData();
    this.save();
  }
}
