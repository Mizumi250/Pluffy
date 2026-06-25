// ============================================================
// ARKZEN GENERATED UTILITIES — lain098 [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T07:05:56.775Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, Heart, Instagram, Menu, Play, Send, Sparkles, Star, X, ZoomIn } from 'lucide-react'

// ── HELPERS ──────────────────────────────────────────────────────────────────

export function smoothScroll(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
