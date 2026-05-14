'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneTunnel } from '@/lib/canvas/GlobalCanvas'

// ── Hexagonal grid shader ─────────────────────────────────────────────────
const GRID_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const GRID_FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;

  vec2 hexCoord(vec2 p) {
    vec2 q = vec2(p.x * 2.0/3.0, (-p.x/3.0 + sqrt(3.0)/3.0 * p.y));
    return floor(q + 0.5);
  }

  float hexDist(vec2 p) {
    p = abs(p);
    return max(dot(p, normalize(vec2(1.0, 1.73))), p.x);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 16.0;
    uv.y *= 0.6;

    // Hex grid
    vec2 hc = hexCoord(uv);
    vec2 center = vec2(hc.x * 1.5, hc.y * 1.73 + hc.x * 0.866);
    float dist = hexDist(uv - center);

    float cell = 1.0 - smoothstep(0.85, 0.9, dist);
    float edge = smoothstep(0.80, 0.86, dist) * (1.0 - smoothstep(0.86, 0.92, dist));

    // Pulse wave from center
    float r    = length(hc) * 0.4;
    float wave = sin(r - u_time * 1.4) * 0.5 + 0.5;
    wave       = pow(wave, 3.0) * smoothstep(8.0, 0.0, r);

    // Vignette
    float vig = 1.0 - smoothstep(0.3, 1.0, length(vUv - 0.5));

    vec3 edgeCol = mix(vec3(0.12, 0.09, 0.05), vec3(0.9, 0.67, 0.24), wave + edge * 0.3);
    float alpha  = (edge * 0.6 + wave * 0.2) * vig;

    gl_FragColor = vec4(edgeCol, alpha * 0.55);
  }
`

// ── Floating data packets ─────────────────────────────────────────────────
const PACKET_VERT = /* glsl */`
  attribute float a_phase;
  attribute float a_lane;
  uniform float u_time;
  varying float v_life;

  void main() {
    float life = fract(a_phase + u_time * 0.18);
    v_life = sin(life * 3.14159);

    // Lanes: horizontal streams
    float x = mix(-8.0, 8.0, life);
    float y = (a_lane - 2.0) * 1.2;
    float z = -1.0 + sin(life * 6.28 + a_lane) * 0.3;

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = v_life * 3.0 + 0.5;
  }
`

const PACKET_FRAG = /* glsl */`
  precision mediump float;
  varying float v_life;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if (dot(uv,uv) > 0.25) discard;
    gl_FragColor = vec4(0.9, 0.67, 0.24, v_life * 0.9);
  }
`

function HexGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  useFrame(s => { if (matRef.current) matRef.current.uniforms.u_time.value = s.clock.elapsedTime })
  return (
    <mesh position={[0, 0, -3]} rotation={[-0.2, 0, 0]}>
      <planeGeometry args={[28, 18, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        uniforms={{ u_time: { value: 0 } }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function DataPackets() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { geo, uniforms } = useMemo(() => {
    const N     = 200
    const phase = new Float32Array(N)
    const lane  = new Float32Array(N)
    const pos   = new Float32Array(N * 3) // dummy positions
    for (let i = 0; i < N; i++) {
      phase[i] = Math.random()
      lane[i]  = Math.floor(Math.random() * 5)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos,   3))
    geo.setAttribute('a_phase',  new THREE.BufferAttribute(phase, 1))
    geo.setAttribute('a_lane',   new THREE.BufferAttribute(lane,  1))
    return { geo, uniforms: { u_time: { value: 0 } } }
  }, [])

  useFrame(s => { if (matRef.current) matRef.current.uniforms.u_time.value = s.clock.elapsedTime })

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={PACKET_VERT}
        fragmentShader={PACKET_FRAG}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function SystemsScene() {
  return (
    <SceneTunnel.In>
      <fog attach="fog" args={['#090909', 12, 35]} />
      <ambientLight color="#1C1C1E" intensity={0.4} />
      <pointLight position={[0, 0, 2]} color="#E5A93C" intensity={2} distance={20} />
      <pointLight position={[-5, 3, 0]} color="#3A3A8A" intensity={1} distance={15} />

      <HexGrid />
      <DataPackets />
    </SceneTunnel.In>
  )
}
