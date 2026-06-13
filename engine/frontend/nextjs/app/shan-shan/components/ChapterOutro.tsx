'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ChapterOutro
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T02:03:48.782Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'

// ─── CHAPTER OUTRO ────────────────────────────────────────────────────────────

export const ChapterOutro = ({ chapter, nextChapter }: { chapter: (typeof CHAPTERS)[0], nextChapter?: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-outro">
    <div className="chapter-outro-inner">
      <div className="chapter-outro-head">
        <p>{chapter.desc.slice(0, 80)}…</p>
        <a href="#contact" className="btn-outline">LET'S WORK</a>
      </div>
      {nextChapter && (
        <div className="chapter-outro-next">
          <span className="chapter-outro-next-label">NEXT</span>
          <a href={`#ch-${nextChapter.id}`} className="chapter-outro-next-link">
            {nextChapter.coverLabel.toUpperCase()} →
          </a>
        </div>
      )}
      <div className="chapter-outro-img-wrap">
        <img src="/tatemonos/shan-shan/assets/images/shan5.jpg" alt="Shan" className="chapter-outro-img" />
        <p>Shan Sabal Cezar</p>
      </div>
    </div>
  </div>
)

// ─── FULL CHAPTER ─────────────────────────────────────────────────────────────
