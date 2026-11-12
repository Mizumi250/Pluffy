// ============================================================
// ARKZEN GENERATED TYPES — asset-hub [React+Vite]
// Source: @arkzen:components (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:34.305Z
// ============================================================



export type AssetCategory = 'images' | 'fonts' | 'icons' | 'svg' | 'video' | 'audio' | 'data'

export interface AssetItem {
  name: string
  path: string
  category: AssetCategory
  ext: string
}
