'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { RouteCamera } from './Camera/RouteCamera'
import tunnel from 'tunnel-rat'

// Singleton tunnel — scenes inject themselves here from any route
export const SceneTunnel = tunnel()

/**
 * GlobalCanvas — mounts ONCE in layout.tsx, never unmounts.
 * Positioned fixed behind all DOM content.
 * All 3D scenes render through SceneTunnel.Out.
 */
export function GlobalCanvas() {
  return (
    <Canvas
      id="arkhevara-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      gl={{
        antialias: false,          // post-processing handles AA
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{
        fov: 60,
        near: 0.1,
        far: 200,
        position: [0, 0, 5],
      }}
      dpr={[0.5, 2]}              // adaptive via perfStore
      frameloop="always"
    >
      <Suspense fallback={null}>
        {/* Route camera — tweens on pathname change */}
        <RouteCamera />

        {/* Scene portal — all route scenes inject here */}
        <SceneTunnel.Out />
      </Suspense>
    </Canvas>
  )
}
