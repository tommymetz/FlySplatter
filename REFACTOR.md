# FlySplatter Refactoring Plan

This document outlines an incremental plan to modernize the FlySplatter codebase. Each step is designed to be merged and deployed independently, minimizing risk and allowing for iterative improvements.

## Current State

- **Build System**: Grunt with JSHint and UglifyJS
- **JavaScript**: ES5, prototype-based OOP, global variables
- **Architecture**: Single file (~687 lines) with tightly coupled concerns
- **Tests**: None
- **Module System**: None (global `Flies` and `Fly` constructors)

## External Usage (Important!)

The library is embedded in external projects using the following paths:

```
/flysplatter/dist/js/flysplatter.min.js
/flysplatter/dist/audio/*
/flysplatter/dist/img/*
```

⚠️ **Breaking changes to these paths must be coordinated with external projects.**

---

## Step 1: Migrate from Grunt to Vite

**Goal**: Replace the outdated Grunt build system with Vite for modern bundling, faster builds, and better developer experience.

### Changes Required

1. **Create new package.json at repository root** with Vite as a dev dependency
2. **Create vite.config.js** configured for library mode output
3. **Update .gitignore** to exclude `node_modules/` at root level
4. **Maintain backward compatibility** by outputting to the same `flysplatter/dist/` paths

### Tasks

- [ ] Create root `package.json` with Vite dependencies
- [ ] Create `vite.config.js` for library bundling
- [ ] Add npm scripts: `dev`, `build`, `preview`
- [ ] Configure output to `flysplatter/dist/js/flysplatter.min.js`
- [ ] Copy static assets (audio, images) to dist during build
- [ ] Update root `.gitignore` for node_modules
- [ ] Add README section for new build commands
- [ ] Remove old `flysplatter/package.json` and `flysplatter/gruntfile.js`
- [ ] Test that embedded usage still works

### Breaking Changes

**None** - Output paths remain the same.

### New Build Commands

```bash
npm install          # Install dependencies (now at root)
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Step 2: JavaScript Modernization (Syntax Only)

**Goal**: Update JavaScript syntax to ES6+ while maintaining the same architecture and functionality.

### Changes Required

1. **Replace `var` with `const`/`let`** throughout the codebase
2. **Convert prototype methods to ES6 classes** (`Flies` and `Fly`)
3. **Use arrow functions** where appropriate
4. **Use template literals** for string concatenation
5. **Use destructuring** for object properties
6. **Replace `docReady` with standard DOMContentLoaded** or remove entirely

### Tasks

- [ ] Convert `Flies` constructor function to ES6 class
- [ ] Convert `Fly` constructor function to ES6 class
- [ ] Replace all `var` declarations with `const`/`let`
- [ ] Convert anonymous functions to arrow functions where `this` binding allows
- [ ] Replace string concatenation with template literals
- [ ] Use object destructuring for configuration options
- [ ] Remove or modernize the `docReady` polyfill
- [ ] Remove legacy IE support (`attachEvent`)
- [ ] Update iOS detection to use modern feature detection

### Breaking Changes

**None** - External API remains identical (`new Flies(count, options)`).

---

## Step 3: Add ES Modules Support

**Goal**: Enable ES modules for better code organization while maintaining backward compatibility through the build process.

### Changes Required

1. **Add ES module entry point** (`src/index.js`)
2. **Configure Vite for dual output** (UMD for backward compatibility, ESM for modern usage)
3. **Export classes properly** for both consumption methods

### Tasks

- [ ] Create `src/` directory structure
- [ ] Add named exports: `export { Flies, Fly }`
- [ ] Add default export: `export default Flies`
- [ ] Update Vite config for UMD + ESM dual build
- [ ] Ensure `Flies` is still available globally in UMD build
- [ ] Update README with ES module import examples

### New Directory Structure

```
FlySplatter/
├── src/
│   └── index.js          # ES module entry point
├── flysplatter/
│   ├── assets/           # Source assets (legacy, can be migrated later)
│   └── dist/             # Build output (unchanged paths)
├── package.json
└── vite.config.js
```

### Breaking Changes

**None** - UMD build maintains global `Flies` constructor.

### New Usage Option (ES Modules)

```javascript
// New ES module import (optional)
import Flies from 'flysplatter';
// or
import { Flies, Fly } from 'flysplatter';
```

---

## Step 4: Eliminate Global Variables

**Goal**: Encapsulate global state within classes to prevent pollution and enable multiple independent instances.

### Changes Required

1. **Move `score` into `Flies` class** as an instance property
2. **Move `iOS` detection into a utility** or make it a class method
3. **Remove `debug` global** and replace with a configuration option

### Tasks

- [ ] Add `debug` as a configuration option in `Flies`
- [ ] Move `score` to be an instance property of `Flies`
- [ ] Pass score reference to `Fly` instances or use callback
- [ ] Create utility function for iOS detection or use feature detection
- [ ] Ensure multiple `Flies` instances can coexist independently

### Breaking Changes

**None** - External API remains identical, but behavior improves.

---

## Step 5: Separate Concerns (Audio Manager)

**Goal**: Extract audio handling into a dedicated module for better testability and maintainability.

### Changes Required

1. **Create `AudioManager` class** to handle all audio operations
2. **Extract audio preloading** logic from `Fly`
3. **Centralize volume control** and mute functionality

### Tasks

- [ ] Create `src/AudioManager.js`
- [ ] Move audio element creation to AudioManager
- [ ] Move volume fade logic to AudioManager
- [ ] Add audio pooling for better performance
- [ ] Update `Fly` to use AudioManager
- [ ] Add mute/unmute public API method

### New File Structure

```
src/
├── index.js
├── Flies.js
├── Fly.js
└── AudioManager.js
```

### Breaking Changes

**None** - Internal refactoring only.

---

## Step 6: Separate Concerns (Renderer)

**Goal**: Extract canvas rendering logic into a dedicated module.

### Changes Required

1. **Create `Renderer` class** for all canvas operations
2. **Extract sprite drawing** logic from `Fly`
3. **Centralize canvas setup** and high-DPI handling

### Tasks

- [ ] Create `src/Renderer.js`
- [ ] Move canvas creation and setup to Renderer
- [ ] Move `drawFly` and `drawSplatFly` to Renderer
- [ ] Centralize device pixel ratio handling
- [ ] Update `Fly` to use Renderer

### New File Structure

```
src/
├── index.js
├── Flies.js
├── Fly.js
├── AudioManager.js
└── Renderer.js
```

### Breaking Changes

**None** - Internal refactoring only.

---

## Step 7: Configuration and Constants

**Goal**: Extract magic numbers and configuration into a dedicated constants file.

### Changes Required

1. **Create `config.js`** with all game constants
2. **Extract sprite dimensions**, timing values, and other magic numbers
3. **Make configuration overridable** through options

### Tasks

- [ ] Create `src/config.js`
- [ ] Extract sprite frame dimensions (50x60, 100x100)
- [ ] Extract timing constants (intervals, delays)
- [ ] Extract animation parameters (step counts, random ranges)
- [ ] Allow configuration overrides in `Flies` options
- [ ] Add JSDoc documentation for all config options

### Example Config Structure

```javascript
export const CONFIG = {
  FLY_FRAME_WIDTH: 50,
  FLY_FRAME_HEIGHT: 60,
  SPLAT_FRAME_WIDTH: 100,
  SPLAT_FRAME_HEIGHT: 100,
  ANIMATION_INTERVAL: 20,
  MAX_ACTIONS_BEFORE_FLYAWAY: 5,
  // ...
};
```

### Breaking Changes

**None** - Internal refactoring with optional configuration additions.

---

## Step 8: Add Testing Infrastructure

**Goal**: Set up a testing framework and add unit tests for core functionality.

### Changes Required

1. **Add Vitest** as the testing framework (integrates well with Vite)
2. **Create test files** for each module
3. **Add mock utilities** for DOM and canvas operations

### Tasks

- [ ] Add Vitest as dev dependency
- [ ] Configure Vitest in vite.config.js
- [ ] Add test script to package.json
- [ ] Create `src/__tests__/` directory
- [ ] Add unit tests for `AudioManager`
- [ ] Add unit tests for `Renderer`
- [ ] Add unit tests for `Fly` state machine
- [ ] Add integration tests for `Flies`
- [ ] Add CI workflow for running tests

### Example Test

```javascript
// src/__tests__/AudioManager.test.js
import { describe, it, expect } from 'vitest';
import AudioManager from '../AudioManager.js';

describe('AudioManager', () => {
  it('should create audio elements', () => {
    // ...
  });
});
```

### Breaking Changes

**None** - Testing is development-only.

---

## Step 9: TypeScript Migration (Optional)

**Goal**: Add TypeScript for improved developer experience and type safety.

### Changes Required

1. **Rename files** from `.js` to `.ts`
2. **Add type annotations** to all functions and classes
3. **Create type definitions** for configuration options

### Tasks

- [ ] Add TypeScript as dev dependency
- [ ] Create `tsconfig.json`
- [ ] Rename source files to `.ts`
- [ ] Add type annotations to all classes
- [ ] Create interfaces for configuration options
- [ ] Generate `.d.ts` declaration files
- [ ] Update Vite config for TypeScript

### Breaking Changes

**None** - TypeScript compiles to JavaScript, output remains the same.

---

## Step 10: Documentation and Cleanup

**Goal**: Add comprehensive documentation and clean up legacy code.

### Tasks

- [ ] Add JSDoc comments to all public methods
- [ ] Update README with complete API documentation
- [ ] Add CONTRIBUTING.md with development guidelines
- [ ] Remove legacy Grunt files if not already done
- [ ] Add CHANGELOG.md
- [ ] Consider adding example HTML files for different use cases
- [ ] Add inline code comments for complex logic

---

## Future Considerations

These items are out of scope for the initial refactoring but worth considering:

1. **Animation System Overhaul**: Replace `setInterval` with `requestAnimationFrame` for smoother animations
2. **Touch Event Improvements**: Better touch handling with gesture support
3. **Accessibility**: Add ARIA labels and keyboard controls
4. **Performance**: Implement fly pooling instead of creating new instances
5. **PWA Support**: Add service worker for offline play
6. **Sound Sprites**: Combine audio files into a single sprite for faster loading
7. **WebGL Renderer**: Optional WebGL rendering for better performance

---

## Migration Timeline Estimate

| Step | Complexity | Estimated Effort |
|------|------------|------------------|
| 1. Grunt → Vite | Medium | 2-4 hours |
| 2. ES6+ Syntax | Low | 2-3 hours |
| 3. ES Modules | Low | 1-2 hours |
| 4. Global Variables | Low | 1-2 hours |
| 5. Audio Manager | Medium | 2-3 hours |
| 6. Renderer | Medium | 2-3 hours |
| 7. Configuration | Low | 1-2 hours |
| 8. Testing | Medium | 4-6 hours |
| 9. TypeScript | Medium | 3-4 hours |
| 10. Documentation | Low | 2-3 hours |

**Total: ~20-32 hours of work**

---

## Checklist Summary

- [x] Document current architecture
- [x] Identify breaking changes
- [x] Plan incremental migration steps
- [ ] Execute Step 1: Grunt → Vite
- [ ] Execute Step 2: ES6+ Syntax
- [ ] Execute Step 3: ES Modules
- [ ] Execute Step 4: Global Variables
- [ ] Execute Step 5: Audio Manager
- [ ] Execute Step 6: Renderer
- [ ] Execute Step 7: Configuration
- [ ] Execute Step 8: Testing
- [ ] Execute Step 9: TypeScript (Optional)
- [ ] Execute Step 10: Documentation
