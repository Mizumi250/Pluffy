'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Letters
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:52.426Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export const Letters = ({ text }: { text: string }) => (
  <>
    {text.split('').map((c, k) => (
      <span key={k} className="pf-ch-w"><span className="pf-ch">{c === ' ' ? '\u00a0' : c}</span></span>
    ))}
  </>
)
