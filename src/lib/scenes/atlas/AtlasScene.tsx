'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneTunnel } from '@/lib/canvas/GlobalCanvas'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'

interface AtlasNode {
  id: string
  label: string
  category: 'web' | 'bots' | 'ai' | 'apps'
  position: [number, number, number]
  scale: number
  connections: string[]
  metrics: { loc: number; region: string; uptime: number; deps: number }
}

interface AtlasData {
  nodes: AtlasNode[]
  categories: Record<string, { color: string; label: string }>
}

const CATEGORY_COLORS: Record<string, number> = {
  web:  0xf2f2f7,
  bots: 0xcd7f32,
  ai:   0xe5a93c,
  apps: 0x7a8290,
}

// ── Node mesh (instanced octahedra) ────────────────────────────────────────
function NodeGraph({ nodes, activeId, onHover }: {
  nodes: AtlasNode[]
  activeId: string | null
  onHover: (id: string | null) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    nodes.forEach((node, i) => {
      dummy.position.set(...node.position)
      dummy.scale.setScalar(node.scale * 0.12)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      meshRef.current!.setColorAt(
        i,
        new THREE.Color(CATEGORY_COLORS[node.category] ?? 0xffffff)
      )
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [nodes, dummy])

  useFrame((state) => {
    if (!meshRef.current) return
    nodes.forEach((node, i) => {
      const isActive = node.id === activeId
      const t = state.clock.elapsedTime
      // Idle drift
      dummy.position.set(
        node.position[0] + Math.sin(t * 0.4 + i) * 0.04,
        node.position[1] + Math.cos(t * 0.35 + i * 1.3) * 0.04,
        node.position[2] + Math.sin(t * 0.3 + i * 0.7) * 0.03
      )
      const targetScale = node.scale * 0.12 * (isActive ? 1.4 : 1.0)
      dummy.scale.setScalar(targetScale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(nodes[e.instanceId ?? 0]?.id ?? null)
      }}
      onPointerOut={() => onHover(null)}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        metalness={0.85}
        roughness={0.35}
        envMapIntensity={0.4}
        vertexColors
      />
    </instancedMesh>
  )
}

// ── Edge tubes ─────────────────────────────────────────────────────────────
function EdgeBundle({ nodes }: { nodes: AtlasNode[] }) {
  const lines = useMemo(() => {
    const pairs: { a: THREE.Vector3; b: THREE.Vector3 }[] = []
    const seen = new Set<string>()
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]))
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        const key = [node.id, connId].sort().join('--')
        if (seen.has(key) || !byId[connId]) return
        seen.add(key)
        pairs.push({
          a: new THREE.Vector3(...node.position),
          b: new THREE.Vector3(...byId[connId].position),
        })
      })
    })
    return pairs
  }, [nodes])

  return (
    <>
      {lines.map(({ a, b }, i) => {
        const dir = b.clone().sub(a)
        const mid = a.clone().add(dir.clone().multiplyScalar(0.5))
        const len = dir.length()
        const ax  = new THREE.Vector3(0, 1, 0)
        const q   = new THREE.Quaternion().setFromUnitVectors(
          ax,
          dir.normalize()
        )
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.008, 0.008, len, 4]} />
            <meshBasicMaterial
              color={0xe5a93c}
              transparent
              opacity={0.12}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ── Full Atlas scene ────────────────────────────────────────────────────────
export function AtlasScene() {
  const [data, setData] = useState<AtlasData | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const setActiveNode = useInteractionStore((s) => s.setActiveNode)

  useEffect(() => {
    fetch('/data/atlas.nodes.json')
      .then(r => r.json())
      .then(setData)
  }, [])

  const handleHover = (id: string | null) => {
    setActiveId(id)
    setActiveNode(id)
  }

  if (!data) return null

  return (
    <SceneTunnel.In>
      <fog attach="fog" args={['#090909', 20, 50]} />
      <ambientLight color="#1C1C1E" intensity={0.6} />
      <pointLight position={[0, 8, 0]} color="#E5A93C" intensity={3} distance={30} />
      <pointLight position={[0, -8, 0]} color="#3A3A8A" intensity={1} distance={20} />

      {data && (
        <>
          <NodeGraph
            nodes={data.nodes}
            activeId={activeId}
            onHover={handleHover}
          />
          <EdgeBundle nodes={data.nodes} />
        </>
      )}
    </SceneTunnel.In>
  )
}
