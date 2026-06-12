// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — jo-payroll
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:07.031Z
// ============================================================

// ─── Constants ──────────────────────────────────────────────────────────────
export const API_BASE = ''

export const FUNDING_OPTIONS = ['PUBLIC SERVICES', 'ADMIN', 'MAINTENANCE', 'SANITATION', 'SUPPLIES', 'HUMAN RESOURCES']

export const JOB_TITLES = ['LABORER', 'UTILITY WORKER', 'CLERK', 'DRIVER', 'SECURITY GUARD']

export const PYRL_GROUPS = ['GROUP A', 'GROUP B', 'GROUP C']

export const formatPeso = (v?: number) =>
  v == null ? '₱0.00' : `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export const getInitials = (name: string) => {
  const parts = name.replace(/,/g, '').trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

// Avatar color based on name hash
export const getAvatarColor = (name: string) => {
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ]
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// ─── Shared UI Components ───────────────────────────────────────────────────
