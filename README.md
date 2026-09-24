# FlySplatter

Splatter those pesky flies you hate so much in the Fly Splatter game!

**[Play FlySplatter](https://flysplatter.netlify.app)**

Flies buzz in, land, rub their arms, twitch their wings, walk around, and fly off. Click or tap one to splat it.

## Use it in a React project

```bash
npm i github:tommymetz/flysplatter#v2.0.0
```

```tsx
import { FlySplatter } from 'flysplatter'

export function App() {
  return (
    <>
      <FlySplatter anchor="page" muted initialDelay={2000} />
      {/* ...your app */}
    </>
  )
}
```

The component portals its flies into `document.body`, so it can go anywhere in the tree. It is SSR-safe and doesn't block clicks on the page underneath.

| Prop | Default | |
| --- | --- | --- |
| `count` | `1` | Number of flies |
| `anchor` | `'viewport'` | `'viewport'`: flies are fixed on screen. `'page'`: landed flies and splats scroll with the page |
| `muted` | `false` | Toggling it doesn't reset the flies |
| `initialDelay` | `0` | ms before the first flies appear |
| `spawnDelay` | `5000` | ms, plus up to 1s of random time, before a fly returns |
| `zIndex` | `1000` | |
| `showScore` | `false` | Built-in scoreboard in the top-left corner |
| `respectReducedMotion` | `true` | Show no flies when the user prefers reduced motion |
| `onSplat` | | `(score) => void`, for rendering your own scoreboard |

### Legacy script embed

The original v1 build is still served at `/flysplatter/dist/js/flysplatter.min.js`, along with its `img/` and `audio/` folders, so existing `new Flies(...)` embeds keep working. It's frozen and won't get updates. Switch to the component when you can.

## Development

```bash
npm install
npm run dev        # the game at http://localhost:5173 (?anchor=page for a scroll test)
npm test
npm run lint
npm run build      # game site → dist/site
npm run build:lib  # package → dist/lib
```

See [AGENTS.md](AGENTS.md) for architecture notes.

## License

MIT © Tom Metz Media LLC
