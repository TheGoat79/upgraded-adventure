import { Scene } from '../engine/scene.js';
import { Button, Panel, Label } from '../engine/ui.js';
import { PauseOverlay } from '../engine/pause.js';
import { ParticleSystem } from '../engine/particles.js';

export class MemoryGame extends Scene {
  constructor(engine) {
    super(engine);
    this.boardSize = 4;
    this.cardSize = 80;
    this.cardGap = 10;
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.timer = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.paused = false;
    this.difficulty = 'medium';
    this.flipDelay = 500;
    this.canFlip = true;
    this.particles = new ParticleSystem();
    this.pauseOverlay = null;
    this.createUI();
  }

  createUI() {
    this.movesLabel = new Label(10, 10, 'Moves: 0', 18, '#ffffff');
    this.timerLabel = new Label(10, 35, 'Time: 0:00', 18, '#ffffff');
    this.difficultyLabel = new Label(10, 60, 'Difficulty: Medium', 16, '#f39c12');
    
    this.pauseOverlay = new PauseOverlay(
      this,
      () => this.resume(),
      () => this.restart(),
      () => this.goToMenu(),
      () => this.showSettings()
    );
  }

  init() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.timer = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.paused = false;
    this.canFlip = true;
    
    this.setDifficulty(this.difficulty);
    this.createBoard();
    this.updateUI();
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    switch (difficulty) {
      case 'easy':
        this.boardSize = 4;
        break;
      case 'medium':
        this.boardSize = 4;
        break;
      case 'hard':
        this.boardSize = 6;
        break;
    }
  }

  createBoard() {
    const totalPairs = (this.boardSize * this.boardSize) / 2;
    const symbols = this.generateSymbols(totalPairs);
    const cardValues = [...symbols, ...symbols];
    this.shuffleArray(cardValues);
    
    const boardWidth = this.boardSize * (this.cardSize + this.cardGap) - this.cardGap;
    const boardHeight = this.boardSize * (this.cardSize + this.cardGap) - this.cardGap;
    const startX = (this.engine.width - boardWidth) / 2;
    const startY = (this.engine.height - boardHeight) / 2 + 30;
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const index = i * this.boardSize + j;
        this.cards.push({
          x: startX + j * (this.cardSize + this.cardGap),
          y: startY + i * (this.cardSize + this.cardGap),
          width: this.cardSize,
          height: this.cardSize,
          value: cardValues[index],
          flipped: false,
          matched: false,
          flipProgress: 0
        });
      }
    }
  }

  generateSymbols(count) {
    const symbols = [];
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    
    for (let i = 0; i < count; i++) {
      symbols.push({
        type: i % 8,
        color: colors[i % colors.length]
      });
    }
    
    return symbols;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  update(dt) {
    super.update(dt);
    
    if (this.gameOver || this.paused) return;
    
    if (this.gameStarted) {
      this.timer += dt;
      this.updateTimerDisplay();
    }
    
    this.cards.forEach(card => {
      if (card.flipped && card.flipProgress < 1) {
        card.flipProgress = Math.min(1, card.flipProgress + dt * 5);
      } else if (!card.flipped && card.flipProgress > 0) {
        card.flipProgress = Math.max(0, card.flipProgress - dt * 5);
      }
    });
    
    this.particles.update(dt);
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = Math.floor(this.timer % 60);
    this.timerLabel.text = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  updateUI() {
    this.movesLabel.text = `Moves: ${this.moves}`;
    this.difficultyLabel.text = `Difficulty: ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
  }

  handleClick(x, y) {
    if (this.gameOver || this.paused || !this.canFlip) return false;
    
    for (let card of this.cards) {
      if (card.flipped || card.matched) continue;
      
      if (x >= card.x && x <= card.x + card.width &&
          y >= card.y && y <= card.y + card.height) {
        
        if (!this.gameStarted) {
          this.gameStarted = true;
        }
        
        this.flipCard(card);
        return true;
      }
    }
    
    return super.handleClick(x, y);
  }

  flipCard(card) {
    card.flipped = true;
    this.flippedCards.push(card);
    window.audio.playSelect();
    
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.updateUI();
      this.canFlip = false;
      
      setTimeout(() => this.checkMatch(), this.flipDelay);
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    
    if (card1.value.type === card2.value.type) {
      card1.matched = true;
      card2.matched = true;
      this.matchedPairs++;
      window.audio.playCollect();
      
      this.particles.emit(card1.x + card1.width / 2, card1.y + card1.height / 2, 10, {
        colors: ['#27ae60', '#2ecc71', '#f39c12'],
        minSpeed: 50,
        maxSpeed: 150,
        minLife: 0.5,
        maxLife: 1,
        minSize: 3,
        maxSize: 6
      });
      
      this.particles.emit(card2.x + card2.width / 2, card2.y + card2.height / 2, 10, {
        colors: ['#27ae60', '#2ecc71', '#f39c12'],
        minSpeed: 50,
        maxSpeed: 150,
        minLife: 0.5,
        maxLife: 1,
        minSize: 3,
        maxSize: 6
      });
      
      if (this.matchedPairs === (this.boardSize * this.boardSize) / 2) {
        this.endGame();
      }
    } else {
      card1.flipped = false;
      card2.flipped = false;
      window.audio.playHit();
    }
    
    this.flippedCards = [];
    this.canFlip = true;
  }

  endGame() {
    this.gameOver = true;
    window.audio.playScore();
    this.engine.transitions.shake(5, 0.4);
    
    const score = Math.max(0, 1000 - this.moves * 10 - Math.floor(this.timer));
    window.save.setHighScore('memory', score);
    window.save.addGamePlayed('memory');
    window.statistics.trackGamePlayed('memory');
    window.statistics.trackScore('memory', score);
    window.achievements.trackScore('memory', score);
    window.achievements.trackGamePlayed('memory');
    
    // Track perfect game achievement
    if (this.moves === this.cards.length / 2) {
      window.achievements.trackGameEvent('memory', 'memory_perfect');
    }
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.pauseOverlay.show();
    } else {
      this.pauseOverlay.hide();
    }
  }

  resume() {
    this.paused = false;
  }

  restart() {
    this.init();
  }

  goToMenu() {
    this.engine.switchScene('menu');
  }

  showSettings() {
    // Settings implementation
  }

  onEnter() {
    this.init();
    this.addUI(this.movesLabel);
    this.addUI(this.timerLabel);
    this.addUI(this.difficultyLabel);
    window.audio.playGameMusic();
  }

  onExit() {
    this.removeUI(this.movesLabel);
    this.removeUI(this.timerLabel);
    this.removeUI(this.difficultyLabel);
    window.audio.stopMusic();
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    this.cards.forEach(card => {
      const progress = card.flipProgress;
      const scaleX = Math.cos(progress * Math.PI / 2);
      
      ctx.save();
      ctx.translate(card.x + card.width / 2, card.y + card.height / 2);
      ctx.scale(scaleX, 1);
      
      if (card.flipped || card.matched) {
        ctx.fillStyle = card.matched ? '#27ae60' : card.value.color;
        ctx.fillRect(-card.width / 2, -card.height / 2, card.width, card.height);
        
        if (card.flipped || card.matched) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '32px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const symbols = ['★', '●', '■', '▲', '♦', '♠', '♥', '♣'];
          ctx.fillText(symbols[card.value.type], 0, 0);
        }
      } else {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(-card.width / 2, -card.height / 2, card.width, card.height);
        
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.strokeRect(-card.width / 2, -card.height / 2, card.width, card.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
      }
      
      ctx.restore();
    });
    
    this.particles.render(ctx);
    
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.engine.width, this.engine.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU WIN!', this.engine.width / 2, this.engine.height / 2 - 50);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Moves: ${this.moves}`, this.engine.width / 2, this.engine.height / 2 + 10);
      ctx.fillText(`Time: ${this.timerLabel.text.split(': ')[1]}`, this.engine.width / 2, this.engine.height / 2 + 40);
      
      ctx.font = '18px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Press SPACE to restart', this.engine.width / 2, this.engine.height / 2 + 80);
      ctx.fillText('Press ESC for menu', this.engine.width / 2, this.engine.height / 2 + 110);
      
      if (window.input.isKeyPressed('Space')) {
        this.restart();
      }
      if (window.input.isKeyPressed('Escape')) {
        this.goToMenu();
      }
    }
    
    super.render(ctx);
  }
}
