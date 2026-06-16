// ============================================================
// ARKZEN GENERATED TYPES — animation-lab [React+Vite]
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T13:13:33.793Z
// ============================================================

// ─── ZUSTAND STORE ────────────────────────────────────────────────────────────
export interface AnimLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  playingDemo: string | null
  setPlayingDemo: (id: string | null) => void
  resetKey: number
  triggerReset: () => void
}
