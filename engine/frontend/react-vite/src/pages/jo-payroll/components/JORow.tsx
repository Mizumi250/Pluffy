// ============================================================
// ARKZEN GENERATED COMPONENT — JORow [React+Vite]
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T13:13:37.529Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { avatarColor, colors, deductions, formatPeso, getAvatarColor, getInitials, initials, netPay } from './utils'
import type { JobOrder } from './types'

// JO row — replaces the "course row" in the reference UI
export const JORow = ({
  jo, onEdit, onDelete
}: {
  jo: JobOrder
  onEdit: (jo: JobOrder) => void
  onDelete: (id: number) => void
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = getInitials(jo.name_of_jo)
  const avatarColor = getAvatarColor(jo.name_of_jo)
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors group px-1 rounded-xl">
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
        {initials}
      </div>
      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">{jo.name_of_jo}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{jo.job_title} · {jo.funding}</p>
      </div>
      {/* Pay info */}
      <div className="hidden sm:flex flex-col items-end shrink-0">
        <p className="text-xs font-semibold text-neutral-900">{formatPeso(netPay)}</p>
        <p className="text-xs text-neutral-400">net pay</p>
      </div>
      {/* Disbursement badge */}
      <div className="hidden md:block shrink-0">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
          jo.disbursement_type === 'ATM'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {jo.disbursement_type}
        </span>
      </div>
      {/* Status dot */}
      <div className="shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          jo.status === 'active'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-neutral-100 text-neutral-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${jo.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
          {jo.status}
        </span>
      </div>
      {/* Action button — "View course" style */}
      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-700 transition-all"
        >
          Actions
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-neutral-100 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => { onEdit(jo); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Edit2 size={13} /> Edit Record
              </button>
              <button
                onClick={() => { onDelete(jo.id); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Modal / Drawer for add/edit JO ──────────────────────────────────────────
