'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePerfStore } from '@/lib/state/stores/perfStore'

const VERT = /* glsl */`
  attribute float a_speed;
  attribute float a_size;
  attribute float a_phase;

  uniform float u_time;
  varying float v_alpha;

  void main() {
    vec3 pos = position;
    pos.x += sin(u_time * a_speed + a_phase) * 0.12;
    pos.y += cos(u_time * a_speed * 0.7 + a_phase * 1.3) * 0.08;
    pos.z += sin(u_time * a_speed * 0.5 + a_phase * 0.9) * 0.10;

    float dist = length(pos);
    v_alpha = smoothstep(4.5, 0.5, dist) * 0.35;

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = a_size;
  }
`

const FRAG = /* glsl */`
  precision mediump float;
  varying float v_alpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float alpha = (1.0 - d * 4.0) * v_alpha;
    gl_FragColor = vec4(0.9, 0.67, 0.24, alpha);
  }
`

export function AmbientParticles() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const count  = usePerfStore((s) => s.particleCount)
  const N      = Math.min(count, 6000)

  const { geo, uniforms } = useMemo(() => {
    const positions = new Float32Array(N * 3)
    const speeds    = new Float32Array(N)
    const sizes     = new Float32Array(N)
    const phases    = new Float32Array(N)

    for (let i = 0; i < N; i++) {
      const r  = Math.cbrt(Math.random()) * 4.5
      const th = Math.acos(2 * Math.random() - 1)
      const ph = Math.random() * Math.PI * 2
      positions[i * 3]     = r * Math.sin(th) * Math.cos(ph)
      positions[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph)
      positions[i * 3 + 2] = r * Math.cos(th)
      speeds[i]  = 0.2 + Math.random() * 0.4
      sizes[i]   = 1 + Math.random() * 2
      phases[i]  = Math.random() * Math.PI * 2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('a_speed',  new THREE.BufferAttribute(speeds,    1))
    geo.setAttribute('a_size',   new THREE.BufferAttribute(sizes,     1))
    geo.setAttribute('a_phase',  new THREE.BufferAttribute(phases,    1))

    return { geo, uniforms: { u_time: { value: 0 } } }
  }, [N])

  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.u_time.value = s.clock.elapsedTime
  })

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
