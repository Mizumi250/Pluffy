// ============================================================
// ARKZEN GENERATED COMPONENT — HeroSection [TanStack]
// Source: @arkzen:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:08:55.449Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/arkzen/core/adapters/router'
import { Code, Layers, Menu, Palette, X, Zap } from 'lucide-react'
import styles from '../styles/HeroSection.module.css'
import type { HeroSectionProps } from './types'

export const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, ctaText, onCta }) => {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-xl text-neutral-600">{subtitle}</p>
      <button 
        onClick={onCta}
        className="arkzen-btn mx-auto"
      >
        {ctaText}
      </button>
    </div>
  )
}

// ─── UTILITIES & TYPES ───────────────────────────────
