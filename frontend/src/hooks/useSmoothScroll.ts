import Lenis from 'lenis'
import { useEffect, useRef, type RefObject } from 'react'

/**
 * Inertial scrolling for the whole document, using Lenis.
 * Disabled outright when the visitor asks for reduced motion.
 *
 * Returns a ref to the live instance (null while reduced motion is on) so callers
 * can reset the scroll through Lenis instead of fighting it with window.scrollTo.
 */
export function useSmoothScroll(): RefObject<Lenis | null> {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenisRef.current = lenis
    let frame = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
