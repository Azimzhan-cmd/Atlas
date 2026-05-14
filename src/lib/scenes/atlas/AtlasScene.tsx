'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
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

// ── Node instanced mesh ────────────────────────────────────────────────────
function NodeGraph({
  nodes,
  livePos,
  activeId,
  onHover,
}: {
  nodes: AtlasNode[]
  livePos: React.RefObject<Map<string, THREE.Vector3>>
  activeId: string | null
  onHover: (id: string | null) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  // Initialise colours once
  useEffect(() => {
    if (!meshRef.current) return
    nodes.forEach((node, i) => {
      meshRef.current!.setColorAt(i, new THREE.Color(CAT_COLOR[node.category] ?? 0xffffff))
    })
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [nodes])

  useFrame((state) => {
    if (!meshRef.current || !livePos.current) return
    const t = state.clock.elapsedTime
    nodes.forEach((node, i) => {
      const live = livePos.current!.get(node.id)
      const isActive = node.id === activeId

      if (live) {
        // Idle micro-drift on top of physics position
        dummy.position.set(
          live.x + Math.sin(t * 0.35 + i * 1.1) * 0.028,
          live.y + Math.cos(t * 0.28 + i * 0.9) * 0.028,
          live.z + Math.sin(t * 0.22 + i * 0.7) * 0.022,
        )
      } else {
        dummy.position.set(...node.position)
      }

      dummy.scale.setScalar(node.scale * 0.12 * (isActive ? 1.6 : 1))
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
        roughness={0.2}
        vertexColors
        envMapIntensity={0.5}
      />
    </instancedMesh>
  )
}

// ── Edge tubes ─────────────────────────────────────────────────────────────
function EdgeBundle({
  nodes,
  livePos,
}: {
  nodes: AtlasNode[]
  livePos: React.RefObject<Map<string, THREE.Vector3>>
}) {
  const groupRef = useRef<THREE.Group>(null)

  const edgePairs = useMemo(() => {
    const seen  = new Set<string>()
    const byId  = Object.fromEntries(nodes.map(n => [n.id, n]))
    return nodes.flatMap(node =>
      node.connections
        .filter(cid => {
          const key = [node.id, cid].sort().join('--')
          if (seen.has(key) || !byId[cid]) return false
          seen.add(key)
          return true
        })
        .map(cid => ({ aId: node.id, bId: cid }))
    )
  }, [nodes])

  // Update edge positions from live physics positions each frame
  useFrame(() => {
    if (!groupRef.current || !livePos.current) return
    groupRef.current.children.forEach((child, i) => {
      const pair = edgePairs[i]
      if (!pair) return
      const a = livePos.current!.get(pair.aId)
      const b = livePos.current!.get(pair.bId)
      if (!a || !b) return

      const dir = b.clone().sub(a)
      const len = dir.length()
      const mid = a.clone().add(dir.clone().multiplyScalar(0.5))

      child.position.copy(mid)
      child.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize()
      )
      child.scale.set(1, len, 1)
    })
  })

  return (
    <group ref={groupRef}>
      {edgePairs.map(({ aId, bId }) => (
        <mesh key={`${aId}--${bId}`}>
          <cylinderGeometry args={[0.007, 0.007, 1, 3]} />
          <meshBasicMaterial color={0xe5a93c} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  )
}

// ── Main scene ─────────────────────────────────────────────────────────────
export function AtlasScene() {
  const [data, setData]     = useState<AtlasData | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const setActiveNode       = useInteractionStore((s) => s.setActiveNode)
  const workerRef           = useRef<Worker | null>(null)
  const livePos             = useRef<Map<string, THREE.Vector3>>(new Map())

  useEffect(() => {
    fetch('/data/atlas.nodes.json')
      .then(r => r.json())
      .then((d: AtlasData) => {
        setData(d)

        // Seed live positions from JSON
        d.nodes.forEach(n => {
          livePos.current.set(n.id, new THREE.Vector3(...n.position))
        })

        // Launch force-layout Web Worker
        const worker = new Worker(
          new URL('@/lib/workers/forceLayout.worker.ts', import.meta.url),
          { type: 'module' }
        )
        workerRef.current = worker

        // Build edge list
        const seen  = new Set<string>()
        const edges: { source: string; target: string }[] = []
        d.nodes.forEach(n => {
          n.connections.forEach(cid => {
            const key = [n.id, cid].sort().join('--')
            if (!seen.has(key)) {
              seen.add(key)
              edges.push({ source: n.id, target: cid })
            }
          })
        })

        worker.postMessage({ type: 'INIT', nodes: d.nodes, edges })

        worker.onmessage = (e) => {
          if (e.data.type !== 'POSITIONS') return
          const pos: Record<string, [number, number, number]> = e.data.positions
          Object.entries(pos).forEach(([id, xyz]) => {
            const v = livePos.current.get(id)
            if (v) {
              v.set(xyz[0], xyz[1], xyz[2])
            } else {
              livePos.current.set(id, new THREE.Vector3(...xyz))
            }
          })
        }
      })

    return () => {
      workerRef.current?.postMessage({ type: 'STOP' })
      workerRef.current?.terminate()
    }
  }, [])

  const handleHover = useCallback((id: string | null) => {
    setActiveId(id)
    setActiveNode(id)
  }, [setActiveNode])

  return (
    <SceneTunnel.In>
      <fog attach="fog" args={['#090909', 20, 55]} />
      <ambientLight color="#1C1C1E" intensity={0.7} />
      <pointLight position={[0, 10, 0]}    color="#E5A93C" intensity={5}   distance={40} />
      <pointLight position={[-6, -6, 6]}   color="#3A3A8A" intensity={1.2} distance={25} />
      <pointLight position={[6, -6, -6]}   color="#CD7F32" intensity={0.9} distance={25} />

      {data && (
        <>
          <NodeGraph
            nodes={data.nodes}
            livePos={livePos}
            activeId={activeId}
            onHover={handleHover}
          />
          <EdgeBundle nodes={data.nodes} livePos={livePos} />
        </>
      )}
    </SceneTunnel.In>
  )
}
