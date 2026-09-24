import { useState } from 'react'
import { FlySplatter, type Anchor } from '../src'
import { version } from '../package.json'

// ?anchor=page adds a long page to test flies that scroll with the content
const anchor: Anchor = new URLSearchParams(location.search).get('anchor') === 'page' ? 'page' : 'viewport'

export function App() {
  const [muted, setMuted] = useState(false)

  return (
    <>
      <main>
        <h1 className="visually-hidden">Fly Splatter</h1>
        <img src="/logo.png" alt="Fly Splatter" className="logo" />
        <button className="mute" aria-pressed={muted} onClick={() => setMuted((m) => !m)}>
          {muted ? 'Sound off' : 'Sound on'}
        </button>
        {anchor === 'page' && (
          <div className="scroll-test">
            {Array.from({ length: 30 }, (_, i) => (
              <p key={i}>Scroll test section {i + 1}. Landed flies and splats should move with this text.</p>
            ))}
          </div>
        )}
        <small className="version">v{version}</small>
      </main>
      <FlySplatter count={3} anchor={anchor} spawnDelay={1000} muted={muted} showScore respectReducedMotion={false} />
    </>
  )
}
