'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
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

const CAT_COLOR: Record<string, number> = {
  web:  0xf2f2f7,
  bots: 0xcd7f32,
  ai:   0xe5a93c,
  apps: 0x7a8290,
}

// ── Instanced node graph ───────────────────────────────────────────────────
function NodeGraph({ nodes, activeId, onHover }: {
  nodes: AtlasNode[]
  activeId: string | null
  onHover: (id: string | null) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const basePos = useMemo(() => nodes.map(n => new THREE.Vector3(...n.position)), [nodes])

  useEffect(() => {
    if (!meshRef.current) return
    nodes.forEach((node, i) => {
      dummy.position.copy(basePos[i])
      dummy.scale.setScalar(node.scale * 0.12)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      meshRef.current!.setColorAt(i, new THREE.Color(CAT_COLOR[node.category] ?? 0xffffff))
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [nodes, dummy, basePos])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    nodes.forEach((node, i) => {
      const active = node.id === activeId
      dummy.position.set(
        basePos[i].x + Math.sin(t * 0.4 + i * 1.1) * 0.035,
        basePos[i].y + Math.cos(t * 0.35 + i * 0.9) * 0.035,
        basePos[i].z + Math.sin(t * 0.28 + i * 0.7) * 0.025,
      )
      const s = node.scale * 0.12 * (active ? 1.5 : 1)
      dummy.scale.setScalar(s)
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
        metalness={0.9}
        roughness={0.25}
        vertexColors
      />
    </instancedMesh>
  )
}

// ── Edge bundle (cylinder tubes) ───────────────────────────────────────────
function EdgeBundle({ nodes }: { nodes: AtlasNode[] }) {
  const edges = useMemo(() => {
    const seen  = new Set<string>()
    const byId  = Object.fromEntries(nodes.map(n => [n.id, n]))
    const pairs: { a: THREE.Vector3; b: THREE.Vector3 }[] = []
    nodes.forEach(node => {
      node.connections.forEach(cid => {
        const key = [node.id, cid].sort().join('--')
        if (seen.has(key) || !byId[cid]) return
        seen.add(key)
        pairs.push({
          a: new THREE.Vector3(...node.position),
          b: new THREE.Vector3(...byId[cid].position),
        })
      })
    })
    return pairs
  }, [nodes])

  return (
    <>
      {edges.map(({ a, b }, i) => {
        const dir = b.clone().sub(a)
        const len = dir.length()
        const mid = a.clone().add(dir.clone().multiplyScalar(0.5))
        const q   = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        )
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.007, 0.007, len, 3]} />
            <meshBasicMaterial color={0xe5a93c} transparent opacity={0.10} />
          </mesh>
        )
      })}
    </>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────
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

  return (
    <SceneTunnel.In>
      <fog attach="fog" args={['#090909', 18, 45]} />
      <ambientLight color="#1C1C1E" intensity={0.7} />
      <pointLight position={[0, 10, 0]} color="#E5A93C" intensity={4} distance={35} />
      <pointLight position={[-5, -5, 5]} color="#3A3A8A" intensity={1} distance={20} />
      <pointLight position={[5, -5, -5]} color="#CD7F32" intensity={0.8} distance={20} />

      {data && (
        <>
          <NodeGraph nodes={data.nodes} activeId={activeId} onHover={handleHover} />
          <EdgeBundle nodes={data.nodes} />
        </>
      )}
    </SceneTunnel.In>
  )
}
