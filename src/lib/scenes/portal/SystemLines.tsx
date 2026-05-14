'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PHI = (1 + Math.sqrt(5)) / 2
const LINE_COUNT   = 12
const SEGMENTS     = 64
const RIBBON_LEN   = 2.5

// No #version directive — Three.js handles it
const VERT = /* glsl */`
  attribute float a_t;
  attribute float a_index;
  attribute vec3  a_dir;
  attribute float a_pulseOffset;

  uniform float u_time;

  varying float v_alpha;
  varying vec3  v_color;

  void main() {
    float pulse = fract(u_time * 0.35 + a_pulseOffset);
    float dist  = abs(a_t - pulse);
    float glow  = exp(-dist * dist * 40.0);

    // Quadratic bezier along a_dir
    float t   = a_t;
    float mt  = 1.0 - t;
    vec3 p0   = vec3(0.0);
    vec3 p1   = a_dir * ${RIBBON_LEN} * 0.5;
    vec3 p2   = a_dir * ${RIBBON_LEN};
    vec3 pos  = mt*mt*p0 + 2.0*mt*t*p1 + t*t*p2;

    // Idle wave drift
    float wave = sin(u_time * 1.2 + a_index * 0.8 + t * 3.14159) * 0.05;
    pos += a_dir * wave * 0.3;

    v_alpha = mix(0.08, 0.85, glow) * (1.0 - t * 0.45);
    v_color = mix(vec3(0.42, 0.27, 0.15), vec3(0.9, 0.67, 0.24), glow);

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = mix(1.0, 3.5, glow);
  }
`

const FRAG = /* glsl */`
  precision mediump float;
  varying float v_alpha;
  varying vec3  v_color;

  void main() {
    gl_FragColor = vec4(v_color, v_alpha);
  }
`

function goldenDirs(n: number): THREE.Vector3[] {
  return Array.from({ length: n }, (_, i) => {
    const theta = Math.acos(1 - 2 * (i + 0.5) / n)
    const phi   = 2 * Math.PI * i / PHI
    return new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta)
    ).normalize()
  })
}

export function SystemLines() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const { geo, uniforms } = useMemo(() => {
    const dirs  = goldenDirs(LINE_COUNT)
    const N     = LINE_COUNT * SEGMENTS
    const pos   = new Float32Array(N * 3)   // placeholder positions
    const tArr  = new Float32Array(N)
    const idxArr= new Float32Array(N)
    const dirArr= new Float32Array(N * 3)
    const pulArr= new Float32Array(N)

    dirs.forEach((dir, l) => {
      for (let s = 0; s < SEGMENTS; s++) {
        const i = l * SEGMENTS + s
        tArr[i]            = s / (SEGMENTS - 1)
        idxArr[i]          = l
        dirArr[i * 3]      = dir.x
        dirArr[i * 3 + 1]  = dir.y
        dirArr[i * 3 + 2]  = dir.z
        pulArr[i]          = l / LINE_COUNT
      }
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position',      new THREE.BufferAttribute(pos,    3))
    geo.setAttribute('a_t',           new THREE.BufferAttribute(tArr,   1))
    geo.setAttribute('a_index',       new THREE.BufferAttribute(idxArr, 1))
    geo.setAttribute('a_dir',         new THREE.BufferAttribute(dirArr, 3))
    geo.setAttribute('a_pulseOffset', new THREE.BufferAttribute(pulArr, 1))

    return {
      geo,
      uniforms: { u_time: { value: 0 } },
    }
  }, [])

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
