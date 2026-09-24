import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Fly } from './Fly'
import { FLY_BOX, type FlyState } from './flyMachine'
import { overlayStyle, sizeToPage, visibleBounds, type Anchor } from './overlay'
import { Splat, type SplatData } from './Splat'
import { SPLAT_BOX, SPLAT_VARIANTS } from './sprites'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export interface FlySplatterProps {
  /** Number of flies. Default 1 */
  count?: number
  /** 'viewport' (default): flies stay put on screen. 'page': landed flies and splats scroll with the page. */
  anchor?: Anchor
  muted?: boolean
  /** ms before the first flies appear. Default 0 */
  initialDelay?: number
  /** ms (plus up to 1s random) before a fly returns after leaving or being splatted. Default 5000 */
  spawnDelay?: number
  /** Default 1000 */
  zIndex?: number
  /** Render a simple scoreboard in the top-left corner */
  showScore?: boolean
  /** Don't show flies when the user prefers reduced motion. Default true */
  respectReducedMotion?: boolean
  onSplat?: (score: number) => void
}

const MAX_SPLATS = 30

const noopSubscribe = () => () => {}
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

export function FlySplatter({
  count = 1,
  anchor = 'viewport',
  muted = false,
  initialDelay = 0,
  spawnDelay = 5000,
  zIndex = 1000,
  showScore = false,
  respectReducedMotion = true,
  onSplat,
}: FlySplatterProps) {
  const isClient = useIsClient()
  const reducedMotion = usePrefersReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef(0)
  const nextSplatId = useRef(0)
  const [score, setScore] = useState(0)
  const [splats, setSplats] = useState<SplatData[]>([])

  // A page-anchored overlay spans the whole document so flies can sit anywhere on it
  // while overflow stays clipped (no scrollbars from flies entering off-screen).
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay || anchor !== 'page') return
    const sync = () => sizeToPage(overlay)
    sync()
    // body may be fixed at 100% height, so also watch its children for content changes
    const observer = new ResizeObserver(sync)
    for (const el of [document.body, ...document.body.children]) {
      if (el !== overlay) observer.observe(el)
    }
    window.addEventListener('resize', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [anchor, isClient])

  const getBounds = useCallback(() => (overlayRef.current ? visibleBounds(overlayRef.current) : null), [])

  const handleSplat = useCallback(
    (fly: FlyState) => {
      const offset = (SPLAT_BOX - FLY_BOX) / 2
      const splat = {
        id: nextSplatId.current++,
        x: fly.x - offset,
        y: fly.y - offset,
        angle: fly.angle,
        variant: Math.floor(Math.random() * SPLAT_VARIANTS),
      }
      setSplats((list) => [...list, splat].slice(-MAX_SPLATS))
      scoreRef.current += 1
      setScore(scoreRef.current)
      onSplat?.(scoreRef.current)
    },
    [onSplat],
  )

  if (!isClient) return null
  const active = !(respectReducedMotion && reducedMotion)

  return (
    <>
      {createPortal(
        // Keyed by anchor: coordinates differ between modes, so start fresh when it changes
        <div key={anchor} ref={overlayRef} className="flysplatter" aria-hidden style={overlayStyle(anchor, zIndex)}>
          {splats.map((s) => (
            <Splat key={s.id} {...s} />
          ))}
          {active &&
            Array.from({ length: count }, (_, i) => (
              <Fly
                key={i}
                getBounds={getBounds}
                initialDelay={initialDelay}
                spawnDelay={spawnDelay}
                muted={muted}
                onSplat={handleSplat}
              />
            ))}
        </div>,
        document.body,
      )}
      {showScore && (
        <div
          className="flysplatter-score"
          role="status"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: zIndex + 1,
            padding: 10,
            color: '#fff',
            background: '#000',
            font: '16px sans-serif',
          }}
        >
          Score: {score}
        </div>
      )}
    </>
  )
}
