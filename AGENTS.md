# FlySplatter Codebase Information

FlySplatter is a fly-swatting game built with React + TypeScript + Vite. It ships two ways:

1. **The game site** (`demo/`), deployed to Netlify at https://flysplatter.netlify.app
2. **The `<FlySplatter />` component** (`src/`), installed from GitHub into other React projects

## Architecture

Behavior and view are deliberately separate so the 2D sprite view can later be swapped for a React Three Fiber 3D fly that reuses the same behavior.

- `src/flyMachine.ts`: **pure** fly state machine (no DOM, no React). `stepFly(state, dt, rng, bounds, spawnDelay)` goes `waiting → flyingIn → landed (rub | twitch | walk × 4) → flyingAway → waiting`. It outputs `x`, `y`, `angle` and `frame`.
- `src/Fly.tsx`: 2D canvas view of one fly. It runs `stepFly` in `useAnimationFrame` and mutates the canvas transform and drawing through refs. **Per-frame motion never goes through React state.**
- `src/Splat.tsx`: a canvas that draws a splat once.
- `src/FlySplatter.tsx`: the public component. It portals an overlay into `document.body` and owns the score and splat list, which are the only React state.
- `src/overlay.ts`: anchor modes. `viewport` uses a fixed overlay. `page` uses an absolute overlay sized to the document, so flies scroll with the page. `visibleBounds()` converts the visible viewport into overlay-local coordinates and is used for spawning, targets, walk clamping and exits.
- `src/sprites.ts`: DPR canvas setup and sprite drawing. There are 6 fly frames at 50×60 and 5 splat variants at 100×100. Rotation is in canvas space, so the shadow stays bottom-right.
- `src/useFlyAudio.ts`: per-fly buzz (fade-in) and splat sounds, created lazily only when not muted.
- `src/random.ts`: seedable RNG for deterministic tests.

Assets are imported from `src/assets`. The library build inlines them, so the package is self-contained.

## Commands

```bash
npm run dev        # game dev server (demo/); add ?anchor=page for the scroll test page
npm test           # vitest (jsdom; canvas/audio stubbed in test/setup.ts)
npm run lint
npm run build      # game site → dist/site (Netlify publishes this)
npm run build:lib  # component package → dist/lib (runs on `prepare` for GitHub installs)
```

## Notes

- `demo/public/flysplatter/dist/` is the **legacy** script-tag build, still served for sites that haven't switched to the component. Delete it once nothing loads `/flysplatter/dist/js/flysplatter.min.js`.
- React is a peer dependency. Keep `react`, `react-dom` and `react/jsx-runtime` external in `vite.lib.config.ts`.
