'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — StatChip
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T02:28:31.995Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import { accents, iconAccents } from './utils'

// Stat card — matches the "11 Courses completed / 4 in progress" chips from the reference UI
export const StatChip = ({
  value, label, icon: Icon, accent = 'neutral'
}: {
  value: string | number
  label: string
  icon: React.ElementType
  accent?: 'neutral' | 'violet' | 'emerald' | 'rose' | 'amber' | 'blue'
}) => {
  const accents: Record<string, string> = {
    neutral: 'bg-white border-neutral-100',
    violet:  'bg-violet-50 border-violet-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    rose:    'bg-rose-50 border-rose-100',
    amber:   'bg-amber-50 border-amber-100',
    blue:    'bg-blue-50 border-blue-100',
  }
  const iconAccents: Record<string, string> = {
    neutral: 'text-neutral-600',
    violet:  'text-violet-600',
    emerald: 'text-emerald-600',
    rose:    'text-rose-600',
    amber:   'text-amber-600',
    blue:    'text-blue-600',
  }
  return (
    <div className={`flex-1 min-w-[120px] rounded-2xl border p-4 ${accents[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon size={18} className={iconAccents[accent]} />
      </div>
      <p className="text-2xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5 font-medium">{label}</p>
    </div>
  )
}

// Page section header — matching the reference UI style
