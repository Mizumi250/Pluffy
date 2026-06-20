'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Tag
// Source: @arkzen:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:32.425Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

export const Tag = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    display: 'inline-block', padding: '2px 9px', borderRadius: 20,
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
    background: color + '22', color,
  }}>{label}</span>
)
