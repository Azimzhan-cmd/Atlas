'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneTunnel } from '@/lib/canvas/GlobalCanvas'

// ── One floating card plane ────────────────────────────────────────────────
const CARD_VERT = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const CARD_FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;

  uniform float u_time;
  uniform vec3  u_color;
  uniform float u_active;
  uniform float u_index;

  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
  }

  void main(){
    vec2 uv = vUv;

    // Glass panel base
    vec3 glass   = mix(vec3(0.12,0.10,0.08), vec3(0.16,0.14,0.12), uv.y);
    float scan   = smoothstep(0.0, 0.003, abs(fract(uv.y * 40.0 + u_time * 0.3) - 0.5));
    glass       -= scan * 0.04;

    // Border glow
    float edgeX  = min(uv.x, 1.0-uv.x);
    float edgeY  = min(uv.y, 1.0-uv.y);
    float border = 1.0 - smoothstep(0.0, 0.04, min(edgeX, edgeY));
    float bGlow  = border * (0.4 + u_active * 0.6);

    // Noise texture
    float n      = noise(uv * 8.0 + u_time * 0.05) * 0.06;

    vec3 col     = glass + n
                 + u_color * bGlow
                 + u_color * u_active * 0.08;

    // Alpha: opaque inside, fade at border
    float alpha  = 0.72 + border * 0.28 + u_active * 0.1;

    // Fresnel-like edge darkening
    alpha *= smoothstep(0.0, 0.02, min(edgeX, edgeY));

    gl_FragColor  = vec4(col, alpha * 0.85);
  }
`

interface WorkCard {
  position: THREE.Vector3
  rotation: THREE.Euler
  color: THREE.Color
  index: number
}

function FloatingCard({
  card,
  active,
}: {
  card: WorkCard
  active: boolean
}) {
  const matRef  = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const targetY = useRef(card.position.y)

  const uniforms = useMemo(() => ({
    u_time:   { value: 0 },
    u_color:  { value: card.color },
    u_active: { value: 0 },
    u_index:  { value: card.index },
  }), [card.color, card.index])

  useFrame((state) => {
    if (!matRef.current || !meshRef.current) return
    const t = state.clock.elapsedTime

    matRef.current.uniforms.u_time.value   = t
    matRef.current.uniforms.u_active.value +=
      ((active ? 1 : 0) - matRef.current.uniforms.u_active.value) * 0.08

    // Gentle idle float
    meshRef.current.position.y = card.position.y + Math.sin(t * 0.4 + card.index * 1.2) * 0.12
    meshRef.current.rotation.y = card.rotation.y + Math.sin(t * 0.25 + card.index * 0.8) * 0.04
    meshRef.current.rotation.x = card.rotation.x + Math.sin(t * 0.3  + card.index * 1.5) * 0.02
  })

  return (
    <mesh
      ref={meshRef}
      position={card.position}
      rotation={card.rotation}
    >
      <planeGeometry args={[2.4, 1.5, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CARD_VERT}
        fragmentShader={CARD_FRAG}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Constellation background lines ─────────────────────────────────────────
function ConstellationLines() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const { geo, uniforms } = useMemo(() => {
    const N   = 60
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const r  = 2 + Math.random() * 10
      const th = Math.acos(2 * Math.random() - 1)
      const ph = Math.random() * Math.PI * 2
      pos[i*3]   = r * Math.sin(th) * Math.cos(ph)
      pos[i*3+1] = r * Math.sin(th) * Math.sin(ph)
      pos[i*3+2] = r * Math.cos(th)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo, uniforms: { u_time: { value: 0 } } }
  }, [])

  useFrame(s => { if (matRef.current) matRef.current.uniforms.u_time.value = s.clock.elapsedTime })

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={`uniform float u_time; void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_PointSize=1.5+sin(u_time*0.8+position.x)*0.5; }`}
        fragmentShader={`void main(){ vec2 uv=gl_PointCoord-0.5; if(dot(uv,uv)>0.25) discard; gl_FragColor=vec4(0.9,0.67,0.24,0.3); }`}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Card layout ────────────────────────────────────────────────────────────
const PROJECT_COLORS = [
  '#E5A93C', '#F2F2F7', '#CD7F32',
  '#7A8290', '#CD7F32', '#E5A93C',
]

function buildCards(): WorkCard[] {
  return Array.from({ length: 6 }, (_, i) => {
    const col = Math.floor(i / 2)        // 0, 0, 1, 1, 2, 2
    const row = i % 2                    // 0, 1, 0, 1, 0, 1
    return {
      position: new THREE.Vector3(
        (col - 1) * 3.4,
        (row - 0.5) * 2.2,
        -2 + Math.sin(i * 1.4) * 1.2
      ),
      rotation: new THREE.Euler(
        -0.08 + Math.sin(i * 0.9) * 0.06,
        (col - 1) * 0.12,
        Math.sin(i * 1.7) * 0.04
      ),
      color: new THREE.Color(PROJECT_COLORS[i]),
      index: i,
    }
  })
}

export function WorkScene() {
  const cards = useMemo(() => buildCards(), [])

  return (
    <SceneTunnel.In>
      <fog attach="fog" args={['#090909', 16, 40]} />
      <ambientLight color="#1C1C1E" intensity={0.5} />
      <pointLight position={[0, 4, 3]}   color="#E5A93C" intensity={3}   distance={30} />
      <pointLight position={[-4, -2, 2]} color="#CD7F32" intensity={1.5} distance={20} />
      <pointLight position={[4, -2, 2]}  color="#3A3A8A" intensity={1}   distance={20} />

      <ConstellationLines />

      {cards.map((card) => (
        <FloatingCard
          key={card.index}
          card={card}
          active={false}
        />
      ))}
    </SceneTunnel.In>
  )
}
