import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface InteractionState {
  // NDC cursor [-1..1]
  cursorNDC: [number, number]
  // Cursor in screen pixels
  cursorPx: [number, number]
  // Currently hovered 3D object id
  hoverTarget: string | null
  // Currently selected/focused node id (Atlas)
  activeNode: string | null
  // Is cursor in gravitational zone near Core
  inGravitationalZone: boolean
  // Is pointer down
  isPointerDown: boolean

  setCursorNDC: (x: number, y: number) => void
  setCursorPx: (x: number, y: number) => void
  setHoverTarget: (id: string | null) => void
  setActiveNode: (id: string | null) => void
  setGravitationalZone: (b: boolean) => void
  setPointerDown: (b: boolean) => void
}

export const useInteractionStore = create<InteractionState>()(
  subscribeWithSelector((set) => ({
    cursorNDC: [0, 0],
    cursorPx:  [0, 0],
    hoverTarget: null,
    activeNode: null,
    inGravitationalZone: false,
    isPointerDown: false,

    setCursorNDC: (x, y) => set({ cursorNDC: [x, y] }),
    setCursorPx:  (x, y) => set({ cursorPx:  [x, y] }),
    setHoverTarget: (hoverTarget) => set({ hoverTarget }),
    setActiveNode: (activeNode) => set({ activeNode }),
    setGravitationalZone: (inGravitationalZone) => set({ inGravitationalZone }),
    setPointerDown: (isPointerDown) => set({ isPointerDown }),
  }))
)
