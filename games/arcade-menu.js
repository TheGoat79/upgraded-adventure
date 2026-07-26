import { Scene } from '../engine/scene.js';
import { Button, Panel, Label } from '../engine/ui.js';
import { ParticleSystem } from '../engine/particles.js';

export class ArcadeMenu extends Scene {
  constructor(engine) {
    super(engine);
    this.games = [
      { id: 'snake', name: 'Snake', description: 'Classic snake game', color: '#27ae60' },
      { id: 'pong', name: 'Pong', description: 'Table tennis classic', color: '#e74c3c' },
      { id: 'breakout', name: 'Breakout', description: 'Brick breaker', color: '#3498db' },
      { id: 'memory', name: 'Memory', description: 'Card matching game', color: '#9b59b6' },
      { id: 'tictactoe', name: 'Tic Tac Toe', description: 'X and O game', color: '#f39c12' }
    ];
    this.selectedGame = 0;
    this.titleAnimation = 0;
    this.particles = new ParticleSystem();
    this.menuButtons = [];
    this.createUI();
  }

  createUI() {
    const title = new Label(0, 50, 'MINI ARCADE', 48, '#ffffff');
    title.textAlign = 'center';
    title.x = this.engine.width / 2;
    this.titleLabel = title;

    const subtitle = new Label(0, 100, 'Select a game to play', 20, '#aaaaaa');
    subtitle.textAlign = 'center';
    subtitle.x = this.engine.width / 2;
    this.subtitleLabel = subtitle;

    const btnWidth = 180;
    const btnHeight = 60;
    const gap = 20;
    const startX = (this.engine.width - (btnWidth * 5 + gap * 4)) / 2;
    const startY = 180;

    this.games.forEach((game, index) => {
      const btn = new Button(
        startX + index * (btnWidth + gap),
        startY,
        btnWidth,
        btnHeight,
        game.name,
        () => this.selectGame(index)
      );
      btn.backgroundColor = game.color;
      btn.hoverColor = this.lightenColor(game.color, 20);
      btn.pressedColor = this.darkenColor(game.color, 20);
      this.menuButtons.push(btn);
    });

    const playBtn = new Button(
      (this.engine.width - 200) / 2,
      300,
      200,
      50,
      'PLAY',
      () => this.playSelectedGame()
    );
    playBtn.backgroundColor = '#27ae60';
    playBtn.hoverColor = '#2ecc71';
    playBtn.pressedColor = '#1e8449';
    this.playButton = playBtn;

    const settingsBtn = new Button(
      20,
      this.engine.height - 70,
      120,
      50,
      'Settings',
      () => this.showSettings()
    );
    this.settingsButton = settingsBtn;

    const creditsBtn = new Button(
      this.engine.width - 140,
      this.engine.height - 70,
      120,
      50,
      'Credits',
      () => this.showCredits()
    );
    this.creditsButton = creditsBtn;

    this.descriptionLabel = new Label(0, 380, '', 18, '#ffffff');
    this.descriptionLabel.textAlign = 'center';
    this.descriptionLabel.x = this.engine.width / 2;

    this.highScoreLabel = new Label(0, 420, '', 16, '#f39c12');
    this.highScoreLabel.textAlign = 'center';
    this.highScoreLabel.x = this.engine.width / 2;

    this.lastPlayedLabel = new Label(0, 450, '', 14, '#888888');
    this.lastPlayedLabel.textAlign = 'center';
    this.lastPlayedLabel.x = this.engine.width / 2;

    this.updateSelection();
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 + (B > 0 ? B : 0)).toString(16).slice(1);
  }

  selectGame(index) {
    this.selectedGame = index;
    window.audio.playSelect();
    this.updateSelection();
  }

  updateSelection() {
    const game = this.games[this.selectedGame];
    this.descriptionLabel.text = game.description;
    
    const highScore = window.save.getHighScore(game.id);
    this.highScoreLabel.text = highScore > 0 ? `High Score: ${highScore}` : '';
    
    const lastPlayed = window.save.getLastPlayed();
    this.lastPlayedLabel.text = lastPlayed === game.id ? 'Last played' : '';

    this.menuButtons.forEach((btn, i) => {
      btn.height = i === this.selectedGame ? 70 : 60;
      btn.y = 180 + (i === this.selectedGame ? -5 : 0);
    });
  }

  playSelectedGame() {
    const game = this.games[this.selectedGame];
    window.save.setLastPlayed(game.id);
    window.audio.playSelect();
    this.engine.switchScene(game.id);
  }

  showSettings() {
    window.audio.playSelect();
    // Create a simple settings overlay
    this.createSettingsOverlay();
  }

  createSettingsOverlay() {
    const panel = new Panel(0, 0, 400, 500, 'rgba(0, 0, 0, 0.9)');
    panel.x = (this.engine.width - panel.width) / 2;
    panel.y = (this.engine.height - panel.height) / 2;
    
    const titleLabel = new Label(0, panel.y + 30, 'STATISTICS', 32, '#ffffff');
    titleLabel.textAlign = 'center';
    titleLabel.x = this.engine.width / 2;
    
    const stats = window.statistics.getGlobalStatistics();
    
    const statsLabels = [
      new Label(panel.x + 20, panel.y + 80, `Total Games: ${stats.totalGamesPlayed}`, 16, '#ffffff'),
      new Label(panel.x + 20, panel.y + 110, `Total Time: ${window.statistics.formatTime(stats.totalTimePlayed)}`, 16, '#ffffff'),
      new Label(panel.x + 20, panel.y + 140, `Total Wins: ${stats.totalWins}`, 16, '#27ae60'),
      new Label(panel.x + 20, panel.y + 170, `Total Losses: ${stats.totalLosses}`, 16, '#e74c3c'),
      new Label(panel.x + 20, panel.y + 200, `Win Rate: ${stats.winRate.toFixed(1)}%`, 16, '#f39c12'),
      new Label(panel.x + 20, panel.y + 230, `Achievements: ${stats.achievementsUnlocked}`, 16, '#9b59b6'),
      new Label(panel.x + 20, panel.y + 260, `Longest Streak: ${stats.longestWinStreak}`, 16, '#3498db')
    ];
    
    const closeBtn = new Button(
      panel.x + 20,
      panel.y + panel.height - 60,
      panel.width - 40,
      40,
      'Close',
      () => {
        this.removeUI(panel);
        this.removeUI(titleLabel);
        statsLabels.forEach(label => this.removeUI(label));
        this.removeUI(closeBtn);
      }
    );
    
    this.addUI(panel);
    this.addUI(titleLabel);
    statsLabels.forEach(label => this.addUI(label));
    this.addUI(closeBtn);
  }

  showCredits() {
    window.audio.playSelect();
    // Credits implementation
  }

  onEnter() {
    this.addUI(this.titleLabel);
    this.addUI(this.subtitleLabel);
    this.menuButtons.forEach(btn => this.addUI(btn));
    this.addUI(this.playButton);
    this.addUI(this.settingsButton);
    this.addUI(this.creditsButton);
    this.addUI(this.descriptionLabel);
    this.addUI(this.highScoreLabel);
    this.addUI(this.lastPlayedLabel);
    window.audio.playMenuMusic();
  }

  onExit() {
    this.removeUI(this.titleLabel);
    this.removeUI(this.subtitleLabel);
    this.menuButtons.forEach(btn => this.removeUI(btn));
    this.removeUI(this.playButton);
    this.removeUI(this.settingsButton);
    this.removeUI(this.creditsButton);
    this.removeUI(this.descriptionLabel);
    this.removeUI(this.highScoreLabel);
    this.removeUI(this.lastPlayedLabel);
    window.audio.stopMusic();
  }

  update(dt) {
    super.update(dt);
    this.titleAnimation += dt;
    
    if (Math.random() < 0.1) {
      this.particles.emit(
        Math.random() * this.engine.width,
        this.engine.height,
        1,
        {
          colors: ['#ffffff', '#ffd700', '#ff6b6b'],
          minSpeed: 20,
          maxSpeed: 50,
          minLife: 2,
          maxLife: 4,
          minSize: 2,
          maxSize: 4,
          direction: -Math.PI / 2,
          spread: 0.5
        }
      );
    }
    
    this.particles.update(dt);
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    this.particles.render(ctx);
    
    const titleOffset = Math.sin(this.titleAnimation * 3) * 5;
    this.titleLabel.y = 50 + titleOffset;
    
    super.render(ctx);
  }

  handleClick(x, y) {
    return super.handleClick(x, y);
  }
}
