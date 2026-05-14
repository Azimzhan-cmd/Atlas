'use client'

import { useRef, useEffect } from 'react'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'

/**
 * Cursor — custom amber ring cursor.
 * - Outer ring lags behind (lerp 12%)
 * - Inner dot snaps instantly
 * - Ring expands on hover over interactive elements
 * - Pulse flash on pointer down
 */
export function Cursor() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)

  const rafRef   = useRef<number>(0)
  const pos      = useRef({ x: -100, y: -100, tx: -100, ty: -100 })
  const scale    = useRef(1)
  const targetScale = useRef(1)

  useEffect(() => {
    document.body.style.cursor = 'none'

    // Subscribe to interactionStore for pixel cursor pos
    const unsub = useInteractionStore.subscribe(
      (s) => s.cursorPx,
      ([tx, ty]) => {
        pos.current.tx = tx
        pos.current.ty = ty
      }
    )

    // Expand ring over interactive elements
    const onOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      const isInteractive = el.matches('a,button,input,textarea,[data-cursor-expand],label,[role="button"]')
      targetScale.current = isInteractive ? 2.2 : 1
    }

    // Pulse effect on pointer down
    const onDown = () => {
      if (!pulseRef.current) return
      pulseRef.current.style.transform = 'translate(-50%,-50%) scale(1)'
      pulseRef.current.style.opacity   = '0.6'
      pulseRef.current.style.transition = 'none'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!pulseRef.current) return
          pulseRef.current.style.transition = 'transform 500ms ease-out, opacity 500ms ease-out'
          pulseRef.current.style.transform  = 'translate(-50%,-50%) scale(3)'
          pulseRef.current.style.opacity    = '0'
        })
      })
    }

    window.addEventListener('pointermove', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    // Animation loop
    const tick = () => {
      const { tx, ty } = pos.current
      pos.current.x += (tx - pos.current.x) * 0.10
      pos.current.y += (ty - pos.current.y) * 0.10
      scale.current  += (targetScale.current - scale.current) * 0.12

      if (outerRef.current) {
        outerRef.current.style.transform =
          `translate(calc(${pos.current.x}px - 50%), calc(${pos.current.y}px - 50%)) scale(${scale.current})`
      }
      if (innerRef.current) {
        innerRef.current.style.transform =
          `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`
      }
      if (pulseRef.current) {
        pulseRef.current.style.left = `${tx}px`
        pulseRef.current.style.top  = `${ty}px`
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      document.body.style.cursor = ''
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onOver)
      window.removeEventListener('pointerdown', onDown)
      unsub()
    }
  }, [])

  const RING_SIZE = 36

  return (
    <>
      {/* Outer ring — lagged */}
      <div
        ref={outerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width:  RING_SIZE,
          height: RING_SIZE,
          borderRadius: '50%',
          border: '1.5px solid rgba(229,169,60,0.65)',
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)' as any,
          mixBlendMode: 'screen',
          willChange: 'transform',
          transformOrigin: '50% 50%',
        }}
      />

      {/* Inner dot — snappy */}
      <div
        ref={innerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#E5A93C',
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)' as any,
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />

      {/* Click pulse ring */}
      <div
        ref={pulseRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: '50%',
          border: '1px solid rgba(229,169,60,0.8)',
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)' as any,
          opacity: 0,
          transform: 'translate(-50%,-50%) scale(1)',
          transformOrigin: '50% 50%',
        }}
      />
    </>
  )
}
