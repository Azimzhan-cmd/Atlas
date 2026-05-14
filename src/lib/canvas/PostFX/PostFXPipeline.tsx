'use client'

import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { usePerfStore } from '@/lib/state/stores/perfStore'

/**
 * PostFXPipeline — filmic post-processing effects.
 * Simplified to avoid Turbopack circular ref issues:
 *   - Bloom  (luminance threshold + mipmap blur)
 *   - Vignette
 *
 * ChromaticAberration & Noise disabled pending R3F/Turbopack fix.
 */
export function PostFXPipeline() {
  const tier = usePerfStore((s) => s.tier)

  if (tier === 'D') return null

  const isLow = tier === 'C'

  return (
    <EffectComposer multisampling={isLow ? 0 : 4} disableNormalPass>
      <Bloom
        luminanceThreshold={0.35}
        luminanceSmoothing={0.75}
        intensity={isLow ? 1.0 : 1.8}
        kernelSize={isLow ? KernelSize.SMALL : KernelSize.MEDIUM}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={0.22}
        darkness={isLow ? 0.45 : 0.65}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
