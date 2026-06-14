// ============================================================
// ARKZEN GENERATED COMPONENT — SectionHeader [TanStack]
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:55.877Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { create } from 'zustand'

// Page section header — matching the reference UI style
export const SectionHeader = ({
  title, subtitle, action
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-semibold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// Tab pills — matching the "All Courses / The Newest / Top Rated" row from reference
