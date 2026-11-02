// ============================================================
// ARKZEN GENERATED NATIVE TYPES — animation-lab [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-02T10:55:50.280Z
// ============================================================

/* @arkzen:resolved:import expo */
// ─── ZUSTAND STORE ────────────────────────────────────────────────────────────
export interface AnimLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  playingDemo: string | null
  setPlayingDemo: (id: string | null) => void
  resetKey: number
  triggerReset: () => void
}
