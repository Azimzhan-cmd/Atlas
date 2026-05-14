'use client'

import { useState } from 'react'
import { AtlasScene } from '@/lib/scenes/atlas/AtlasScene'
import { Glass } from '@/components/ui/Glass'
import { useInteractionStore } from '@/lib/state/stores/interactionStore'
import { useUnifiedPointer } from '@/lib/utils/input/unifiedPointer'

const CATEGORIES = [
  { id: 'all',  label: 'All Systems', color: '#F2F2F7' },
  { id: 'web',  label: 'Web Arch',    color: '#F2F2F7' },
  { id: 'bots', label: 'Bots',        color: '#CD7F32' },
  { id: 'ai',   label: 'AI/Compute',  color: '#E5A93C' },
  { id: 'apps', label: 'Native',      color: '#7A8290' },
]

export default function AtlasPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  useUnifiedPointer()

  return (
    <>
      <AtlasScene />

      <main style={{ minHeight: '100vh', position: 'relative', zIndex: 10, pointerEvents: 'none' }}>

        {/* Page title */}
        <div
          className="animate-fadeUp"
          style={{
            position: 'absolute',
            top: '7rem',
            left: '2.5rem',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            opacity: 0.7,
            marginBottom: '0.5rem',
          }}>
            System Map
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Atlas
          </h1>
        </div>

        {/* Category filter chips — top right */}
        <Glass
          className="animate-fadeUp"
          style={{
            position: 'absolute',
            top: '7rem',
            right: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            pointerEvents: 'auto',
            animationDelay: '300ms',
          }}
          padding="1rem"
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '0.25rem',
          }}>
            Filter
          </p>
          {CATEGORIES.map(({ id, label, color }) => (
            <button
              key={id}
              id={`filter-${id}`}
              onClick={() => setActiveFilter(id)}
              aria-pressed={activeFilter === id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: activeFilter === id ? 'rgba(229,169,60,0.1)' : 'transparent',
                border: `1px solid ${activeFilter === id ? 'var(--accent)' : 'transparent'}`,
                borderRadius: '4px',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xs)',
                letterSpacing: '0.08em',
                color: activeFilter === id ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 200ms var(--ease-out)',
                textTransform: 'uppercase',
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }} />
              {label}
            </button>
          ))}
        </Glass>

        {/* Node count */}
        <Glass
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '2.5rem',
            pointerEvents: 'none',
          }}
          padding="0.75rem 1.25rem"
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--accent)',
            opacity: 0.7,
            letterSpacing: '0.08em',
          }}>
            12 NODES ◈ 4 CATEGORIES ◈ LIVE
          </p>
        </Glass>

        {/* Hover node info — would be populated by interactionStore */}
        <NodeInfoPanel />
      </main>
    </>
  )
}

function NodeInfoPanel() {
  const activeNode = useInteractionStore((s) => s.activeNode)
  if (!activeNode) return null

  return (
    <Glass
      style={{
        position: 'absolute',
        bottom: '2.5rem',
        right: '2.5rem',
        minWidth: '220px',
        pointerEvents: 'none',
        animation: 'fadeUp 200ms var(--ease-out) both',
      }}
      padding="1rem 1.25rem"
    >
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--accent)',
        marginBottom: '0.5rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {activeNode.replace(/-/g, ' ')}
      </p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
      }}>
        HOVER NODE SELECTED
      </p>
    </Glass>
  )
}
