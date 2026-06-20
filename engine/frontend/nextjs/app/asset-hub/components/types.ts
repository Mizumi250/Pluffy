// ============================================================
// ARKZEN GENERATED TYPES — asset-hub
// Source: @arkzen:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T01:50:03.560Z
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
