// ============================================================
// ARKZEN GENERATED COMPONENT — ChapterCover [React+Vite]
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T14:10:34.052Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'

export const ChapterCover = ({ chapter }: { chapter: (typeof CHAPTERS)[0] }) => (
  <div className="chapter-cover" id={`cover-${chapter.id}`}>
    <div className="chapter-cover-bg" style={{ backgroundImage: `url(${chapter.coverImg})` }} />
    <div className="chapter-cover-overlay" />
    <div className="chapter-cover-label-l">[{chapter.coverLabel}]</div>
    <div className="chapter-cover-label-r">[{chapter.coverLabel}]</div>
    <div className="chapter-cover-num">{chapter.num}</div>
  </div>
);
