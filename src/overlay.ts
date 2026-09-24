import type { CSSProperties } from 'react'
import type { Bounds } from './flyMachine'

/**
 * - viewport: flies live in a fixed layer, like a bug on your screen.
 * - page: flies live on the document (or a scroll container) and scroll with it, like a bug on the page.
 */
export type Anchor = 'viewport' | 'page'

export function overlayStyle(anchor: Anchor, zIndex: number): CSSProperties {
  return {
    position: anchor === 'page' ? 'absolute' : 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: anchor === 'page' ? 0 : '100%', // page height is kept in sync by the component
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex,
  }
}

/** The visible area (viewport, or the scroller's inner box) in the overlay's local coordinates. */
export function visibleBounds(overlay: HTMLElement, scroller: HTMLElement | null = null): Bounds {
  const o = overlay.getBoundingClientRect()
  if (!scroller) {
    const root = document.documentElement
    return {
      left: 0 - o.left, // not -o.left, which gives -0
      top: 0 - o.top,
      width: root.clientWidth || window.innerWidth,
      height: root.clientHeight || window.innerHeight,
    }
  }
  const s = scroller.getBoundingClientRect()
  return {
    left: s.left + scroller.clientLeft - o.left,
    top: s.top + scroller.clientTop - o.top,
    width: scroller.clientWidth,
    height: scroller.clientHeight,
  }
}

/**
 * Stretch a page overlay to the full scrollable height of the document or scroller. Collapse
 * it first so it doesn't measure itself. Uses scrollHeight because html/body are often
 * `height: 100%` with content overflowing them, so their box heights are just the viewport.
 */
export function sizeToPage(overlay: HTMLElement, scroller: HTMLElement | null = null) {
  overlay.style.height = '0'
  overlay.style.height = `${(scroller ?? document.documentElement).scrollHeight}px`
}

/**
 * Put the portal host in the scroller (or body). The overlay is absolutely positioned, so it
 * only scrolls with the scroller's content if the scroller is its containing block: a static
 * scroller gets `position: relative` until detached.
 */
export function attachHost(host: HTMLElement, scroller: HTMLElement | null) {
  ;(scroller ?? document.body).appendChild(host)
  const previous = scroller?.style.position ?? ''
  if (scroller && getComputedStyle(scroller).position === 'static') scroller.style.position = 'relative'
  return () => {
    host.remove()
    if (scroller) scroller.style.position = previous
  }
}
