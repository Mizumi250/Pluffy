'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Chip
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:24:16.326Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'
import { Logo } from './Logo'

export const Chip = ({ id, label }: { id: string; label: string }) => (
  <span className="pf-chip"><Logo id={id} />{label}</span>
)
