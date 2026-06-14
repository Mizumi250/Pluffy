// ============================================================
// ARKZEN GENERATED TYPES — inventory-management [React+Vite]
// Source: @arkzen:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:55:59.329Z
// ============================================================

export interface InventoryItem {
  id:          number
  name:        string
  sku:         string
  quantity:    number
  price:       number
  category:    string | null
  description: string | null
  created_at:  string
  updated_at:  string
}

export interface FormState {
  name: string; sku: string; quantity: string
  price: string; category: string; description: string
}
