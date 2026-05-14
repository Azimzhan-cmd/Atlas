'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PortalScene } from '@/lib/scenes/portal/PortalScene'
import { Glass } from '@/components/ui/Glass'

export default function PortalPage() {
  const router = useRouter()
  const [disruption, setDisruption] = useState(0)
  const [entered, setEntered] = useState(false)



  const handleEnter = () => {
    if (entered) return
    setEntered(true)
    // Trigger disruption animation then navigate
    setDisruption(1)
    setTimeout(() => {
      router.push('/atlas')
    }, 1800)
  }

  // Register the portal waypoint (camera is already at [0,0,5] by default)
  useEffect(() => {
    document.title = 'ARKHEVARA — Digital Systems Atelier'
  }, [])

  return (
    <>
      {/* Inject 3D scene into persistent canvas */}
      <PortalScene disruption={disruption} />

      {/* DOM overlay — full viewport */}
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '2rem',
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Studio identity */}
        <div
          className="animate-fadeUp"
          style={{
            textAlign: 'center',
            animationDelay: '200ms',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: '1rem',
              opacity: 0.8,
            }}
          >
            Digital Systems Atelier
          </p>
          <h1
            className="text-gradient"
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '1.5rem',
            }}
          >
            ARKHEVARA
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              maxWidth: '38ch',
              textAlign: 'center',
              lineHeight: 1.7,
            }}
          >
            We don&apos;t tell you we can build living systems.{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
              The page you&apos;re reading is the living system.
            </em>
          </p>
        </div>

        {/* Enter CTA */}
        <div
          className="animate-fadeUp"
          style={{
            animationDelay: '600ms',
            pointerEvents: 'auto',
          }}
        >
          <button
            id="portal-enter-btn"
            onClick={handleEnter}
            disabled={entered}
            aria-label="Enter the ARKHEVARA system"
            style={{
              position: 'relative',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: entered ? 'var(--color-void)' : 'var(--accent)',
              background: entered ? 'var(--accent)' : 'transparent',
              border: '1px solid var(--accent)',
              padding: '1rem 2.5rem',
              borderRadius: '4px',
              cursor: entered ? 'default' : 'pointer',
              transition: 'all 300ms var(--ease-out)',
              backdropFilter: 'blur(8px)',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!entered) {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(229,169,60,0.1)'
                el.style.boxShadow  = '0 0 40px rgba(229,169,60,0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!entered) {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'transparent'
                el.style.boxShadow  = 'none'
              }
            }}
          >
            {entered ? 'Entering System…' : 'Enter the System'}
          </button>
        </div>

        {/* Bottom metadata */}
        <Glass
          className="animate-fadeUp"
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '2.5rem',
            animationDelay: '1000ms',
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
            SYSTEM ONLINE ◈ v1.0.0
          </p>
        </Glass>

        {/* Competencies bottom-right */}
        <Glass
          className="animate-fadeUp"
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            right: '2.5rem',
            animationDelay: '1100ms',
            pointerEvents: 'none',
          }}
          padding="0.75rem 1.25rem"
        >
          <ul
            role="list"
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {['Web Architectures', 'Autonomous Systems', 'AI / Compute Pipelines'].map(
              (label, i) => (
                <li
                  key={label}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.06em',
                  }}
                >
                  <span style={{ color: 'var(--accent)', marginRight: '0.5rem' }}>
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  {label}
                </li>
              )
            )}
          </ul>
        </Glass>
      </main>
    </>
  )
}
