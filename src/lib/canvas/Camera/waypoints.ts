import * as THREE from 'three'

export type RouteId = '/' | '/atlas' | '/work' | '/systems' | '/lab' | '/craft' | '/brief'

export interface CameraWaypoint {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
  duration: number          // ms
  easing: 'cubicOut' | 'expoOut' | 'springCritical' | 'linear'
}

export const WAYPOINTS: Record<RouteId, CameraWaypoint> = {
  '/': {
    position: new THREE.Vector3(0, 0, 5),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 60,
    duration: 1200,
    easing: 'cubicOut',
  },
  '/atlas': {
    position: new THREE.Vector3(0, 2, 18),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 65,
    duration: 1800,
    easing: 'expoOut',
  },
  '/work': {
    position: new THREE.Vector3(0, 0, 12),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 55,
    duration: 1400,
    easing: 'cubicOut',
  },
  '/systems': {
    position: new THREE.Vector3(0, 0, 8),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 70,
    duration: 1000,
    easing: 'expoOut',
  },
  '/lab': {
    position: new THREE.Vector3(2, 1, 9),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 58,
    duration: 1200,
    easing: 'cubicOut',
  },
  '/craft': {
    position: new THREE.Vector3(-1, 0.5, 10),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 50,
    duration: 1500,
    easing: 'springCritical',
  },
  '/brief': {
    position: new THREE.Vector3(0, 1, 11),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 62,
    duration: 900,
    easing: 'expoOut',
  },
}
