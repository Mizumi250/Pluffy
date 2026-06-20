// ============================================================
// ARKZEN GENERATED TYPES — visual-lab
// Source: @arkzen:components (visual-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:11.746Z
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
