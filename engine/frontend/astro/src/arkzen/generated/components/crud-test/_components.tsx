// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — crud-test
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T10:07:14.433Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Boxes } from 'lucide-react'

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
