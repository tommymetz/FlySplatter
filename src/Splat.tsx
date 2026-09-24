import { useEffect, useRef } from 'react'
import { SPLAT_BOX, drawSplat, getSplatImage, setupCanvas } from './sprites'

export interface SplatData {
  id: number
  /** Top-left of the splat's box */
  x: number
  y: number
  angle: number
  variant: number
}

export function Splat({ x, y, angle, variant }: SplatData) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current && setupCanvas(canvasRef.current, SPLAT_BOX)
    if (!ctx) return
    const img = getSplatImage()
    const draw = () => drawSplat(ctx, img, variant, angle)
    if (img.complete) draw()
    else img.addEventListener('load', draw, { once: true })
    return () => img.removeEventListener('load', draw)
  }, [angle, variant])

  return (
    <canvas
      ref={canvasRef}
      data-testid="splat"
      style={{ position: 'absolute', top: 0, left: 0, transform: `translate3d(${x}px, ${y}px, 0)` }}
    />
  )
}
