'use client'
// ============================================================
// ARKZEN GENERATED HOOKS — jo-payroll
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:15.455Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import type { JobOrder, PayrollState, PayrollSummary } from './types'

export const usePayrollStore = create<PayrollState>((set) => ({
  jobOrders: [],
  summary: null,
  isLoading: false,
  searchQuery: '',
  activeTab: 'All',
  setJobOrders: (orders) => set({ jobOrders: orders }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addJobOrder: (order) => set((s) => ({ jobOrders: [...s.jobOrders, order] })),
  updateJobOrder: (id, order) => set((s) => ({ jobOrders: s.jobOrders.map(j => j.id === id ? order : j) })),
  removeJobOrder: (id) => set((s) => ({ jobOrders: s.jobOrders.filter(j => j.id !== id) })),
}))

// ─── Constants ──────────────────────────────────────────────────────────────
