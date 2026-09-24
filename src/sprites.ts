import type { Frame } from './flyMachine'

const FLY_FRAMES: Frame[] = [
  'flying',
  'normal',
  'wing-twitch-left',
  'wing-twitch-right',
  'rubbing-arms-left',
  'rubbing-arms-right',
]
const FLY_FRAME_W = 50
const FLY_FRAME_H = 60
const SPLAT_FRAME = 100
export const SPLAT_VARIANTS = 5
export const SPLAT_BOX = 200

/** Size a square canvas for the device pixel ratio and return a context in CSS pixels. */
export function setupCanvas(canvas: HTMLCanvasElement, size: number) {
  const ratio = window.devicePixelRatio || 1
  canvas.width = size * ratio
  canvas.height = size * ratio
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  const ctx = canvas.getContext('2d')
  ctx?.scale(ratio, ratio)
  return ctx
}

/** Draw `image`'s cell `col` rotated by `angle` around the center of a `box`-sized canvas. */
function drawRotated(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  box: number,
  angle: number,
  sx: number,
  w: number,
  h: number,
) {
  const c = box / 2
  ctx.clearRect(0, 0, box, box)
  ctx.save()
  ctx.translate(c, c)
  ctx.rotate(angle)
  ctx.translate(-c, -c)
  ctx.drawImage(image, sx, 0, w, h, box / 4, box / 4, w, h)
  ctx.restore()
}

export function drawFly(ctx: CanvasRenderingContext2D, image: CanvasImageSource, frame: Frame, angle: number, box: number) {
  // Shadow is in canvas space (not rotated), so it always falls bottom-right
  ctx.shadowColor = 'rgba(0,0,0,0.1)'
  ctx.shadowOffsetX = 10
  ctx.shadowOffsetY = 10
  ctx.shadowBlur = 10
  drawRotated(ctx, image, box, angle, FLY_FRAMES.indexOf(frame) * FLY_FRAME_W, FLY_FRAME_W, FLY_FRAME_H)
}

export function drawSplat(ctx: CanvasRenderingContext2D, image: CanvasImageSource, variant: number, angle: number) {
  drawRotated(ctx, image, SPLAT_BOX, angle, variant * SPLAT_FRAME, SPLAT_FRAME, SPLAT_FRAME)
}

const images = new Map<string, HTMLImageElement>()

/** Shared, cached image; check `.complete` before drawing. */
export function getImage(src: string) {
  let img = images.get(src)
  if (!img) {
    img = new Image()
    img.src = src
    images.set(src, img)
  }
  return img
}
