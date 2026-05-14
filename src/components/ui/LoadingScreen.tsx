'use client'

import { useEffect, useState, useRef } from 'react'

const BOOT_LINES = [
  'ARKHEVARA OS v1.0.0',
  'Initializing render pipeline...',
  'Loading WebGL context............OK',
  'Compiling GLSL shaders...........OK',
  'Mounting scene graph.............OK',
  'Calibrating force layout.........OK',
  'Spawning curl noise field........OK',
  'Connecting telemetry stream......OK',
  'SYSTEM ONLINE',
]

/**
 * LoadingScreen — cinematic boot sequence shown on first mount.
 * Fades out once React has hydrated and the 3D canvas is ready.
 */
export function LoadingScreen() {
  const [lines, setLines]     = useState<string[]>([])
  const [done, setDone]       = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]])
        i++
      } else {
        clearInterval(interval)
        // Short pause at "SYSTEM ONLINE" then fade out
        setTimeout(() => {
          setDone(true)
          setTimeout(() => setVisible(false), 700)
        }, 600)
      }
    }, 130)

    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-label="Loading ARKHEVARA system"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#090909',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 700ms ease',
        opacity: done ? 0 : 1,
        pointerEvents: done ? 'none' : 'all',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#F2F2F7',
          lineHeight: 1,
        }}>
          ARKHEVARA
        </p>
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(229,169,60,0.7), transparent)',
          marginTop: '0.75rem',
        }} />
      </div>

      {/* Boot log */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        letterSpacing: '0.04em',
        lineHeight: 1.9,
        color: 'rgba(229,169,60,0.65)',
        maxWidth: '420px',
        width: '100%',
        padding: '0 1rem',
      }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.75rem',
              color: i === lines.length - 1 ? '#E5A93C' : 'rgba(229,169,60,0.55)',
              fontWeight: i === lines.length - 1 ? 700 : 400,
            }}
          >
            <span style={{ opacity: 0.35 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{line}</span>
            {/* Blinking cursor on last line */}
            {i === lines.length - 1 && !done && (
              <span style={{ animation: 'blink 1s step-end infinite' }}>▋</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: '3rem',
        width: '420px',
        maxWidth: '90vw',
        height: '1px',
        background: 'rgba(229,169,60,0.1)',
        borderRadius: '1px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.round((lines.length / BOOT_LINES.length) * 100)}%`,
          background: 'linear-gradient(90deg, #CD7F32, #E5A93C)',
          transition: 'width 120ms linear',
          boxShadow: '0 0 8px rgba(229,169,60,0.5)',
        }} />
      </div>

      {/* Corner decorations */}
      {['0 0', '0 auto', 'auto 0', 'auto auto'].map((margin, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...(i < 2 ? { top: '1.5rem' } : { bottom: '1.5rem' }),
          ...(i % 2 === 0 ? { left: '1.5rem' } : { right: '1.5rem' }),
          width: '16px',
          height: '16px',
          borderTop:    i < 2 ? '1px solid rgba(229,169,60,0.3)' : 'none',
          borderBottom: i >= 2 ? '1px solid rgba(229,169,60,0.3)' : 'none',
          borderLeft:   i % 2 === 0 ? '1px solid rgba(229,169,60,0.3)' : 'none',
          borderRight:  i % 2 === 1 ? '1px solid rgba(229,169,60,0.3)' : 'none',
        }} />
      ))}
    </div>
  )
}
