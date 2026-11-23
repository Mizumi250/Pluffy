// ============================================================
// ARKZEN GENERATED TYPES — a2ui-lab
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:11.810Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export type Props = Record<string, string>

export type Plan = { component: string; props: Props; say: string; suggestions: string[] }

export type ShowFn = (plan: Plan) => void

export type Service = { id: number; name: string; price_idr: number; minutes: number; note: string | null }

export type Ticket = { code: string; customer: string; bike: string; status: string; note: string | null; ready_by: string | null }
