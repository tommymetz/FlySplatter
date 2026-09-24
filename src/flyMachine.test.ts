import { describe, expect, it } from 'vitest'
import { FLY_BOX, createFly, isSplattable, splatFly, stepFly, type Bounds, type FlyState } from './flyMachine'
import { seededRng } from './random'

const bounds: Bounds = { left: 0, top: 0, width: 800, height: 600 }
const SPAWN = 1000

function run(fly: FlyState, ms: number, rng = seededRng(1), b = bounds, dt = 16) {
  const phases: FlyState['phase'][] = []
  for (let t = 0; t < ms; t += dt) {
    fly = stepFly(fly, dt, rng, b, SPAWN)
    if (phases.at(-1) !== fly.phase) phases.push(fly.phase)
  }
  return { fly, phases }
}

describe('flyMachine', () => {
  it('waits for its delay before flying in', () => {
    const rng = seededRng(1)
    let fly = stepFly(createFly(500), 400, rng, bounds, SPAWN)
    expect(fly.phase).toBe('waiting')
    fly = stepFly(fly, 100, rng, bounds, SPAWN)
    expect(fly.phase).toBe('flyingIn')
    expect(fly.frame).toBe('flying')
  })

  it('spawns off-screen and targets the visible area', () => {
    const offset = { left: 0, top: 2000, width: 800, height: 600 }
    for (let seed = 0; seed < 20; seed++) {
      const fly = stepFly(createFly(0), 16, seededRng(seed), offset, SPAWN)
      const onScreen = fly.x > -FLY_BOX && fly.x < 800 && fly.y > 2000 - FLY_BOX && fly.y < 2600
      expect(onScreen).toBe(false)
      expect(fly.targetX).toBeGreaterThanOrEqual(100)
      expect(fly.targetX).toBeLessThanOrEqual(700)
      expect(fly.targetY).toBeGreaterThanOrEqual(2000)
      expect(fly.targetY).toBeLessThanOrEqual(2450)
    }
  })

  it('lands quickly, performs actions, flies away and comes back', () => {
    const { phases } = run(createFly(0), 30_000)
    expect(phases.slice(0, 5)).toEqual(['flyingIn', 'landed', 'flyingAway', 'waiting', 'flyingIn'])
  })

  it('lands within half a second regardless of frame rate', () => {
    for (const dt of [8, 16, 33, 100]) {
      const { fly } = run(stepFly(createFly(0), 1, seededRng(2), bounds, SPAWN), 500, seededRng(3), bounds, dt)
      expect(fly.phase).toBe('landed')
    }
  })

  it('does not walk out of the visible area', () => {
    for (let seed = 0; seed < 20; seed++) {
      let fly = createFly(0)
      const rng = seededRng(seed)
      while (fly.phase !== 'flyingAway') {
        fly = stepFly(fly, 16, rng, bounds, SPAWN)
        if (fly.phase === 'landed') {
          expect(fly.x).toBeGreaterThanOrEqual(0)
          expect(fly.y).toBeGreaterThanOrEqual(0)
          expect(fly.x).toBeLessThanOrEqual(800 - FLY_BOX)
          expect(fly.y).toBeLessThanOrEqual(600 - FLY_BOX)
        }
      }
    }
  })

  it('is only splattable once landed', () => {
    const rng = seededRng(4)
    let fly = stepFly(createFly(0), 16, rng, bounds, SPAWN)
    expect(isSplattable(fly)).toBe(false)
    while (fly.phase !== 'landed') fly = stepFly(fly, 16, rng, bounds, SPAWN)
    expect(isSplattable(fly)).toBe(true)

    const splatted = splatFly(fly, rng, SPAWN)
    expect(splatted.phase).toBe('waiting')
    expect(splatted.timer).toBeGreaterThanOrEqual(2000)
  })

  it('is deterministic for a given seed', () => {
    expect(run(createFly(0), 5000, seededRng(9)).fly).toEqual(run(createFly(0), 5000, seededRng(9)).fly)
  })
})
