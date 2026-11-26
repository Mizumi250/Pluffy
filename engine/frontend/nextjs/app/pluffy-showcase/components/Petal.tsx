'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Petal
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:52.421Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PETAL_PATH } from './constants'

export const Petal = ({ i }: { i: number }) => (
  <svg className="pf-petal" viewBox="-8 -16 16 16" style={{ left: `${(i * 13 + 6) % 92}%`, width: 14 + (i % 3) * 9 }} aria-hidden="true">
    <path d={PETAL_PATH} fill="currentColor" />
  </svg>
)
