// ============================================================
// ARKZEN GENERATED COMPONENT — FeatureCard [React+Vite]
// Source: @arkzen:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:46.065Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Layers, Menu, Palette, X, Zap } from 'lucide-react'
import { Link } from 'react-router'
import styles from '../styles/FeatureCard.module.css'
import { bgColors } from './utils'
import type { FeatureCardProps } from './types'

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const bgColors = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }
  
  return (
    <div className={`rounded-xl border-2 p-6 ${bgColors[color]}`}>
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  )
}
