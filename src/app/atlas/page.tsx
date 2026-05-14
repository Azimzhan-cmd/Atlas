'use client'

import { useState, useEffect } from 'react'
import { AtlasScene } from '@/lib/scenes/atlas/AtlasScene'
import { Glass } from '@/components/ui/Glass'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'

interface AtlasNode {
  id: string
  label: string
  category: string
  position: [number, number, number]
  scale: number
  connections: string[]
  metrics: { loc: number; region: string; uptime: number; deps: number }
}

const CATEGORY_LABELS: Record<string, string> = {
  web:  'Web Architecture',
  bots: 'Autonomous Bots',
  ai:   'AI / Compute',
  apps: 'Native Apps',
}

const CATEGORY_COLORS: Record<string, string> = {
  web:  '#F2F2F7',
  bots: '#CD7F32',
  ai:   '#E5A93C',
  apps: '#7A8290',
}

const FILTERS = [
  { id: 'all',  label: 'All Systems', color: '#F2F2F7' },
  { id: 'web',  label: 'Web Arch',    color: '#F2F2F7' },
  { id: 'bots', label: 'Bots',        color: '#CD7F32' },
  { id: 'ai',   label: 'AI/Compute',  color: '#E5A93C' },
  { id: 'apps', label: 'Native',      color: '#7A8290' },
]

export default function AtlasPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [nodes, setNodes] = useState<AtlasNode[]>([])

  useEffect(() => {
    fetch('/data/atlas.nodes.json')
      .then(r => r.json())
      .then((d: { nodes: AtlasNode[] }) => setNodes(d.nodes))
  }, [])

  const visible = activeFilter === 'all'
    ? nodes
    : nodes.filter(n => n.category === activeFilter)

  return (
    <>
      <AtlasScene />

      <main style={{ minHeight: '100vh', position: 'relative', zIndex: 10, pointerEvents: 'none' }}>

        {/* Title */}
        <div className="animate-fadeUp" style={{ position: 'absolute', top: '7rem', left: '2.5rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.4rem' }}>
            System Map
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Atlas
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', opacity: 0.5, marginTop: '0.4rem' }}>
            {visible.length} / {nodes.length} nodes visible
          </p>
        </div>

        {/* Category filter — top right */}
        <Glass
          className="animate-fadeUp"
          style={{
            position: 'absolute',
            top: '7rem',
            right: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            pointerEvents: 'auto',
            animationDelay: '200ms',
          }}
          padding="1rem"
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Filter
          </p>
          {FILTERS.map(({ id, label, color }) => (
            <button
              key={id}
              id={`atlas-filter-${id}`}
              onClick={() => setActiveFilter(id)}
              aria-pressed={activeFilter === id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: activeFilter === id ? 'rgba(229,169,60,0.08)' : 'transparent',
                border: `1px solid ${activeFilter === id ? 'var(--accent)' : 'transparent'}`,
                borderRadius: '4px', padding: '0.35rem 0.7rem', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: activeFilter === id ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 200ms ease',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </Glass>

        {/* Bottom-left status */}
        <Glass style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', pointerEvents: 'none' }} padding="0.65rem 1.1rem">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent)', opacity: 0.7, letterSpacing: '0.08em' }}>
            {nodes.length} NODES ◈ 4 CATEGORIES ◈ LIVE
          </p>
        </Glass>

        {/* Hover node info panel — bottom right */}
        <NodeInfoPanel nodes={nodes} />
      </main>
    </>
  )
}

// ── Hover panel with real metrics ──────────────────────────────────────────
function NodeInfoPanel({ nodes }: { nodes: AtlasNode[] }) {
  const activeNode = useInteractionStore((s) => s.activeNode)
  const node = nodes.find(n => n.id === activeNode)

  if (!node) return (
    <div style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', pointerEvents: 'none' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', opacity: 0.25, letterSpacing: '0.08em' }}>
        Hover a node to inspect
      </p>
    </div>
  )

  const color = CATEGORY_COLORS[node.category] ?? 'var(--accent)'

  return (
    <Glass
      style={{
        position: 'absolute',
        bottom: '2.5rem',
        right: '2.5rem',
        minWidth: '240px',
        maxWidth: '300px',
        pointerEvents: 'none',
        animation: 'fadeUp 180ms var(--ease-out) both',
        border: `1px solid ${color}30`,
      }}
      padding="1.25rem"
    >
      {/* Category tag */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color, opacity: 0.8, marginBottom: '0.35rem' }}>
        {CATEGORY_LABELS[node.category] ?? node.category}
      </p>

      {/* Node name */}
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
        {node.label}
      </p>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[
          { label: 'Lines of Code', value: `${(node.metrics.loc / 1000).toFixed(1)}k` },
          { label: 'Region',        value: node.metrics.region },
          { label: 'Uptime',        value: `${node.metrics.uptime}%` },
          { label: 'Dependencies',  value: String(node.metrics.deps) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '0.15rem' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color, fontWeight: 600 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Connections */}
      <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: `1px solid ${color}18` }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '0.3rem' }}>
          Connections
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
          {node.connections.length} edges
        </p>
      </div>
    </Glass>
  )
}
