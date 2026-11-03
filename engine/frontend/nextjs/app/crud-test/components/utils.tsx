// ============================================================
// ARKZEN GENERATED UTILITIES — crud-test
// Source: @arkzen:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-03T12:28:25.390Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Boxes } from 'lucide-react'
import type { FormData, Item } from './types'

export const emptyForm: FormData = { name: '', description: '', status: 'active', priority: 0, tags: '' }
