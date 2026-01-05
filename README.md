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
├── index.html              # Main game page
├── flysplatter.css         # Game styling
├── flysplatter/            # Core game library
│   ├── assets/             # Source assets
│   │   ├── js/             # Source JavaScript
│   │   ├── img/            # Image sprites
│   │   └── audio/          # Sound effects
│   ├── dist/               # Compiled/minified assets
│   │   ├── js/             # Minified JavaScript
│   │   ├── img/            # Optimized images
│   │   └── audio/          # Audio files
│   ├── gruntfile.js        # Build configuration
│   └── package.json        # Dependencies
├── bg-001-*.jpg            # Background images (large, medium, small)
├── logo.png                # Game logo
└── favicon.ico             # Site favicon
```

## Usage

Include the minified JavaScript file and initialize the game:

```html
<div id="flycontainer"></div>
<script src="flysplatter/dist/js/flysplatter.min.js"></script>
<script>
  var flies = new Flies(3, {
    id: 'flies',                    // HTML/CSS namespace
    assetlocation: 'flysplatter',   // Path to assets folder
    containerid: 'flycontainer',    // Container element ID
    startpause: 1000,               // Delay before new fly appears (ms)
    mute: false,                    // Mute audio (default: false)
    score: true                     // Show scoreboard (default: false)
  });
</script>
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

The game uses Grunt for building. To set up the development environment:

```bash
cd flysplatter
npm install
grunt        # Build once
grunt watch  # Watch for changes
```

## License

MIT

## Author

Tom Metz Media LLC
