'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Glass } from '@/components/ui/Glass'

// ── Curl noise experiment ──────────────────────────────────────────────────
const CURL_VERT = /* glsl */`
  attribute float a_phase;
  attribute float a_speed;
  uniform float u_time;
  varying float v_life;

  float hash(float n){ return fract(sin(n)*43758.5453); }
  vec3 curlField(vec3 p, float t){
    float e=0.01;
    float nx0=hash(p.x*7.1+p.y*3.3+p.z*2.7+t);
    float nx1=hash(p.x*7.1+p.y*3.3+p.z*2.7+t+e);
    float ny0=hash(p.y*5.9+p.z*4.1+p.x*8.3+t);
    float ny1=hash(p.y*5.9+p.z*4.1+p.x*8.3+t+e);
    float nz0=hash(p.z*6.7+p.x*2.9+p.y*5.1+t);
    float nz1=hash(p.z*6.7+p.x*2.9+p.y*5.1+t+e);
    return normalize(vec3(ny1-ny0,nz1-nz0,nx1-nx0)/(2.0*e));
  }
  void main(){
    float life=fract(u_time*a_speed*0.12+a_phase);
    vec3 pos=position;
    pos+=curlField(position,u_time*0.2)*life*1.8;
    pos+=curlField(pos,u_time*0.1+3.0)*life*0.4;
    v_life=smoothstep(0.0,0.2,life)*smoothstep(1.0,0.7,life);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
    gl_PointSize=mix(1.0,4.0,v_life);
  }
`
const CURL_FRAG = /* glsl */`
  precision mediump float;
  varying float v_life;
  void main(){
    vec2 uv=gl_PointCoord-0.5;
    if(dot(uv,uv)>0.25) discard;
    gl_FragColor=vec4(0.9,0.67,0.24,v_life*0.8);
  }
`

function CurlExperiment() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const N = 4000
  const { geo, uniforms } = useMemo(() => {
    const pos    = new Float32Array(N * 3)
    const phases = new Float32Array(N)
    const speeds = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const r = Math.cbrt(Math.random()) * 2
      const th= Math.acos(2*Math.random()-1)
      const ph= Math.random()*Math.PI*2
      pos[i*3]   = r*Math.sin(th)*Math.cos(ph)
      pos[i*3+1] = r*Math.sin(th)*Math.sin(ph)
      pos[i*3+2] = r*Math.cos(th)
      phases[i]  = Math.random()
      speeds[i]  = 0.5 + Math.random()*0.5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos,    3))
    geo.setAttribute('a_phase',  new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('a_speed',  new THREE.BufferAttribute(speeds, 1))
    return { geo, uniforms: { u_time: { value: 0 } } }
  }, [])
  useFrame(s => { if (matRef.current) matRef.current.uniforms.u_time.value = s.clock.elapsedTime })
  return (
    <points geometry={geo}>
      <shaderMaterial ref={matRef} vertexShader={CURL_VERT} fragmentShader={CURL_FRAG} uniforms={uniforms} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

// ── Reaction-Diffusion visual ──────────────────────────────────────────────
const RD_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
const RD_FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
  void main(){
    vec2 uv=vUv;
    float t=u_time*0.3;
    float n=0.0;
    for(int i=0;i<6;i++){
      float s=pow(2.0,float(i));
      n+=hash(uv*s+t*0.1+float(i)*1.7)/s;
    }
    float rx=hash(uv*14.0+vec2(t*0.4,0.0));
    float ry=hash(uv*9.0+vec2(0.0,t*0.3));
    float rd=smoothstep(0.45,0.55,rx)*smoothstep(0.45,0.55,ry);
    vec3 cold=vec3(0.1,0.08,0.04);
    vec3 hot=vec3(0.9,0.55,0.1);
    vec3 col=mix(cold,hot,rd*n*2.0);
    gl_FragColor=vec4(col,1.0);
  }
`

function RDExperiment() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  useFrame(s => { if (matRef.current) matRef.current.uniforms.u_time.value = s.clock.elapsedTime })
  return (
    <mesh>
      <planeGeometry args={[4, 4, 1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={RD_VERT} fragmentShader={RD_FRAG} uniforms={{ u_time: { value: 0 } }} />
    </mesh>
  )
}

const EXPERIMENTS = [
  { id: 'curl',   label: 'Curl Noise Fluid',     component: <CurlExperiment /> },
  { id: 'rd',     label: 'Reaction Diffusion',    component: <RDExperiment />   },
]

export default function LabPage() {
  const [active, setActive] = useState(0)

  return (
    <main style={{ minHeight: '100vh', padding: '6rem 2rem 2rem', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.25rem' }}>Generative Research</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>Lab</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', flex: 1, pointerEvents: 'auto', minHeight: '65vh' }}>
        {/* Canvas */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(229,169,60,0.1)', background: '#090909' }}>
          <Canvas camera={{ position: [0, 0, 4], fov: 60 }} gl={{ antialias: false, alpha: false }}>
            <ambientLight intensity={0.3} />
            {EXPERIMENTS[active].component}
          </Canvas>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Glass padding="1rem">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Experiments</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {EXPERIMENTS.map((exp, i) => (
                <button
                  key={exp.id}
                  id={`lab-exp-${exp.id}`}
                  onClick={() => setActive(i)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: '0.05em',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${active === i ? 'var(--accent)' : 'transparent'}`,
                    background: active === i ? 'rgba(229,169,60,0.08)' : 'transparent',
                    color: active === i ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}. {exp.label}
                </button>
              ))}
            </div>
          </Glass>

          <Glass padding="1rem">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Active</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600 }}>{EXPERIMENTS[active].label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6, opacity: 0.7 }}>
              Real-time GLSL experiment running at native framerate.
            </p>
          </Glass>
        </div>
      </div>
    </main>
  )
}
