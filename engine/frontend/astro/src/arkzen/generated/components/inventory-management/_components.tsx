// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — inventory-management
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-19T23:54:01.520Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog } from '@/arkzen/core/components/Dialog'
import { Modal } from '@/arkzen/core/components/Modal'
import { useToast } from '@/arkzen/core/components/Toast'
import { Badge } from '@/arkzen/core/components/utils'
import { useMutation } from '@/arkzen/core/hooks/useMutation'
import { useQuery } from '@/arkzen/core/hooks/useQuery'
import { AlertTriangle, DollarSign, Edit2, Package, Plus, Trash2, TrendingUp } from 'lucide-react'

interface InventoryItem {
  id:          number
  name:        string
  sku:         string
  quantity:    number
  price:       number
  category:    string | null
  description: string | null
  created_at:  string
  updated_at:  string
}

interface FormState {
  name: string; sku: string; quantity: string
  price: string; category: string; description: string
}

const emptyForm: FormState = { name: '', sku: '', quantity: '', price: '', category: '', description: '' }

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="arkzen-card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-neutral-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  </div>
)

const InventoryRow = ({ item, onEdit, onDelete }: { item: InventoryItem; onEdit: (i: InventoryItem) => void; onDelete: (i: InventoryItem) => void }) => {
  const stockVariant = item.quantity === 0 ? 'error' : item.quantity < 20 ? 'warning' : 'success'
  const stockLabel   = item.quantity === 0 ? 'Out of stock' : item.quantity < 20 ? 'Low stock' : 'In stock'
  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
      <td className="px-4 py-3.5">
        <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">{item.sku}</p>
      </td>
      <td className="px-4 py-3.5 text-sm text-neutral-600">{item.category ?? '—'}</td>
      <td className="px-4 py-3.5"><Badge label={stockLabel} variant={stockVariant} dot /></td>
      <td className="px-4 py-3.5 text-sm font-medium">{item.quantity}</td>
      <td className="px-4 py-3.5 text-sm font-semibold">₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  )
}
