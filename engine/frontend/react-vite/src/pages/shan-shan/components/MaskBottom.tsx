// ============================================================
// ARKZEN GENERATED COMPONENT — MaskBottom [React+Vite]
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T14:56:04.190Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── SVG DIAGONAL MASKS ───────────────────────────────────────────────────────

export const MaskBottom = ({ fill = '#CC0000' }: { fill?: string }) => (
  <div className="mask-bottom">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
      <polygon fill={fill} points="0,100 1440,100 1440,0" />
    </svg>
  </div>
)
