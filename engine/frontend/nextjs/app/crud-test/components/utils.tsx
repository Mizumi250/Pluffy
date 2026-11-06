// ============================================================
// ARKZEN GENERATED UTILITIES — crud-test
// Source: @arkzen:components (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-06T05:42:44.564Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Boxes } from 'lucide-react'
import type { FormData, Item } from './types'

export const emptyForm: FormData = { name: '', description: '', status: 'active', priority: 0, tags: '' }
