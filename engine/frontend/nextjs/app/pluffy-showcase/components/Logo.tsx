'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Logo
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:03.340Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'
import { IMG_BASE } from './constants'

export const Logo = ({ id }: { id: string }) => (
  id === 'lynx'
    ? <span className="pf-lm" aria-hidden="true">Ly</span>
    : <img className="pf-logo" src={IMG_BASE + 'logo-' + id + '.svg'} alt="" width={20} height={20} loading="lazy" />
)
