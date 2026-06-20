// ============================================================
// ARKZEN GENERATED LYNX SHARED TYPES — asset-hub
// Source: @arkzen:native:components:lynx:* (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:07:58.576Z
// ============================================================

// ─── LYNX ASSET REGISTRY ──────────────────────────────────────────────────────
// Lynx uses URI-based asset references — no Metro static require() needed.
// Assets are served from the Lynx dev server or bundled as URI strings.
// Drop files into tatemonos/asset-hub/assets/<category>/ and register here.

export interface LynxAssetItem {
  name:     string
  uri:      string   // relative URI served by Lynx asset pipeline
  category: string
  ext:      string
}
