'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ChapterLookbook
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:26:50.201Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'

// ─── CHAPTER LOOKBOOK ─────────────────────────────────────────────────────────

export const ChapterLookbook = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-lookbook">
    <div className="chapter-lookbook-inner">
      <div className="chapter-lookbook-side">
        <img src={chapter.gallery[0]} alt={`${chapter.coverLabel} secondary`} className="chapter-lookbook-secondary" />
        <p className="chapter-lookbook-quote">{chapter.desc}</p>
      </div>
      <div className="chapter-lookbook-main">
        <img src={chapter.gallery[1] || chapter.img} alt={`${chapter.coverLabel} main`} className="chapter-lookbook-main-img" />
      </div>
    </div>
  </div>
)

// ─── CHAPTER STORY ────────────────────────────────────────────────────────────
