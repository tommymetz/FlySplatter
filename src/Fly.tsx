import { useEffect, useRef, type PointerEvent } from 'react'
import flyPng from './assets/fly.png'
import {
  FLY_BOX,
  createFly,
  isSplattable,
  respawnDelay,
  splatFly,
  stepFly,
  type Bounds,
  type FlyState,
} from './flyMachine'
import { drawFly, getImage, setupCanvas } from './sprites'
import { useAnimationFrame } from './useAnimationFrame'
import { useFlyAudio } from './useFlyAudio'

export interface FlyProps {
  getBounds: () => Bounds | null
  initialDelay: number
  spawnDelay: number
  muted: boolean
  onSplat: (fly: FlyState) => void
}

/** 2D canvas view of one fly. All per-frame work mutates refs; React never re-renders for motion. */
export function Fly({ getBounds, initialDelay, spawnDelay, muted, onSplat }: FlyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const flyRef = useRef<FlyState | null>(null)
  const drawnRef = useRef('')
  const { buzzStart, buzzStop, playSplat } = useFlyAudio(muted)

  useEffect(() => {
    if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current, FLY_BOX)
  }, [])

  function render(fly: FlyState) {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas) return
    canvas.style.visibility = fly.phase === 'waiting' ? 'hidden' : 'visible'
    canvas.style.transform = `translate3d(${fly.x}px, ${fly.y}px, 0)`

    const img = getImage(flyPng)
    const key = `${fly.frame}:${fly.angle}`
    if (ctx && img.complete && key !== drawnRef.current) {
      drawFly(ctx, img, fly.frame, fly.angle, FLY_BOX)
      drawnRef.current = key
    }
  }

  useAnimationFrame((dt) => {
    const bounds = getBounds()
    if (!bounds) return
    const prev = flyRef.current ?? createFly(initialDelay + respawnDelay(Math.random, spawnDelay))
    const next = stepFly(prev, dt, Math.random, bounds, spawnDelay)
    flyRef.current = next

    if (next.phase !== prev.phase) {
      if (next.phase === 'flyingIn' || next.phase === 'flyingAway') buzzStart()
      else buzzStop()
    }
    render(next)
  })

  function handlePointerDown(e: PointerEvent) {
    const fly = flyRef.current
    if (!fly || !isSplattable(fly)) return
    e.preventDefault()
    buzzStop()
    playSplat()
    onSplat(fly)
    flyRef.current = splatFly(fly, Math.random, spawnDelay)
    render(flyRef.current)
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="fly"
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        visibility: 'hidden',
        cursor: 'pointer',
        pointerEvents: 'auto',
        touchAction: 'none',
      }}
    />
  )
}
