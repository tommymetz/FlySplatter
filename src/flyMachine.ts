import { between, type Rng } from './random'

/**
 * Pure fly behavior. No DOM, no React: a view (2D canvas today, maybe R3F later)
 * reads `x`, `y`, `angle` and `frame` from the state each tick.
 */

export type Frame =
  | 'flying'
  | 'normal'
  | 'wing-twitch-left'
  | 'wing-twitch-right'
  | 'rubbing-arms-left'
  | 'rubbing-arms-right'

export type Phase = 'waiting' | 'flyingIn' | 'landed' | 'flyingAway'

/** Visible area in the fly's coordinate space. */
export interface Bounds {
  left: number
  top: number
  width: number
  height: number
}

type ActionKind = 'rub' | 'twitch' | 'walk'

interface Action {
  kind: ActionKind
  stepsLeft: number
  toggle: boolean
}

export interface FlyState {
  phase: Phase
  /** Top-left of the fly's 100x100 box */
  x: number
  y: number
  angle: number
  frame: Frame
  /** ms until the next discrete event (spawn, action step) */
  timer: number
  targetX: number
  targetY: number
  actionsLeft: number
  /** null while pausing between actions */
  action: Action | null
}

export const FLY_BOX = 100
const ACTIONS_PER_LANDING = 4
const FLY_IN_EASE = 0.75 // fraction of remaining distance left after each 20ms
const FLY_AWAY_SPEED = 5 // px per ms
const OFFSCREEN = 200

export const respawnDelay = (rng: Rng, spawnDelay: number) => between(rng, spawnDelay, 1000)

export function createFly(delay: number): FlyState {
  return {
    phase: 'waiting',
    x: 0,
    y: 0,
    angle: 0,
    frame: 'flying',
    timer: delay,
    targetX: 0,
    targetY: 0,
    actionsLeft: 0,
    action: null,
  }
}

export const isSplattable = (fly: FlyState) => fly.phase === 'landed' || fly.phase === 'flyingAway'

export function splatFly(fly: FlyState, rng: Rng, spawnDelay: number): FlyState {
  return { ...fly, phase: 'waiting', action: null, timer: 1000 + respawnDelay(rng, spawnDelay) }
}

export function stepFly(fly: FlyState, dt: number, rng: Rng, bounds: Bounds, spawnDelay: number): FlyState {
  switch (fly.phase) {
    case 'waiting':
      return fly.timer - dt > 0 ? { ...fly, timer: fly.timer - dt } : flyIn(fly, rng, bounds)
    case 'flyingIn':
      return stepFlyingIn(fly, dt)
    case 'landed':
      return stepLanded(fly, dt, rng, bounds)
    case 'flyingAway':
      return stepFlyingAway(fly, dt, rng, bounds, spawnDelay)
  }
}

function flyIn(fly: FlyState, rng: Rng, bounds: Bounds): FlyState {
  const { left, top, width, height } = bounds
  const corner = Math.floor(rng() * 4)
  const x = corner === 1 || corner === 2 ? left + width : left - FLY_BOX
  const y = corner >= 2 ? top + height : top - FLY_BOX
  const targetX = left + between(rng, width * 0.125, width * 0.75)
  const targetY = top + rng() * height * 0.75
  return {
    ...fly,
    phase: 'flyingIn',
    x,
    y,
    targetX,
    targetY,
    angle: Math.atan2(targetY - y, targetX - x) + Math.PI / 2,
    frame: 'flying',
    timer: 0,
    action: null,
  }
}

function stepFlyingIn(fly: FlyState, dt: number): FlyState {
  const keep = Math.pow(FLY_IN_EASE, dt / 20)
  const x = fly.targetX + (fly.x - fly.targetX) * keep
  const y = fly.targetY + (fly.y - fly.targetY) * keep
  if (Math.hypot(fly.targetX - x, fly.targetY - y) < 10) {
    return { ...fly, x, y, phase: 'landed', frame: 'normal', actionsLeft: ACTIONS_PER_LANDING, timer: 0 }
  }
  return { ...fly, x, y }
}

function stepFlyingAway(fly: FlyState, dt: number, rng: Rng, bounds: Bounds, spawnDelay: number): FlyState {
  const distance = FLY_AWAY_SPEED * dt
  const x = fly.x + Math.cos(fly.angle - Math.PI / 2) * distance
  const y = fly.y + Math.sin(fly.angle - Math.PI / 2) * distance
  const { left, top, width, height } = bounds
  if (x <= left - OFFSCREEN || x >= left + width || y <= top - OFFSCREEN || y >= top + height) {
    return { ...fly, x, y, phase: 'waiting', timer: respawnDelay(rng, spawnDelay) }
  }
  return { ...fly, x, y }
}

function stepLanded(fly: FlyState, dt: number, rng: Rng, bounds: Bounds): FlyState {
  let next = { ...fly, timer: fly.timer - dt }
  while (next.phase === 'landed' && next.timer <= 0) {
    next = landedEvent(next, rng, bounds)
  }
  return next
}

/** One discrete event while landed: start an action, advance it, or finish it. */
function landedEvent(fly: FlyState, rng: Rng, bounds: Bounds): FlyState {
  const { action } = fly

  if (!action) {
    if (fly.actionsLeft <= 0) return { ...fly, phase: 'flyingAway', frame: 'flying', timer: 0 }
    const kind = (['rub', 'twitch', 'walk'] as const)[Math.floor(rng() * 3)]
    const stepsLeft =
      kind === 'rub'
        ? Math.round(rng() * 10) + 10
        : kind === 'twitch'
          ? Math.round(rng() * 3) + 3
          : Math.round(rng() * 4) + 2
    return {
      ...fly,
      actionsLeft: fly.actionsLeft - 1,
      action: { kind, stepsLeft, toggle: false },
      timer: fly.timer + between(rng, 200, 200),
    }
  }

  if (action.stepsLeft <= 0) {
    return { ...fly, action: null, frame: 'normal', timer: fly.timer }
  }

  const toggle = !action.toggle
  const nextAction = { ...action, stepsLeft: action.stepsLeft - 1, toggle }

  switch (action.kind) {
    case 'rub':
      return {
        ...fly,
        action: nextAction,
        frame: toggle ? 'rubbing-arms-right' : 'rubbing-arms-left',
        timer: fly.timer + between(rng, 50, 50),
      }
    case 'twitch':
      return {
        ...fly,
        action: nextAction,
        frame: toggle ? 'wing-twitch-right' : 'wing-twitch-left',
        timer: fly.timer + between(rng, 30, 70),
      }
    case 'walk': {
      const angle = fly.angle + ((Math.round(rng() * 90) - 45) * Math.PI) / 180
      const distance = between(rng, 20, 40)
      const x = fly.x + Math.cos(angle - Math.PI / 2) * distance
      const y = fly.y + Math.sin(angle - Math.PI / 2) * distance
      return {
        ...fly,
        ...keepInside(fly, x, y, bounds),
        angle,
        action: nextAction,
        frame: 'normal',
        timer: fly.timer + between(rng, 50, 50),
      }
    }
  }
}

/**
 * Stop a walk from leaving the visible area. A fly that's already outside it
 * (e.g. the page scrolled away in page-anchored mode) is left alone.
 */
function keepInside(fly: FlyState, x: number, y: number, b: Bounds) {
  const maxX = b.left + b.width - FLY_BOX
  const maxY = b.top + b.height - FLY_BOX
  const inside = fly.x >= b.left && fly.x <= maxX && fly.y >= b.top && fly.y <= maxY
  if (!inside) return { x, y }
  return { x: Math.min(Math.max(x, b.left), maxX), y: Math.min(Math.max(y, b.top), maxY) }
}
