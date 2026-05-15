// ============================================================
// ARKZEN GENERATED SHARED — crud-test [React+Inertia]
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-15T04:47:54.582Z
// ============================================================

import { Boxes } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

type FormData = { name: string; description: string; status: string; priority: number; tags: string }
const emptyForm: FormData = { name: '', description: '', status: 'active', priority: 0, tags: '' }
