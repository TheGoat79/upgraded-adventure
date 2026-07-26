export class StatisticsManager {
  constructor(saveManager) {
    this.save = saveManager;
    this.sessionStartTime = null;
    this.sessionGamesPlayed = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    this.sessionStartTime = Date.now();
    this.initialized = true;
  }

  startSession() {
    this.sessionStartTime = Date.now();
    this.sessionGamesPlayed = 0;
  }

  endSession() {
    if (this.sessionStartTime) {
      const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;
      this.save.addTimePlayed('total', sessionDuration);
      this.save.recordSession();
    }
  }

  trackGamePlayed(game) {
    this.sessionGamesPlayed++;
    this.save.addGamePlayed(game);
  }

  trackGameWon(game) {
    this.save.addWin(game);
  }

  trackGameLost(game) {
    this.save.addLoss(game);
  }

  trackScore(game, score) {
    this.save.addScore(game, score);
    this.save.setHighScore(game, score);
  }

  trackTimePlayed(game, seconds) {
    this.save.addTimePlayed(game, seconds);
  }

  getGlobalStatistics() {
    const stats = this.save.getStatistics();
    return {
      totalGamesPlayed: stats.totalGamesPlayed,
      totalTimePlayed: stats.totalTimePlayed,
      totalWins: stats.totalWins,
      totalLosses: stats.totalLosses,
      currentStreak: stats.currentStreak,
      longestWinStreak: stats.longestWinStreak,
      longestLoseStreak: stats.longestLoseStreak,
      averageScore: stats.averageScore,
      totalScore: stats.totalScore,
      achievementsUnlocked: stats.achievementsUnlocked,
      totalSessions: stats.totalSessions,
      winRate: this.save.getWinRate()
    };
  }

  getGameStatistics(game) {
    return this.save.getGameStats(game);
  }

  getAllGameStatistics() {
    const games = ['snake', 'pong', 'breakout', 'memory', 'tictactoe'];
    const stats = {};
    
    games.forEach(game => {
      stats[game] = this.getGameStatistics(game);
    });
    
    return stats;
  }

  getSessionStatistics() {
    const sessionDuration = this.sessionStartTime 
      ? (Date.now() - this.sessionStartTime) / 1000 
      : 0;

    return {
      sessionStartTime: this.sessionStartTime,
      sessionDuration,
      gamesPlayed: this.sessionGamesPlayed
    };
  }

  getMostPlayedGame() {
    const games = this.getAllGameStatistics();
    let mostPlayed = null;
    let maxCount = 0;

    Object.entries(games).forEach(([game, stats]) => {
      if (stats.gamesPlayed > maxCount) {
        maxCount = stats.gamesPlayed;
        mostPlayed = game;
      }
    });

    return mostPlayed;
  }

  getHighestWinRate() {
    const games = this.getAllGameStatistics();
    let highest = null;
    let maxRate = 0;

    Object.entries(games).forEach(([game, stats]) => {
      if (stats.winRate > maxRate && stats.gamesPlayed > 0) {
        maxRate = stats.winRate;
        highest = game;
      }
    });

    return { game: highest, winRate: maxRate };
  }

  getTotalTimePlayedFormatted() {
    const total = this.save.data.statistics.totalTimePlayed;
    return this.formatTime(total);
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  getRecentActivity(limit = 10) {
    // This would require tracking individual game sessions
    // For now, return basic info
    return {
      lastPlayed: this.save.getLastPlayed(),
      totalSessions: this.save.data.statistics.totalSessions
    };
  }

  getPerformanceSummary() {
    const global = this.getGlobalStatistics();
    const games = this.getAllGameStatistics();

    return {
      overall: {
        winRate: global.winRate,
        averageScore: global.averageScore,
        totalTime: this.getTotalTimePlayedFormatted()
      },
      byGame: games,
      highlights: {
        mostPlayed: this.getMostPlayedGame(),
        highestWinRate: this.getHighestWinRate(),
        longestStreak: global.longestWinStreak
      }
    };
  }

  exportStatistics() {
    return {
      global: this.getGlobalStatistics(),
      games: this.getAllGameStatistics(),
      session: this.getSessionStatistics(),
      summary: this.getPerformanceSummary()
    };
  }

  reset() {
    this.save.data.statistics = this.save.getDefaultStatistics();
    this.save.save();
  }
}
