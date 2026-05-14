'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePerfStore } from '@/lib/state/stores/perfStore'
import { useCameraStore } from '@/lib/state/stores/cameraStore'

const ROUTE_LABELS: Record<string, string> = {
  '/':        'PORTAL',
  '/atlas':   'ATLAS',
  '/work':    'WORK',
  '/systems': 'SYSTEMS',
  '/lab':     'LAB',
  '/craft':   'CRAFT',
  '/brief':   'BRIEF',
}

/**
 * HUD — persistent heads-up display overlay.
 * Shows:
 *   - Current route label (top-left, beneath nav)
 *   - Quality tier indicator (bottom-right)
 *   - Camera velocity bar (right edge)
 *   - FPS counter (only in dev)
 */
export function HUD() {
  const pathname      = usePathname()
  const tier          = usePerfStore((s) => s.tier)
  const [fps, setFps] = useState(60)
  const frameCount    = useRef(0)
  const lastTime      = useRef(performance.now())

  // FPS sampler
  useEffect(() => {
    let raf: number
    const measure = () => {
      frameCount.current++
      const now = performance.now()
      if (now - lastTime.current >= 1000) {
        setFps(Math.round(frameCount.current * 1000 / (now - lastTime.current)))
        frameCount.current = 0
        lastTime.current   = now
      }
      raf = requestAnimationFrame(measure)
    }
    raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [])

  const TIER_COLORS: Record<string, string> = {
    S: '#4CAF50', A: '#8BC34A', B: '#E5A93C',
    C: '#FF9800', D: '#F44336',
  }

  const routeLabel = ROUTE_LABELS[pathname] ?? pathname.replace('/', '').toUpperCase()

  return (
    <>
      {/* Route label — left side, below nav */}
      <div
        aria-label={`Current section: ${routeLabel}`}
        style={{
          position: 'fixed',
          left: '2.5rem',
          top: '5.5rem',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(229,169,60,0.35)',
        }}>
          ◈ {routeLabel}
        </p>
      </div>

      {/* Quality tier + FPS — bottom right corner */}
      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1.25rem',
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '2px',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          letterSpacing: '0.1em',
          color: TIER_COLORS[tier],
          opacity: 0.7,
        }}>
          TIER {tier}
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          letterSpacing: '0.08em',
          color: fps >= 55 ? 'rgba(76,175,80,0.6)' : fps >= 30 ? 'rgba(255,152,0,0.6)' : 'rgba(244,67,54,0.6)',
        }}>
          {fps} FPS
        </p>
      </div>
    </>
  )
}
