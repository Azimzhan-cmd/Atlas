'use client'

import { useState, useEffect } from 'react'
import { Glass } from '@/components/ui/Glass'
import { SystemsScene } from '@/lib/scenes/systems/SystemsScene'

function useTelemetry(max = 60) {
  const [events, setEvents] = useState<{ id: number; type: string; region: string; latencyMs: number; ts: number }[]>([])
  useEffect(() => {
    const es = new EventSource('/api/telemetry')
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setEvents(prev => [data, ...prev].slice(0, max))
      } catch {}
    }
    return () => es.close()
  }, [max])
  return events
}

function WebQ({ events }: { events: ReturnType<typeof useTelemetry> }) {
  const layers = [
    { name: 'CDN Edge', type: 'REQUEST_SERVED' },
    { name: 'App Server', type: 'BUILD_COMPLETED' },
    { name: 'Cache', type: 'CACHE_HIT' },
    { name: 'Database', type: 'DB_QUERY' },
  ]
  return (
    <div style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>01 — Web Architecture</p>
      {layers.map(l => {
        const cnt = events.filter(e => e.type === l.type).length
        return (
          <div key={l.name} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(229,169,60,0.08)', borderRadius: '6px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{l.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)', opacity: cnt > 0 ? 1 : 0.3 }}>{'◈'.repeat(Math.min(cnt, 5))}</span>
          </div>
        )
      })}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.4 }}>{events.length} events</p>
    </div>
  )
}

function BotsQ({ events }: { events: ReturnType<typeof useTelemetry> }) {
  const logs = events.filter(e => ['AGENT_TICK','SCRAPER_CYCLE','WEBHOOK_FIRED'].includes(e.type)).slice(0, 10)
  return (
    <div style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#CD7F32', letterSpacing: '0.15em', textTransform: 'uppercase' }}>02 — Autonomous Agents</p>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', overflowY: 'hidden', display: 'flex', flexDirection: 'column-reverse', gap: '2px' }}>
        <div style={{ color: '#CD7F32', opacity: 0.4 }}>▶ stream active</div>
        {logs.map(ev => (
          <div key={ev.id} style={{ display: 'flex', gap: '0.5rem', color: '#F2F2F7' }}>
            <span style={{ color: '#CD7F32', flexShrink: 0 }}>[{new Date(ev.ts).toISOString().slice(11,19)}]</span>
            <span style={{ color: '#7A8290', flexShrink: 0 }}>{ev.region}</span>
            <span>{ev.type}</span>
            <span style={{ color: '#CD7F32', marginLeft: 'auto' }}>{ev.latencyMs}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AppsQ() {
  const apps = [
    { name: 'Atlas Mobile', platform: 'iOS + Android', status: 'LIVE', v: '2.4.1' },
    { name: 'ARKHEVARA Dash', platform: 'macOS', status: 'BETA', v: '0.9.3' },
  ]
  return (
    <div style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#7A8290', letterSpacing: '0.15em', textTransform: 'uppercase' }}>03 — Native Apps</p>
      {apps.map(a => (
        <div key={a.name} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(122,130,144,0.15)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>{a.name}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#7A8290' }}>{a.platform}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: a.status === 'LIVE' ? '#4CAF50' : '#FF9800' }}>◈ {a.status}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#7A8290' }}>v{a.v}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AIQ({ events }: { events: ReturnType<typeof useTelemetry> }) {
  const cnt = events.filter(e => e.type === 'LLM_INFERENCE').length
  const recent = events.filter(e => ['LLM_INFERENCE','EMBED_COMPUTED'].includes(e.type)).slice(0, 4)
  return (
    <div style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>04 — AI Infrastructure</p>
      <div style={{ background: 'rgba(229,169,60,0.05)', border: '1px solid rgba(229,169,60,0.15)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--accent)', fontWeight: 700 }}>{cnt}</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>INFERENCES</p>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {recent.map(ev => (
          <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.6rem', background: 'rgba(229,169,60,0.03)', borderRadius: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--accent)', opacity: 0.8 }}>{ev.type}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{ev.latencyMs}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SystemsPage() {
  const events = useTelemetry(120)
  const [expanded, setExpanded] = useState<number | null>(null)

  const quads = [
    <WebQ key="web" events={events} />,
    <BotsQ key="bots" events={events} />,
    <AppsQ key="apps" />,
    <AIQ key="ai" events={events} />,
  ]

  const getCols = () => {
    if (expanded === null) return '1fr 1fr'
    return expanded % 2 === 0 ? '3fr 1fr' : '1fr 3fr'
  }
  const getRows = () => {
    if (expanded === null) return '1fr 1fr'
    return expanded < 2 ? '2.5fr 1fr' : '1fr 2.5fr'
  }

  return (
    <>
      <SystemsScene />

      <main style={{ minHeight: '100vh', padding: '6rem 2rem 2rem', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.25rem' }}>Autonomous Matrix</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>Systems</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: getCols(), gridTemplateRows: getRows(), gap: '1px', flex: 1, background: 'rgba(28,28,30,0.5)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(229,169,60,0.1)', pointerEvents: 'auto', minHeight: '65vh', transition: 'all 600ms cubic-bezier(0.4,0,0.2,1)' }}>
        {quads.map((q, i) => (
          <div key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: 'rgba(9,9,9,0.9)', borderRight: i%2===0 ? '1px solid rgba(229,169,60,0.08)' : 'none', borderBottom: i<2 ? '1px solid rgba(229,169,60,0.08)' : 'none', cursor: 'pointer', overflow: 'hidden', transition: 'background 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(28,28,30,0.95)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(9,9,9,0.9)')}>
            {q}
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', opacity: 0.35, textAlign: 'center', pointerEvents: 'none' }}>Click any quadrant to expand · Live SSE telemetry</p>
      </main>
    </>
  )
}
