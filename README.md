# FlySplatter

Splatter those pesky flies you hate so much in the Fly Splatter game!

## 🎮 Play Now

**[Play FlySplatter Live](https://flysplatter.netlify.app)**

## About

FlySplatter is an interactive browser-based game where players click or tap on flies to splat them. The game features:

- Animated flies that fly in, land, and perform various actions (wing twitching, hand rubbing, walking)
- Sound effects for flying and splatting
- Score tracking
- Responsive design with different background images for various screen sizes
- Touch support for mobile devices

## Project Structure

```
FlySplatter/
├── src/                    # Source files
│   ├── index.js            # Main entry point
│   ├── flysplatter.js      # Core game logic
│   └── assets/             # Game assets
│       ├── img/            # Image sprites
│       └── audio/          # Sound effects
├── public/                 # Static files for demo site
│   ├── index.html          # Demo page
│   ├── flysplatter.css     # Game styling
│   ├── bg-001-*.jpg        # Background images
│   ├── logo.png            # Game logo
│   └── favicon.ico         # Site favicon
├── dist/                   # Built files (generated)
│   ├── flysplatter.js      # UMD build
│   └── flysplatter.es.js   # ES module build
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Usage

### Browser (UMD)

Include the built JavaScript file and initialize the game:

```html
<div id="flycontainer"></div>
<script src="dist/flysplatter.js"></script>
<script>
  var flies = new Flies(3, {
    id: 'flies',                    // HTML/CSS namespace
    assetlocation: '/src/assets',   // Path to assets folder
    containerid: 'flycontainer',    // Container element ID
    startpause: 1000,               // Delay before new fly appears (ms)
    mute: false,                    // Mute audio (default: false)
    score: true                     // Show scoreboard (default: false)
  });
</script>
```

### ES Module

```javascript
import Flies from 'flysplatter';

const flies = new Flies(3, {
  id: 'flies',
  assetlocation: '/src/assets',
  containerid: 'flycontainer',
  startpause: 1000,
  score: true
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | string | `'fly'` | HTML/CSS namespace for elements |
| `assetlocation` | string | `'.'` | Path to the flysplatter assets folder |
| `containerid` | string | `'body'` | ID of the container element |
| `startpause` | number | `5000` | Milliseconds before a new fly appears |
| `mute` | boolean | `false` | Whether to mute sound effects |
| `score` | boolean | `false` | Whether to display the scoreboard |

## Development

The game uses Vite for building and development. To set up the development environment:

```bash
npm install          # Install dependencies
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
```

The development server will start at `http://localhost:3000` with hot module replacement enabled.

## License

MIT

## Author

Tom Metz Media LLC
