import { describe, expect, it, vi } from 'vitest'
import { sizeToPage, visibleBounds } from './overlay'

function overlayAt(left: number, top: number) {
  const el = document.createElement('div')
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ left, top } as DOMRect)
  return el
}

describe('visibleBounds', () => {
  it('is the viewport for a fixed overlay', () => {
    expect(visibleBounds(overlayAt(0, 0))).toMatchObject({ left: 0, top: 0 })
  })

  it('offsets by scroll for a page overlay', () => {
    // Page scrolled down 1500px: overlay's top edge is 1500px above the viewport
    expect(visibleBounds(overlayAt(0, -1500))).toMatchObject({ left: 0, top: 1500 })
  })

  it('accounts for an overlay offset inside a positioned body', () => {
    expect(visibleBounds(overlayAt(8, 40))).toMatchObject({ left: -8, top: -40 })
  })
})

describe('sizeToPage', () => {
  it('uses the scrollable height, not the (100%) body height', () => {
    const overlay = document.createElement('div')
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(4200)
    sizeToPage(overlay)
    expect(overlay.style.height).toBe('4200px')
  })
})
