'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePerfStore } from '@/lib/state/stores/perfStore'

// ──────────────────────────────────────────────────────────────────────────
// Vertex shader — all simulation on GPU, zero CPU per frame
// Curl noise from divergence of noise gradient (Bridson 2007)
// ──────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute float a_life;
  attribute float a_speed;
  attribute vec3  a_seed;

  uniform float u_time;
  uniform float u_spread;

  varying float v_alpha;
  varying float v_warm;

  // Value noise in 3D
  vec3 hash3(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(vec3(p.x*p.y, p.y*p.z, p.z*p.x) * 46.1234);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f*f*(3.0 - 2.0*f);

    return mix(mix(mix(dot(hash3(i+vec3(0,0,0))*2.0-1.0, f-vec3(0,0,0)),
                       dot(hash3(i+vec3(1,0,0))*2.0-1.0, f-vec3(1,0,0)), u.x),
                   mix(dot(hash3(i+vec3(0,1,0))*2.0-1.0, f-vec3(0,1,0)),
                       dot(hash3(i+vec3(1,1,0))*2.0-1.0, f-vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1))*2.0-1.0, f-vec3(0,0,1)),
                       dot(hash3(i+vec3(1,0,1))*2.0-1.0, f-vec3(1,0,1)), u.x),
                   mix(dot(hash3(i+vec3(0,1,1))*2.0-1.0, f-vec3(0,1,1)),
                       dot(hash3(i+vec3(1,1,1))*2.0-1.0, f-vec3(1,1,1)), u.x), u.y));
  }

  // Curl noise — divergence-free velocity field
  vec3 curl(vec3 p) {
    float e = 0.03;
    float  n1, n2;
    vec3 curl;

    n1 = vnoise(p + vec3(0,  e, 0));
    n2 = vnoise(p - vec3(0,  e, 0));
    curl.x = (n1 - n2) / (2.0 * e);

    n1 = vnoise(p + vec3(0, 0,  e));
    n2 = vnoise(p - vec3(0, 0,  e));
    curl.y = (n1 - n2) / (2.0 * e);

    n1 = vnoise(p + vec3( e, 0, 0));
    n2 = vnoise(p - vec3( e, 0, 0));
    curl.z = (n1 - n2) / (2.0 * e);

    return curl;
  }

  void main() {
    // Each particle has a unique life phase [0..1]
    float life = fract(a_life + u_time * a_speed * 0.04);

    // Spawn from seed position, advect along curl field
    float t = life * 3.14159;  // parameter along trajectory
    vec3 pos = a_seed * u_spread;

    // Multi-octave curl advection
    pos += curl(pos * 0.4 + u_time * 0.06)        * 1.8 * life;
    pos += curl(pos * 0.9 + u_time * 0.09 + 3.7)  * 0.6 * life;
    pos += curl(pos * 2.2 + u_time * 0.14 + 7.3)  * 0.18 * life;

    // Fade in/out along life
    float fade = sin(life * 3.14159);
    v_alpha  = fade * 0.45;

    // Warmer near center
    v_warm = 1.0 - smoothstep(0.0, 2.5, length(pos));

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = mix(0.8, 2.4, fade * v_warm);
  }
`

const FRAG = /* glsl */`
  precision mediump float;
  varying float v_alpha;
  varying float v_warm;

  void main() {
    // Circular billboard
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;

    // Bronze → amber gradient by warmth
    vec3 cold = vec3(0.35, 0.22, 0.10);
    vec3 hot  = vec3(0.90, 0.67, 0.24);
    vec3 col  = mix(cold, hot, v_warm);

    float alpha = (1.0 - d * 4.0) * v_alpha;
    gl_FragColor = vec4(col, alpha);
  }
`

// Particle counts per quality tier
const TIER_COUNT: Record<string, number> = {
  S: 524288,
  A: 262144,
  B: 131072,
  C: 65536,
  D: 16384,
}

export function CurlNoiseField() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const tier   = usePerfStore((s) => s.tier)
  const N      = TIER_COUNT[tier] ?? 131072

  const { geo, uniforms } = useMemo(() => {
    // Pre-bake random seeds — positions are driven entirely by shader
    const life  = new Float32Array(N)
    const speed = new Float32Array(N)
    const seed  = new Float32Array(N * 3)

    for (let i = 0; i < N; i++) {
      // Uniform sphere distribution for seeds
      const u  = Math.random()
      const v  = Math.random()
      const th = Math.acos(2 * u - 1)
      const ph = 2 * Math.PI * v
      const r  = Math.cbrt(Math.random())  // volume-uniform radius
      seed[i * 3]     = r * Math.sin(th) * Math.cos(ph)
      seed[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph)
      seed[i * 3 + 2] = r * Math.cos(th)

      life[i]  = Math.random()
      speed[i] = 0.4 + Math.random() * 0.6
    }

    // Position attribute is unused (shader computes position from seed)
    // but BufferGeometry needs at least one vec3 attribute named 'position'
    const pos = new Float32Array(N * 3)  // all zeros

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos,   3))
    geo.setAttribute('a_life',   new THREE.BufferAttribute(life,  1))
    geo.setAttribute('a_speed',  new THREE.BufferAttribute(speed, 1))
    geo.setAttribute('a_seed',   new THREE.BufferAttribute(seed,  3))

    return {
      geo,
      uniforms: {
        u_time:   { value: 0 },
        u_spread: { value: 4.8 },
      },
    }
  }, [N])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = state.clock.elapsedTime
    }
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
        depthTest={false}
      />
    </points>
  )
}
