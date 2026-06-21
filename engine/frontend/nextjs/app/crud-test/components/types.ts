// ============================================================
// ARKZEN GENERATED TYPES — crud-test
// Source: @arkzen:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T02:50:30.908Z
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

export type FormData = { name: string; description: string; status: string; priority: number; tags: string }
