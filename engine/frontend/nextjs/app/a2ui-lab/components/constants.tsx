// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — a2ui-lab
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:14:27.740Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'


export const API = '/api/a2ui-lab'

export const SLOTS = ['09:00', '11:00', '14:00', '16:00']

export const STEPS = [
  { key: 'waiting', label: 'In the queue' },
  { key: 'in_progress', label: 'On the stand' },
  { key: 'ready', label: 'Ready' },
  { key: 'picked_up', label: 'Picked up' },
]
