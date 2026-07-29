import { Engine } from '../engine/Engine.js';
import { InputManager } from '../engine/Input.js';
import { AudioManager } from '../engine/Audio.js';
import { AssetManager } from '../engine/Assets.js';
import { SaveManager } from '../engine/Save.js';
import { CollisionUtils } from '../engine/Collision.js';
import { ParticleSystem } from '../engine/particles.js';
import { AchievementManager } from '../engine/Achievements.js';
import { StatisticsManager } from '../engine/Statistics.js';
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

// Startup diagnostics
const startupDiagnostics = {
  startTime: Date.now(),
  stages: [],
  errors: [],
  warnings: []
};

function logStartupStage(stage, details = null) {
  const timestamp = Date.now() - startupDiagnostics.startTime;
  startupDiagnostics.stages.push({ stage, timestamp, details });
  console.log(`[Startup ${timestamp}ms] ${stage}${details ? ': ' + details : ''}`);
}

function logStartupError(stage, error) {
  const timestamp = Date.now() - startupDiagnostics.startTime;
  startupDiagnostics.errors.push({ stage, timestamp, error: error.message });
  console.error(`[Startup Error ${timestamp}ms] ${stage}: ${error.message}`);
}

function logStartupWarning(stage, warning) {
  const timestamp = Date.now() - startupDiagnostics.startTime;
  startupDiagnostics.warnings.push({ stage, timestamp, warning });
  console.warn(`[Startup Warning ${timestamp}ms] ${stage}: ${warning}`);
}

function getStartupDiagnostics() {
  return {
    ...startupDiagnostics,
    totalTime: Date.now() - startupDiagnostics.startTime,
    success: startupDiagnostics.errors.length === 0
  };
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
    logStartupStage('Starting initialization');
    showLoadingScreen();
    updateLoadingProgress(0, 'Initializing...');

    // Get canvas
    logStartupStage('Getting canvas element');
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    logStartupStage('Canvas found', `${canvas.width}x${canvas.height}`);

    // Resize canvas
    logStartupStage('Resizing canvas');
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const maxHeight = Math.min(window.innerHeight - 20, 600);
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    logStartupStage('Canvas resized', `${maxWidth}x${maxHeight}`);

    updateLoadingProgress(0.1, 'Creating engine...');

    // Create engine and systems
    logStartupStage('Creating engine');
    const engine = new Engine(canvas);
    logStartupStage('Creating input manager');
    const input = new InputManager();
    logStartupStage('Creating audio manager');
    const audio = new AudioManager();
    logStartupStage('Creating asset manager');
    const assets = new AssetManager();
    logStartupStage('Creating save manager');
    const save = new SaveManager();
    logStartupStage('Creating particle system');
    const particles = new ParticleSystem();
    logStartupStage('Creating achievement manager');
    const achievements = new AchievementManager(save);
    logStartupStage('Creating statistics manager');
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
    logStartupStage('Global objects set');

    updateLoadingProgress(0.2, 'Initializing systems...');

    // Initialize systems
    logStartupStage('Initializing achievements');
    achievements.init();
    logStartupStage('Initializing statistics');
    statistics.init();

    updateLoadingProgress(0.3, 'Loading games...');

    // Create game instances
    logStartupStage('Creating arcade menu');
    const arcadeMenu = new ArcadeMenu(engine);
    logStartupStage('Creating snake game');
    const snakeGame = new SnakeGame(engine);
    logStartupStage('Creating pong game');
    const pongGame = new PongGame(engine);
    logStartupStage('Creating breakout game');
    const breakoutGame = new BreakoutGame(engine);
    logStartupStage('Creating memory game');
    const memoryGame = new MemoryGame(engine);
    logStartupStage('Creating tic-tac-toe game');
    const ticTacToeGame = new TicTacToeGame(engine);

    updateLoadingProgress(0.5, 'Registering scenes...');

    // Register scenes
    logStartupStage('Registering scenes');
    engine.addScene('menu', arcadeMenu);
    engine.addScene('snake', snakeGame);
    engine.addScene('pong', pongGame);
    engine.addScene('breakout', breakoutGame);
    engine.addScene('memory', memoryGame);
    engine.addScene('tictactoe', ticTacToeGame);
    logStartupStage('All scenes registered');

    updateLoadingProgress(0.7, 'Setting up input...');

    // Setup input handlers
    logStartupStage('Setting up click handler');
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (engine.currentScene) {
        engine.currentScene.handleClick(x, y);
      }
    });

    logStartupStage('Setting up mouse move handler');
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
    logStartupStage('Setting up resize handler');
    window.addEventListener('resize', () => {
      const maxWidth = Math.min(window.innerWidth - 20, 800);
      const maxHeight = Math.min(window.innerHeight - 20, 600);
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      engine.resize(maxWidth, maxHeight);
    });

    // Setup fullscreen
    logStartupStage('Setting up keyboard handlers');
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
    logStartupStage('Switching to menu scene');
    engine.switchScene('menu');
    logStartupStage('Starting engine loop');
    engine.start();

    updateLoadingProgress(1.0, 'Ready!');

    // Hide loading screen after a short delay
    setTimeout(() => {
      logStartupStage('Hiding loading screen');
      hideLoadingScreen();
      console.log('Application initialized successfully');
      console.log('Startup diagnostics:', getStartupDiagnostics());
    }, 300);

  } catch (error) {
    logStartupError('Initialization', error);
    console.error('Failed to initialize application:', error);
    console.error('Startup diagnostics:', getStartupDiagnostics());
    updateLoadingProgress(1, 'Error: ' + error.message);
    
    // Show error to user
    if (loadingText) {
      loadingText.textContent = 'Error: ' + error.message;
      loadingText.style.color = '#e74c3c';
    }
    
    // Try to hide loading screen after delay to show error
    setTimeout(() => {
      hideLoadingScreen();
      // Show error panel
      showErrorPanel(error);
    }, 3000);
  }
}

function showErrorPanel(error) {
  const errorPanel = document.createElement('div');
  errorPanel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(44, 62, 80, 0.95);
    padding: 30px;
    border-radius: 10px;
    color: white;
    font-family: Arial, sans-serif;
    max-width: 500px;
    z-index: 10000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;
  
  errorPanel.innerHTML = `
    <h2 style="color: #e74c3c; margin-top: 0;">Initialization Error</h2>
    <p style="margin: 10px 0;">${error.message}</p>
    <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">
      ${error.stack || 'No stack trace available'}
    </div>
    <p style="margin: 10px 0; font-size: 14px; color: #f39c12;">Press F5 to retry</p>
    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
  `;
  
  document.body.appendChild(errorPanel);
  
  // Make diagnostics available globally
  window.startupDiagnostics = getStartupDiagnostics();
}

// Safety timeout - hide loading screen after 10 seconds regardless
setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    console.warn('Loading screen timeout - forcing hide');
    console.error('Startup diagnostics:', getStartupDiagnostics());
    hideLoadingScreen();
    showErrorPanel(new Error('Loading screen timeout - initialization did not complete'));
  }
}, 10000);

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}
