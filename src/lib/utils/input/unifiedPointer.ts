'use client'

import { useEffect, useCallback } from 'react'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'

/**
 * useUnifiedPointer — normalises mouse / touch / pen events
 * into NDC coordinates and fires store updates.
 * Must be mounted once at the root (layout level).
 */
export function useUnifiedPointer() {
  const setCursorNDC = useInteractionStore((s) => s.setCursorNDC)
  const setCursorPx  = useInteractionStore((s) => s.setCursorPx)
  const setDown      = useInteractionStore((s) => s.setPointerDown)

  const onMove = useCallback((e: PointerEvent) => {
    const x =  (e.clientX / window.innerWidth)  * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    setCursorNDC(x, y)
    setCursorPx(e.clientX, e.clientY)
  }, [setCursorNDC, setCursorPx])

  const onDown = useCallback(() => setDown(true),  [setDown])
  const onUp   = useCallback(() => setDown(false), [setDown])

  useEffect(() => {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup',   onUp,   { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup',   onUp)
    }
  }, [onMove, onDown, onUp])
}

/**
 * Normalise scroll delta across trackpad / wheel / touch
 * Returns a unified delta-Y in normalised pixels/frame
 */
export function normalizeScrollDelta(e: WheelEvent): number {
  // WheelEvent.deltaMode: 0=px, 1=line, 2=page
  if (e.deltaMode === 1) return e.deltaY * 16
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight
  return e.deltaY
}
