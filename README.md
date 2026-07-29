# Mini Arcade

A web-based arcade game collection featuring five classic games built with vanilla JavaScript and HTML5 Canvas.

## Features

- **5 Classic Games**: Snake, Pong, Breakout, Memory, and Tic-Tac-Toe
- **Shared Game Engine**: Modular, reusable engine with scene management, input handling, audio, and more
- **Persistent Save System**: High scores, statistics, achievements, and settings
- **Responsive Design**: Works on desktop and mobile devices
- **Achievement System**: Track and unlock achievements across all games
- **Statistics Tracking**: Monitor your gameplay statistics and performance
- **Audio System**: Procedural audio generation for sound effects and music

## Project Architecture

### Folder Structure

```
upgraded-adventure/
├── css/
│   └── styles.css          # Global styles and responsive design
├── engine/
│   ├── Achievements.js     # Achievement system with tracking and persistence
│   ├── AnimationManager.js # Animation system with easing functions
│   ├── Assets.js           # Asset loading with caching and progress tracking
│   ├── Audio.js            # Audio manager with channels and volume control
│   ├── Collision.js        # Collision detection utilities
│   ├── Config.js           # Configuration management system
│   ├── Debug.js            # Debug mode with profiling and visual debugging
│   ├── Engine.js           # Core game engine with loop and scene management
│   ├── EventBus.js         # Event-driven communication system
│   ├── Input.js            # Input handling for keyboard, mouse, and touch
│   ├── particles.js        # Particle system for visual effects
│   ├── pause.js            # Pause overlay with settings menu
│   ├── Save.js             # Save system with data migration
│   ├── Scene.js            # Base scene class for game states
│   ├── SettingsMenu.js     # Settings menu with volume controls
│   ├── Statistics.js       # Statistics tracking and analysis
│   ├── TimeManager.js      # Time scaling and FPS tracking
│   ├── UI.js               # UI framework with buttons, panels, labels
│   └── effects.js          # Screen effects (shake, fade transitions)
├── games/
│   ├── arcade-menu.js      # Main menu with game selection
│   ├── snake.js            # Snake game implementation
│   ├── pong.js             # Pong game implementation
│   ├── breakout.js         # Breakout game implementation
│   ├── memory.js           # Memory game implementation
│   └── tictactoe.js        # Tic-Tac-Toe game implementation
├── js/
│   └── main.js             # Application entry point
├── index.html              # Main HTML file
└── README.md               # This file
```

## Engine Overview

### Core Systems

#### Engine (`Engine.js`)
The main game engine that manages the game loop, scene transitions, and subsystem coordination.

**Key Features:**
- Fixed timestep game loop for consistent physics
- Scene management with transitions
- Subsystem initialization and coordination
- Debug mode integration
- Performance monitoring

#### Time Manager (`TimeManager.js`)
Manages time scaling and FPS tracking.

**Features:**
- Time scaling for slow-motion or fast-forward effects
- FPS calculation and monitoring
- Delta time management
- Frame counting

#### Animation Manager (`AnimationManager.js`)
Provides animation capabilities with various easing functions.

**Features:**
- Multiple easing functions (linear, quadratic, cubic, elastic, bounce)
- Animation looping and yoyo support
- Delay support
- Progress callbacks

#### Event Bus (`EventBus.js`)
Event-driven communication system for decoupled components.

**Features:**
- Event priority system
- One-time event listeners
- Event history tracking
- Enable/disable functionality

#### Config Manager (`Config.js`)
Centralized configuration management.

**Features:**
- Nested configuration access
- Default value support
- Change notifications
- Import/export functionality

#### Debug Manager (`Debug.js`)
Debugging and profiling tools.

**Features:**
- Visual debugging overlay
- FPS counter
- Profiling metrics
- Watch variables
- Collision visualization

### Input System

#### Input Manager (`Input.js`)
Handles keyboard, mouse, and touch input.

**Features:**
- Keyboard state tracking (pressed, released, held)
- Mouse position and button tracking
- Touch input with swipe detection
- Mobile-friendly controls

### Audio System

#### Audio Manager (`Audio.js`)
Procedural audio generation and management.

**Features:**
- Web Audio API integration
- Multiple audio channels (SFX, music, ambient)
- Volume control (master, music, SFX)
- Volume persistence
- Cross-fading support
- Loop points for music

### Asset System

#### Asset Manager (`Assets.js`)
Asset loading with caching and progress tracking.

**Features:**
- Image loading with progress callbacks
- Asset caching
- Failed asset handling
- Lazy loading queue
- Retry mechanism

### Save System

#### Save Manager (`Save.js`)
Persistent data storage with migration support.

**Features:**
- LocalStorage integration
- Data versioning and migration
- High score tracking
- Game statistics
- Settings persistence
- Achievement progress
- Import/export functionality

### UI System

#### UI Framework (`UI.js`)
Flexible UI component system.

**Components:**
- `UIElement`: Base class for all UI elements
- `Button`: Interactive buttons with animations
- `Label`: Text display
- `Panel`: Container panels
- `ProgressBar`: Progress indication

**Features:**
- Component hierarchy
- Hover and pressed states
- Focus states
- Animations and transitions
- Rounded corners and shadows
- Custom styling

#### Settings Menu (`SettingsMenu.js`)
In-game settings interface.

**Features:**
- Volume sliders
- Reset to defaults
- Responsive design

#### Pause Overlay (`pause.js`)
Pause menu with game controls.

**Features:**
- Resume, restart, and menu options
- Settings integration
- Visual polish

### Game Systems

#### Achievements (`Achievements.js`)
Achievement tracking and unlocking system.

**Features:**
- Achievement definitions
- Progress tracking
- Unlock notifications
- Game-specific achievements
- Statistics integration

#### Statistics (`Statistics.js`)
Gameplay statistics tracking.

**Features:**
- Global statistics (total games, time played, win rate)
- Per-game statistics
- Session tracking
- Performance summaries
- Time formatting

#### Particles (`particles.js`)
Particle system for visual effects.

**Features:**
- Configurable particle emission
- Multiple colors and sizes
- Direction and spread control
- Performance optimization (max particle limit)

#### Effects (`effects.js`)
Screen and visual effects.

**Features:**
- Screen shake
- Fade transitions
- Transition manager

## Adding New Games

### Step 1: Create Game Class

Create a new file in the `games/` directory that extends the `Scene` class:

```javascript
import { Scene } from '../engine/scene.js';
import { Button, Label } from '../engine/ui.js';
import { PauseOverlay } from '../engine/pause.js';

export class YourGame extends Scene {
  constructor(engine) {
    super(engine);
    // Initialize game state
    this.score = 0;
    this.gameOver = false;
    this.createUI();
  }

  createUI() {
    // Create UI elements
    this.scoreLabel = new Label(10, 10, 'Score: 0', 20, '#ffffff');
    
    this.pauseOverlay = new PauseOverlay(
      this,
      () => this.resume(),
      () => this.restart(),
      () => this.goToMenu(),
      () => this.showSettings()
    );
  }

  init() {
    // Initialize game state
    this.score = 0;
    this.gameOver = false;
  }

  update(dt) {
    super.update(dt);
    
    if (this.gameOver || this.paused) return;
    
    // Game logic
  }

  render(ctx) {
    // Render game
  }

  handleClick(x, y) {
    // Handle click input
  }

  // Game lifecycle methods
  onEnter() {
    this.init();
    this.addUI(this.scoreLabel);
    window.audio.playGameMusic();
  }

  onExit() {
    this.removeUI(this.scoreLabel);
    window.audio.stopMusic();
  }

  // Game controls
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
    // Show settings
  }
}
```

### Step 2: Register Game

Add your game to `js/main.js`:

```javascript
import { YourGame } from '../games/yourgame.js';

const yourGame = new YourGame(engine);
engine.addScene('yourgame', yourGame);
```

### Step 3: Add to Menu

Add your game to the menu in `games/arcade-menu.js`:

```javascript
this.games = [
  // ... existing games
  { id: 'yourgame', name: 'Your Game', description: 'Description', color: '#color' }
];
```

### Step 4: Integrate Systems

Add statistics and achievements tracking:

```javascript
endGame() {
  this.gameOver = true;
  
  // Save high score
  window.save.setHighScore('yourgame', this.score);
  
  // Track statistics
  window.save.addGamePlayed('yourgame');
  window.statistics.trackGamePlayed('yourgame');
  window.statistics.trackScore('yourgame', this.score);
  
  // Track achievements
  window.achievements.trackScore('yourgame', this.score);
  window.achievements.trackGamePlayed('yourgame');
  
  // Track win/loss if applicable
  if (this.playerWon) {
    window.save.addWin('yourgame');
    window.statistics.trackGameWon('yourgame');
    window.achievements.trackWin('yourgame');
  } else {
    window.save.addLoss('yourgame');
    window.statistics.trackGameLost('yourgame');
  }
}
```

## Save Format

The save system stores data in localStorage with the following structure:

```javascript
{
  version: 2,
  highScores: {
    snake: 100,
    pong: 5,
    breakout: 500,
    memory: 950,
    tictactoe: 10
  },
  wins: {
    snake: 10,
    pong: 8,
    // ... etc
  },
  losses: {
    snake: 5,
    pong: 12,
    // ... etc
  },
  gamesPlayed: {
    snake: 15,
    pong: 20,
    // ... etc
  },
  timePlayed: {
    snake: 3600,
    pong: 1800,
    // ... etc (in seconds)
  },
  settings: {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    masterVolume: 1.0,
    fullscreen: false,
    debugMode: false
  },
  lastPlayed: 'snake',
  achievements: {
    first_win: {
      unlocked: true,
      unlockedAt: 1234567890
    },
    // ... etc
  },
  statistics: {
    totalGamesPlayed: 50,
    totalTimePlayed: 7200,
    totalWins: 25,
    totalLosses: 25,
    currentStreak: 3,
    longestWinStreak: 5,
    longestLoseStreak: 3,
    gamesByType: {
      snake: 15,
      pong: 20,
      // ... etc
    },
    averageScore: 450,
    totalScore: 22500,
    achievementsUnlocked: 5,
    lastSessionTime: 1234567890,
    totalSessions: 10
  }
}
```

## Controls

### General Controls
- **F**: Toggle fullscreen
- **Escape**: Exit fullscreen / Pause game
- **P**: Pause game

### Game-Specific Controls

#### Snake
- **Arrow Keys / WASD**: Move snake
- **Swipe**: Mobile swipe controls

#### Pong
- **Arrow Up / W**: Move paddle up
- **Arrow Down / S**: Move paddle down
- **Swipe Up/Down**: Mobile controls

#### Breakout
- **Arrow Left / A**: Move paddle left
- **Arrow Right / D**: Move paddle right
- **Swipe Left/Right**: Mobile controls

#### Memory
- **Click / Tap**: Select cards

#### Tic-Tac-Toe
- **Click / Tap**: Place mark

## Development

### Running the Project

```bash
npm install
npm start
```

The game will be available at `http://localhost:8000`

### Building for GitHub Pages

The project is already configured for GitHub Pages deployment. Simply push to the `main` branch to deploy.

## Startup Flow

The application follows this initialization sequence:

1. **DOM Ready**: Waits for DOM to be fully loaded
2. **Error Handlers**: Sets up global error and promise rejection handlers
3. **Canvas Setup**: Configures canvas with responsive sizing
4. **Async Initialization**: Begins async initialization with progress tracking
5. **Engine Creation**: Initializes core engine and subsystems (with error handling)
6. **System Initialization**: Sets up achievements, statistics, and save systems (with fallbacks)
7. **Game Creation**: Instantiates all game scenes (with error handling per game)
8. **Scene Registration**: Registers games with the engine
9. **Input Setup**: Configures mouse, keyboard, and touch handlers
10. **Engine Start**: Switches to menu scene and starts game loop
11. **Loading Screen**: Hides loading screen after successful initialization or shows error

### Error Recovery

The application includes multiple layers of error recovery:

- **Global Error Handlers**: Catch unhandled errors and promise rejections
- **Per-Game Error Handling**: Individual game initialization failures don't crash the app
- **Save System Fallbacks**: Corrupted save data falls back to defaults
- **Asset Timeouts**: Failed asset loads don't block startup
- **Loading Screen Timeout**: Loading screen will auto-hide after 3 seconds on error

## Troubleshooting

### Loading Screen Stuck

If the loading screen remains visible:

1. **Check Console**: Open browser DevTools (F12) and check for errors
2. **Debug Mode**: Press `Ctrl+Shift+D` to enable debug mode
3. **Module Loading**: Ensure all JavaScript files are present and accessible
4. **Browser Compatibility**: Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

### Games Not Launching

If games fail to launch:

1. **Save Data Corrupt**: Clear localStorage and reload
   ```javascript
   localStorage.clear();
   location.reload();
   ```
2. **Missing Dependencies**: Check that all engine files are present
3. **Initialization Errors**: Check console for specific error messages

### Performance Issues

If the game runs slowly:

1. **Debug Mode**: Enable debug mode to check FPS and performance metrics
2. **Particle Count**: The engine limits particles to 500 for performance
3. **Browser Extensions**: Some extensions can interfere with canvas rendering
4. **Hardware Acceleration**: Ensure hardware acceleration is enabled in browser

### Save System Issues

If save data isn't persisting:

1. **LocalStorage Disabled**: Check that localStorage is enabled in your browser
2. **Private Mode**: Some browsers disable localStorage in private/incognito mode
3. **Storage Quota**: Clear browser cache if storage quota is exceeded
4. **Data Migration**: The save system automatically migrates old data formats

### Audio Not Playing

If audio doesn't work:

1. **User Interaction**: Browsers require user interaction before playing audio
2. **Volume Settings**: Check that volume isn't muted in settings
3. **Browser Policy**: Some browsers block autoplay - interact with the page first

### Debug Mode

Enable debug mode by pressing `Ctrl+Shift+D` to see:

- FPS counter
- Current scene name
- Asset loading status
- Memory usage (when available)
- Performance metrics
- Watch variables

Debug mode can also be enabled programmatically:

```javascript
window.engine.toggleDebug();
```

### Common Error Messages

**"Canvas element not found"**: The HTML structure is corrupted or canvas ID changed

**"Failed to load save data"**: LocalStorage is corrupted or disabled (will use defaults)

**"Asset loading timeout"**: An asset failed to load within 10 seconds (will continue with missing asset)

**"Game initialization failed"**: A game failed to initialize properly (will show error state)

## Debug Mode

Enable debug mode by pressing the configured debug key (can be set in config) or through code:

```javascript
window.engine.toggleDebug();
```

Debug mode provides:
- FPS counter
- Performance metrics
- Visual debugging
- Watch variables
- Collision visualization

## Performance

The engine is optimized for 60 FPS on modern devices:

- Fixed timestep game loop
- Particle count limits
- Efficient rendering
- Delta time capping
- Object pooling where applicable

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch controls

## License

MIT License - feel free to use this project for learning or as a base for your own games.