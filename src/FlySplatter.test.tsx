import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FlySplatter } from './FlySplatter'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] })
})
afterEach(() => {
  vi.useRealTimers()
  vi.mocked(HTMLMediaElement.prototype.play).mockClear()
})

const overlay = () => document.body.querySelector('.flysplatter')
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))
const flyVisible = (el: HTMLElement) => el.style.visibility === 'visible'

/** Advance until the fly has landed (visible and past fly-in). */
function land() {
  advance(1000) // spawnDelay 0 + up to 1s random
  advance(1000) // fly-in converges well within this
}

describe('<FlySplatter>', () => {
  it('portals an overlay into body and removes it on unmount', () => {
    const { unmount } = render(<FlySplatter count={2} />)
    expect(overlay()?.parentElement).toBe(document.body)
    expect(screen.getAllByTestId('fly')).toHaveLength(2)
    unmount()
    expect(overlay()).toBeNull()
  })

  it('uses a fixed overlay by default and an absolute one for page anchoring', () => {
    const { rerender } = render(<FlySplatter />)
    expect((overlay() as HTMLElement).style.position).toBe('fixed')
    rerender(<FlySplatter anchor="page" />)
    expect((overlay() as HTMLElement).style.position).toBe('absolute')
  })

  it('ignores clicks until landed, then splats, scores and respawns', () => {
    const onSplat = vi.fn()
    render(<FlySplatter spawnDelay={0} showScore onSplat={onSplat} />)
    const fly = screen.getByTestId('fly')

    fireEvent.pointerDown(fly)
    expect(onSplat).not.toHaveBeenCalled()

    land()
    expect(flyVisible(fly)).toBe(true)
    fireEvent.pointerDown(fly)
    expect(onSplat).toHaveBeenCalledWith(1)
    expect(screen.getByRole('status').textContent).toBe('Score: 1')
    expect(screen.getAllByTestId('splat')).toHaveLength(1)
    expect(flyVisible(fly)).toBe(false)

    advance(2100) // 1s splat pause + spawnDelay 0 + up to 1s random
    expect(flyVisible(fly)).toBe(true)
  })

  it('plays sound unless muted, and toggling mute keeps the flies', () => {
    const { rerender } = render(<FlySplatter spawnDelay={0} muted />)
    const fly = screen.getByTestId('fly')
    land()
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()

    rerender(<FlySplatter spawnDelay={0} />)
    expect(screen.getByTestId('fly')).toBe(fly)
    fireEvent.pointerDown(fly)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('shows no flies when the user prefers reduced motion', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    } as unknown as MediaQueryList)
    const { rerender } = render(<FlySplatter />)
    expect(screen.queryByTestId('fly')).toBeNull()
    rerender(<FlySplatter respectReducedMotion={false} />)
    expect(screen.getByTestId('fly')).toBeTruthy()
    spy.mockRestore()
  })
})
