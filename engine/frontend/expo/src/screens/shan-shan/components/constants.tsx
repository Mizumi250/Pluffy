// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — shan-shan [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-15T06:14:56.121Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const CHAPTERS = [
  {
    id: 'design',
    num: '01',
    coverLabel: 'Visual',
    tagline: 'GRAPHIC DESIGN',
    headline: 'Visual clarity,\nbold impressions.',
    desc: 'Visual design for print and digital — posters, flyers, social media graphics, brand materials. Clean layouts with bold typography that communicate clearly and leave an impression.',
    craft: 'Every layout starts from a single question: what should the eye land on first? From there, hierarchy, contrast, and rhythm carry the rest.',
    sound: 'FORM FOLLOWS FEELING',
    tags: ['Print Design', 'Social Graphics', 'Brand Identity', 'Typography'],
    img: require('../../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
    gallery: [
      require('../../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
    ],
    color: '#CC0000',
  },
  {
    id: 'docs',
    num: '02',
    coverLabel: 'Document',
    tagline: 'DOCUMENT PREPARATION',
    headline: 'Every page structured,\nevery detail polished.',
    desc: 'Professional document preparation — reports, proposals, templates, formatted deliverables. Every page structured, every section purposeful, every detail polished.',
    craft: 'A document is architecture in two dimensions. The margins, the headers, the flow from section to section — all of it is intentional.',
    sound: 'STRUCTURE IS THE STORY',
    tags: ['Reports', 'Proposals', 'Templates', 'Formatting'],
    img: require('../../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
    gallery: [
      require('../../../../assets/tatemonos/shan-shan/images/shan2.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
    ],
    color: '#111111',
  },
  {
    id: 'research',
    num: '03',
    coverLabel: 'Research',
    tagline: 'RESEARCH & ANALYSIS',
    headline: 'Deep dives.\nActionable insights.',
    desc: 'Thorough research and analysis — academic papers, market studies, data gathering and synthesis. Deep dives that turn complex information into clear, actionable insights.',
    craft: "Good research isn't just gathering data — it's knowing which question to ask next, and having the patience to follow it all the way down.",
    sound: 'DEPTH BEFORE DELIVERY',
    tags: ['Academic Research', 'Market Studies', 'Data Synthesis', 'Analysis'],
    img: require('../../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
    gallery: [
      require('../../../../assets/tatemonos/shan-shan/images/shan3.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan5.jpg'),
    ],
    color: '#8B0000',
  },
  {
    id: 'present',
    num: '04',
    coverLabel: 'Present',
    tagline: 'PRESENTATION DESIGN',
    headline: 'Stories told\none slide at a time.',
    desc: 'Clean, impactful slide decks — pitch presentations, school projects, business proposals. Every slide designed to support the story, not distract from it.',
    craft: 'A great presentation is a rhythm. Breath in: information. Breath out: space. Every slide knows exactly when to speak and when to let silence work.',
    sound: 'ONE SLIDE, ONE TRUTH',
    tags: ['Pitch Decks', 'School Projects', 'Business Proposals', 'Slide Design'],
    img: require('../../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
    gallery: [
      require('../../../../assets/tatemonos/shan-shan/images/shan4.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan5.jpg'),
      require('../../../../assets/tatemonos/shan-shan/images/shan1.jpg'),
    ],
    color: '#1a1a2e',
  },
]

export const SKILLS = [
  { name: 'CANVA',               pct: 96 },
  { name: 'ADOBE ILLUSTRATOR',   pct: 85 },
  { name: 'PHOTOSHOP',           pct: 80 },
  { name: 'MICROSOFT WORD',      pct: 98 },
  { name: 'POWERPOINT',          pct: 94 },
  { name: 'GOOGLE SLIDES',       pct: 95 },
  { name: 'RESEARCH WRITING',    pct: 90 },
  { name: 'LAYOUT DESIGN',       pct: 88 },
  { name: 'TYPOGRAPHY',          pct: 84 },
]

export const SKILLS_MARQUEE = [
  'Canva', '·', 'Adobe Illustrator', '·', 'Photoshop', '·',
  'Microsoft Word', '·', 'PowerPoint', '·', 'Google Slides', '·',
  'Google Docs', '·', 'Excel', '·', 'Research Writing', '·',
  'Layout Design', '·', 'Typography', '·', 'Brand Identity', '·',
]

export const PERSONAL_INFO = [
  { label: 'NAME',    value: 'Shan Sabal Cezar' },
  { label: 'ROLE',    value: 'Designer · Document Specialist · Researcher' },
  { label: 'BASE',    value: 'Philippines' },
  { label: 'TOOLS',   value: 'Canva, Microsoft Office, Google Workspace, Adobe Suite' },
  { label: 'STATUS',  value: 'Open for freelance projects and collaborations' },
  { label: 'CONTACT', value: 'Facebook · @shan.cezar.71' },
]

export const NAV_LINKS = [
  { label: "SHAN'S WORK", scrollTo: 'work' },
  { label: 'SKILLS',      scrollTo: 'skills' },
  { label: 'ABOUT',       scrollTo: 'about' },
  { label: 'CONTACT',     scrollTo: 'contact' },
]

// ─── LOADER ───────────────────────────────────────────────────────────────────

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
