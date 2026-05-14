'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'

// NOTE: No #version directive — Three.js adds it automatically.
// Use gl_FragColor (not out vec4) for compatibility with Three.js WebGL context.

const VERT = /* glsl */`
  varying vec3 v_worldPos;
  varying vec3 v_normal;
  varying vec2 v_uv;
  uniform float u_disruption;
  varying float v_disruption;

  void main() {
    vec4 wp     = modelMatrix * vec4(position, 1.0);
    v_worldPos   = wp.xyz;
    v_normal     = normalize(normalMatrix * normal);
    v_uv         = uv;
    v_disruption = u_disruption;
    gl_Position  = projectionMatrix * viewMatrix * wp;
  }
`

const FRAG = /* glsl */`
  precision highp float;

  varying vec3  v_worldPos;
  varying vec3  v_normal;
  varying vec2  v_uv;
  varying float v_disruption;

  uniform float u_time;
  uniform vec2  u_cursorField;
  uniform vec3  u_cameraPos;
  uniform vec3  u_emissionColor;
  uniform float u_emissionIntensity;
  uniform float u_bloomWarmup;

  // ── Hash / noise ─────────────────────────────────────────────
  vec3 hash33(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    return fract(sin(p)*43758.5453123)*2.0-1.0;
  }

  float gnoise(vec3 p) {
    vec3 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
    return mix(
      mix(mix(dot(hash33(i+vec3(0,0,0)),f-vec3(0,0,0)),
              dot(hash33(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
          mix(dot(hash33(i+vec3(0,1,0)),f-vec3(0,1,0)),
              dot(hash33(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
      mix(mix(dot(hash33(i+vec3(0,0,1)),f-vec3(0,0,1)),
              dot(hash33(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
          mix(dot(hash33(i+vec3(0,1,1)),f-vec3(0,1,1)),
              dot(hash33(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),
      u.z);
  }

  float fbm(vec3 p) {
    float v=0.0, a=0.5;
    mat3 rot=mat3(0.0,0.80,0.60,-0.80,0.36,-0.48,-0.60,-0.48,0.64);
    for(int i=0;i<5;++i){ v+=a*gnoise(p); p=rot*p*2.02; a*=0.5; }
    return v;
  }

  // ── SDF ──────────────────────────────────────────────────────
  float sdArkhe(vec3 p) {
    float baseR = 0.425;
    float breath= 0.018*sin(u_time*0.6);
    vec3  cw    = vec3(u_cursorField,0.0)*0.14;
    float d     = fbm(p*2.4+u_time*0.08+cw)*0.06;
          d    += fbm(p*7.1+u_time*0.12)*0.018;
          d    += v_disruption*fbm(p*18.0+u_time*1.4)*0.09;
    return length(p)-(baseR+breath+d);
  }

  vec3 calcNormal(vec3 p) {
    float h=0.0008;
    vec2 k=vec2(1.0,-1.0);
    return normalize(
      k.xyy*sdArkhe(p+k.xyy*h)+
      k.yyx*sdArkhe(p+k.yyx*h)+
      k.yxy*sdArkhe(p+k.yxy*h)+
      k.xxx*sdArkhe(p+k.xxx*h));
  }

  float fresnel(float c,float F0){ return F0+(1.0-F0)*pow(1.0-c,5.0); }

  vec3 aces(vec3 x){ return(x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14); }

  void main() {
    // Raymarch from camera position through rasterised world-space hit
    vec3 ro = u_cameraPos;
    vec3 rd = normalize(v_worldPos - ro);
    float t=0.0, d=0.0;
    vec3 p;
    for(int i=0;i<64;++i) {
      p=ro+rd*t; d=sdArkhe(p);
      if(d<0.0008||t>6.0) break;
      t+=d*0.92;
    }
    if(t>6.0) discard;

    vec3 n  = calcNormal(p);
    vec3 vd = normalize(u_cameraPos-p);

    // Surface colour — cold bronze to hot amber
    float interior = smoothstep(-0.4,0.6,fbm(p*5.0+u_time*0.05));
    vec3 cold = vec3(0.42,0.27,0.15);
    vec3 hot  = u_emissionColor*2.2;
    vec3 surf = mix(cold,hot,interior);

    // Fresnel rim
    float NdV   = max(dot(n,vd),0.0);
    float rim   = fresnel(NdV,0.04);
    float warmup= u_bloomWarmup*u_emissionIntensity;
    vec3 em     = u_emissionColor*rim*warmup*(1.2+v_disruption*3.0);

    // Subsurface bleed at thin SDF regions
    float thin = 1.0-smoothstep(0.0,0.08,abs(d));
    em += u_emissionColor*thin*0.45*warmup;

    vec3 color = aces(surf+em);
    gl_FragColor = vec4(color, 1.0);
  }
`

interface ArkheCoreProps {
  disruption?: number
}

export function ArkheCore({ disruption = 0 }: ArkheCoreProps) {
  const meshRef     = useRef<THREE.Mesh>(null)
  const matRef      = useRef<THREE.ShaderMaterial>(null)
  const { camera }  = useThree()
  const bloomWarmup = useRef(0)
  const disruptSmooth = useRef(0)

  useFrame((state, delta) => {
    if (!matRef.current) return
    const mat = matRef.current

    bloomWarmup.current    = Math.min(1, bloomWarmup.current + delta / 0.9)
    disruptSmooth.current += (disruption - disruptSmooth.current) * Math.min(1, delta * 4)

    const [cx, cy] = useInteractionStore.getState().cursorNDC

    mat.uniforms.u_time.value             = state.clock.elapsedTime
    mat.uniforms.u_cursorField.value.set(cx, cy)
    mat.uniforms.u_cameraPos.value.copy(camera.position)
    mat.uniforms.u_disruption.value       = disruptSmooth.current
    mat.uniforms.u_bloomWarmup.value      = bloomWarmup.current
  })

  const uniforms = useRef({
    u_time:              { value: 0 },
    u_cursorField:       { value: new THREE.Vector2(0, 0) },
    u_cameraPos:         { value: new THREE.Vector3(0, 0, 5) },
    u_emissionColor:     { value: new THREE.Color(0xe5a93c) },
    u_emissionIntensity: { value: 2.5 },
    u_disruption:        { value: 0 },
    u_bloomWarmup:       { value: 0 },
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.6, 96, 96]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms.current}
        side={THREE.FrontSide}
        transparent={false}
      />
    </mesh>
  )
}
