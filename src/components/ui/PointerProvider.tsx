'use client'

import { useUnifiedPointer } from '@/lib/utils/input/unifiedPointer'

/**
 * PointerProvider — mounts at root layout level.
 * Activates unified pointer tracking globally across all routes.
 * No rendering output.
 */
export function PointerProvider() {
  useUnifiedPointer()
  return null
}
