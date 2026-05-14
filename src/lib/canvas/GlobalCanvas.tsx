'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { RouteCamera } from './Camera/RouteCamera'
import { PostFXPipeline } from './PostFX/PostFXPipeline'
import { usePerfStore } from '@/lib/state/stores/perfStore'
import tunnel from 'tunnel-rat'

export const SceneTunnel = tunnel()

/** Sets renderer properties that can't be passed as R3F gl props */
function RendererSetup() {
  useFrame(({ gl, delta }: any) => {}, 0)

  // One-time setup via useFrame with priority -Infinity to run before everything
  const store = usePerfStore.getState()
  return null
}

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
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping         = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
        gl.outputColorSpace    = THREE.SRGBColorSpace
      }}
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 0, 5] }}
      dpr={[0.5, 2]}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <PerfMonitor />
        <RouteCamera />
        <SceneTunnel.Out />
        <PostFXPipeline />
      </Suspense>
    </Canvas>
  )
}
