import { Scene } from '../engine/scene.js';
import { Button, Panel, Label } from '../engine/ui.js';
import { PauseOverlay } from '../engine/pause.js';
import { CollisionUtils } from '../engine/collision.js';
import { ParticleSystem } from '../engine/particles.js';

export class BreakoutGame extends Scene {
  constructor(engine) {
    super(engine);
    this.paddleWidth = 100;
    this.paddleHeight = 15;
    this.ballSize = 12;
    this.brickRows = 5;
    this.brickCols = 8;
    this.brickWidth = 80;
    this.brickHeight = 25;
    this.brickPadding = 5;
    this.paddleSpeed = 500;
    this.ballSpeed = 300;
    this.lives = 3;
    this.score = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.particles = new ParticleSystem();
    this.pauseOverlay = null;
    this.powerUps = [];
    this.activePowerUp = null;
    this.powerUpTimer = 0;
    this.createUI();
  }

  createUI() {
    this.scoreLabel = new Label(10, 10, 'Score: 0', 18, '#ffffff');
    this.livesLabel = new Label(10, 35, 'Lives: 3', 18, '#e74c3c');
    this.levelLabel = new Label(10, 60, 'Level: 1', 18, '#3498db');
    
    this.pauseOverlay = new PauseOverlay(
      this,
      () => this.resume(),
      () => this.restart(),
      () => this.goToMenu(),
      () => this.showSettings()
    );
  }

  init() {
    this.paddle = {
      x: this.engine.width / 2 - this.paddleWidth / 2,
      y: this.engine.height - 40,
      width: this.paddleWidth,
      height: this.paddleHeight
    };
    
    this.ball = {
      x: this.engine.width / 2,
      y: this.engine.height - 60,
      radius: this.ballSize / 2,
      vx: this.ballSpeed * (Math.random() - 0.5),
      vy: -this.ballSpeed
    };
    
    this.bricks = [];
    this.createBricks();
    
    this.lives = 3;
    this.score = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.powerUps = [];
    this.activePowerUp = null;
    this.powerUpTimer = 0;
    this.updateUI();
  }

  createBricks() {
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#27ae60', '#3498db'];
    const startX = (this.engine.width - (this.brickCols * (this.brickWidth + this.brickPadding))) / 2;
    const startY = 80;
    
    for (let row = 0; row < this.brickRows; row++) {
      for (let col = 0; col < this.brickCols; col++) {
        this.bricks.push({
          x: startX + col * (this.brickWidth + this.brickPadding),
          y: startY + row * (this.brickHeight + this.brickPadding),
          width: this.brickWidth,
          height: this.brickHeight,
          color: colors[row % colors.length],
          alive: true,
          points: (this.brickRows - row) * 10
        });
      }
    }
  }

  update(dt) {
    super.update(dt);
    
    if (this.gameOver || this.paused) return;
    
    this.handleInput();
    this.updateBall(dt);
    this.updatePaddle(dt);
    this.updatePowerUps(dt);
    this.particles.update(dt);
    
    if (this.bricks.every(brick => !brick.alive)) {
      this.nextLevel();
    }
  }

  handleInput() {
    if (window.input.isKeyDown('ArrowLeft') || window.input.isKeyDown('KeyA')) {
      this.paddle.x -= this.paddleSpeed * dt;
    }
    if (window.input.isKeyDown('ArrowRight') || window.input.isKeyDown('KeyD')) {
      this.paddle.x += this.paddleSpeed * dt;
    }
    
    if (window.input.isKeyPressed('Escape') || window.input.isKeyPressed('KeyP')) {
      this.togglePause();
    }
    
    const swipe = window.input.getSwipe();
    if (swipe === 'left') {
      this.paddle.x -= this.paddleSpeed * dt * 2;
    } else if (swipe === 'right') {
      this.paddle.x += this.paddleSpeed * dt * 2;
    }
  }

  updateBall(dt) {
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;
    
    if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.engine.width) {
      this.ball.vx *= -1;
      this.ball.x = Math.max(this.ball.radius, Math.min(this.engine.width - this.ball.radius, this.ball.x));
      window.audio.playHit();
    }
    
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.vy *= -1;
      this.ball.y = this.ball.radius;
      window.audio.playHit();
    }
    
    if (this.ball.y + this.ball.radius > this.engine.height) {
      this.loseLife();
      return;
    }
    
    if (CollisionUtils.rectCircleIntersect(this.paddle, this.ball)) {
      this.ball.vy = -Math.abs(this.ball.vy);
      this.ball.y = this.paddle.y - this.ball.radius;
      
      const hitOffset = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
      this.ball.vx += hitOffset * 100;
      
      window.audio.playHit();
      
      this.particles.emit(this.ball.x, this.ball.y, 5, {
        colors: ['#3498db', '#2980b9'],
        minSpeed: 50,
        maxSpeed: 100,
        minLife: 0.2,
        maxLife: 0.4,
        minSize: 2,
        maxSize: 4
      });
    }
    
    for (let brick of this.bricks) {
      if (brick.alive && CollisionUtils.rectCircleIntersect(brick, this.ball)) {
        brick.alive = false;
        this.score += brick.points;
        this.updateUI();
        
        const ballCenterX = this.ball.x;
        const ballCenterY = this.ball.y;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          this.ball.vx *= -1;
        } else {
          this.ball.vy *= -1;
        }
        
        window.audio.playCollect();
        
        this.particles.emit(brick.x + brick.width / 2, brick.y + brick.height / 2, 8, {
          colors: [brick.color],
          minSpeed: 50,
          maxSpeed: 150,
          minLife: 0.3,
          maxLife: 0.6,
          minSize: 3,
          maxSize: 6
        });
        
        if (Math.random() < 0.2) {
          this.spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
        }
        
        break;
      }
    }
  }

  updatePaddle(dt) {
    this.paddle.x = Math.max(0, Math.min(this.engine.width - this.paddle.width, this.paddle.x));
  }

  updatePowerUps(dt) {
    this.powerUpTimer -= dt;
    if (this.powerUpTimer <= 0 && this.activePowerUp) {
      this.deactivatePowerUp();
    }
    
    this.powerUps = this.powerUps.filter(powerUp => {
      powerUp.y += 100 * dt;
      
      if (CollisionUtils.rectCircleIntersect(this.paddle, { x: powerUp.x, y: powerUp.y, radius: 15 })) {
        this.activatePowerUp(powerUp.type);
        window.audio.playCollect();
        return false;
      }
      
      return powerUp.y < this.engine.height;
    });
  }

  spawnPowerUp(x, y) {
    const types = ['expand', 'shrink', 'slow', 'fast'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push({ x, y, type });
  }

  activatePowerUp(type) {
    this.activePowerUp = type;
    this.powerUpTimer = 10;
    
    switch (type) {
      case 'expand':
        this.paddle.width = this.paddleWidth * 1.5;
        break;
      case 'shrink':
        this.paddle.width = this.paddleWidth * 0.7;
        break;
      case 'slow':
        this.ball.vx *= 0.7;
        this.ball.vy *= 0.7;
        break;
      case 'fast':
        this.ball.vx *= 1.3;
        this.ball.vy *= 1.3;
        break;
    }
  }

  deactivatePowerUp() {
    if (!this.activePowerUp) return;
    
    switch (this.activePowerUp) {
      case 'expand':
      case 'shrink':
        this.paddle.width = this.paddleWidth;
        break;
      case 'slow':
      case 'fast':
        const currentSpeed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        const targetSpeed = this.ballSpeed;
        const scale = targetSpeed / currentSpeed;
        this.ball.vx *= scale;
        this.ball.vy *= scale;
        break;
    }
    
    this.activePowerUp = null;
  }

  loseLife() {
    this.lives--;
    this.updateUI();
    this.engine.transitions.shake(5, 0.3);
    
    if (this.lives <= 0) {
      this.endGame();
    } else {
      this.resetBall();
      window.audio.playExplosion();
    }
  }

  resetBall() {
    this.ball.x = this.engine.width / 2;
    this.ball.y = this.engine.height - 60;
    this.ball.vx = this.ballSpeed * (Math.random() - 0.5);
    this.ball.vy = -this.ballSpeed;
    this.deactivatePowerUp();
  }

  nextLevel() {
    this.level++;
    this.ballSpeed += 30;
    this.createBricks();
    this.resetBall();
    this.updateUI();
    window.audio.playScore();
  }

  updateUI() {
    this.scoreLabel.text = `Score: ${this.score}`;
    this.livesLabel.text = `Lives: ${this.lives}`;
    this.levelLabel.text = `Level: ${this.level}`;
  }

  endGame() {
    this.gameOver = true;
    window.save.setHighScore('breakout', this.score);
    window.save.addGamePlayed('breakout');
    window.audio.playExplosion();
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
    this.addUI(this.livesLabel);
    this.addUI(this.levelLabel);
    window.audio.playGameMusic();
  }

  onExit() {
    this.removeUI(this.scoreLabel);
    this.removeUI(this.livesLabel);
    this.removeUI(this.levelLabel);
    window.audio.stopMusic();
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    this.bricks.forEach(brick => {
      if (brick.alive) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    this.powerUps.forEach(powerUp => {
      const colors = {
        expand: '#27ae60',
        shrink: '#e74c3c',
        slow: '#3498db',
        fast: '#f39c12'
      };
      ctx.fillStyle = colors[powerUp.type];
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbols = { expand: '+', shrink: '-', slow: 'S', fast: 'F' };
      ctx.fillText(symbols[powerUp.type], powerUp.x, powerUp.y);
    });
    
    this.particles.render(ctx);
    
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.engine.width, this.engine.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', this.engine.width / 2, this.engine.height / 2 - 50);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${this.score}`, this.engine.width / 2, this.engine.height / 2 + 10);
      ctx.fillText(`Level: ${this.level}`, this.engine.width / 2, this.engine.height / 2 + 40);
      
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

  handleClick(x, y) {
    if (this.gameOver) {
      this.restart();
      return true;
    }
    return super.handleClick(x, y);
  }
}
