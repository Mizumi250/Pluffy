'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — HomeView
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:31:48.101Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, Laptop, ListChecks, MessageSquare, Plus, Puzzle, RefreshCw, Search, Settings, Terminal, Upload } from 'lucide-react'

export const HomeView = () => (
  <div className="pf-v pf-v-home">
    <div className="pf-w-h2">What are we building?</div>
    <p style={{ color: 'var(--muted)', marginTop: 8, maxWidth: 520 }}>Pick a tatemono in the sidebar to edit it, or describe a new one.</p>
    <div className="pf-w-prompt"><span className="pf-typed" data-ph="Describe an app, or type / for commands" /><span className="pf-w-write">Write tatemono</span></div>
  </div>
)
