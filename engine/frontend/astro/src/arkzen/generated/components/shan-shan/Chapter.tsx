// ============================================================
// ARKZEN GENERATED COMPONENT — Chapter
// Source: @arkzen:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:13.969Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './constants'
import { ChapterCover } from './ChapterCover'
import { ChapterHead } from './ChapterHead'
import { ChapterLookbook } from './ChapterLookbook'
import { ChapterOutro } from './ChapterOutro'
import { ChapterOverview } from './ChapterOverview'
import { ChapterStory } from './ChapterStory'

// ─── FULL CHAPTER ─────────────────────────────────────────────────────────────

export const Chapter = ({ chapter, index }: { chapter: (typeof CHAPTERS)[0]; index: number }) => (
  <section className="homepage-tale" id={`tale-${chapter.id}`}>
    <ChapterCover chapter={chapter} />
    <ChapterHead chapter={chapter} />
    <ChapterLookbook chapter={chapter} />
    <ChapterOverview chapter={chapter} />
    <ChapterStory chapter={chapter} />
    <ChapterOutro chapter={chapter} nextChapter={CHAPTERS[index + 1]} />
  </section>
)
