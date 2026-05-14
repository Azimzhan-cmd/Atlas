'use client'

import { useState } from 'react'
import { Glass } from '@/components/ui/Glass'

const MODULES = [
  { id: 'web-app',   label: 'Web Application', icon: '⬡', color: '#F2F2F7', cost: 8,  weeks: 3 },
  { id: 'bot',       label: 'Bot / Agent',      icon: '◈', color: '#CD7F32', cost: 5,  weeks: 2 },
  { id: 'ai-layer',  label: 'AI / LLM Layer',   icon: '◉', color: '#E5A93C', cost: 12, weeks: 4 },
  { id: 'mobile',    label: 'Mobile App',        icon: '▣', color: '#7A8290', cost: 10, weeks: 5 },
  { id: 'realtime',  label: 'Realtime Layer',    icon: '◎', color: '#E5A93C', cost: 6,  weeks: 2 },
  { id: 'auth',      label: 'Auth System',       icon: '⬟', color: '#F2F2F7', cost: 3,  weeks: 1 },
  { id: 'pipeline',  label: 'Data Pipeline',     icon: '⬛', color: '#7A8290', cost: 7,  weeks: 3 },
]

interface PlacedModule {
  moduleId: string
  x: number
  y: number
}

export default function BriefPage() {
  const [placed, setPlaced]     = useState<PlacedModule[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '', message: '' })

  const totalCost  = placed.reduce((s, p) => s + (MODULES.find(m => m.id === p.moduleId)?.cost ?? 0), 0)
  const totalWeeks = placed.reduce((s, p) => s + (MODULES.find(m => m.id === p.moduleId)?.weeks ?? 0), 0)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x    = Math.round((e.clientX - rect.left - 24) / 80) * 80
    const y    = Math.round((e.clientY - rect.top  - 24) / 80) * 80
    setPlaced(prev => {
      if (prev.find(p => p.moduleId === dragging)) return prev
      return [...prev, { moduleId: dragging, x: Math.max(0, x), y: Math.max(0, y) }]
    })
    setDragging(null)
  }

  const removeModule = (moduleId: string) => {
    setPlaced(prev => prev.filter(p => p.moduleId !== moduleId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main style={{ minHeight: '100vh', padding: '6rem 2rem 2rem', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto', pointerEvents: 'auto' }}>
      {/* Header */}
      <div style={{ pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.25rem' }}>System Assembler</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>Brief</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Drag modules onto the canvas to assemble your system.</p>
      </div>

      {submitted ? (
        <Glass style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--accent)', fontWeight: 700 }}>Blueprint Received</p>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', marginTop: '1rem' }}>We'll be in touch within 48 hours.</p>
        </Glass>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 280px', gap: '1rem', flex: 1, minHeight: '60vh' }}>
          {/* Module library */}
          <Glass padding="1rem">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Modules</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {MODULES.map(mod => {
                const isPlaced = placed.some(p => p.moduleId === mod.id)
                return (
                  <div
                    key={mod.id}
                    draggable={!isPlaced}
                    onDragStart={() => setDragging(mod.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: `1px solid ${isPlaced ? 'rgba(255,255,255,0.04)' : mod.color + '30'}`,
                      background: isPlaced ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                      cursor: isPlaced ? 'default' : 'grab',
                      opacity: isPlaced ? 0.3 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 200ms',
                    }}
                  >
                    <span style={{ color: mod.color, fontSize: '1rem' }}>{mod.icon}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{mod.label}</span>
                  </div>
                )
              })}
            </div>
          </Glass>

          {/* Assembly canvas */}
          <div
            id="brief-assembly-canvas"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              background: 'rgba(9,9,9,0.8)',
              border: '1px solid rgba(229,169,60,0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundImage: `
                linear-gradient(rgba(229,169,60,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(229,169,60,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          >
            {placed.map(({ moduleId, x, y }) => {
              const mod = MODULES.find(m => m.id === moduleId)!
              return (
                <div
                  key={moduleId}
                  onClick={() => removeModule(moduleId)}
                  title="Click to remove"
                  style={{
                    position: 'absolute',
                    left: x + 16,
                    top: y + 16,
                    width: 60,
                    height: 60,
                    borderRadius: '8px',
                    background: `${mod.color}15`,
                    border: `1px solid ${mod.color}40`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    gap: '2px',
                  }}
                >
                  <span style={{ color: mod.color, fontSize: '1.25rem' }}>{mod.icon}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: mod.color, opacity: 0.7, textAlign: 'center', lineHeight: 1.2 }}>{mod.label}</span>
                </div>
              )
            })}
            {placed.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', opacity: 0.3, letterSpacing: '0.1em' }}>Drag modules here</p>
              </div>
            )}
          </div>

          {/* Metrics + contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Glass padding="1.25rem">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Blueprint Metrics</p>
              {[
                { label: 'Modules',   value: placed.length },
                { label: 'Est. Cost', value: `~$${totalCost}k` },
                { label: 'Timeline',  value: `~${totalWeeks}w` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', opacity: 0.6 }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </Glass>

            <Glass padding="1.25rem">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Contact</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(['name', 'email'] as const).map(f => (
                  <input
                    key={f}
                    id={`brief-${f}`}
                    type={f === 'email' ? 'email' : 'text'}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                    value={contact[f]}
                    onChange={e => setContact(prev => ({ ...prev, [f]: e.target.value }))}
                    required
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(229,169,60,0.15)', borderRadius: '6px', padding: '0.55rem 0.75rem', color: 'var(--text-primary)', outline: 'none', width: '100%' }}
                  />
                ))}
                <textarea
                  id="brief-message"
                  placeholder="Describe your project..."
                  value={contact.message}
                  onChange={e => setContact(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(229,169,60,0.15)', borderRadius: '6px', padding: '0.55rem 0.75rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', width: '100%' }}
                />
                <button
                  type="submit"
                  id="brief-submit"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--color-void)', border: 'none', borderRadius: '6px', padding: '0.65rem', cursor: 'pointer', fontWeight: 700, transition: 'background 200ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-amber-glow)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Submit Blueprint
                </button>
              </form>
            </Glass>
          </div>
        </div>
      )}
    </main>
  )
}
