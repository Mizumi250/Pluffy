// ============================================================
// ARKZEN GENERATED UTILITIES — lain098 [React+Vite]
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T01:16:58.249Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, ExternalLink, Heart, Instagram, Menu, Send, Sparkles, Star, X } from 'lucide-react'

// ── HELPERS ──────────────────────────────────────────────────────────────────

export function smoothScroll(href: string) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
