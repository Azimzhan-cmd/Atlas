import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type QualityTier = 'S' | 'A' | 'B' | 'C' | 'D'

const getDPR = (tier: QualityTier): number => {
  if (typeof window === 'undefined') return 1
  const native = window.devicePixelRatio ?? 1
  switch (tier) {
    case 'S': return Math.min(native, 2.0)
    case 'A': return 1.0
    case 'B': return 0.85
    case 'C': return 0.65
    case 'D': return 0.5
  }
}

const PARTICLE_COUNT: Record<QualityTier, number> = {
  S: 524288, A: 262144, B: 131072, C: 65536, D: 16384,
}

interface PerfState {
  tier: QualityTier
  dpr: number
  particleCount: number
  frameTimes: number[]
  frameCount: number
  setTier: (tier: QualityTier) => void
  recordFrame: (ms: number) => void
  rollingMean: () => number
}

export const usePerfStore = create<PerfState>()(
  subscribeWithSelector((set, get) => ({
    tier: 'B',
    dpr: 0.85,
    particleCount: PARTICLE_COUNT['B'],
    frameTimes: [],
    frameCount: 0,

    setTier: (tier) => {
      set({ tier, dpr: getDPR(tier), particleCount: PARTICLE_COUNT[tier] })
    },

    recordFrame: (ms: number) => {
      const { frameTimes, frameCount, tier, setTier } = get()
      const next = [...frameTimes.slice(-29), ms]
      const mean = next.reduce((a, b) => a + b, 0) / next.length
      const newCount = frameCount + 1
      const TIERS: QualityTier[] = ['S', 'A', 'B', 'C', 'D']
      const idx = TIERS.indexOf(tier)
      let newTier = tier
      if      (mean > 22 && idx < 4 && newCount % 30  === 0) newTier = TIERS[idx + 1]
      else if (mean < 8  && idx > 0 && newCount % 240 === 0) newTier = TIERS[idx - 1]
      else if (mean < 12 && idx > 1 && newCount % 240 === 0) newTier = TIERS[idx - 1]
      if (newTier !== tier) setTier(newTier)
      set({ frameTimes: next, frameCount: newCount })
    },

    rollingMean: () => {
      const { frameTimes } = get()
      return frameTimes.length ? frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length : 16
    },
  }))
)
