'use client'

import { useRef } from 'react'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCameraStore } from '@/lib/state/stores/cameraStore'
import { usePerfStore } from '@/lib/state/stores/perfStore'

/**
 * PostFXPipeline — mounts inside the R3F Canvas.
 * Applies scene-wide filmic effects:
 *   - Bloom (luminance threshold, soft knee)
 *   - Chromatic Aberration (reacts to camera velocity)
 *   - Noise / Film Grain (subtle, 0.025 opacity)
 *   - Vignette (dark edges)
 *
 * Effects are disabled at tier D (low-end) and
 * scaled at tier C.
 */
export function PostFXPipeline() {
  const chromaticRef   = useRef<any>(null)
  const bloomRef       = useRef<any>(null)
  const offsetRef      = useRef(new THREE.Vector2(0, 0))

  const tier = usePerfStore((s) => s.tier)

  // Disable entirely on low-end
  if (tier === 'D') return null

  const isLow = tier === 'C'

  useFrame(() => {
    if (!chromaticRef.current) return
    const velocity = useCameraStore.getState().velocity
    // velocity → chromatic aberration offset (max 0.003 at high speed)
    const strength = Math.min(velocity * 0.00015, 0.003)
    offsetRef.current.set(strength, strength * 0.5)
    chromaticRef.current.offset = offsetRef.current
  })

  return (
    <EffectComposer multisampling={isLow ? 0 : 4}>
      {/* ── Bloom ─────────────────────────────────────────────── */}
      <Bloom
        ref={bloomRef}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.7}
        intensity={isLow ? 1.2 : 2.0}
        kernelSize={isLow ? KernelSize.SMALL : KernelSize.LARGE}
        mipmapBlur
      />

      {/* ── Chromatic Aberration (velocity-driven) ────────────── */}
      <ChromaticAberration
        ref={chromaticRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0004, 0.0002)}
        radialModulation={false}
        modulationOffset={0}
      />

      {/* ── Film Grain ────────────────────────────────────────── */}
      {!isLow && (
        <Noise
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
          opacity={0.025}
        />
      )}

      {/* ── Vignette ──────────────────────────────────────────── */}
      <Vignette
        eskil={false}
        offset={0.25}
        darkness={isLow ? 0.5 : 0.72}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
