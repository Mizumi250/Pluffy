'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — TabPills
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:56.168Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import type { JobOrder, PayrollState, PayrollSummary } from './types'

// Tab pills — matching the "All Courses / The Newest / Top Rated" row from reference
export const TabPills = ({
  tabs, active, onChange
}: {
  tabs: string[]
  active: string
  onChange: (t: string) => void
}) => (
  <div className="flex gap-1 flex-wrap">
    {tabs.map(t => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
          ${active === t
            ? 'bg-neutral-900 text-white'
            : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
          }`}
      >
        {t}
      </button>
    ))}
  </div>
)

// JO row — replaces the "course row" in the reference UI
