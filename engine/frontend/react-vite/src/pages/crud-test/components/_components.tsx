// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — crud-test [React+Vite]
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T06:27:32.381Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Boxes } from 'lucide-react'

export type Item = {
  id:          number
  name:        string
  description: string | null
  status:      'active' | 'pending' | 'archived'
  priority:    number
  tags:        string | null
  created_at:  string
  updated_at:  string
}

export type FormData = { name: string; description: string; status: string; priority: number; tags: string }
const emptyForm: FormData = { name: '', description: '', status: 'active', priority: 0, tags: '' }
