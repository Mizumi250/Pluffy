// ============================================================
// ARKZEN GENERATED UTILITIES — inventory-management
// Source: @arkzen:components (inventory-management)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:55.302Z
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

export const emptyForm: FormState = { name: '', sku: '', quantity: '', price: '', category: '', description: '' }
