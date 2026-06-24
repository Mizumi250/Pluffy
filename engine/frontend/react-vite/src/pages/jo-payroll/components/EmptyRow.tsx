// ============================================================
// ARKZEN GENERATED COMPONENT — EmptyRow [React+Vite]
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-24T16:50:57.655Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { create } from 'zustand'

export const EmptyRow = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
      <FileText size={20} className="text-neutral-400" />
    </div>
    <p className="text-sm font-medium text-neutral-500">{message}</p>
    <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters or add a new entry.</p>
  </div>
)

// Stat card — matches the "11 Courses completed / 4 in progress" chips from the reference UI
