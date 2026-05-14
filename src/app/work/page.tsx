'use client'

import { useState, useEffect } from 'react'
import { Glass } from '@/components/ui/Glass'
import { WorkScene } from '@/lib/scenes/work/WorkScene'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  year: number
  stack: string[]
  linesOfCode: number
  region: string
  uptime: number
  description: string
  color: string
}

const CATEGORY_LABELS: Record<string, string> = {
  web:  'Web Architecture',
  bots: 'Autonomous Bots',
  ai:   'AI / Compute',
  apps: 'Native Apps',
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      id={`project-${project.id}`}
      role="article"
      aria-label={project.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'rgba(28,28,30,0.6)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? project.color + '55' : 'rgba(229,169,60,0.1)'}`,
        borderRadius: '12px',
        padding: '2rem',
        cursor: 'default',
        transition: 'border-color 300ms ease, transform 300ms ease, box-shadow 300ms ease',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'none',
        boxShadow: hovered
          ? `0 20px 60px ${project.color}15, 0 0 0 1px ${project.color}20`
          : '0 4px 24px rgba(0,0,0,0.4)',
        animationDelay: `${index * 80}ms`,
      }}
      className="animate-fadeUp"
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: project.color,
            opacity: 0.85,
          }}>
            {CATEGORY_LABELS[project.category] ?? project.category}
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginTop: '0.25rem',
            letterSpacing: '-0.01em',
          }}>
            {project.title}
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginTop: '0.15rem',
          }}>
            {project.subtitle}
          </p>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          opacity: 0.5,
          letterSpacing: '0.05em',
        }}>
          {project.year}
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        marginBottom: '1.5rem',
      }}>
        {project.description}
      </p>

      {/* Stack chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {project.stack.slice(0, 5).map(tech => (
          <span key={tech} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            padding: '0.2rem 0.55rem',
            letterSpacing: '0.04em',
          }}>
            {tech}
          </span>
        ))}
        {project.stack.length > 5 && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--accent)',
            opacity: 0.5,
            padding: '0.2rem 0.4rem',
          }}>
            +{project.stack.length - 5}
          </span>
        )}
      </div>

      {/* Metrics footer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[
          { label: 'LOC', value: `${(project.linesOfCode / 1000).toFixed(1)}k` },
          { label: 'Region', value: project.region },
          { label: 'Uptime', value: `${project.uptime}%` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              opacity: 0.5,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.2rem',
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: project.color,
              fontWeight: 600,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Hover accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
        borderRadius: '12px 12px 0 0',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 300ms ease',
      }} />
    </article>
  )
}

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/data/work.projects.json')
      .then(r => r.json())
      .then(setProjects)
  }, [])

  const FILTERS = ['all', 'web', 'bots', 'ai', 'apps']
  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter)

  return (
    <>
      {/* Inject 3D floating card scene */}
      <WorkScene />

      <main style={{
        minHeight: '100vh',
        padding: '8rem 2.5rem 4rem',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '3rem' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          opacity: 0.7,
          marginBottom: '0.5rem',
          pointerEvents: 'none',
        }}>
          Engineering Archives
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          pointerEvents: 'none',
        }}>
          Work
        </h1>
      </div>

      {/* Filter bar */}
      <div className="animate-fadeUp" style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2.5rem',
        animationDelay: '100ms',
        pointerEvents: 'auto',
      }}>
        {FILTERS.map(f => (
          <button
            key={f}
            id={`work-filter-${f}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.4rem 1rem',
              borderRadius: '4px',
              border: `1px solid ${filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
              background: filter === f ? 'rgba(229,169,60,0.1)' : 'transparent',
              color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            {f === 'all' ? 'All' : CATEGORY_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1.5rem',
        pointerEvents: 'auto',
      }}>
        {filtered.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>

      {/* Count */}
      {projects.length > 0 && (
        <Glass
          style={{ display: 'inline-block', marginTop: '3rem' }}
          padding="0.6rem 1.2rem"
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--accent)',
            opacity: 0.7,
            letterSpacing: '0.08em',
          }}>
            {filtered.length} / {projects.length} PROJECTS ◈ {filter.toUpperCase()}
          </p>
        </Glass>
      )}
      </main>
    </>
  )
}
