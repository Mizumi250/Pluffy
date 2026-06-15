// ============================================================
// ARKZEN GENERATED COMPONENT — MaskTop [React+Vite]
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:14:57.063Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const MaskTop = ({ fill = '#CC0000' }: { fill?: string }) => (
  <div className="mask-top">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
      <polygon fill={fill} points="0,0 0,100 1440,0" />
    </svg>
  </div>
)

// ─── ANIMATED SHAN LOGO ───────────────────────────────────────────────────────
// Full stroke-draw animation on mount. Letters are meaty, editorial weight.
