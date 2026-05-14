'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ViewTransitionLayer — manages route-change visual transitions.
 *
 * On route change:
 *   1. Flash a brief amber scan-line wipe across the screen
 *   2. Short chromatic split at peak (pure CSS, zero GPU)
 *   3. Fade out
 *
 * Works alongside the native View Transitions API (next.config.ts
 * has viewTransition: true) and degrades gracefully if not supported.
 */
export function ViewTransitionLayer() {
  const pathname   = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const lineRef    = useRef<HTMLDivElement>(null)
  const prevPath   = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    const overlay = overlayRef.current
    const line    = lineRef.current
    if (!overlay || !line) return

    // Kill any running animation
    overlay.getAnimations().forEach(a => a.cancel())
    line.getAnimations().forEach(a => a.cancel())

    // Scan-line wipe
    line.animate([
      { top: '-2px', opacity: 1 },
      { top: '102%', opacity: 0.6 },
    ], { duration: 480, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'both' })

    // Screen flash
    overlay.animate([
      { opacity: 0 },
      { opacity: 0.08, offset: 0.15 },
      { opacity: 0 },
    ], { duration: 480, easing: 'ease-out', fill: 'both' })

  }, [pathname])

  return (
    <>
      {/* Full-screen amber flash */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(229,169,60,1)',
          pointerEvents: 'none',
          zIndex: 8000,
          opacity: 0,
        }}
      />
      {/* Horizontal scan line */}
      <div
        ref={lineRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: '-2px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(229,169,60,0.9) 40%, rgba(255,210,100,1) 50%, rgba(229,169,60,0.9) 60%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 8001,
          boxShadow: '0 0 16px 4px rgba(229,169,60,0.6)',
          opacity: 0,
        }}
      />
    </>
  )
}
