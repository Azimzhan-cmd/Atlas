'use client'

import { Glass } from '@/components/ui/Glass'
import { VariableType } from '@/components/ui/VariableType'

const POSTS = [
  {
    slug: 'persistent-canvas',
    title: 'The Persistent Canvas Pattern',
    date: '2026-05-01',
    readTime: '8 min',
    tag: 'Architecture',
    excerpt: 'How to mount a single WebGL context that survives Next.js App Router navigation — the technique that makes route transitions feel like camera moves rather than page loads.',
    code: `// layout.tsx
// GlobalCanvas mounts once — never unmounts
<GlobalCanvas />
{children}  ← routes swap here`,
  },
  {
    slug: 'raymarched-sdf',
    title: 'Raymarched SDFs in Three.js',
    date: '2026-04-18',
    readTime: '12 min',
    tag: 'Graphics',
    excerpt: 'Embedding a signed distance field raymarcher inside a Three.js ShaderMaterial — the trick of using a rasterised sphere hull to bound the raymarch and guarantee exact silhouettes.',
    code: `// Fragment shader — no #version directive
// Three.js prepends it automatically
float sdArkhe(vec3 p) {
  return length(p) - (0.425 + fbm(p*2.4)*0.06);
}`,
  },
  {
    slug: 'xstate-webgl',
    title: 'XState + WebGL State Machines',
    date: '2026-04-05',
    readTime: '10 min',
    tag: 'Systems',
    excerpt: 'Using XState to orchestrate multi-step 3D scene transitions — portal open, camera fly-through, particle coalesce — without race conditions or leaked event listeners.',
    code: `const routeMachine = createMachine({
  initial: 'PORTAL',
  states: {
    PORTAL:  { on: { ENTER: 'ATLAS' } },
    ATLAS:   { on: { SELECT: 'WORK' } },
    WORK:    { on: { BACK:   'ATLAS' } },
  }
})`,
  },
]

export default function CraftPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '8rem 2rem 4rem', position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', pointerEvents: 'auto' }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '4rem', pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.7, marginBottom: '0.5rem' }}>
          Engineering Epistemology
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Craft
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginTop: '0.75rem', maxWidth: '55ch', lineHeight: 1.7 }}>
          Technical writing on the intersection of real-time graphics, autonomous systems, and production web architecture.
        </p>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {POSTS.map((post, i) => (
          <article
            key={post.slug}
            id={`craft-${post.slug}`}
            className="animate-fadeUp"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(229,169,60,0.08)', border: '1px solid rgba(229,169,60,0.2)', borderRadius: '4px', padding: '0.2rem 0.6rem' }}>
                {post.tag}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', opacity: 0.5 }}>
                {post.date} · {post.readTime} read
              </span>
            </div>

            {/* Title */}
            <VariableType
              tag="h2"
              baseWeight={600}
              minWeight={300}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: '0.75rem', cursor: 'default' }}
            >
              {post.title}
            </VariableType>

            {/* Excerpt */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              {post.excerpt}
            </p>

            {/* Code block */}
            <Glass padding="1rem 1.25rem">
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: 0.85 }}>
                {post.code}
              </pre>
            </Glass>

            {/* Divider */}
            {i < POSTS.length - 1 && (
              <div style={{ marginTop: '3rem', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(229,169,60,0.2), transparent)' }} />
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
