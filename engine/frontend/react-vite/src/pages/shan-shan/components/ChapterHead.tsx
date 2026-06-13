// ============================================================
// ARKZEN GENERATED COMPONENT — ChapterHead [React+Vite]
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:34.135Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'

// ─── CHAPTER HEAD ─────────────────────────────────────────────────────────────

export const ChapterHead = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-head" id={`ch-${chapter.id}`}>
    <div className="chapter-head-inner">
      <div className="chapter-head-pre">
        <span>[{chapter.num}]</span>
        <span>[CHAPTER]</span>
      </div>
      <h2 className="chapter-head-title">{chapter.coverLabel.toUpperCase()}</h2>
      <p className="chapter-head-tagline">{chapter.tagline}</p>
      <p className="chapter-head-abstract">
        {chapter.headline.split('\n').map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}
      </p>
      <div className="chapter-head-content">
        {/* Side col 1 */}
        <div className="chapter-side-col">
          <img src={chapter.gallery[1]} alt={chapter.coverLabel} className="chapter-side-img" />
        </div>
        {/* Main image */}
        <div className="chapter-main-img-wrap">
          <img src={chapter.img} alt={chapter.coverLabel} className="chapter-main-img" />
        </div>
        {/* Side col 2 */}
        <div className="chapter-side-col">
          <img src={chapter.gallery[2] || chapter.gallery[0]} alt="" className="chapter-side-img chapter-side-img--offset" />
        </div>
      </div>
    </div>
  </div>
)

// ─── CHAPTER LOOKBOOK ─────────────────────────────────────────────────────────
