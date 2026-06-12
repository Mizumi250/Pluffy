'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Spinner
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T14:02:46.226Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'

// ─── Shared UI Components ───────────────────────────────────────────────────

export const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
  </div>
)
