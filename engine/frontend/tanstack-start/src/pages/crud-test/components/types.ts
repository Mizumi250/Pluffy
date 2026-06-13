// ============================================================
// ARKZEN GENERATED TYPES — crud-test [TanStack]
// Source: @arkzen:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:08:52.921Z
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
