import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'

interface CameraState {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  near: number
  far: number
  velocity: number          // scalar speed for chromatic aberration
  isTransitioning: boolean

  setPosition: (v: THREE.Vector3) => void
  setTarget: (v: THREE.Vector3) => void
  setFov: (fov: number) => void
  setVelocity: (v: number) => void
  setTransitioning: (b: boolean) => void
}

export const useCameraStore = create<CameraState>()(
  subscribeWithSelector((set) => ({
    position: new THREE.Vector3(0, 0, 5),
    target:   new THREE.Vector3(0, 0, 0),
    fov:      60,
    near:     0.1,
    far:      200,
    velocity: 0,
    isTransitioning: false,

    setPosition:      (v) => set({ position: v.clone() }),
    setTarget:        (v) => set({ target: v.clone() }),
    setFov:           (fov) => set({ fov }),
    setVelocity:      (velocity) => set({ velocity }),
    setTransitioning: (isTransitioning) => set({ isTransitioning }),
  }))
)
