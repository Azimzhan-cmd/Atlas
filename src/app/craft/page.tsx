'use client'
export default function CraftPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
      <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.5rem' }}>Coming Soon</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--text-primary)' }}>Craft</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Engineering Epistemology — Phase 6</p>
      </div>
    </main>
  )
}
