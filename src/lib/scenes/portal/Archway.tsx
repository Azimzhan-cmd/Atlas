'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BRONZE_VERT = /* glsl */`
  varying vec3 v_worldPos;
  varying vec3 v_normal;

  void main() {
    vec4 wp    = modelMatrix * vec4(position, 1.0);
    v_worldPos = wp.xyz;
    v_normal   = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const BRONZE_FRAG = /* glsl */`
  precision highp float;
  varying vec3 v_worldPos;
  varying vec3 v_normal;
  uniform float u_time;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
  }
  float noise2(vec2 p) {
    vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
    return mix(mix(hash2(i),hash2(i+vec2(1,0)),u.x),
               mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),u.x),u.y);
  }
  float oxidation(vec3 p) {
    return clamp((noise2(p.xy*0.4)+noise2(p.yz*0.4)*0.7+noise2(p.xz*0.4)*0.5)/2.2,0.0,1.0);
  }
  vec3 aces(vec3 x){ return(x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14); }

  void main() {
    vec3 n  = normalize(v_normal);
    float ox = oxidation(v_worldPos);
    vec3 albedo = mix(vec3(0.804,0.498,0.196), vec3(0.22,0.35,0.28), ox*0.55);
    vec3 lightDir = normalize(vec3(0.5,1.0,0.5));
    float NdL     = max(dot(n,lightDir),0.0);
    vec3 viewDir  = normalize(cameraPosition - v_worldPos);
    float spec    = pow(max(dot(normalize(lightDir+viewDir),n),0.0), mix(32.0,8.0,ox));
    vec3 color    = albedo*(NdL*0.85+0.15)
                  + vec3(0.9,0.67,0.24)*spec*(1.0-ox*0.6)*0.4
                  + vec3(0.898,0.663,0.235)*0.08;
    gl_FragColor  = vec4(aces(color),1.0);
  }
`

// Creates a fresh ShaderMaterial instance — each mesh needs its own
function makeBronzeMat(uniforms: Record<string, THREE.IUniform>) {
  return new THREE.ShaderMaterial({
    vertexShader: BRONZE_VERT,
    fragmentShader: BRONZE_FRAG,
    uniforms,
  })
}

export function Archway() {
  const matsRef = useRef<THREE.ShaderMaterial[]>([])

  // Create 3 independent material instances (left/right pillar + beam)
  const materials = useMemo(() => {
    const list = Array.from({ length: 3 }, () =>
      makeBronzeMat({ u_time: { value: 0 } })
    )
    matsRef.current = list
    return list
  }, [])

  useFrame((s) => {
    matsRef.current.forEach(m => {
      m.uniforms.u_time.value = s.clock.elapsedTime
    })
  })

  return (
    <group position={[0, 0, -1.8]}>
      <mesh position={[-1.25, 0, 0]} material={materials[0]}>
        <boxGeometry args={[0.18, 4, 0.18]} />
      </mesh>
      <mesh position={[1.25, 0, 0]} material={materials[1]}>
        <boxGeometry args={[0.18, 4, 0.18]} />
      </mesh>
      <mesh position={[0, 2, 0]} material={materials[2]}>
        <boxGeometry args={[2.68, 0.18, 0.18]} />
      </mesh>
      <pointLight position={[0, 0, -0.5]} color="#E5A93C" intensity={1.8} distance={7} decay={2} />
    </group>
  )
}
