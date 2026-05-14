'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { WAYPOINTS, RouteId } from './waypoints'
import { useCameraStore } from '@/lib/state/stores/cameraStore'
import { getEasing } from './easings'

/**
 * RouteCamera — lives inside the R3F Canvas.
 * Listens to pathname changes and tweens the camera to the
 * route's registered waypoint using GSAP.
 */
export function RouteCamera() {
  const pathname = usePathname()
  const { camera } = useThree()
  const { setVelocity, setTransitioning } = useCameraStore()
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const prevPos  = useRef(new THREE.Vector3())

  useEffect(() => {
    const waypoint = WAYPOINTS[pathname as RouteId]
    if (!waypoint) return

    // Kill any running tween
    tweenRef.current?.kill()
    setTransitioning(true)

    const startPos = camera.position.clone()
    const endPos   = waypoint.position.clone()
    const endLookAt = waypoint.target.clone()
    const duration  = waypoint.duration / 1000  // GSAP uses seconds

    const proxy = { t: 0 }
    tweenRef.current = gsap.to(proxy, {
      t: 1,
      duration,
      ease: `power2.out`,  // matches our cubicOut
      onUpdate: () => {
        const t = proxy.t
        camera.position.lerpVectors(startPos, endPos, t)

        // Lerp lookAt target
        const lerpedTarget = new THREE.Vector3().lerpVectors(
          prevPos.current,
          endLookAt,
          t
        )
        camera.lookAt(lerpedTarget)

        // Track velocity for chromatic aberration
        const vel = camera.position.distanceTo(prevPos.current) * 60
        setVelocity(vel)
        prevPos.current.copy(camera.position)
      },
      onComplete: () => {
        camera.lookAt(endLookAt)
        setVelocity(0)
        setTransitioning(false)
        // Apply FOV
        if ((camera as THREE.PerspectiveCamera).fov !== undefined) {
          ;(camera as THREE.PerspectiveCamera).fov = waypoint.fov
          ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
        }
      },
    })

    return () => { tweenRef.current?.kill() }
  }, [pathname, camera, setVelocity, setTransitioning])

  return null
}
