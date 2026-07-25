import { Scene } from '../engine/scene.js';
import { Button, Panel, Label } from '../engine/ui.js';
import { PauseOverlay } from '../engine/pause.js';
import { ParticleSystem } from '../engine/particles.js';

export class TicTacToeGame extends Scene {
  constructor(engine) {
    super(engine);
    this.boardSize = 3;
    this.cellSize = 100;
    this.cellGap = 10;
    this.board = [];
    this.currentPlayer = 'X';
    this.gameMode = 'pvp';
    this.aiDifficulty = 'medium';
    this.gameOver = false;
    this.winner = null;
    this.paused = false;
    this.particles = new ParticleSystem();
    this.pauseOverlay = null;
    this.createUI();
  }

  createUI() {
    this.statusLabel = new Label(0, 20, "Player X's turn", 24, '#ffffff');
    this.statusLabel.textAlign = 'center';
    this.statusLabel.x = this.engine.width / 2;
    
    this.modeLabel = new Label(10, 10, 'Mode: PvP', 16, '#f39c12');
    
    this.difficultyLabel = new Label(10, 35, 'AI: Medium', 16, '#3498db');
    this.difficultyLabel.visible = false;
    
    this.pauseOverlay = new PauseOverlay(
      this,
      () => this.resume(),
      () => this.restart(),
      () => this.goToMenu(),
      () => this.showSettings()
    );
  }

  init() {
    this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.paused = false;
    this.updateUI();
  }

  update(dt) {
    super.update(dt);
    
    if (this.gameOver || this.paused) return;
    
    if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
      this.makeAIMove();
    }
    
    this.particles.update(dt);
  }

  handleClick(x, y) {
    if (this.gameOver || this.paused) return false;
    
    if (this.gameMode === 'ai' && this.currentPlayer === 'O') return false;
    
    const boardWidth = this.boardSize * (this.cellSize + this.cellGap) - this.cellGap;
    const boardHeight = this.boardSize * (this.cellSize + this.cellGap) - this.cellGap;
    const startX = (this.engine.width - boardWidth) / 2;
    const startY = (this.engine.height - boardHeight) / 2 + 40;
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const cellX = startX + j * (this.cellSize + this.cellGap);
        const cellY = startY + i * (this.cellSize + this.cellGap);
        
        if (x >= cellX && x <= cellX + this.cellSize &&
            y >= cellY && y <= cellY + this.cellSize) {
          
          if (this.board[i][j] === null) {
            this.makeMove(i, j);
            return true;
          }
        }
      }
    }
    
    return super.handleClick(x, y);
  }

  makeMove(row, col) {
    this.board[row][col] = this.currentPlayer;
    window.audio.playSelect();
    this.engine.transitions.shake(3, 0.2);
    
    this.particles.emit(
      this.engine.width / 2 + (col - 1) * (this.cellSize + this.cellGap),
      this.engine.height / 2 + 40 + (row - 1) * (this.cellSize + this.cellGap),
      8,
      {
        colors: this.currentPlayer === 'X' ? ['#e74c3c', '#c0392b'] : ['#3498db', '#2980b9'],
        minSpeed: 50,
        maxSpeed: 150,
        minLife: 0.3,
        maxLife: 0.6,
        minSize: 3,
        maxSize: 6
      }
    );
    
    if (this.checkWin(row, col)) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
      window.audio.playScore();
      
      if (this.gameMode === 'ai') {
        if (this.currentPlayer === 'X') {
          window.save.addWin('tictactoe');
        } else {
          window.save.addLoss('tictactoe');
        }
      }
      
      window.save.addGamePlayed('tictactoe');
    } else if (this.checkDraw()) {
      this.gameOver = true;
      this.winner = 'draw';
      window.audio.playHit();
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    this.updateUI();
  }

  makeAIMove() {
    setTimeout(() => {
      if (this.gameOver || this.paused) return;
      
      let move;
      switch (this.aiDifficulty) {
        case 'easy':
          move = this.getRandomMove();
          break;
        case 'medium':
          move = this.getMediumMove();
          break;
        case 'impossible':
          move = this.getBestMove();
          break;
      }
      
      if (move) {
        this.makeMove(move.row, move.col);
      }
    }, 500);
  }

  getRandomMove() {
    const availableMoves = [];
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === null) {
          availableMoves.push({ row: i, col: j });
        }
      }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  getMediumMove() {
    if (Math.random() < 0.3) {
      return this.getRandomMove();
    }
    return this.getBestMove();
  }

  getBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === null) {
          this.board[i][j] = 'O';
          const score = this.minimax(this.board, 0, false);
          this.board[i][j] = null;
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = { row: i, col: j };
          }
        }
      }
    }
    
    return bestMove;
  }

  minimax(board, depth, isMaximizing) {
    if (this.checkWinFor(board, 'O')) return 10 - depth;
    if (this.checkWinFor(board, 'X')) return depth - 10;
    if (this.checkDrawFor(board)) return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < this.boardSize; i++) {
        for (let j = 0; j < this.boardSize; j++) {
          if (board[i][j] === null) {
            board[i][j] = 'O';
            const score = this.minimax(board, depth + 1, false);
            board[i][j] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < this.boardSize; i++) {
        for (let j = 0; j < this.boardSize; j++) {
          if (board[i][j] === null) {
            board[i][j] = 'X';
            const score = this.minimax(board, depth + 1, true);
            board[i][j] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
      }
      return bestScore;
    }
  }

  checkWin(row, col) {
    return this.checkWinFor(this.board, this.currentPlayer);
  }

  checkWinFor(board, player) {
    for (let i = 0; i < this.boardSize; i++) {
      if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
        return true;
      }
    }
    
    for (let j = 0; j < this.boardSize; j++) {
      if (board[0][j] === player && board[1][j] === player && board[2][j] === player) {
        return true;
      }
    }
    
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
      return true;
    }
    
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
      return true;
    }
    
    return false;
  }

  checkDraw() {
    return this.checkDrawFor(this.board);
  }

  checkDrawFor(board) {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] === null) {
          return false;
        }
      }
    }
    return true;
  }

  updateUI() {
    if (this.gameOver) {
      if (this.winner === 'draw') {
        this.statusLabel.text = "It's a draw!";
      } else {
        this.statusLabel.text = `Player ${this.winner} wins!`;
      }
    } else {
      this.statusLabel.text = `Player ${this.currentPlayer}'s turn`;
    }
    
    this.modeLabel.text = `Mode: ${this.gameMode === 'pvp' ? 'PvP' : 'vs AI'}`;
    this.difficultyLabel.text = `AI: ${this.aiDifficulty.charAt(0).toUpperCase() + this.aiDifficulty.slice(1)}`;
    this.difficultyLabel.visible = this.gameMode === 'ai';
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
    this.addUI(this.statusLabel);
    this.addUI(this.modeLabel);
    this.addUI(this.difficultyLabel);
    window.audio.playGameMusic();
  }

  onExit() {
    this.removeUI(this.statusLabel);
    this.removeUI(this.modeLabel);
    this.removeUI(this.difficultyLabel);
    window.audio.stopMusic();
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    const boardWidth = this.boardSize * (this.cellSize + this.cellGap) - this.cellGap;
    const boardHeight = this.boardSize * (this.cellSize + this.cellGap) - this.cellGap;
    const startX = (this.engine.width - boardWidth) / 2;
    const startY = (this.engine.height - boardHeight) / 2 + 40;
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const cellX = startX + j * (this.cellSize + this.cellGap);
        const cellY = startY + i * (this.cellSize + this.cellGap);
        
        ctx.fillStyle = '#34495e';
        ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
        
        if (this.board[i][j]) {
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (this.board[i][j] === 'X') {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('X', cellX + this.cellSize / 2, cellY + this.cellSize / 2);
          } else {
            ctx.fillStyle = '#3498db';
            ctx.fillText('O', cellX + this.cellSize / 2, cellY + this.cellSize / 2);
          }
        }
      }
    }
    
    this.particles.render(ctx);
    
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.engine.width, this.engine.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (this.winner === 'draw') {
        ctx.fillText("It's a draw!", this.engine.width / 2, this.engine.height / 2 - 50);
      } else {
        ctx.fillText(`Player ${this.winner} wins!`, this.engine.width / 2, this.engine.height / 2 - 50);
      }
      
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
