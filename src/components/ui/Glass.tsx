'use client'

import React from 'react'

interface GlassProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: string
}

/**
 * Glass — glassmorphic panel base component.
 * backdrop-filter: blur(24px) saturate(140%)
 */
export function Glass({ children, className = '', style, padding = '1.5rem' }: GlassProps) {
  return (
    <div
      className={className}
      style={{
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        background: 'rgba(28, 28, 30, 0.55)',
        border: '1px solid rgba(229, 169, 60, 0.15)',
        borderRadius: '12px',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
