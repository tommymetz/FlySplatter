import type { CSSProperties } from 'react'
import type { Bounds } from './flyMachine'

/**
 * - viewport: flies live in a fixed layer, like a bug on your screen.
 * - page: flies live on the document and scroll with it, like a bug on the page.
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

/** The visible viewport in the overlay's local coordinates. */
export function visibleBounds(overlay: HTMLElement): Bounds {
  const rect = overlay.getBoundingClientRect()
  const root = document.documentElement
  return {
    left: 0 - rect.left, // not -rect.left, which gives -0
    top: 0 - rect.top,
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  }
}

/**
 * Stretch a page overlay to the full scrollable height. Collapse it first so it doesn't
 * measure itself. Uses scrollHeight because html/body are often `height: 100%` with content
 * overflowing them, so their box heights are just the viewport.
 */
export function sizeToPage(overlay: HTMLElement) {
  overlay.style.height = '0'
  overlay.style.height = `${document.documentElement.scrollHeight}px`
}
