'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — StatCard
// Source: @arkzen:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T13:50:36.389Z
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
import type { FormState, InventoryItem } from './types'

export const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="arkzen-card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-neutral-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  </div>
)
