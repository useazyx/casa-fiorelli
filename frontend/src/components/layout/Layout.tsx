import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { Footer } from './Footer'
import { Header } from './Header'

/**
 * Page change reads like a linen napkin wiping the table: a cream panel sweeps
 * across, the new page settles in behind it.
 *
 * The panel is keyed by route and has no exit animation on purpose: there is
 * nothing to wipe away when it leaves, and an AnimatePresence around it could
 * strand it half-open over the page.
 */
function NapkinWipe() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[80] origin-top bg-cream-200"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden
    />
  )
}

export function Layout() {
  const location = useLocation()
  const firstRender = useRef(true)
  const [navigated, setNavigated] = useState(false)
  const lenis = useSmoothScroll()

  useEffect(() => {
    // Lenis owns the scroll position while it is running: a bare window.scrollTo
    // is undone on the next frame whenever an inertial scroll is still in flight,
    // which drops the visitor into the middle (or past the end) of the page that
    // just opened, with nothing on screen. Reset Lenis first, then the window for
    // the reduced-motion case where Lenis never started.
    lenis.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo({ top: 0, behavior: 'auto' })

    // The wipe covers the viewport before uncovering it, so it must never run on
    // the first paint: a stalled animation would leave the visitor staring at a
    // blank panel. There is also nothing to wipe away when the page just loaded.
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    setNavigated(true)
  }, [location.pathname, lenis])

  return (
    <div className="flex min-h-screen flex-col bg-stucco">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-chianti-600 focus:px-5 focus:py-3 focus:text-sm focus:text-cream-50"
      >
        Pular para o conteúdo
      </a>

      <Header />
      {navigated && <NapkinWipe key={location.pathname} />}

      <main id="conteudo" className="flex-1">
        {/*
          No AnimatePresence around the page: <Outlet /> is not a snapshot, it always
          renders the *current* route. An exiting wrapper would therefore fade out the
          page that had just arrived, and whenever the swap to the incoming wrapper was
          interrupted the new page stayed parked on the exit values (opacity 0) for
          good. That is the blank page. Re-keying by pathname remounts the wrapper, so
          the entrance replays on every navigation and no exit state can ever stick.
        */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
