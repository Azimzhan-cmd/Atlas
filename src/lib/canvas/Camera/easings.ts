// Easing functions — all take t ∈ [0,1] and return t' ∈ [0,1]

export const cubicOut = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

export const expoOut = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export const cubicInOut = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const linear = (t: number): number => t

// Critically-damped spring approximation — smooth approach to target
// Useful for camera and particle follow
export const springApprox = (
  current: number,
  target: number,
  velocity: { v: number },   // mutable ref
  omega: number = 12,        // natural frequency (stiffness)
  zeta: number = 1.0,        // damping ratio (1.0 = critical)
  dt: number = 0.016
): number => {
  const x = current - target
  const d = zeta * omega
  const k = -omega * omega * x - 2 * d * velocity.v
  velocity.v += k * dt
  return current + velocity.v * dt
}

// 3-component spring
export const spring3 = (
  current: [number, number, number],
  target: [number, number, number],
  vel: { v: [number, number, number] },
  omega = 12,
  zeta  = 1.0,
  dt    = 0.016
): [number, number, number] => {
  return [
    springApprox(current[0], target[0], { v: vel.v[0] }, omega, zeta, dt),
    springApprox(current[1], target[1], { v: vel.v[1] }, omega, zeta, dt),
    springApprox(current[2], target[2], { v: vel.v[2] }, omega, zeta, dt),
  ]
}

// Ease selector
export type EasingName = 'cubicOut' | 'expoOut' | 'cubicInOut' | 'linear' | 'springCritical'

export const getEasing = (name: EasingName): ((t: number) => number) => {
  switch (name) {
    case 'cubicOut':       return cubicOut
    case 'expoOut':        return expoOut
    case 'cubicInOut':     return cubicInOut
    case 'springCritical': return cubicOut // fallback for tween-based spring
    default:               return linear
  }
}
