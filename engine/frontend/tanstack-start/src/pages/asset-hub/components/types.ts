// ============================================================
// ARKZEN GENERATED TYPES — asset-hub [TanStack]
// Source: @arkzen:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:27:01.914Z
// ============================================================

// ─── ASSET REGISTRY ───────────────────────────────────────────────────────────
// Add an entry here after dropping a file into tatemonos/asset-hub/assets/<category>/
// The engine copies everything in assets/ → public/tatemonos/asset-hub/assets/
// Reference in code: /tatemonos/asset-hub/assets/<category>/<filename>

export type AssetCategory = 'images' | 'fonts' | 'icons' | 'svg' | 'video' | 'audio' | 'data'

export interface AssetItem {
  name: string
  path: string
  category: AssetCategory
  ext: string
}
