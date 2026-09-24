import { useCallback, useEffect, useRef } from 'react'
import buzzSrc from './assets/fly.mp3'
import splatSrc from './assets/splat.mp3'

const BUZZ_VOLUME = 0.25

function load(src: string) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.load()
  return audio
}

function play(audio: HTMLAudioElement) {
  audio.currentTime = 0
  // Autoplay policy may reject until the user has interacted with the page
  audio.play()?.catch(() => {})
}

/** Per-fly buzz (fades in) and splat sounds. Audio is preloaded as soon as it's unmuted, never while muted. */
export function useFlyAudio(muted: boolean) {
  const buzz = useRef<HTMLAudioElement | null>(null)
  const splat = useRef<HTMLAudioElement | null>(null)
  const fade = useRef<ReturnType<typeof setInterval>>(undefined)

  const buzzStop = useCallback(() => {
    clearInterval(fade.current)
    buzz.current?.pause()
  }, [])

  const buzzStart = useCallback(() => {
    if (muted) return
    const audio = (buzz.current ??= load(buzzSrc))
    clearInterval(fade.current)
    audio.volume = 0
    play(audio)
    fade.current = setInterval(() => {
      if (audio.volume < BUZZ_VOLUME) audio.volume = Math.min(audio.volume + 0.02, BUZZ_VOLUME)
      else clearInterval(fade.current)
    }, 20)
  }, [muted])

  const playSplat = useCallback(() => {
    if (muted) return
    play((splat.current ??= load(splatSrc)))
  }, [muted])

  useEffect(() => {
    if (muted) return buzzStop()
    buzz.current ??= load(buzzSrc)
    splat.current ??= load(splatSrc)
  }, [muted, buzzStop])

  useEffect(() => buzzStop, [buzzStop])

  return { buzzStart, buzzStop, playSplat }
}
