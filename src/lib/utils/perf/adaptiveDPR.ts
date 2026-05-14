import { usePerfStore } from '@/lib/state/stores/perfStore'

/**
 * AdaptiveDPR — singleton that runs in a useFrame and records
 * frame timing to drive the quality tier machine.
 * Mount once inside the GlobalCanvas.
 */
export function useAdaptiveDPR() {
  let lastTime = performance.now()

  return (state: { gl: { setPixelRatio: (dpr: number) => void } }) => {
    const now   = performance.now()
    const delta = now - lastTime
    lastTime = now

    const store = usePerfStore.getState()
    store.recordFrame(delta)

    // Apply DPR to renderer when tier changes
    state.gl.setPixelRatio(store.dpr)
  }
}
