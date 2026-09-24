export type Rng = () => number

/** Seedable PRNG (mulberry32) for deterministic tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random number in [min, min + range) */
export const between = (rng: Rng, min: number, range: number) => min + rng() * range
