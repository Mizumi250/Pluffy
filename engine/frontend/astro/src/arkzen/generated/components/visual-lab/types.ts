// ============================================================
// ARKZEN GENERATED TYPES — visual-lab
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:14.440Z
// ============================================================

// ─── STORE ────────────────────────────────────────────────────────────────────
export interface VisualLabState {
  activeSection: string
  setActiveSection: (s: string) => void
  resetKey: number
  triggerReset: () => void
  htmlCanvasSupported: boolean | null
  setHtmlCanvasSupported: (v: boolean) => void
}
