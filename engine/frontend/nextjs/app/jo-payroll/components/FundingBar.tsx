'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — FundingBar
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:29.760Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import type { JobOrder, PayrollState, PayrollSummary } from './types'

// Mini bar chart for funding breakdown
export const FundingBar = ({ label, count, total, max }: { label: string; count: number; total: number; max: number }) => (
  <div className="flex items-center gap-3 py-1.5">
    <p className="text-xs text-neutral-500 w-28 truncate shrink-0">{label}</p>
    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-neutral-900 rounded-full transition-all duration-700"
        style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
      />
    </div>
    <p className="text-xs font-semibold text-neutral-700 w-6 text-right shrink-0">{count}</p>
  </div>
)
