// ============================================================
// ARKZEN GENERATED TYPES — animation-lab
// Source: @arkzen:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:14:40.495Z
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
