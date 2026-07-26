export class AchievementManager {
  constructor(saveManager) {
    this.save = saveManager;
    this.achievements = new Map();
    this.progress = new Map();
    this.listeners = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    this.registerDefaultAchievements();
    this.loadProgress();
    this.initialized = true;
  }

  registerDefaultAchievements() {
    // Game-specific achievements
    this.register('first_win', {
      name: 'First Win',
      description: 'Win your first game',
      icon: '🏆',
      hidden: false
    });

    this.register('score_100', {
      name: 'Century',
      description: 'Score 100 points in any game',
      icon: '💯',
      hidden: false
    });

    this.register('score_1000', {
      name: 'High Roller',
      description: 'Score 1000 points in any game',
      icon: '🎰',
      hidden: false
    });

    this.register('play_every_game', {
      name: 'Completionist',
      description: 'Play every game at least once',
      icon: '🎮',
      hidden: false
    });

    this.register('ten_wins', {
      name: 'Winner',
      description: 'Win 10 games',
      icon: '🥇',
      hidden: false
    });

    this.register('hundred_games', {
      name: 'Dedicated',
      description: 'Play 100 games',
      icon: '⭐',
      hidden: false
    });

    this.register('streak_5', {
      name: 'Hot Streak',
      description: 'Win 5 games in a row',
      icon: '🔥',
      hidden: false
    });

    this.register('time_hour', {
      name: 'Time Flies',
      description: 'Play for 1 hour total',
      icon: '⏰',
      hidden: false
    });

    // Snake-specific
    this.register('snake_score_50', {
      name: 'Snake Master',
      description: 'Score 50 in Snake',
      icon: '🐍',
      hidden: false,
      game: 'snake'
    });

    this.register('snake_score_100', {
      name: 'Snake Legend',
      description: 'Score 100 in Snake',
      icon: '👑',
      hidden: false,
      game: 'snake'
    });

    // Pong-specific
    this.register('pong_win_10', {
      name: 'Pong Champion',
      description: 'Win 10 games of Pong',
      icon: '🏓',
      hidden: false,
      game: 'pong'
    });

    // Breakout-specific
    this.register('breakout_clear', {
      name: 'Brick Breaker',
      description: 'Clear all bricks in Breakout',
      icon: '🧱',
      hidden: false,
      game: 'breakout'
    });

    // Memory-specific
    this.register('memory_perfect', {
      name: 'Perfect Memory',
      description: 'Complete Memory game with no mistakes',
      icon: '🧠',
      hidden: false,
      game: 'memory'
    });

    // Tic Tac Toe-specific
    this.register('tictactoe_win_5', {
      name: 'Tic Tac Toe Master',
      description: 'Win 5 games of Tic Tac Toe',
      icon: '❌',
      hidden: false,
      game: 'tictactoe'
    });
  }

  register(id, config) {
    this.achievements.set(id, {
      id,
      name: config.name || 'Unknown',
      description: config.description || '',
      icon: config.icon || '🏆',
      hidden: config.hidden || false,
      game: config.game || null,
      condition: config.condition || null
    });
  }

  loadProgress() {
    const savedAchievements = this.save.getAllAchievements();
    Object.entries(savedAchievements).forEach(([id, data]) => {
      if (data.unlocked) {
        this.progress.set(id, {
          unlocked: true,
          unlockedAt: data.unlockedAt
        });
      }
    });
  }

  saveProgress() {
    const toSave = {};
    this.progress.forEach((data, id) => {
      toSave[id] = data;
    });
    
    // Update save manager
    this.save.data.achievements = toSave;
    this.save.save();
  }

  unlock(id) {
    if (!this.achievements.has(id)) {
      console.warn(`Unknown achievement: ${id}`);
      return false;
    }

    if (this.isUnlocked(id)) {
      return false;
    }

    const achievement = this.achievements.get(id);
    this.progress.set(id, {
      unlocked: true,
      unlockedAt: Date.now()
    });

    this.save.unlockAchievement(id);
    this.notifyListeners(id, achievement);
    
    return true;
  }

  isUnlocked(id) {
    const progress = this.progress.get(id);
    return progress?.unlocked || false;
  }

  getProgress(id) {
    return this.progress.get(id) || { unlocked: false, unlockedAt: null };
  }

  getAchievement(id) {
    return this.achievements.get(id) || null;
  }

  getAllAchievements() {
    const result = [];
    this.achievements.forEach((achievement, id) => {
      result.push({
        ...achievement,
        progress: this.getProgress(id)
      });
    });
    return result;
  }

  getUnlockedAchievements() {
    return this.getAllAchievements().filter(a => a.progress.unlocked);
  }

  getLockedAchievements() {
    return this.getAllAchievements().filter(a => !a.progress.unlocked);
  }

  getAchievementsForGame(game) {
    return this.getAllAchievements().filter(a => !a.game || a.game === game);
  }

  onUnlock(id, callback) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }
    this.listeners.get(id).push(callback);
  }

  notifyListeners(id, achievement) {
    const callbacks = this.listeners.get(id) || [];
    callbacks.forEach(callback => {
      try {
        callback(achievement);
      } catch (error) {
        console.error('Error in achievement unlock callback:', error);
      }
    });
  }

  // Tracking methods
  trackWin(game) {
    if (!this.isUnlocked('first_win')) {
      this.unlock('first_win');
    }

    const totalWins = this.save.data.statistics.totalWins;
    if (totalWins >= 10 && !this.isUnlocked('ten_wins')) {
      this.unlock('ten_wins');
    }

    const currentStreak = this.save.data.statistics.currentStreak;
    if (currentStreak >= 5 && !this.isUnlocked('streak_5')) {
      this.unlock('streak_5');
    }

    // Game-specific
    if (game === 'pong') {
      const pongWins = this.save.getWins('pong');
      if (pongWins >= 10 && !this.isUnlocked('pong_win_10')) {
        this.unlock('pong_win_10');
      }
    }

    if (game === 'tictactoe') {
      const tttWins = this.save.getWins('tictactoe');
      if (tttWins >= 5 && !this.isUnlocked('tictactoe_win_5')) {
        this.unlock('tictactoe_win_5');
      }
    }
  }

  trackScore(game, score) {
    if (score >= 100 && !this.isUnlocked('score_100')) {
      this.unlock('score_100');
    }

    if (score >= 1000 && !this.isUnlocked('score_1000')) {
      this.unlock('score_1000');
    }

    // Game-specific
    if (game === 'snake') {
      if (score >= 50 && !this.isUnlocked('snake_score_50')) {
        this.unlock('snake_score_50');
      }
      if (score >= 100 && !this.isUnlocked('snake_score_100')) {
        this.unlock('snake_score_100');
      }
    }
  }

  trackGamePlayed(game) {
    const totalGames = this.save.data.statistics.totalGamesPlayed;
    if (totalGames >= 100 && !this.isUnlocked('hundred_games')) {
      this.unlock('hundred_games');
    }

    // Check if all games played
    const games = ['snake', 'pong', 'breakout', 'memory', 'tictactoe'];
    const allPlayed = games.every(g => this.save.getGamesPlayed(g) > 0);
    if (allPlayed && !this.isUnlocked('play_every_game')) {
      this.unlock('play_every_game');
    }
  }

  trackTimePlayed(seconds) {
    const totalTime = this.save.data.statistics.totalTimePlayed;
    if (totalTime >= 3600 && !this.isUnlocked('time_hour')) { // 1 hour
      this.unlock('time_hour');
    }
  }

  trackGameEvent(game, event, data) {
    switch (event) {
      case 'breakout_cleared':
        if (!this.isUnlocked('breakout_clear')) {
          this.unlock('breakout_clear');
        }
        break;
      case 'memory_perfect':
        if (!this.isUnlocked('memory_perfect')) {
          this.unlock('memory_perfect');
        }
        break;
    }
  }

  reset() {
    this.progress.clear();
    this.save.resetAchievements();
  }

  getStats() {
    const total = this.achievements.size;
    const unlocked = this.getUnlockedAchievements().length;
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;

    return {
      total,
      unlocked,
      locked: total - unlocked,
      percentage
    };
  }
}
