'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/',        label: 'Portal'  },
  { href: '/atlas',   label: 'Atlas'   },
  { href: '/work',    label: 'Work'    },
  { href: '/systems', label: 'Systems' },
  { href: '/lab',     label: 'Lab'     },
  { href: '/craft',   label: 'Craft'   },
  { href: '/brief',   label: 'Brief'   },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-nav)' as any,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2.5rem',
        pointerEvents: 'none',
      }}
    >
      {/* Wordmark */}
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          pointerEvents: 'auto',
          textDecoration: 'none',
        }}
      >
        ARKHEVARA
      </Link>

      {/* Links */}
      <ul
        role="list"
        style={{
          display: 'flex',
          gap: '2.5rem',
          listStyle: 'none',
          alignItems: 'center',
        }}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className="nav-link pointer-events-auto"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Brief CTA */}
      <Link
        href="/brief"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-void)',
          background: 'var(--accent)',
          padding: '0.55rem 1.25rem',
          borderRadius: '4px',
          pointerEvents: 'auto',
          textDecoration: 'none',
          transition: 'background 200ms ease',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.background = 'var(--color-amber-glow)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.background = 'var(--accent)'
        }}
      >
        Start a Brief
      </Link>
    </nav>
  )
}
