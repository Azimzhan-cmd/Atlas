'use client'

import React, { useRef, useEffect } from 'react'

interface VariableTypeProps {
  children: string
  tag?: keyof JSX.IntrinsicElements
  baseWeight?: number
  minWeight?: number
  maxWeight?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * VariableType — text whose font-weight reacts to scroll velocity.
 * Faster scroll → lighter weight. On dwell → settles to baseWeight.
 */
export function VariableType({
  children,
  tag: Tag = 'span',
  baseWeight = 400,
  minWeight = 200,
  maxWeight = 700,
  className,
  style,
}: VariableTypeProps) {
  const ref        = useRef<HTMLElement>(null)
  const weightRef  = useRef(baseWeight)
  const velRef     = useRef(0)
  const lastScroll = useRef(0)
  const rafRef     = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now()
      const dt  = now - lastScroll.current
      velRef.current = Math.abs(window.scrollY) / (dt + 1) * 10
      lastScroll.current = now
    }

    const tick = () => {
      const target = velRef.current > 5
        ? minWeight
        : baseWeight
      weightRef.current += (target - weightRef.current) * 0.06
      velRef.current    *= 0.92  // decay

      if (ref.current) {
        ref.current.style.fontVariationSettings = `"wght" ${Math.round(weightRef.current)}`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [baseWeight, minWeight])

  return (
    <Tag
      ref={ref as React.RefObject<any>}
      className={className}
      style={{
        fontVariationSettings: `"wght" ${baseWeight}`,
        transition: 'font-variation-settings 0ms',
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
