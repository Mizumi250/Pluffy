'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — JOFormModal
// Source: @arkzen:components (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:07.037Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle, ChevronDown, Clock, CreditCard, Download, Edit2, Eye, FileText, Filter, Landmark, MoreHorizontal, Plus, Printer, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, Users, Wallet, X, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import { FUNDING_OPTIONS, JOB_TITLES, PYRL_GROUPS } from './constants'

// ── Modal / Drawer for add/edit JO ──────────────────────────────────────────
export const JOFormModal = ({
  open, onClose, onSave, initial
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<JobOrder>) => void
  initial?: JobOrder | null
}) => {
  const [form, setForm] = useState<Partial<JobOrder>>(initial ?? {
    jor_number: 0,
    name_of_jo: '',
    job_title: 'LABORER',
    funding: 'PUBLIC SERVICES',
    basic_pay: 346,
    disbursement_type: 'CASH',
    jor_pyrl_group: 'GROUP A',
    sss_amount: 0,
    hdmf_premium: 0,
    hdmf_mpl: 0,
    calamity_loan: 0,
    status: 'active',
  })

  useEffect(() => {
    setForm(initial ?? {
      jor_number: 0, name_of_jo: '', job_title: 'LABORER',
      funding: 'PUBLIC SERVICES', basic_pay: 346,
      disbursement_type: 'CASH', jor_pyrl_group: 'GROUP A',
      sss_amount: 0, hdmf_premium: 0, hdmf_mpl: 0, calamity_loan: 0, status: 'active',
    })
  }, [initial, open])

  const set = (k: keyof JobOrder, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const inputCls = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-colors"
  const labelCls = "text-xs font-semibold text-neutral-600 mb-1 block"

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif]">
              {initial ? 'Edit Job Order' : 'New Job Order'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Fill in the employee payroll details</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X size={16} className="text-neutral-500" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>JOR Number</label>
              <input type="number" className={inputCls} value={form.jor_number ?? ''} onChange={e => set('jor_number', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status ?? 'active'} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Full Name (LAST, FIRST MI.)</label>
            <input type="text" className={inputCls} value={form.name_of_jo ?? ''} placeholder="DELA CRUZ, JUAN A." onChange={e => set('name_of_jo', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Job Title</label>
              <select className={inputCls} value={form.job_title ?? 'LABORER'} onChange={e => set('job_title', e.target.value)}>
                {JOB_TITLES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Funding Source</label>
              <select className={inputCls} value={form.funding ?? ''} onChange={e => set('funding', e.target.value)}>
                {FUNDING_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Basic Pay (₱/day)</label>
              <input type="number" step="0.01" className={inputCls} value={form.basic_pay ?? ''} onChange={e => set('basic_pay', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Disbursement</label>
              <select className={inputCls} value={form.disbursement_type ?? 'CASH'} onChange={e => set('disbursement_type', e.target.value as 'CASH' | 'ATM')}>
                <option value="CASH">CASH</option>
                <option value="ATM">ATM</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Payroll Group</label>
              <select className={inputCls} value={form.jor_pyrl_group ?? 'GROUP A'} onChange={e => set('jor_pyrl_group', e.target.value)}>
                {PYRL_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>SSS Number</label>
              <input type="text" className={inputCls} value={form.sss_number ?? ''} placeholder="00-0000000-0" onChange={e => set('sss_number', e.target.value)} />
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest pt-1">Deductions</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>SSS Amount</label>
              <input type="number" step="0.01" className={inputCls} value={form.sss_amount ?? 0} onChange={e => set('sss_amount', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>HDMF Premium</label>
              <input type="number" step="0.01" className={inputCls} value={form.hdmf_premium ?? 0} onChange={e => set('hdmf_premium', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>HDMF MPL</label>
              <input type="number" step="0.01" className={inputCls} value={form.hdmf_mpl ?? 0} onChange={e => set('hdmf_mpl', +e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Calamity Loan</label>
              <input type="number" step="0.01" className={inputCls} value={form.calamity_loan ?? 0} onChange={e => set('calamity_loan', +e.target.value)} />
            </div>
          </div>
          {form.disbursement_type === 'ATM' && (
            <div>
              <label className={labelCls}>Cash Card Number</label>
              <input type="text" className={inputCls} value={form.cash_card_number ?? ''} onChange={e => set('cash_card_number', e.target.value)} />
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-700 transition-colors"
          >
            {initial ? 'Save Changes' : 'Add JO'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Mini bar chart for funding breakdown
