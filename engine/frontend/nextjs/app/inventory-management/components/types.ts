// ============================================================
// ARKZEN GENERATED TYPES — inventory-management
// Source: @arkzen:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:05.970Z
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

export interface InventoryItem {
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

export interface FormState {
  name: string; sku: string; quantity: string
  price: string; category: string; description: string
}
