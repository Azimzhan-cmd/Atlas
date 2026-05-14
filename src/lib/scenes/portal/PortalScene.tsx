'use client'

import { SceneTunnel } from '@/lib/canvas/GlobalCanvas'
import { ArkheCore } from './ArkheCore'
import { Archway } from './Archway'
import { SystemLines } from './SystemLines'
import { AmbientParticles } from './AmbientParticles'

interface PortalSceneProps {
  disruption?: number
}

/**
 * PortalScene — injected into the global canvas via SceneTunnel.
 * Renders when the '/' route is active.
 */
export function PortalScene({ disruption = 0 }: PortalSceneProps) {
  return (
    <SceneTunnel.In>
      {/* Scene lighting */}
      <ambientLight color="#1C1C1E" intensity={0.4} />
      <directionalLight
        position={[0.5, 2, 1.5]}
        color="#E5C870"
        intensity={8.5}
        castShadow={false}
      />

      {/* Background radial fog feel */}
      <fog attach="fog" args={['#090909', 12, 35]} />

      {/* The Arkhē Core — raymarched SDF */}
      <ArkheCore disruption={disruption} />

      {/* Bronze Archway behind the Core */}
      <Archway />

      {/* 12 system lines radiating at golden-ratio angles */}
      <SystemLines />

      {/* Background ambient particles */}
      <AmbientParticles />
    </SceneTunnel.In>
  )
}
