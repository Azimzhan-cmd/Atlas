'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useCallback } from 'react'
import { RouteCamera } from './Camera/RouteCamera'
import { usePerfStore } from '@/lib/state/stores/perfStore'
import tunnel from 'tunnel-rat'

export const SceneTunnel = tunnel()

// Inner component — useFrame only works inside Canvas
function PerfMonitor() {
  const recordFrame = usePerfStore((s) => s.recordFrame)
  const dpr         = usePerfStore((s) => s.dpr)

  useFrame(({ gl }, delta) => {
    recordFrame(delta * 1000)
    gl.setPixelRatio(dpr)
  })

  return null
}

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
        antialias: false,
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
      dpr={[0.5, 2]}
      frameloop="always"
    >
      <Suspense fallback={null}>
        {/* Adaptive DPR + perf monitor */}
        <PerfMonitor />

        {/* Route camera — tweens on pathname change */}
        <RouteCamera />

        {/* Scene portal — all route scenes inject here */}
        <SceneTunnel.Out />
      </Suspense>
    </Canvas>
  )
}
