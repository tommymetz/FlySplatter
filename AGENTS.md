# FlySplatter Codebase Information

This document provides essential information about the FlySplatter codebase to assist with refactoring and development tasks.

## Architecture Overview

FlySplatter is a browser-based fly-swatting game built with vanilla JavaScript and HTML5 Canvas.

### Core Components

- **Main entry point**: `index.html` - Loads the game and initializes flies
- **Core library**: `flysplatter/assets/js/flysplatter.js` - Contains all game logic (~687 lines)
- **Build system**: Grunt with JSHint and UglifyJS
- **No framework**: Pure vanilla JavaScript with DOM manipulation

### Key Classes

#### `Flies` (Main Controller)
- Creates and manages multiple `Fly` instances
- Manages the scoreboard display
- Handles container-level event listeners (mouse/touch events)
- Accepts configuration options: `id`, `assetlocation`, `containerid`, `startpause`, `mute`, `score`

#### `Fly` (Individual Fly)
- Manages complete fly lifecycle: spawn → fly in → land → actions → fly away
- Uses HTML5 Canvas for rendering with sprite-based animation
- Handles sprite animation with 6 frames: flying, normal, wing-twitch-left/right, rubbing-arms-left/right
- Audio management for fly buzzing and splat sounds
- Implements click/touch detection for splatting

## Technical Details

### Code Patterns
- **Language**: Vanilla JavaScript (ES5 style)
- **OOP Pattern**: Prototype-based inheritance
- **Variable declarations**: Uses `var` throughout
- **Global variables**: `debug`, `iOS`, `score` are defined globally
- **Event handling**: Traditional DOM event listeners

### Canvas Rendering
- Uses HTML5 Canvas API with 2D context
- Implements custom device pixel ratio handling for high-DPI displays
- Uses legacy `webkitBackingStorePixelRatio` for canvas scaling
- Frame-based sprite rendering with rotation support
- Shadow effects applied to canvas context

### Animation System
- Uses `setInterval` for animation loops
- Random timing for fly behaviors
- State-based rendering (flying, landing, wing-twitching, arm-rubbing, walking)

### Audio System
- Dual format support: MP3 and OGG
- Preloading of audio assets
- Volume fade in/out effects
- Audio elements created dynamically via DOM

### Browser Compatibility
- iOS detection: `/iPad|iPhone|iPod/.test(navigator.userAgent)`
- Touch event support for mobile devices
- Legacy event handler support (`attachEvent` for older IE)
- Custom `docReady` implementation (jQuery-inspired)

### Asset Structure
```
flysplatter/
├── assets/
│   ├── js/
│   │   └── flysplatter.js          # Source JavaScript
│   ├── img/
│   │   ├── fly.png                 # Fly sprite sheet (6 frames: 50x60 each)
│   │   └── flysplat.png            # Splat sprite sheet (5 variations: 100x100 each)
│   └── audio/
│       ├── fly.mp3/ogg             # Fly buzzing sound
│       └── splat.mp3/ogg           # Splat sound effect
└── dist/
    ├── js/
    │   └── flysplatter.min.js      # Minified/built JavaScript
    ├── img/                        # Optimized images
    └── audio/                      # Audio files
```

## Current Pain Points

1. **Global state**: `score`, `debug`, and `iOS` are global variables
2. **Memory management**: Event listeners may not be properly cleaned up
3. **Tight coupling**: Rendering, audio, and game logic are intertwined in the `Fly` class
4. **No modularity**: All code in a single file with no module system
5. **Legacy patterns**: Uses `var`, prototype methods, and old-style event handling
6. **No tests**: No unit or integration tests exist

## Build Commands

```bash
cd flysplatter
npm install          # Install dependencies
grunt                # Build once (JSHint + UglifyJS)
grunt watch          # Watch for changes and rebuild
```

## Game Initialization

The game is initialized by creating a `Flies` instance:

```javascript
var flies = new Flies(3, {
  id: 'flies',                    // HTML/CSS namespace
  assetlocation: 'flysplatter',   // Path to assets folder
  containerid: 'flycontainer',    // Container element ID
  startpause: 1000,               // Delay before new fly appears (ms)
  mute: false,                    // Mute audio
  score: true                     // Show scoreboard
});
```

## Deployment

The game is deployed to Netlify at: https://flysplatter.netlify.app

## Important Notes for Refactoring

- The game uses frame-based sprite animation, not CSS animations
- Audio preloading is critical for smooth gameplay
- Canvas scaling logic accounts for high-DPI displays
- Fly lifecycle is complex with multiple states and transitions
- Event listeners are attached at both the container and individual fly level
- The `trackEvent` function exists but is currently commented out (Google Analytics integration)
