# FlySplatter Copilot Instructions

## Project Overview

FlySplatter is a browser-based fly-swatting game built with vanilla JavaScript and HTML5 Canvas. The project needs refactoring to modernize the codebase while maintaining its core functionality.

## Current Architecture

- **Main entry point**: `index.html` loads the game and initializes flies
- **Core library**: `flysplatter/assets/js/flysplatter.js` contains all game logic
- **Build system**: Grunt with JSHint and UglifyJS
- **No framework**: Pure vanilla JavaScript with DOM manipulation

## Key Classes

### `Flies` (Main Controller)
- Creates multiple `Fly` instances
- Manages scoreboard
- Handles container-level event listeners

### `Fly` (Individual Fly)
- Manages fly lifecycle: spawn → fly in → land → actions → fly away
- Uses HTML5 Canvas for rendering
- Handles sprite animation with frame-based drawing
- Audio management for fly and splat sounds

## Refactoring Guidelines

### Code Modernization
- Convert from `var` to `const`/`let`
- Use ES6+ features: classes, arrow functions, template literals, destructuring
- Replace prototype-based OOP with ES6 classes
- Consider ES modules for better code organization

### Architecture Improvements
- Separate concerns: rendering, game logic, audio, event handling
- Extract configuration/constants to separate files
- Add proper state management
- Consider using requestAnimationFrame instead of setInterval

### Code Quality
- Remove global variables (`debug`, `iOS`, `score`)
- Add proper error handling
- Add JSDoc comments for documentation
- Implement proper cleanup/disposal for audio and canvas elements

### Build System
- Consider migrating from Grunt to modern tools (Vite, esbuild, or Rollup)
- Add TypeScript support if desired
- Set up proper linting with ESLint
- Add unit tests

## File Structure Suggestion for Refactoring

```
flysplatter/
├── src/
│   ├── index.js          # Main entry point
│   ├── Game.js           # Game controller (formerly Flies)
│   ├── Fly.js            # Fly class
│   ├── Renderer.js       # Canvas rendering logic
│   ├── AudioManager.js   # Audio handling
│   ├── EventHandler.js   # Input event management
│   └── config.js         # Game configuration
├── assets/
│   ├── images/
│   └── audio/
└── dist/
```

## Current Pain Points

1. **Global state**: `score`, `debug`, and `iOS` are global variables
2. **Memory leaks**: Event listeners may not be properly cleaned up
3. **Tight coupling**: Rendering, audio, and game logic are intertwined in `Fly`
4. **No modularity**: All code in single file with no exports
5. **Legacy patterns**: Using `var`, prototype methods, and old-style event handling
6. **No tests**: No unit or integration tests exist

## Browser Compatibility Notes

- Uses legacy `webkitBackingStorePixelRatio` for canvas scaling
- iOS detection for touch events
- Consider replacing with modern APIs and feature detection

## Assets

- Fly sprite sheet: `dist/img/fly.png` (6 frames: flying, normal, wing-twitch-left/right, rubbing-arms-left/right)
- Splat sprite sheet: `dist/img/flysplat.png` (5 variations)
- Audio: `dist/audio/fly.mp3/.ogg` and `dist/audio/splat.mp3/.ogg`

## Deployment

The game is deployed to Netlify at https://flysplatter.netlify.app
