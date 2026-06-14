// ============================================================
// ARKZEN GENERATED COMPONENT — ChapterStory
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T05:02:57.113Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'

// ─── CHAPTER STORY ────────────────────────────────────────────────────────────

export const ChapterStory = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-story">
    <div className="chapter-story-inner">
      <div className="chapter-story-content">
        <div className="chapter-story-col">
          <h3>[ABOUT THIS]</h3>
          <p>{chapter.desc}</p>
        </div>
        <div className="chapter-story-col">
          <h3>[MY APPROACH]</h3>
          <p>{chapter.craft}</p>
        </div>
      </div>
      {/* Sound-within strip */}
      <div className="chapter-sound-strip">
        <span className="chapter-sound-label">THE SOUND WITHIN</span>
        <span className="chapter-sound-title">{chapter.sound}</span>
        <div className="chapter-sound-bars">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="chapter-sound-bar" style={{ animationDelay: `${i * 0.11}s` }} />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ─── CHAPTER TAGS / OVERVIEW ──────────────────────────────────────────────────
