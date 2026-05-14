'use client'

import { useEffect } from 'react'
import { usePerfStore } from '@/lib/state/stores/perfStore'

/**
 * MotionGuard — honours prefers-reduced-motion by forcing
 * the quality tier to its lowest (D) which cuts particles,
 * and also signals the canvas to pause non-essential animations.
 *
 * Also catches low-end GPU via device memory API.
 */
export function MotionGuard() {
  useEffect(() => {
    // 1. Reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const apply = (reduced: boolean) => {
      if (reduced) {
        usePerfStore.getState().setTier('D')
        document.documentElement.setAttribute('data-reduced-motion', 'true')
      } else {
        document.documentElement.removeAttribute('data-reduced-motion')
      }
    }

    apply(mq.matches)
    mq.addEventListener('change', (e) => apply(e.matches))

    // 2. Low device memory → cap at tier C
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) {
      const current = usePerfStore.getState().tier
      if (!['C', 'D'].includes(current)) {
        usePerfStore.getState().setTier('C')
      }
    }

    return () => {
      mq.removeEventListener('change', (e) => apply(e.matches))
    }
  }, [])

  return null
}
