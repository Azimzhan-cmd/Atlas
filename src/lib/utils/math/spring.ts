// Critically-damped spring
export interface SpringState {
  value: number
  velocity: number
}

/**
 * Tick a critically-damped spring toward `target`.
 * Mutates `state` in place for performance.
 * omega = natural frequency (stiffness), zeta = damping ratio (1.0 = critical)
 */
export function tickSpring(
  state: SpringState,
  target: number,
  dt: number,
  omega: number = 12,
  zeta: number  = 1.0
): void {
  const x   = state.value - target
  const d   = zeta * omega
  const acc = -omega * omega * x - 2 * d * state.velocity
  state.velocity += acc * dt
  state.value    += state.velocity * dt
}

// 3D spring state
export interface Spring3State {
  value:    [number, number, number]
  velocity: [number, number, number]
}

export function tickSpring3(
  state:  Spring3State,
  target: [number, number, number],
  dt:     number,
  omega:  number = 12,
  zeta:   number = 1.0
): void {
  for (let i = 0; i < 3; i++) {
    const x   = state.value[i] - target[i]
    const d   = zeta * omega
    const acc = -omega * omega * x - 2 * d * state.velocity[i]
    state.velocity[i] += acc * dt
    state.value[i]    += state.velocity[i] * dt
  }
}

// Ease functions
export const cubicOut    = (t: number) => 1 - Math.pow(1 - t, 3)
export const expoOut     = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
export const cubicInOut  = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// Bezier 1D (cubic, 4 control points)
export function bezier1D(
  p0: number, p1: number, p2: number, p3: number,
  t: number
): number {
  const mt = 1 - t
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3
}

// Remap [a,b] → [c,d]
export function remap(
  value: number,
  inMin: number, inMax: number,
  outMin: number, outMax: number
): number {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin)
}

// Clamp
export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

// Smooth step
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

// Linear interpolation
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Angular distance (degrees)
export const angleDeg = (a: number, b: number) => {
  const d = ((b - a) % 360 + 360) % 360
  return d > 180 ? d - 360 : d
}
