'use client'
// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — crud-test
// All utilities, types, constants from @arkzen:components
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-11T13:31:06.063Z
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
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
