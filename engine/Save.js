export class SaveManager {
  constructor() {
    this.storageKey = 'mini-arcade-save';
    this.version = 2;
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this.migrate(parsed);
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
      // Return default data on any error to prevent startup failure
      return this.getDefaultData();
    }
    
    return this.getDefaultData();
  }

  migrate(oldData) {
    // If data has current version, return as-is
    if (oldData.version === this.version) {
      return oldData;
    }

    const migrated = { ...this.getDefaultData() };

    // Migrate from version 1 to version 2
    if (!oldData.version || oldData.version < 2) {
      // Copy existing data
      if (oldData.highScores) migrated.highScores = oldData.highScores;
      if (oldData.wins) migrated.wins = oldData.wins;
      if (oldData.losses) migrated.losses = oldData.losses;
      if (oldData.gamesPlayed) migrated.gamesPlayed = oldData.gamesPlayed;
      if (oldData.timePlayed) migrated.timePlayed = oldData.timePlayed;
      if (oldData.settings) migrated.settings = { ...migrated.settings, ...oldData.settings };
      if (oldData.lastPlayed) migrated.lastPlayed = oldData.lastPlayed;

      // Add new fields
      migrated.achievements = {};
      migrated.statistics = this.getDefaultStatistics();
      migrated.version = 2;

      console.log('Migrated save data from version 1 to 2');
    }

    return migrated;
  }

  getDefaultData() {
    return {
      version: this.version,
      highScores: {},
      wins: {},
      losses: {},
      gamesPlayed: {},
      timePlayed: {},
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.7,
        masterVolume: 1.0,
        fullscreen: false,
        debugMode: false
      },
      lastPlayed: null,
      achievements: {},
      statistics: this.getDefaultStatistics()
    };
  }

  getDefaultStatistics() {
    return {
      totalGamesPlayed: 0,
      totalTimePlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      currentStreak: 0,
      longestWinStreak: 0,
      longestLoseStreak: 0,
      gamesByType: {},
      averageScore: 0,
      totalScore: 0,
      achievementsUnlocked: 0,
      lastSessionTime: null,
      totalSessions: 0
    };
  }

  save() {
    try {
      this.data.version = this.version;
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data:', e);
      // Don't throw - saving should never crash the application
    }
  }

  setHighScore(game, score) {
    if (!this.data.highScores[game] || score > this.data.highScores[game]) {
      this.data.highScores[game] = score;
      this.updateStatistics('highScore', game, score);
      this.save();
    }
  }

  getHighScore(game) {
    return this.data.highScores[game] || 0;
  }

  addWin(game) {
    this.data.wins[game] = (this.data.wins[game] || 0) + 1;
    this.data.statistics.totalWins++;
    this.data.statistics.currentStreak = Math.max(0, this.data.statistics.currentStreak) + 1;
    this.data.statistics.longestWinStreak = Math.max(
      this.data.statistics.longestWinStreak,
      this.data.statistics.currentStreak
    );
    this.updateStatistics('win', game);
    this.save();
  }

  addLoss(game) {
    this.data.losses[game] = (this.data.losses[game] || 0) + 1;
    this.data.statistics.totalLosses++;
    this.data.statistics.currentStreak = Math.min(0, this.data.statistics.currentStreak) - 1;
    this.data.statistics.longestLoseStreak = Math.min(
      this.data.statistics.longestLoseStreak,
      this.data.statistics.currentStreak
    );
    this.updateStatistics('loss', game);
    this.save();
  }

  addGamePlayed(game) {
    this.data.gamesPlayed[game] = (this.data.gamesPlayed[game] || 0) + 1;
    this.data.statistics.totalGamesPlayed++;
    
    if (!this.data.statistics.gamesByType[game]) {
      this.data.statistics.gamesByType[game] = 0;
    }
    this.data.statistics.gamesByType[game]++;
    
    this.save();
  }

  addTimePlayed(game, seconds) {
    this.data.timePlayed[game] = (this.data.timePlayed[game] || 0) + seconds;
    this.data.statistics.totalTimePlayed += seconds;
    this.save();
  }

  addScore(game, score) {
    this.data.statistics.totalScore += score;
    const totalGames = this.data.statistics.totalGamesPlayed || 1;
    this.data.statistics.averageScore = this.data.statistics.totalScore / totalGames;
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

  // Achievement system
  unlockAchievement(id) {
    if (!this.data.achievements[id]) {
      this.data.achievements[id] = {
        unlocked: true,
        unlockedAt: Date.now()
      };
      this.data.statistics.achievementsUnlocked++;
      this.save();
      return true;
    }
    return false;
  }

  isAchievementUnlocked(id) {
    return this.data.achievements[id]?.unlocked || false;
  }

  getAchievement(id) {
    return this.data.achievements[id] || null;
  }

  getAllAchievements() {
    return { ...this.data.achievements };
  }

  resetAchievements() {
    this.data.achievements = {};
    this.data.statistics.achievementsUnlocked = 0;
    this.save();
  }

  // Statistics system
  getStatistics() {
    return { ...this.data.statistics };
  }

  updateStatistics(type, game, value) {
    const stats = this.data.statistics;
    
    switch (type) {
      case 'highScore':
        // High score tracking is handled separately
        break;
      case 'win':
      case 'loss':
        // Win/loss tracking handled in addWin/addLoss
        break;
      case 'session':
        stats.totalSessions++;
        stats.lastSessionTime = Date.now();
        break;
    }
    
    this.save();
  }

  getSessionStats() {
    return {
      totalSessions: this.data.statistics.totalSessions,
      lastSessionTime: this.data.statistics.lastSessionTime
    };
  }

  getWinRate() {
    const total = this.data.statistics.totalWins + this.data.statistics.totalLosses;
    if (total === 0) return 0;
    return (this.data.statistics.totalWins / total) * 100;
  }

  getGameStats(game) {
    return {
      gamesPlayed: this.getGamesPlayed(game),
      wins: this.getWins(game),
      losses: this.getLosses(game),
      timePlayed: this.getTimePlayed(game),
      highScore: this.getHighScore(game),
      winRate: this.getGameWinRate(game)
    };
  }

  getGameWinRate(game) {
    const wins = this.getWins(game);
    const losses = this.getLosses(game);
    const total = wins + losses;
    if (total === 0) return 0;
    return (wins / total) * 100;
  }

  recordSession() {
    this.updateStatistics('session');
  }

  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      const migrated = this.migrate(imported);
      this.data = migrated;
      this.save();
      return true;
    } catch (e) {
      console.error('Failed to import save data:', e);
      return false;
    }
  }

  reset() {
    this.data = this.getDefaultData();
    this.save();
  }

  resetGame(game) {
    delete this.data.highScores[game];
    delete this.data.wins[game];
    delete this.data.losses[game];
    delete this.data.gamesPlayed[game];
    delete this.data.timePlayed[game];
    this.save();
  }

  getVersion() {
    return this.data.version;
  }
}
