import { Engine } from '../engine/engine.js';
import { InputManager } from '../engine/input.js';
import { AudioManager } from '../engine/audio.js';
import { AssetManager } from '../engine/assets.js';
import { SaveManager } from '../engine/save.js';
import { CollisionUtils } from '../engine/collision.js';
import { ParticleSystem } from '../engine/particles.js';
import { ArcadeMenu } from '../games/arcade-menu.js';
import { SnakeGame } from '../games/snake.js';
import { PongGame } from '../games/pong.js';
import { BreakoutGame } from '../games/breakout.js';
import { MemoryGame } from '../games/memory.js';
import { TicTacToeGame } from '../games/tictactoe.js';

const canvas = document.getElementById('game-canvas');
const container = document.getElementById('game-container');

function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth - 20, 800);
  const maxHeight = Math.min(window.innerHeight - 20, 600);
  
  canvas.width = maxWidth;
  canvas.height = maxHeight;
  
  if (window.engine) {
    window.engine.resize(maxWidth, maxHeight);
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const engine = new Engine(canvas);
const input = new InputManager();
const audio = new AudioManager();
const assets = new AssetManager();
const save = new SaveManager();
const particles = new ParticleSystem();

window.engine = engine;
window.input = input;
window.audio = audio;
window.assets = assets;
window.save = save;
window.particles = particles;

const arcadeMenu = new ArcadeMenu(engine);
const snakeGame = new SnakeGame(engine);
const pongGame = new PongGame(engine);
const breakoutGame = new BreakoutGame(engine);
const memoryGame = new MemoryGame(engine);
const ticTacToeGame = new TicTacToeGame(engine);

engine.addScene('menu', arcadeMenu);
engine.addScene('snake', snakeGame);
engine.addScene('pong', pongGame);
engine.addScene('breakout', breakoutGame);
engine.addScene('memory', memoryGame);
engine.addScene('tictactoe', ticTacToeGame);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (engine.currentScene) {
    engine.currentScene.handleClick(x, y);
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (engine.currentScene) {
    input.mouse.x = x;
    input.mouse.y = y;
  }
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'F' || e.key === 'f') {
    toggleFullscreen();
  }
  if (e.key === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen();
  }
});

engine.switchScene('menu');
engine.start();
