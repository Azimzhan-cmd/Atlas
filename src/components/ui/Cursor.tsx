'use client'

import React, { useRef, useEffect } from 'react'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'
import { smoothstep } from '@/lib/utils/math/spring'

/**
 * Cursor — replaces the native cursor with a custom SVG ring.
 * Expands in gravitational zone near the Arkhē Core.
 */
export function Cursor() {
  const cursorRef   = useRef<HTMLDivElement>(null)
  const dotRef      = useRef<HTMLDivElement>(null)
  const rafRef      = useRef<number>(0)
  const posRef      = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  useEffect(() => {
    // Hide native cursor
    document.body.style.cursor = 'none'

    const unsub = useInteractionStore.subscribe(
      (s) => s.cursorPx,
      ([tx, ty]) => {
        posRef.current.tx = tx
        posRef.current.ty = ty
      }
    )

    const tick = () => {
      const { tx, ty } = posRef.current
      posRef.current.x += (tx - posRef.current.x) * 0.12
      posRef.current.y += (ty - posRef.current.y) * 0.12

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${posRef.current.x - 20}px, ${posRef.current.y - 20}px)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${tx - 3}px, ${ty - 3}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      document.body.style.cursor = ''
      cancelAnimationFrame(rafRef.current)
      unsub()
    }
  }, [])

  return (
    <>
      {/* Outer ring — lags behind */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(229,169,60,0.6)',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'screen',
          transition: 'transform 0ms linear, width 200ms, height 200ms',
          willChange: 'transform',
        }}
      />
      {/* Inner dot — snaps to cursor */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'rgba(229,169,60,0.9)',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />
    </>
  )
}
