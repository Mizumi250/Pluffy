// ============================================================
// ARKZEN GENERATED TYPES — webmcp-lab
// Source: @arkzen:components (webmcp-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:40:49.855Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export type Service = { id: number; name: string; price_idr: number; minutes: number; note: string | null }

export type Draft = { service: string; day: string; slot: string; name: string }

/*
 * WebMCP registration. Everything is inside this hook on purpose: generated hooks cannot import
 * constants or helpers from this block. The page works exactly the same when no WebMCP API exists.
 * Tools return only public facts. The booking tool never writes until the customer confirms on the page.
 */
