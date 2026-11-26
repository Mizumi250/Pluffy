'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Mark
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:52.423Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PETAL_PATH } from './constants'

export const Mark = () => (
  <svg viewBox="-16 -16 32 32" aria-hidden="true">
    <g fill="currentColor">
      {[0, 72, 144, 216, 288].map((a) => <path key={a} d={PETAL_PATH} transform={`rotate(${a})`} />)}
    </g>
  </svg>
)
