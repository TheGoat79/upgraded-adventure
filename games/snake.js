import { Scene } from '../engine/scene.js';
import { Button, Panel, Label } from '../engine/ui.js';
import { PauseOverlay } from '../engine/pause.js';
import { CollisionUtils } from '../engine/collision.js';
import { ParticleSystem } from '../engine/particles.js';

export class SnakeGame extends Scene {
  constructor(engine) {
    super(engine);
    this.gridSize = 20;
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = { x: 0, y: 0 };
    this.score = 0;
    this.highScore = 0;
    this.speed = 150;
    this.baseSpeed = 150;
    this.minSpeed = 50;
    this.moveTimer = 0;
    this.gameOver = false;
    this.paused = false;
    this.particles = new ParticleSystem();
    this.pauseOverlay = null;
    this.mobileControls = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.createUI();
  }

  createUI() {
    this.scoreLabel = new Label(10, 10, 'Score: 0', 20, '#ffffff');
    this.highScoreLabel = new Label(10, 35, 'High Score: 0', 16, '#f39c12');
    
    this.pauseOverlay = new PauseOverlay(
      this,
      () => this.resume(),
      () => this.restart(),
      () => this.goToMenu(),
      () => this.showSettings()
    );
  }

  init() {
    this.snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.speed = this.baseSpeed;
    this.gameOver = false;
    this.paused = false;
    this.moveTimer = 0;
    this.spawnFood();
    this.highScore = window.save.getHighScore('snake');
    this.updateScore();
  }

  spawnFood() {
    const gridWidth = Math.floor(this.engine.width / this.gridSize);
    const gridHeight = Math.floor(this.engine.height / this.gridSize);
    
    let validPosition = false;
    while (!validPosition) {
      this.food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
      };
      
      validPosition = !this.snake.some(segment => 
        segment.x === this.food.x && segment.y === this.food.y
      );
    }
  }

  update(dt) {
    super.update(dt);
    
    if (this.gameOver || this.paused) return;
    
    this.handleInput();
    this.moveTimer += dt * 1000;
    
    if (this.moveTimer >= this.speed) {
      this.moveTimer = 0;
      this.move();
    }
    
    this.particles.update(dt);
  }

  handleInput() {
    if (window.input.isKeyPressed('ArrowUp') || window.input.isKeyPressed('KeyW')) {
      if (this.direction.y !== 1) {
        this.nextDirection = { x: 0, y: -1 };
      }
    } else if (window.input.isKeyPressed('ArrowDown') || window.input.isKeyPressed('KeyS')) {
      if (this.direction.y !== -1) {
        this.nextDirection = { x: 0, y: 1 };
      }
    } else if (window.input.isKeyPressed('ArrowLeft') || window.input.isKeyPressed('KeyA')) {
      if (this.direction.x !== 1) {
        this.nextDirection = { x: -1, y: 0 };
      }
    } else if (window.input.isKeyPressed('ArrowRight') || window.input.isKeyPressed('KeyD')) {
      if (this.direction.x !== -1) {
        this.nextDirection = { x: 1, y: 0 };
      }
    } else if (window.input.isKeyPressed('Escape') || window.input.isKeyPressed('KeyP')) {
      this.togglePause();
    }

    const swipe = window.input.getSwipe();
    if (swipe) {
      switch (swipe) {
        case 'up':
          if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
          break;
        case 'down':
          if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
          break;
        case 'left':
          if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
          break;
        case 'right':
          if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
          break;
      }
    }
  }

  move() {
    this.direction = { ...this.nextDirection };
    
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };
    
    const gridWidth = Math.floor(this.engine.width / this.gridSize);
    const gridHeight = Math.floor(this.engine.height / this.gridSize);
    
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      this.endGame();
      return;
    }
    
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame();
      return;
    }
    
    this.snake.unshift(head);
    
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.speed = Math.max(this.minSpeed, this.baseSpeed - Math.floor(this.score / 50) * 10);
      this.updateScore();
      this.spawnFood();
      window.audio.playCollect();
      
      this.particles.emit(
        head.x * this.gridSize + this.gridSize / 2,
        head.y * this.gridSize + this.gridSize / 2,
        10,
        {
          colors: ['#27ae60', '#2ecc71', '#f39c12'],
          minSpeed: 50,
          maxSpeed: 150,
          minLife: 0.3,
          maxLife: 0.6,
          minSize: 3,
          maxSize: 6
        }
      );
    } else {
      this.snake.pop();
    }
  }

  updateScore() {
    this.scoreLabel.text = `Score: ${this.score}`;
    this.highScoreLabel.text = `High Score: ${this.highScore}`;
  }

  endGame() {
    this.gameOver = true;
    window.audio.playExplosion();
    this.engine.transitions.shake(10, 0.5);
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      window.save.setHighScore('snake', this.score);
      this.updateScore();
    }
    
    window.save.addGamePlayed('snake');
    window.statistics.trackGamePlayed('snake');
    window.statistics.trackScore('snake', this.score);
    window.achievements.trackScore('snake', this.score);
    window.achievements.trackGamePlayed('snake');
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
    this.addUI(this.scoreLabel);
    this.addUI(this.highScoreLabel);
    window.audio.playGameMusic();
  }

  onExit() {
    this.removeUI(this.scoreLabel);
    this.removeUI(this.highScoreLabel);
    window.audio.stopMusic();
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    this.particles.render(ctx);
    
    this.snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#2ecc71' : '#27ae60';
      ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
      
      if (isHead) {
        ctx.fillStyle = '#ffffff';
        const eyeSize = 3;
        const eyeOffset = 5;
        
        if (this.direction.x === 1) {
          ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset, segment.y * this.gridSize + 5, eyeSize, eyeSize);
          ctx.fillRect(segment.x * this.gridSize + this.gridSize - eyeOffset, segment.y * this.gridSize + this.gridSize - 8, eyeSize, eyeSize);
        } else if (this.direction.x === -1) {
          ctx.fillRect(segment.x * this.gridSize + eyeOffset - 3, segment.y * this.gridSize + 5, eyeSize, eyeSize);
          ctx.fillRect(segment.x * this.gridSize + eyeOffset - 3, segment.y * this.gridSize + this.gridSize - 8, eyeSize, eyeSize);
        } else if (this.direction.y === -1) {
          ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + eyeOffset - 3, eyeSize, eyeSize);
          ctx.fillRect(segment.x * this.gridSize + this.gridSize - 8, segment.y * this.gridSize + eyeOffset - 3, eyeSize, eyeSize);
        } else {
          ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + this.gridSize - eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(segment.x * this.gridSize + this.gridSize - 8, segment.y * this.gridSize + this.gridSize - eyeOffset, eyeSize, eyeSize);
        }
      }
    });
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.engine.width, this.engine.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', this.engine.width / 2, this.engine.height / 2 - 50);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${this.score}`, this.engine.width / 2, this.engine.height / 2 + 10);
      
      ctx.font = '18px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Press SPACE to restart', this.engine.width / 2, this.engine.height / 2 + 50);
      ctx.fillText('Press ESC for menu', this.engine.width / 2, this.engine.height / 2 + 80);
      
      if (window.input.isKeyPressed('Space')) {
        this.restart();
      }
      if (window.input.isKeyPressed('Escape')) {
        this.goToMenu();
      }
    }
    
    super.render(ctx);
  }

  handleClick(x, y) {
    if (this.gameOver) {
      this.restart();
      return true;
    }
    return super.handleClick(x, y);
  }
}
