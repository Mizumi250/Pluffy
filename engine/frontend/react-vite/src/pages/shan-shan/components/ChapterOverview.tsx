// ============================================================
// ARKZEN GENERATED COMPONENT — ChapterOverview [React+Vite]
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:22:21.721Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'

// ─── CHAPTER TAGS / OVERVIEW ──────────────────────────────────────────────────

export const ChapterOverview = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-overview" style={{ '--chapter-color': chapter.color } as React.CSSProperties}>
    <div className="chapter-overview-title-wr">
      <h2 className="chapter-overview-title">{chapter.tagline}</h2>
    </div>
    <div className="chapter-overview-img-wrap">
      <img src={chapter.img} alt={chapter.tagline} className="chapter-overview-img" />
    </div>
    <ul className="chapter-overview-tags">
      {chapter.tags.map(t => <li key={t}>{t}</li>)}
    </ul>
    <a href="#contact" className="chapter-overview-cta">Request info</a>
  </div>
)

// ─── CHAPTER OUTRO ────────────────────────────────────────────────────────────
