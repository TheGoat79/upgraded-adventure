import { Engine } from '../engine/engine.js';
import { InputManager } from '../engine/input.js';
import { AudioManager } from '../engine/audio.js';
import { AssetManager } from '../engine/assets.js';
import { SaveManager } from '../engine/save.js';
import { CollisionUtils } from '../engine/collision.js';
import { ParticleSystem } from '../engine/particles.js';
import { AchievementManager } from '../engine/achievements.js';
import { StatisticsManager } from '../engine/statistics.js';
import { ArcadeMenu } from '../games/arcade-menu.js';
import { SnakeGame } from '../games/snake.js';
import { PongGame } from '../games/pong.js';
import { BreakoutGame } from '../games/breakout.js';
import { MemoryGame } from '../games/memory.js';
import { TicTacToeGame } from '../games/tictactoe.js';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  logError('Global Error', event.error?.message || 'Unknown error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  logError('Unhandled Rejection', event.reason?.message || 'Unknown rejection');
});

function logError(type, message) {
  console.error(`[${type}] ${message}`);
  // Could send to error tracking service here
}

// Loading screen management
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.querySelector('.loading-text');

function showLoadingScreen() {
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
}

function hideLoadingScreen() {
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

function updateLoadingProgress(progress, text = null) {
  if (loadingProgress) {
    loadingProgress.style.width = `${progress * 100}%`;
  }
  if (loadingText && text) {
    loadingText.textContent = text;
  }
}

// Async initialization
async function initializeApplication() {
  try {
    showLoadingScreen();
    updateLoadingProgress(0, 'Initializing...');

    // Get canvas
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Resize canvas
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const maxHeight = Math.min(window.innerHeight - 20, 600);
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    updateLoadingProgress(0.1, 'Creating engine...');

    // Create engine and systems
    const engine = new Engine(canvas);
    const input = new InputManager();
    const audio = new AudioManager();
    const assets = new AssetManager();
    const save = new SaveManager();
    const particles = new ParticleSystem();
    const achievements = new AchievementManager(save);
    const statistics = new StatisticsManager(save);

    // Make globally available
    window.engine = engine;
    window.input = input;
    window.audio = audio;
    window.assets = assets;
    window.save = save;
    window.particles = particles;
    window.achievements = achievements;
    window.statistics = statistics;

    updateLoadingProgress(0.2, 'Initializing systems...');

    // Initialize systems
    achievements.init();
    statistics.init();

    updateLoadingProgress(0.3, 'Loading games...');

    // Create game instances
    const arcadeMenu = new ArcadeMenu(engine);
    const snakeGame = new SnakeGame(engine);
    const pongGame = new PongGame(engine);
    const breakoutGame = new BreakoutGame(engine);
    const memoryGame = new MemoryGame(engine);
    const ticTacToeGame = new TicTacToeGame(engine);

    updateLoadingProgress(0.5, 'Registering scenes...');

    // Register scenes
    engine.addScene('menu', arcadeMenu);
    engine.addScene('snake', snakeGame);
    engine.addScene('pong', pongGame);
    engine.addScene('breakout', breakoutGame);
    engine.addScene('memory', memoryGame);
    engine.addScene('tictactoe', ticTacToeGame);

    updateLoadingProgress(0.7, 'Setting up input...');

    // Setup input handlers
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

    // Setup window resize
    window.addEventListener('resize', () => {
      const maxWidth = Math.min(window.innerWidth - 20, 800);
      const maxHeight = Math.min(window.innerHeight - 20, 600);
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      engine.resize(maxWidth, maxHeight);
    });

    // Setup fullscreen
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F' || e.key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
      // Debug mode toggle
      if (e.key === 'D' && e.ctrlKey && e.shiftKey) {
        engine.toggleDebug();
      }
    });

    updateLoadingProgress(0.9, 'Starting engine...');

    // Switch to menu and start engine
    engine.switchScene('menu');
    engine.start();

    updateLoadingProgress(1.0, 'Ready!');

    // Hide loading screen after a short delay
    setTimeout(() => {
      hideLoadingScreen();
    }, 300);

    console.log('Application initialized successfully');

  } catch (error) {
    console.error('Failed to initialize application:', error);
    updateLoadingProgress(1, 'Error: ' + error.message);
    
    // Show error to user
    if (loadingText) {
      loadingText.textContent = 'Error: ' + error.message;
      loadingText.style.color = '#e74c3c';
    }
    
    // Try to hide loading screen after delay to show error
    setTimeout(() => {
      hideLoadingScreen();
    }, 3000);
  }
}

// Safety timeout - hide loading screen after 10 seconds regardless
setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    console.warn('Loading screen timeout - forcing hide');
    hideLoadingScreen();
  }
}, 10000);

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}
