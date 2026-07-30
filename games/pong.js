import { Scene } from '../engine/Scene.js';
import { Button, Panel, Label } from '../engine/UI.js';
import { PauseOverlay } from '../engine/pause.js';
import { CollisionUtils } from '../engine/Collision.js';
import { ParticleSystem } from '../engine/particles.js';

export class PongGame extends Scene {
  constructor(engine) {
    super(engine);
    this.paddleWidth = 15;
    this.paddleHeight = 80;
    this.ballSize = 15;
    this.paddleSpeed = 400;
    this.ballSpeed = 300;
    this.playerScore = 0;
    this.aiScore = 0;
    this.maxScore = 5;
    this.difficulty = 'medium';
    this.gameOver = false;
    this.paused = false;
    this.particles = new ParticleSystem();
    this.pauseOverlay = null;
    this.createUI();
  }

  createUI() {
    try {
      this.scoreLabel = new Label(0, 20, '0 - 0', 32, '#ffffff');
      this.scoreLabel.textAlign = 'center';
      this.scoreLabel.x = this.engine.width / 2;
      
      this.difficultyLabel = new Label(10, 10, 'Difficulty: Medium', 16, '#f39c12');
      
      this.pauseOverlay = new PauseOverlay(
        this,
        () => this.resume(),
        () => this.restart(),
        () => this.goToMenu(),
        () => this.showSettings()
      );
    } catch (error) {
      console.error('Pong game UI creation failed:', error);
    }
  }

  init() {
    try {
      this.playerPaddle = {
        x: 30,
        y: this.engine.height / 2 - this.paddleHeight / 2,
        width: this.paddleWidth,
        height: this.paddleHeight
      };
      
      this.aiPaddle = {
        x: this.engine.width - 30 - this.paddleWidth,
        y: this.engine.height / 2 - this.paddleHeight / 2,
        width: this.paddleWidth,
        height: this.paddleHeight
      };
      
      this.ball = {
        x: this.engine.width / 2,
        y: this.engine.height / 2,
        radius: this.ballSize / 2,
        vx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        vy: this.ballSpeed * (Math.random() - 0.5)
      };
      
      this.playerScore = 0;
      this.aiScore = 0;
      this.gameOver = false;
      this.paused = false;
      this.updateScore();
    } catch (error) {
      console.error('Pong game initialization failed:', error);
      this.gameOver = true;
    }
  }

  update(dt) {
    super.update(dt);
    
    if (this.gameOver || this.paused) return;
    
    this.handleInput();
    this.updateAI(dt);
    this.updateBall(dt);
    this.updatePaddles(dt);
    this.particles.update(dt);
  }

  handleInput() {
    if (window.input.isKeyDown('ArrowUp') || window.input.isKeyDown('KeyW')) {
      this.playerPaddle.y -= this.paddleSpeed * 0.016;
    }
    if (window.input.isKeyDown('ArrowDown') || window.input.isKeyDown('KeyS')) {
      this.playerPaddle.y += this.paddleSpeed * 0.016;
    }
    
    if (window.input.isKeyPressed('Escape') || window.input.isKeyPressed('KeyP')) {
      this.togglePause();
    }
    
    const swipe = window.input.getSwipe();
    if (swipe === 'up') {
      this.playerPaddle.y -= this.paddleSpeed * 0.05;
    } else if (swipe === 'down') {
      this.playerPaddle.y += this.paddleSpeed * 0.05;
    }
  }

  updateAI(dt) {
    const aiSpeed = this.difficulty === 'easy' ? 200 : this.difficulty === 'medium' ? 300 : 400;
    const reactionDelay = this.difficulty === 'easy' ? 0.3 : this.difficulty === 'medium' ? 0.15 : 0.05;
    
    const targetY = this.ball.y - this.aiPaddle.height / 2;
    const diff = targetY - this.aiPaddle.y;
    
    if (Math.abs(diff) > 10) {
      this.aiPaddle.y += Math.sign(diff) * aiSpeed * dt;
    }
  }

  updateBall(dt) {
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;
    
    if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.engine.height) {
      this.ball.vy *= -1;
      this.ball.y = Math.max(this.ball.radius, Math.min(this.engine.height - this.ball.radius, this.ball.y));
      window.audio.playHit();
    }
    
    if (CollisionUtils.rectCircleIntersect(this.playerPaddle, this.ball)) {
      this.ball.vx = Math.abs(this.ball.vx);
      this.ball.x = this.playerPaddle.x + this.playerPaddle.width + this.ball.radius;
      this.addSpinToBall(this.playerPaddle);
      this.increaseBallSpeed();
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
    
    if (CollisionUtils.rectCircleIntersect(this.aiPaddle, this.ball)) {
      this.ball.vx = -Math.abs(this.ball.vx);
      this.ball.x = this.aiPaddle.x - this.ball.radius;
      this.addSpinToBall(this.aiPaddle);
      this.increaseBallSpeed();
      window.audio.playHit();
      
      this.particles.emit(this.ball.x, this.ball.y, 5, {
        colors: ['#e74c3c', '#c0392b'],
        minSpeed: 50,
        maxSpeed: 100,
        minLife: 0.2,
        maxLife: 0.4,
        minSize: 2,
        maxSize: 4
      });
    }
    
    if (this.ball.x < 0) {
      this.aiScore++;
      this.updateScore();
      this.resetBall();
      window.audio.playExplosion();
    }
    
    if (this.ball.x > this.engine.width) {
      this.playerScore++;
      this.updateScore();
      this.resetBall();
      window.audio.playScore();
    }
    
    if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
      this.endGame();
    }
  }

  addSpinToBall(paddle) {
    const paddleCenter = paddle.y + paddle.height / 2;
    const hitOffset = (this.ball.y - paddleCenter) / (paddle.height / 2);
    this.ball.vy += hitOffset * 100;
  }

  increaseBallSpeed() {
    this.ball.vx *= 1.05;
    this.ball.vy *= 1.05;
    
    const maxSpeed = 600;
    const currentSpeed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      this.ball.vx *= scale;
      this.ball.vy *= scale;
    }
  }

  updatePaddles(dt) {
    this.playerPaddle.y = Math.max(0, Math.min(this.engine.height - this.playerPaddle.height, this.playerPaddle.y));
    this.aiPaddle.y = Math.max(0, Math.min(this.engine.height - this.aiPaddle.height, this.aiPaddle.y));
  }

  resetBall() {
    this.ball.x = this.engine.width / 2;
    this.ball.y = this.engine.height / 2;
    this.ball.vx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    this.ball.vy = this.ballSpeed * (Math.random() - 0.5);
  }

  updateScore() {
    this.scoreLabel.text = `${this.playerScore} - ${this.aiScore}`;
  }

  endGame() {
    this.gameOver = true;
    this.engine.transitions.shake(8, 0.3);
    
    if (this.playerScore > this.aiScore) {
      window.save.addWin('pong');
      window.statistics.trackGameWon('pong');
      window.achievements.trackWin('pong');
      window.audio.playScore();
    } else {
      window.save.addLoss('pong');
      window.statistics.trackGameLost('pong');
      window.audio.playExplosion();
    }
    
    window.save.addGamePlayed('pong');
    window.statistics.trackGamePlayed('pong');
    window.achievements.trackGamePlayed('pong');
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
    this.addUI(this.difficultyLabel);
    window.audio.playGameMusic();
  }

  onExit() {
    this.removeUI(this.scoreLabel);
    this.removeUI(this.difficultyLabel);
    window.audio.stopMusic();
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.engine.width / 2, 0);
    ctx.lineTo(this.engine.width / 2, this.engine.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height);
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    this.particles.render(ctx);
    
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.engine.width, this.engine.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const message = this.playerScore > this.aiScore ? 'YOU WIN!' : 'AI WINS!';
      ctx.fillText(message, this.engine.width / 2, this.engine.height / 2 - 50);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${this.playerScore} - ${this.aiScore}`, this.engine.width / 2, this.engine.height / 2 + 10);
      
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
