import { useEffect, useLayoutEffect, useRef } from 'react'

const MAX_DT = 100

/** Calls `callback(dt)` every frame while `active`. `dt` is clamped so a backgrounded tab doesn't teleport things. */
export function useAnimationFrame(callback: (dt: number) => void, active = true) {
  const callbackRef = useRef(callback)
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!active) return
    let last = performance.now()
    let id = requestAnimationFrame(function loop(now) {
      callbackRef.current(Math.min(Math.max(now - last, 0), MAX_DT))
      last = now
      id = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(id)
  }, [active])
}
