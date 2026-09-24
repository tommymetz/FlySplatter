import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)

// jsdom has no canvas, media playback, ResizeObserver or matchMedia
HTMLCanvasElement.prototype.getContext = vi.fn(
  () => new Proxy({}, { get: () => vi.fn(), set: () => true }),
) as unknown as HTMLCanvasElement['getContext']
HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
HTMLMediaElement.prototype.pause = vi.fn()

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList
