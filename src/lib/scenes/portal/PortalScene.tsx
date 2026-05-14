'use client'

import { SceneTunnel } from '@/lib/canvas/GlobalCanvas'
import { ArkheCore } from './ArkheCore'
import { Archway } from './Archway'
import { SystemLines } from './SystemLines'
import { CurlNoiseField } from './CurlNoiseField'

interface PortalSceneProps {
  disruption?: number
}

/**
 * PortalScene — injected into the global canvas via SceneTunnel.
 * Renders when the '/' route is active.
 *
 * Stack (back → front):
 *   CurlNoiseField  — 500k GPU-simulated divergence-free particles
 *   Archway         — bronze oxidation arch
 *   ArkheCore       — raymarched SDF sphere with bloom
 *   SystemLines     — 12 golden-ratio bezier ribbons
 */
export function PortalScene({ disruption = 0 }: PortalSceneProps) {
  return (
    <SceneTunnel.In>
      {/* Scene lighting */}
      <ambientLight color="#1C1C1E" intensity={0.35} />
      <directionalLight
        position={[0.5, 2, 1.5]}
        color="#E5C870"
        intensity={6}
        castShadow={false}
      />

      {/* Atmospheric depth */}
      <fog attach="fog" args={['#090909', 14, 38]} />

      {/* ── Layers (back → front) ── */}
      <CurlNoiseField />
      <Archway />
      <ArkheCore disruption={disruption} />
      <SystemLines />
    </SceneTunnel.In>
  )
}
