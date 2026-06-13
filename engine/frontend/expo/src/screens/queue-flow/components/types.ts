// ============================================================
// ARKZEN GENERATED NATIVE TYPES — queue-flow [Expo]
// Source: @arkzen:native:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:39.816Z
// ============================================================

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NativeQueue {
  id:               number
  name:             string
  description:      string | null
  prefix:           string
  is_active:        boolean
  avg_wait_minutes: number
}

export interface NativeTicket {
  id:            number
  queue_id:      number
  ticket_number: string
  customer_name: string | null
  status:        'waiting' | 'serving' | 'done' | 'skipped'
  position:      number
  called_at:     string | null
  served_at:     string | null
  created_at:    string
}

export interface NativeQueueStatus {
  queue:         NativeQueue
  serving:       NativeTicket | null
  waiting:       NativeTicket[]
  done_count:    number
  total_waiting: number
}

export interface MyTicketData {
  ticket:         NativeTicket
  position:       number
  estimated_wait: number
  is_serving:     boolean
  is_done:        boolean
}

// ─── Utilities ────────────────────────────────────────────────────────────────
