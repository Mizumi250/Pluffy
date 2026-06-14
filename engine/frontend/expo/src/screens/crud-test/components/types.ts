// ============================================================
// ARKZEN GENERATED NATIVE TYPES — crud-test [Expo]
// Source: @arkzen:native:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:55:57.602Z
// ============================================================

export type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

export type FormData = { name: string; description: string; status: 'active' | 'pending' | 'archived'; priority: string; tags: string }
