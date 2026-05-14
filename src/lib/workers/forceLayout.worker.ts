/**
 * forceLayout.worker.ts
 *
 * Force-directed graph layout using Verlet integration.
 * Runs in a Web Worker — zero UI-thread cost.
 *
 * Messages IN  (main → worker):
 *   { type: 'INIT', nodes, edges, config }
 *   { type: 'TICK', dt }   ← optional manual tick
 *   { type: 'PIN',  id, position }
 *   { type: 'STOP' }
 *
 * Messages OUT (worker → main):
 *   { type: 'POSITIONS', positions: Record<id, [x,y,z]> }
 */

interface NodeState {
  id: string
  pos: [number, number, number]
  vel: [number, number, number]
  mass: number
  pinned: boolean
}

interface Edge {
  source: string
  target: string
}

interface Config {
  repulsion: number    // default 8
  springK:   number    // default 0.04
  restLen:   number    // default 3.2
  damping:   number    // default 0.92
  gravity:   number    // default 0.012  (pull toward origin)
}

const DEFAULT_CONFIG: Config = {
  repulsion: 8,
  springK:   0.04,
  restLen:   3.2,
  damping:   0.92,
  gravity:   0.012,
}

let nodes:  Map<string, NodeState> = new Map()
let edges:  Edge[]                 = []
let config: Config                 = DEFAULT_CONFIG
let rafId:  ReturnType<typeof setInterval> | null = null

function tick(dt: number) {
  const ns = Array.from(nodes.values())

  // 1. Repulsion (O(n²) — acceptable for n ≤ 200)
  for (let i = 0; i < ns.length; i++) {
    const a = ns[i]
    if (a.pinned) continue
    for (let j = i + 1; j < ns.length; j++) {
      const b   = ns[j]
      const dx  = a.pos[0] - b.pos[0]
      const dy  = a.pos[1] - b.pos[1]
      const dz  = a.pos[2] - b.pos[2]
      const d2  = dx*dx + dy*dy + dz*dz + 0.01
      const d   = Math.sqrt(d2)
      const f   = config.repulsion / d2
      const fx  = (dx / d) * f
      const fy  = (dy / d) * f
      const fz  = (dz / d) * f
      a.vel[0] += fx / a.mass * dt
      a.vel[1] += fy / a.mass * dt
      a.vel[2] += fz / a.mass * dt
      if (!b.pinned) {
        b.vel[0] -= fx / b.mass * dt
        b.vel[1] -= fy / b.mass * dt
        b.vel[2] -= fz / b.mass * dt
      }
    }
  }

  // 2. Spring attraction along edges
  for (const edge of edges) {
    const a = nodes.get(edge.source)
    const b = nodes.get(edge.target)
    if (!a || !b) continue
    const dx  = b.pos[0] - a.pos[0]
    const dy  = b.pos[1] - a.pos[1]
    const dz  = b.pos[2] - a.pos[2]
    const d   = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.001
    const stretch = d - config.restLen
    const f   = config.springK * stretch
    const fx  = (dx / d) * f
    const fy  = (dy / d) * f
    const fz  = (dz / d) * f
    if (!a.pinned) {
      a.vel[0] += fx / a.mass * dt
      a.vel[1] += fy / a.mass * dt
      a.vel[2] += fz / a.mass * dt
    }
    if (!b.pinned) {
      b.vel[0] -= fx / b.mass * dt
      b.vel[1] -= fy / b.mass * dt
      b.vel[2] -= fz / b.mass * dt
    }
  }

  // 3. Gravity toward origin
  for (const n of ns) {
    if (n.pinned) continue
    n.vel[0] -= n.pos[0] * config.gravity * dt
    n.vel[1] -= n.pos[1] * config.gravity * dt
    n.vel[2] -= n.pos[2] * config.gravity * dt
  }

  // 4. Verlet integration + damping
  for (const n of ns) {
    if (n.pinned) continue
    n.vel[0] *= config.damping
    n.vel[1] *= config.damping
    n.vel[2] *= config.damping
    n.pos[0] += n.vel[0] * dt
    n.pos[1] += n.vel[1] * dt
    n.pos[2] += n.vel[2] * dt
  }

  // 5. Emit positions
  const positions: Record<string, [number, number, number]> = {}
  for (const n of ns) {
    positions[n.id] = [...n.pos]
  }
  self.postMessage({ type: 'POSITIONS', positions })
}

self.addEventListener('message', (e: MessageEvent) => {
  const msg = e.data

  if (msg.type === 'INIT') {
    nodes = new Map()
    edges = msg.edges ?? []
    config = { ...DEFAULT_CONFIG, ...msg.config }

    for (const node of msg.nodes) {
      nodes.set(node.id, {
        id:     node.id,
        pos:    [...(node.position ?? [0, 0, 0])],
        vel:    [0, 0, 0],
        mass:   node.scale ?? 1,
        pinned: node.id === 'arkhevara-core',  // core is fixed
      })
    }

    // Simulate at 30fps
    if (rafId) clearInterval(rafId)
    rafId = setInterval(() => tick(1 / 30), 1000 / 30)
    return
  }

  if (msg.type === 'TICK') {
    tick(msg.dt ?? 1 / 30)
    return
  }

  if (msg.type === 'PIN') {
    const n = nodes.get(msg.id)
    if (n) {
      n.pinned   = true
      n.pos      = msg.position
    }
    return
  }

  if (msg.type === 'STOP') {
    if (rafId) clearInterval(rafId)
    rafId = null
  }
})
